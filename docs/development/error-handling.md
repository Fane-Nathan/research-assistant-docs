# Error Handling

Comprehensive guide to error handling patterns and best practices in the StudyAssistant project.

## Overview

StudyAssistant implements a robust error handling strategy that ensures graceful degradation, meaningful error messages, and proper recovery mechanisms across all system components.

## Error Handling Philosophy

### Core Principles

- **Fail Fast**: Detect errors early and fail explicitly
- **Graceful Degradation**: Provide fallback functionality when possible
- **User-Friendly Messages**: Present clear, actionable error messages
- **Comprehensive Logging**: Log all errors with sufficient context
- **Recovery Mechanisms**: Implement retry logic and circuit breakers

## Exception Hierarchy

### Custom Exception Structure

```python
# Base exception classes
class StudyAssistantError(Exception):
    """Base exception for StudyAssistant errors."""
    
    def __init__(self, message: str, error_code: str = None, context: dict = None):
        super().__init__(message)
        self.message = message
        self.error_code = error_code
        self.context = context or {}

class ConfigurationError(StudyAssistantError):
    """Configuration-related errors."""
    pass

class DataSourceError(StudyAssistantError):
    """Data source access errors."""
    pass

class ProcessingError(StudyAssistantError):
    """Data processing errors."""
    pass

class ExternalServiceError(StudyAssistantError):
    """External service integration errors."""
    pass

class ValidationError(StudyAssistantError):
    """Input validation errors."""
    pass

# Specific exception types
class ArxivAPIError(ExternalServiceError):
    """ArXiv API specific errors."""
    pass

class EmbeddingError(ProcessingError):
    """Text embedding generation errors."""
    pass

class DatabaseConnectionError(DataSourceError):
    """Database connectivity errors."""
    pass
```

### Error Codes

```python
class ErrorCodes:
    """Standardized error codes."""
    
    # Configuration errors (1000-1999)
    CONFIG_MISSING = "SA-1001"
    CONFIG_INVALID = "SA-1002"
    CONFIG_FILE_NOT_FOUND = "SA-1003"
    
    # Data source errors (2000-2999)
    DATABASE_CONNECTION_FAILED = "SA-2001"
    DATABASE_QUERY_FAILED = "SA-2002"
    FILE_NOT_FOUND = "SA-2003"
    FILE_PERMISSION_DENIED = "SA-2004"
    
    # Processing errors (3000-3999)
    TEXT_PROCESSING_FAILED = "SA-3001"
    EMBEDDING_GENERATION_FAILED = "SA-3002"
    MODEL_INFERENCE_FAILED = "SA-3003"
    
    # External service errors (4000-4999)
    API_RATE_LIMITED = "SA-4001"
    API_AUTHENTICATION_FAILED = "SA-4002"
    API_SERVICE_UNAVAILABLE = "SA-4003"
    
    # Validation errors (5000-5999)
    INVALID_INPUT_FORMAT = "SA-5001"
    MISSING_REQUIRED_FIELD = "SA-5002"
    VALUE_OUT_OF_RANGE = "SA-5003"
```

## Error Handling Patterns

### Try-Catch with Specific Exception Handling

```python
import logging
from typing import Optional, Dict, Any

logger = logging.getLogger(__name__)

async def fetch_arxiv_paper(paper_id: str) -> Optional[Dict[str, Any]]:
    """Fetch paper from ArXiv with comprehensive error handling."""
    
    try:
        # Validate input
        if not paper_id or not isinstance(paper_id, str):
            raise ValidationError(
                "Invalid paper ID format",
                error_code=ErrorCodes.INVALID_INPUT_FORMAT,
                context={"paper_id": paper_id}
            )
        
        # Attempt to fetch paper
        paper_data = await arxiv_client.fetch_paper(paper_id)
        
        if not paper_data:
            logger.warning(f"No data found for paper ID: {paper_id}")
            return None
            
        return paper_data
        
    except ValidationError:
        # Re-raise validation errors
        raise
        
    except ArxivAPIError as e:
        if e.error_code == ErrorCodes.API_RATE_LIMITED:
            logger.warning(f"Rate limited while fetching {paper_id}, implementing backoff")
            await asyncio.sleep(60)  # Wait before retry
            return await fetch_arxiv_paper(paper_id)  # Retry once
        else:
            logger.error(f"ArXiv API error: {e.message}", extra={"context": e.context})
            raise
            
    except ExternalServiceError as e:
        logger.error(f"External service error: {e.message}", extra={"context": e.context})
        return None  # Graceful degradation
        
    except Exception as e:
        # Catch-all for unexpected errors
        logger.error(f"Unexpected error fetching paper {paper_id}: {str(e)}", exc_info=True)
        raise ProcessingError(
            f"Failed to fetch paper: {paper_id}",
            error_code="SA-3999",
            context={"paper_id": paper_id, "original_error": str(e)}
        )
```

### Circuit Breaker Pattern

```python
import asyncio
from datetime import datetime, timedelta
from enum import Enum
from typing import Callable, Any

class CircuitState(Enum):
    CLOSED = "closed"
    OPEN = "open"
    HALF_OPEN = "half_open"

class CircuitBreaker:
    """Circuit breaker implementation for external service calls."""
    
    def __init__(
        self,
        failure_threshold: int = 5,
        recovery_timeout: int = 60,
        expected_exception: type = ExternalServiceError
    ):
        self.failure_threshold = failure_threshold
        self.recovery_timeout = recovery_timeout
        self.expected_exception = expected_exception
        
        self.failure_count = 0
        self.last_failure_time = None
        self.state = CircuitState.CLOSED
        
    async def call(self, func: Callable, *args, **kwargs) -> Any:
        """Execute function with circuit breaker protection."""
        
        if self.state == CircuitState.OPEN:
            if self._should_attempt_reset():
                self.state = CircuitState.HALF_OPEN
            else:
                raise ExternalServiceError(
                    "Circuit breaker is OPEN",
                    error_code=ErrorCodes.API_SERVICE_UNAVAILABLE
                )
        
        try:
            result = await func(*args, **kwargs)
            self._on_success()
            return result
            
        except self.expected_exception as e:
            self._on_failure()
            raise
            
    def _should_attempt_reset(self) -> bool:
        """Check if circuit breaker should attempt to reset."""
        return (
            self.last_failure_time and
            datetime.now() - self.last_failure_time > timedelta(seconds=self.recovery_timeout)
        )
    
    def _on_success(self):
        """Handle successful call."""
        self.failure_count = 0
        self.state = CircuitState.CLOSED
        
    def _on_failure(self):
        """Handle failed call."""
        self.failure_count += 1
        self.last_failure_time = datetime.now()
        
        if self.failure_count >= self.failure_threshold:
            self.state = CircuitState.OPEN

# Usage example
arxiv_circuit_breaker = CircuitBreaker(
    failure_threshold=3,
    recovery_timeout=30,
    expected_exception=ArxivAPIError
)

async def fetch_with_circuit_breaker(paper_id: str):
    """Fetch paper with circuit breaker protection."""
    return await arxiv_circuit_breaker.call(
        arxiv_client.fetch_paper,
        paper_id
    )
```

### Retry Mechanism with Exponential Backoff

```python
import asyncio
import random
from functools import wraps
from typing import Callable, Type, Tuple

def retry_with_backoff(
    max_retries: int = 3,
    base_delay: float = 1.0,
    max_delay: float = 60.0,
    exponential_base: float = 2.0,
    jitter: bool = True,
    exceptions: Tuple[Type[Exception], ...] = (ExternalServiceError,)
):
    """Decorator for retry logic with exponential backoff."""
    
    def decorator(func: Callable):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            last_exception = None
            
            for attempt in range(max_retries + 1):
                try:
                    return await func(*args, **kwargs)
                    
                except exceptions as e:
                    last_exception = e
                    
                    if attempt == max_retries:
                        # Last attempt failed
                        logger.error(
                            f"All {max_retries + 1} attempts failed for {func.__name__}",
                            extra={"error": str(e), "attempts": attempt + 1}
                        )
                        raise
                    
                    # Calculate delay with exponential backoff
                    delay = min(
                        base_delay * (exponential_base ** attempt),
                        max_delay
                    )
                    
                    # Add jitter to prevent thundering herd
                    if jitter:
                        delay *= (0.5 + random.random() * 0.5)
                    
                    logger.warning(
                        f"Attempt {attempt + 1} failed for {func.__name__}, "
                        f"retrying in {delay:.2f}s",
                        extra={"error": str(e), "delay": delay}
                    )
                    
                    await asyncio.sleep(delay)
                    
                except Exception as e:
                    # Unexpected exception, don't retry
                    logger.error(f"Unexpected error in {func.__name__}: {str(e)}", exc_info=True)
                    raise
                    
            return None  # Should never reach here
            
        return wrapper
    return decorator

# Usage example
@retry_with_backoff(
    max_retries=3,
    base_delay=2.0,
    exceptions=(ArxivAPIError, ExternalServiceError)
)
async def fetch_paper_with_retry(paper_id: str):
    """Fetch paper with automatic retry."""
    return await arxiv_client.fetch_paper(paper_id)
```

## Error Context and Debugging

### Context Manager for Error Tracking

```python
import contextvars
from contextlib import contextmanager
from typing import Dict, Any, Optional

# Context variable for error tracking
error_context: contextvars.ContextVar[Dict[str, Any]] = contextvars.ContextVar(
    'error_context', 
    default={}
)

@contextmanager
def error_context_manager(**context):
    """Context manager to add debugging context to errors."""
    current_context = error_context.get({})
    new_context = {**current_context, **context}
    token = error_context.set(new_context)
    
    try:
        yield
    except Exception as e:
        # Add context to exception
        if hasattr(e, 'context'):
            e.context.update(new_context)
        else:
            # Create enhanced exception with context
            enhanced_error = StudyAssistantError(
                str(e),
                context=new_context
            )
            enhanced_error.__cause__ = e
            raise enhanced_error from e
    finally:
        error_context.reset(token)

# Usage example
async def process_document(doc_id: str):
    """Process document with error context."""
    with error_context_manager(document_id=doc_id, operation="process_document"):
        document = await fetch_document(doc_id)
        
        with error_context_manager(step="text_extraction"):
            text = await extract_text(document)
            
        with error_context_manager(step="embedding_generation"):
            embeddings = await generate_embeddings(text)
            
        return embeddings
```

### Error Aggregation and Reporting

```python
from collections import defaultdict
from datetime import datetime
from typing import List, Dict

class ErrorCollector:
    """Collect and aggregate errors for batch processing."""
    
    def __init__(self):
        self.errors: List[Dict[str, Any]] = []
        self.error_counts = defaultdict(int)
        
    def collect_error(
        self, 
        error: Exception, 
        context: Dict[str, Any] = None,
        severity: str = "error"
    ):
        """Collect an error for later processing."""
        error_info = {
            "timestamp": datetime.now().isoformat(),
            "error_type": type(error).__name__,
            "message": str(error),
            "context": context or {},
            "severity": severity
        }
        
        if hasattr(error, 'error_code'):
            error_info["error_code"] = error.error_code
            
        self.errors.append(error_info)
        self.error_counts[error_info["error_code"] or error_info["error_type"]] += 1
        
    def get_error_summary(self) -> Dict[str, Any]:
        """Get summary of collected errors."""
        return {
            "total_errors": len(self.errors),
            "error_breakdown": dict(self.error_counts),
            "recent_errors": self.errors[-10:],  # Last 10 errors
            "summary_generated": datetime.now().isoformat()
        }
        
    def has_critical_errors(self) -> bool:
        """Check if any critical errors were collected."""
        return any(
            error["severity"] == "critical" 
            for error in self.errors
        )

# Global error collector instance
error_collector = ErrorCollector()

# Usage in batch processing
async def batch_process_documents(doc_ids: List[str]):
    """Process documents with error collection."""
    results = []
    
    for doc_id in doc_ids:
        try:
            result = await process_document(doc_id)
            results.append(result)
            
        except StudyAssistantError as e:
            error_collector.collect_error(
                e, 
                context={"document_id": doc_id},
                severity="error"
            )
            
        except Exception as e:
            error_collector.collect_error(
                e,
                context={"document_id": doc_id},
                severity="critical"
            )
    
    # Report error summary
    if error_collector.errors:
        summary = error_collector.get_error_summary()
        logger.warning(f"Batch processing completed with errors: {summary}")
        
        if error_collector.has_critical_errors():
            logger.critical("Critical errors detected during batch processing")
    
    return results
```

## Error Handling in Async Code

### Async Error Propagation

```python
import asyncio
from typing import List, Dict, Any, Optional

async def safe_gather(*awaitables, return_exceptions: bool = False) -> List[Any]:
    """Safe version of asyncio.gather with error handling."""
    results = await asyncio.gather(*awaitables, return_exceptions=True)
    
    errors = []
    valid_results = []
    
    for i, result in enumerate(results):
        if isinstance(result, Exception):
            error_collector.collect_error(
                result,
                context={"task_index": i, "awaitable": str(awaitables[i])}
            )
            if return_exceptions:
                valid_results.append(result)
            else:
                errors.append(result)
        else:
            valid_results.append(result)
    
    if errors and not return_exceptions:
        # Raise first error if not returning exceptions
        raise errors[0]
    
    return valid_results

# Usage example
async def parallel_document_processing(doc_ids: List[str]):
    """Process multiple documents in parallel with error handling."""
    tasks = [process_document(doc_id) for doc_id in doc_ids]
    
    # Process with error collection
    results = await safe_gather(*tasks, return_exceptions=True)
    
    # Filter successful results
    successful_results = [
        result for result in results 
        if not isinstance(result, Exception)
    ]
    
    return successful_results
```

### Timeout Handling

```python
import asyncio
from functools import wraps

def with_timeout(timeout_seconds: float):
    """Decorator to add timeout to async functions."""
    
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            try:
                return await asyncio.wait_for(
                    func(*args, **kwargs),
                    timeout=timeout_seconds
                )
            except asyncio.TimeoutError:
                raise ProcessingError(
                    f"Operation timed out after {timeout_seconds}s",
                    error_code="SA-3010",
                    context={
                        "function": func.__name__,
                        "timeout": timeout_seconds,
                        "args": str(args)[:100],  # Truncate for logging
                        "kwargs": str(kwargs)[:100]
                    }
                )
        return wrapper
    return decorator

# Usage example
@with_timeout(30.0)  # 30 second timeout
async def generate_embeddings(text: str):
    """Generate embeddings with timeout protection."""
    return await embedding_model.encode(text)
```

## Error Recovery Strategies

### Fallback Mechanisms

```python
from typing import Union, Callable, Any

class FallbackChain:
    """Chain of fallback functions for error recovery."""
    
    def __init__(self):
        self.fallbacks: List[Callable] = []
        
    def add_fallback(self, func: Callable):
        """Add a fallback function to the chain."""
        self.fallbacks.append(func)
        return self
        
    async def execute(self, *args, **kwargs) -> Any:
        """Execute fallback chain until one succeeds."""
        last_error = None
        
        for i, fallback in enumerate(self.fallbacks):
            try:
                result = await fallback(*args, **kwargs)
                if i > 0:  # Used fallback
                    logger.info(f"Fallback {i} succeeded after primary failure")
                return result
                
            except Exception as e:
                last_error = e
                logger.warning(f"Fallback {i} failed: {str(e)}")
                continue
        
        # All fallbacks failed
        raise ProcessingError(
            "All fallback mechanisms failed",
            error_code="SA-3020",
            context={"last_error": str(last_error)}
        )

# Example usage
async def fetch_paper_primary(paper_id: str):
    """Primary method to fetch paper."""
    return await arxiv_client.fetch_paper(paper_id)

async def fetch_paper_cache(paper_id: str):
    """Fallback: try cache."""
    cached_data = await cache.get(f"paper:{paper_id}")
    if not cached_data:
        raise DataSourceError("Not found in cache")
    return cached_data

async def fetch_paper_alternative_api(paper_id: str):
    """Fallback: try alternative API."""
    return await alternative_client.fetch_paper(paper_id)

# Setup fallback chain
paper_fetcher = FallbackChain()
paper_fetcher.add_fallback(fetch_paper_primary)
paper_fetcher.add_fallback(fetch_paper_cache)
paper_fetcher.add_fallback(fetch_paper_alternative_api)

# Usage
async def get_paper(paper_id: str):
    """Get paper with fallback chain."""
    return await paper_fetcher.execute(paper_id)
```

## Error Monitoring and Alerting

### Error Metrics Collection

```python
import time
from dataclasses import dataclass
from typing import Dict, Optional

@dataclass
class ErrorMetrics:
    """Error metrics for monitoring."""
    error_count: int = 0
    error_rate: float = 0.0
    last_error_time: Optional[float] = None
    avg_recovery_time: float = 0.0
    critical_error_count: int = 0

class ErrorMonitor:
    """Monitor error patterns and generate alerts."""
    
    def __init__(self):
        self.metrics: Dict[str, ErrorMetrics] = {}
        self.alert_thresholds = {
            "error_rate": 0.1,  # 10% error rate
            "critical_errors": 5,  # 5 critical errors
            "recovery_time": 30.0  # 30 seconds
        }
        
    def record_error(
        self, 
        component: str, 
        error: Exception,
        recovery_time: Optional[float] = None
    ):
        """Record error for monitoring."""
        if component not in self.metrics:
            self.metrics[component] = ErrorMetrics()
            
        metrics = self.metrics[component]
        metrics.error_count += 1
        metrics.last_error_time = time.time()
        
        if hasattr(error, 'context') and error.context.get('severity') == 'critical':
            metrics.critical_error_count += 1
            
        if recovery_time:
            # Update average recovery time
            if metrics.avg_recovery_time == 0:
                metrics.avg_recovery_time = recovery_time
            else:
                metrics.avg_recovery_time = (
                    (metrics.avg_recovery_time + recovery_time) / 2
                )
        
        self._check_alert_conditions(component, metrics)
        
    def _check_alert_conditions(self, component: str, metrics: ErrorMetrics):
        """Check if alert conditions are met."""
        alerts = []
        
        if metrics.critical_error_count >= self.alert_thresholds["critical_errors"]:
            alerts.append(f"Critical error threshold exceeded for {component}")
            
        if metrics.avg_recovery_time > self.alert_thresholds["recovery_time"]:
            alerts.append(f"Recovery time threshold exceeded for {component}")
            
        for alert in alerts:
            logger.critical(alert, extra={"component": component, "metrics": metrics})

# Global error monitor
error_monitor = ErrorMonitor()
```

## Testing Error Conditions

### Error Injection for Testing

```python
import pytest
import asyncio
from unittest.mock import patch, AsyncMock

class ErrorInjector:
    """Inject errors for testing error handling."""
    
    def __init__(self):
        self.injection_rules = {}
        
    def inject_error(
        self, 
        function_name: str, 
        error: Exception, 
        after_calls: int = 0
    ):
        """Configure error injection."""
        self.injection_rules[function_name] = {
            "error": error,
            "after_calls": after_calls,
            "call_count": 0
        }
        
    def should_inject_error(self, function_name: str) -> Optional[Exception]:
        """Check if error should be injected."""
        if function_name not in self.injection_rules:
            return None
            
        rule = self.injection_rules[function_name]
        rule["call_count"] += 1
        
        if rule["call_count"] > rule["after_calls"]:
            return rule["error"]
            
        return None

# Test examples
@pytest.mark.asyncio
async def test_error_handling_with_retry():
    """Test retry mechanism with injected errors."""
    error_injector = ErrorInjector()
    error_injector.inject_error(
        "fetch_paper",
        ArxivAPIError("Rate limited", error_code=ErrorCodes.API_RATE_LIMITED),
        after_calls=0  # Fail immediately
    )
    
    with patch('arxiv_client.fetch_paper') as mock_fetch:
        # First call fails, second succeeds
        mock_fetch.side_effect = [
            ArxivAPIError("Rate limited"),
            {"title": "Test Paper", "abstract": "Test abstract"}
        ]
        
        result = await fetch_paper_with_retry("test-id")
        assert result["title"] == "Test Paper"
        assert mock_fetch.call_count == 2

@pytest.mark.asyncio
async def test_circuit_breaker_opening():
    """Test circuit breaker opens after threshold failures."""
    circuit_breaker = CircuitBreaker(failure_threshold=2)
    
    mock_func = AsyncMock(side_effect=ExternalServiceError("Service down"))
    
    # First two calls should fail and open circuit
    with pytest.raises(ExternalServiceError):
        await circuit_breaker.call(mock_func)
        
    with pytest.raises(ExternalServiceError):
        await circuit_breaker.call(mock_func)
    
    # Third call should fail due to open circuit
    with pytest.raises(ExternalServiceError, match="Circuit breaker is OPEN"):
        await circuit_breaker.call(mock_func)
    
    assert circuit_breaker.state == CircuitState.OPEN
```

## Configuration

### Error Handling Configuration

```yaml
# config/error_handling.yaml
error_handling:
  # Global settings
  enable_circuit_breaker: true
  enable_retry: true
  enable_fallbacks: true
  
  # Circuit breaker settings
  circuit_breaker:
    failure_threshold: 5
    recovery_timeout: 60
    half_open_max_calls: 3
  
  # Retry settings
  retry:
    max_retries: 3
    base_delay: 1.0
    max_delay: 60.0
    exponential_base: 2.0
    jitter: true
  
  # Timeout settings
  timeouts:
    api_call: 30
    database_query: 10
    embedding_generation: 60
    document_processing: 120
  
  # Error collection
  error_collection:
    max_errors_in_memory: 1000
    error_report_interval: 300  # 5 minutes
    
  # Monitoring thresholds
  monitoring:
    error_rate_threshold: 0.1
    critical_error_threshold: 5
    recovery_time_threshold: 30.0
```

## Best Practices Summary

1. **Use Specific Exception Types**: Create meaningful exception hierarchies
2. **Include Error Context**: Provide debugging information with errors
3. **Implement Circuit Breakers**: Protect against cascading failures
4. **Use Exponential Backoff**: Implement intelligent retry mechanisms
5. **Log Comprehensively**: Log all errors with sufficient context
6. **Test Error Conditions**: Thoroughly test error handling paths
7. **Monitor Error Patterns**: Track and alert on error trends
8. **Graceful Degradation**: Provide fallback functionality when possible
9. **User-Friendly Messages**: Present clear error messages to users
10. **Resource Cleanup**: Ensure proper cleanup in error conditions

## Related Documentation

- [Logging Guide](./logging.md)
- [Testing Strategies](./testing.md)
- [Python Standards](./python-standards.md)
- [Async Programming](./async-programming.md)
