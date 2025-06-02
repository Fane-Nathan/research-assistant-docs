# Async Programming Guide

This guide provides comprehensive best practices for asynchronous programming in the StudyAssistant project, covering async/await patterns, concurrency management, and performance optimization.

## Async/Await Fundamentals

### When to Use Async

Use asynchronous programming for:

- **I/O-bound operations**: Database queries, HTTP requests, file operations
- **Network operations**: API calls, web scraping, external service integration
- **Concurrent processing**: Multiple independent tasks
- **Long-running operations**: Document processing, analysis tasks

Avoid async for:
- **CPU-bound operations**: Mathematical calculations, data transformation
- **Simple synchronous operations**: Basic string manipulation, in-memory operations
- **Operations that don't benefit from concurrency**

### Basic Async Patterns

```python
import asyncio
import aiohttp
import aiofiles
from typing import List, Dict, Any, Optional, AsyncIterator
import logging

logger = logging.getLogger(__name__)

# Basic async function
async def fetch_document(url: str) -> Dict[str, Any]:
    """Fetch document from URL asynchronously."""
    async with aiohttp.ClientSession() as session:
        async with session.get(url) as response:
            response.raise_for_status()
            return await response.json()

# Async context manager
class AsyncDocumentProcessor:
    """Async document processor with resource management."""
    
    def __init__(self, max_connections: int = 10):
        self._max_connections = max_connections
        self._session: Optional[aiohttp.ClientSession] = None
        self._semaphore: Optional[asyncio.Semaphore] = None
    
    async def __aenter__(self):
        """Initialize resources."""
        connector = aiohttp.TCPConnector(limit=self._max_connections)
        self._session = aiohttp.ClientSession(connector=connector)
        self._semaphore = asyncio.Semaphore(self._max_connections)
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Clean up resources."""
        if self._session:
            await self._session.close()
    
    async def process_document(self, document_id: str) -> Dict[str, Any]:
        """Process document with rate limiting."""
        async with self._semaphore:
            url = f"https://api.example.com/documents/{document_id}"
            async with self._session.get(url) as response:
                response.raise_for_status()
                data = await response.json()
                
                # Simulate processing
                await asyncio.sleep(0.1)
                return {"id": document_id, "processed": True, "data": data}

# Async iterator
class AsyncDocumentStream:
    """Stream documents asynchronously."""
    
    def __init__(self, document_ids: List[str]):
        self._document_ids = document_ids
        self._index = 0
    
    def __aiter__(self):
        return self
    
    async def __anext__(self):
        if self._index >= len(self._document_ids):
            raise StopAsyncIteration
        
        doc_id = self._document_ids[self._index]
        self._index += 1
        
        # Simulate async document loading
        await asyncio.sleep(0.1)
        return {"id": doc_id, "content": f"Content for {doc_id}"}

# Usage examples
async def main():
    """Example usage of async patterns."""
    # Basic async operation
    document = await fetch_document("https://api.example.com/doc/123")
    
    # Async context manager
    async with AsyncDocumentProcessor() as processor:
        result = await processor.process_document("doc123")
    
    # Async iteration
    async for document in AsyncDocumentStream(["doc1", "doc2", "doc3"]):
        logger.info(f"Processing {document['id']}")
```

## Concurrency Patterns

### Gathering Results

```python
import asyncio
from typing import List, Dict, Any, Union
import aiohttp

async def fetch_multiple_documents(document_ids: List[str]) -> List[Dict[str, Any]]:
    """Fetch multiple documents concurrently."""
    
    async def fetch_single(doc_id: str) -> Dict[str, Any]:
        async with aiohttp.ClientSession() as session:
            async with session.get(f"https://api.example.com/docs/{doc_id}") as response:
                response.raise_for_status()
                return await response.json()
    
    # Create tasks for all documents
    tasks = [fetch_single(doc_id) for doc_id in document_ids]
    
    # Wait for all to complete
    results = await asyncio.gather(*tasks, return_exceptions=True)
    
    # Filter out exceptions and log errors
    successful_results = []
    for i, result in enumerate(results):
        if isinstance(result, Exception):
            logger.error(f"Failed to fetch document {document_ids[i]}: {result}")
        else:
            successful_results.append(result)
    
    return successful_results

async def fetch_with_timeout(document_ids: List[str], timeout: float = 30.0) -> List[Dict[str, Any]]:
    """Fetch documents with timeout."""
    try:
        return await asyncio.wait_for(
            fetch_multiple_documents(document_ids),
            timeout=timeout
        )
    except asyncio.TimeoutError:
        logger.error(f"Timeout after {timeout}s while fetching {len(document_ids)} documents")
        raise

async def fetch_as_completed(document_ids: List[str]) -> AsyncIterator[Dict[str, Any]]:
    """Fetch documents and yield results as they complete."""
    
    async def fetch_single(doc_id: str) -> Dict[str, Any]:
        async with aiohttp.ClientSession() as session:
            async with session.get(f"https://api.example.com/docs/{doc_id}") as response:
                response.raise_for_status()
                data = await response.json()
                return {"id": doc_id, "data": data}
    
    tasks = [fetch_single(doc_id) for doc_id in document_ids]
    
    for coro in asyncio.as_completed(tasks):
        try:
            result = await coro
            yield result
        except Exception as e:
            logger.error(f"Error fetching document: {e}")
            continue
```

### Rate Limiting and Throttling

```python
import asyncio
import time
from typing import Optional, Callable, Any
from collections import deque

class AsyncRateLimiter:
    """Rate limiter for async operations."""
    
    def __init__(self, rate: float, burst: int = 1):
        """
        Initialize rate limiter.
        
        Args:
            rate: Requests per second allowed
            burst: Maximum burst size
        """
        self._rate = rate
        self._burst = burst
        self._tokens = burst
        self._last_update = time.time()
        self._lock = asyncio.Lock()
    
    async def acquire(self) -> None:
        """Acquire a token from the rate limiter."""
        async with self._lock:
            now = time.time()
            elapsed = now - self._last_update
            
            # Add tokens based on elapsed time
            self._tokens = min(
                self._burst,
                self._tokens + elapsed * self._rate
            )
            self._last_update = now
            
            if self._tokens >= 1:
                self._tokens -= 1
                return
            
            # Wait for next token
            wait_time = (1 - self._tokens) / self._rate
            await asyncio.sleep(wait_time)
            self._tokens = 0

class AsyncThrottler:
    """Throttle async operations with sliding window."""
    
    def __init__(self, max_requests: int, window_seconds: float):
        self._max_requests = max_requests
        self._window_seconds = window_seconds
        self._requests = deque()
        self._lock = asyncio.Lock()
    
    async def acquire(self) -> None:
        """Acquire throttling permission."""
        async with self._lock:
            now = time.time()
            
            # Remove old requests outside window
            while self._requests and self._requests[0] <= now - self._window_seconds:
                self._requests.popleft()
            
            if len(self._requests) < self._max_requests:
                self._requests.append(now)
                return
            
            # Wait until oldest request expires
            wait_time = self._requests[0] + self._window_seconds - now
            await asyncio.sleep(wait_time)
            
            # Try again
            await self.acquire()

# Usage with rate limiting
class RateLimitedAPIClient:
    """API client with built-in rate limiting."""
    
    def __init__(self, rate_limit: float = 10.0):
        self._rate_limiter = AsyncRateLimiter(rate_limit)
        self._session: Optional[aiohttp.ClientSession] = None
    
    async def __aenter__(self):
        self._session = aiohttp.ClientSession()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self._session:
            await self._session.close()
    
    async def make_request(self, url: str, **kwargs) -> Dict[str, Any]:
        """Make rate-limited request."""
        await self._rate_limiter.acquire()
        
        async with self._session.get(url, **kwargs) as response:
            response.raise_for_status()
            return await response.json()

# Throttled processing example
async def process_documents_throttled(
    document_ids: List[str],
    max_concurrent: int = 5,
    rate_limit: float = 10.0
) -> List[Dict[str, Any]]:
    """Process documents with concurrency and rate limiting."""
    
    semaphore = asyncio.Semaphore(max_concurrent)
    rate_limiter = AsyncRateLimiter(rate_limit)
    
    async def process_single(doc_id: str) -> Dict[str, Any]:
        async with semaphore:
            await rate_limiter.acquire()
            
            # Simulate document processing
            await asyncio.sleep(0.1)
            return {"id": doc_id, "processed": True}
    
    tasks = [process_single(doc_id) for doc_id in document_ids]
    return await asyncio.gather(*tasks)
```

## Database Operations

### Async Database Patterns

```python
import asyncpg
import asyncio
from typing import List, Dict, Any, Optional, AsyncIterator
from contextlib import asynccontextmanager
import logging

logger = logging.getLogger(__name__)

class AsyncDatabaseManager:
    """Async database manager with connection pooling."""
    
    def __init__(self, database_url: str, min_connections: int = 5, max_connections: int = 20):
        self._database_url = database_url
        self._min_connections = min_connections
        self._max_connections = max_connections
        self._pool: Optional[asyncpg.Pool] = None
    
    async def initialize(self) -> None:
        """Initialize connection pool."""
        self._pool = await asyncpg.create_pool(
            self._database_url,
            min_size=self._min_connections,
            max_size=self._max_connections,
            command_timeout=60
        )
        logger.info(f"Database pool initialized with {self._min_connections}-{self._max_connections} connections")
    
    async def close(self) -> None:
        """Close connection pool."""
        if self._pool:
            await self._pool.close()
            logger.info("Database pool closed")
    
    @asynccontextmanager
    async def get_connection(self):
        """Get connection from pool."""
        if not self._pool:
            raise RuntimeError("Database pool not initialized")
        
        async with self._pool.acquire() as connection:
            yield connection
    
    @asynccontextmanager
    async def transaction(self):
        """Get connection with transaction."""
        async with self.get_connection() as connection:
            async with connection.transaction():
                yield connection
    
    async def execute_query(self, query: str, *args) -> List[Dict[str, Any]]:
        """Execute query and return results."""
        async with self.get_connection() as connection:
            rows = await connection.fetch(query, *args)
            return [dict(row) for row in rows]
    
    async def execute_command(self, command: str, *args) -> str:
        """Execute command and return status."""
        async with self.get_connection() as connection:
            return await connection.execute(command, *args)

class AsyncDocumentRepository:
    """Async repository for document operations."""
    
    def __init__(self, db_manager: AsyncDatabaseManager):
        self._db = db_manager
    
    async def get_document(self, doc_id: str) -> Optional[Dict[str, Any]]:
        """Get document by ID."""
        query = "SELECT * FROM documents WHERE id = $1"
        results = await self._db.execute_query(query, doc_id)
        return results[0] if results else None
    
    async def get_documents_batch(self, doc_ids: List[str]) -> List[Dict[str, Any]]:
        """Get multiple documents efficiently."""
        if not doc_ids:
            return []
        
        query = "SELECT * FROM documents WHERE id = ANY($1)"
        return await self._db.execute_query(query, doc_ids)
    
    async def save_document(self, document: Dict[str, Any]) -> Dict[str, Any]:
        """Save document and return with generated ID."""
        query = """
            INSERT INTO documents (title, content, authors, metadata, created_at)
            VALUES ($1, $2, $3, $4, NOW())
            RETURNING *
        """
        
        results = await self._db.execute_query(
            query,
            document['title'],
            document['content'], 
            document['authors'],
            document.get('metadata', {})
        )
        return results[0]
    
    async def save_documents_batch(self, documents: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Save multiple documents in a transaction."""
        async with self._db.transaction() as conn:
            saved_documents = []
            
            for document in documents:
                query = """
                    INSERT INTO documents (title, content, authors, metadata, created_at)
                    VALUES ($1, $2, $3, $4, NOW())
                    RETURNING *
                """
                
                rows = await conn.fetch(
                    query,
                    document['title'],
                    document['content'],
                    document['authors'], 
                    document.get('metadata', {})
                )
                saved_documents.append(dict(rows[0]))
            
            return saved_documents
    
    async def stream_all_documents(self, batch_size: int = 1000) -> AsyncIterator[Dict[str, Any]]:
        """Stream all documents in batches."""
        offset = 0
        
        while True:
            query = "SELECT * FROM documents ORDER BY id LIMIT $1 OFFSET $2"
            batch = await self._db.execute_query(query, batch_size, offset)
            
            if not batch:
                break
            
            for document in batch:
                yield document
            
            offset += batch_size
            
            # Small delay to prevent overwhelming the database
            await asyncio.sleep(0.01)
```

### Transaction Management

```python
import asyncio
from typing import List, Dict, Any, Callable, TypeVar
from contextlib import asynccontextmanager

T = TypeVar('T')

class AsyncTransactionManager:
    """Advanced transaction management for async operations."""
    
    def __init__(self, db_manager: AsyncDatabaseManager):
        self._db = db_manager
    
    @asynccontextmanager
    async def batch_transaction(self):
        """Context manager for batch operations."""
        async with self._db.transaction() as conn:
            batch_manager = BatchManager(conn)
            try:
                yield batch_manager
                await batch_manager.execute_all()
            except Exception:
                # Transaction will be rolled back automatically
                raise
    
    async def with_retry(
        self,
        operation: Callable[[], T],
        max_retries: int = 3,
        delay: float = 1.0
    ) -> T:
        """Execute operation with retry on deadlock."""
        for attempt in range(max_retries + 1):
            try:
                return await operation()
            except asyncpg.DeadlockDetectedError:
                if attempt == max_retries:
                    raise
                
                wait_time = delay * (2 ** attempt)  # Exponential backoff
                logger.warning(f"Deadlock detected, retrying in {wait_time}s (attempt {attempt + 1})")
                await asyncio.sleep(wait_time)

class BatchManager:
    """Manage batched database operations."""
    
    def __init__(self, connection):
        self._connection = connection
        self._operations = []
    
    def add_insert(self, table: str, data: Dict[str, Any]) -> None:
        """Add insert operation to batch."""
        columns = list(data.keys())
        placeholders = [f"${i+1}" for i in range(len(columns))]
        query = f"INSERT INTO {table} ({', '.join(columns)}) VALUES ({', '.join(placeholders)})"
        values = list(data.values())
        self._operations.append((query, values))
    
    def add_update(self, table: str, data: Dict[str, Any], where_clause: str, where_values: List[Any]) -> None:
        """Add update operation to batch."""
        set_clauses = [f"{col} = ${i+1}" for i, col in enumerate(data.keys())]
        query = f"UPDATE {table} SET {', '.join(set_clauses)} WHERE {where_clause}"
        values = list(data.values()) + where_values
        self._operations.append((query, values))
    
    async def execute_all(self) -> None:
        """Execute all batched operations."""
        for query, values in self._operations:
            await self._connection.execute(query, *values)
        
        logger.info(f"Executed {len(self._operations)} batched operations")
        self._operations.clear()

# Usage example
async def bulk_document_update(
    db_manager: AsyncDatabaseManager,
    updates: List[Dict[str, Any]]
) -> None:
    """Perform bulk document updates efficiently."""
    
    tx_manager = AsyncTransactionManager(db_manager)
    
    async def perform_updates():
        async with tx_manager.batch_transaction() as batch:
            for update in updates:
                batch.add_update(
                    "documents",
                    {"title": update["title"], "content": update["content"]},
                    "id = $1",
                    [update["id"]]
                )
    
    await tx_manager.with_retry(perform_updates, max_retries=3)
```

## Error Handling in Async Code

### Async Error Patterns

```python
import asyncio
from typing import List, Union, Optional, Callable, Any
import logging

logger = logging.getLogger(__name__)

class AsyncErrorHandler:
    """Handle errors in async operations."""
    
    @staticmethod
    async def with_timeout_and_retry(
        coro,
        timeout: float = 30.0,
        max_retries: int = 3,
        retry_delay: float = 1.0,
        exceptions: tuple = (Exception,)
    ):
        """Execute coroutine with timeout and retry."""
        for attempt in range(max_retries + 1):
            try:
                return await asyncio.wait_for(coro, timeout=timeout)
            except asyncio.TimeoutError:
                if attempt == max_retries:
                    logger.error(f"Operation timed out after {max_retries} retries")
                    raise
                logger.warning(f"Timeout on attempt {attempt + 1}, retrying...")
            except exceptions as e:
                if attempt == max_retries:
                    logger.error(f"Operation failed after {max_retries} retries: {e}")
                    raise
                
                wait_time = retry_delay * (2 ** attempt)
                logger.warning(f"Attempt {attempt + 1} failed: {e}. Retrying in {wait_time}s")
                await asyncio.sleep(wait_time)
    
    @staticmethod
    async def gather_with_exceptions(
        *coros,
        max_failures: Optional[int] = None,
        ignore_exceptions: tuple = ()
    ) -> List[Union[Any, Exception]]:
        """Gather coroutines with better exception handling."""
        results = await asyncio.gather(*coros, return_exceptions=True)
        
        # Count failures
        failures = [r for r in results if isinstance(r, Exception) and not isinstance(r, ignore_exceptions)]
        
        if max_failures is not None and len(failures) > max_failures:
            logger.error(f"Too many failures: {len(failures)} > {max_failures}")
            raise RuntimeError(f"Operation failed with {len(failures)} errors")
        
        # Log ignored exceptions
        for result in results:
            if isinstance(result, ignore_exceptions):
                logger.debug(f"Ignored exception: {result}")
        
        return results
    
    @staticmethod
    async def circuit_breaker(
        func: Callable,
        failure_threshold: int = 5,
        recovery_timeout: float = 60.0,
        *args,
        **kwargs
    ):
        """Circuit breaker pattern for async operations."""
        if not hasattr(func, '_circuit_breaker_state'):
            func._circuit_breaker_state = {
                'failures': 0,
                'last_failure': 0,
                'state': 'closed'  # closed, open, half-open
            }
        
        state = func._circuit_breaker_state
        current_time = asyncio.get_event_loop().time()
        
        # Check if circuit should be half-open
        if (state['state'] == 'open' and 
            current_time - state['last_failure'] > recovery_timeout):
            state['state'] = 'half-open'
            logger.info(f"Circuit breaker for {func.__name__} is now half-open")
        
        # Reject if circuit is open
        if state['state'] == 'open':
            raise RuntimeError(f"Circuit breaker open for {func.__name__}")
        
        try:
            result = await func(*args, **kwargs)
            
            # Reset on success
            if state['failures'] > 0:
                logger.info(f"Circuit breaker for {func.__name__} reset after success")
                state['failures'] = 0
                state['state'] = 'closed'
            
            return result
            
        except Exception as e:
            state['failures'] += 1
            state['last_failure'] = current_time
            
            if state['failures'] >= failure_threshold:
                state['state'] = 'open'
                logger.error(f"Circuit breaker opened for {func.__name__} after {state['failures']} failures")
            
            raise

# Async exception context manager
class AsyncExceptionHandler:
    """Context manager for async exception handling."""
    
    def __init__(self, 
                 operation_name: str,
                 reraise: bool = True,
                 default_return: Any = None):
        self.operation_name = operation_name
        self.reraise = reraise
        self.default_return = default_return
        self.exception: Optional[Exception] = None
    
    async def __aenter__(self):
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if exc_type is not None:
            self.exception = exc_val
            logger.error(f"Exception in {self.operation_name}: {exc_val}")
            
            if not self.reraise:
                return True  # Suppress exception
        
        return False  # Don't suppress exception

# Usage examples
async def robust_document_processing(document_ids: List[str]) -> List[Dict[str, Any]]:
    """Process documents with comprehensive error handling."""
    
    async def process_single(doc_id: str) -> Dict[str, Any]:
        # Simulate processing that might fail
        if doc_id.startswith("bad"):
            raise ValueError(f"Bad document ID: {doc_id}")
        
        await asyncio.sleep(0.1)
        return {"id": doc_id, "processed": True}
    
    # Process with error handling
    tasks = [
        AsyncErrorHandler.with_timeout_and_retry(
            process_single(doc_id),
            timeout=5.0,
            max_retries=2,
            exceptions=(ValueError, ConnectionError)
        )
        for doc_id in document_ids
    ]
    
    results = await AsyncErrorHandler.gather_with_exceptions(
        *tasks,
        max_failures=len(document_ids) // 2,  # Allow up to 50% failures
        ignore_exceptions=(ValueError,)  # Don't count these as critical failures
    )
    
    # Filter successful results
    successful_results = [r for r in results if not isinstance(r, Exception)]
    
    logger.info(f"Processed {len(successful_results)}/{len(document_ids)} documents successfully")
    return successful_results
```

## Performance Optimization

### Connection Pooling and Resource Management

```python
import asyncio
import aiohttp
from typing import Optional, Dict, Any
import weakref

class AsyncResourceManager:
    """Manage async resources with proper lifecycle."""
    
    def __init__(self):
        self._http_session: Optional[aiohttp.ClientSession] = None
        self._db_pool: Optional[asyncpg.Pool] = None
        self._cleanup_tasks: List[asyncio.Task] = []
        self._is_closed = False
    
    async def initialize(self, 
                        database_url: str,
                        max_http_connections: int = 100,
                        max_db_connections: int = 20):
        """Initialize all resources."""
        if self._is_closed:
            raise RuntimeError("Cannot initialize closed resource manager")
        
        # HTTP session with connection pooling
        connector = aiohttp.TCPConnector(
            limit=max_http_connections,
            limit_per_host=20,
            keepalive_timeout=30,
            enable_cleanup_closed=True
        )
        
        timeout = aiohttp.ClientTimeout(total=30, connect=10)
        self._http_session = aiohttp.ClientSession(
            connector=connector,
            timeout=timeout
        )
        
        # Database connection pool
        self._db_pool = await asyncpg.create_pool(
            database_url,
            min_size=5,
            max_size=max_db_connections,
            command_timeout=60,
            server_settings={
                'application_name': 'studyassistant',
                'tcp_keepalives_idle': '600',
                'tcp_keepalives_interval': '30',
                'tcp_keepalives_count': '3'
            }
        )
        
        logger.info("Async resource manager initialized")
    
    async def close(self):
        """Close all resources."""
        if self._is_closed:
            return
        
        self._is_closed = True
        
        # Cancel cleanup tasks
        for task in self._cleanup_tasks:
            task.cancel()
        
        # Close HTTP session
        if self._http_session:
            await self._http_session.close()
        
        # Close database pool
        if self._db_pool:
            await self._db_pool.close()
        
        logger.info("Async resource manager closed")
    
    def get_http_session(self) -> aiohttp.ClientSession:
        """Get HTTP session."""
        if self._is_closed or not self._http_session:
            raise RuntimeError("HTTP session not available")
        return self._http_session
    
    def get_db_pool(self) -> asyncpg.Pool:
        """Get database pool."""
        if self._is_closed or not self._db_pool:
            raise RuntimeError("Database pool not available")
        return self._db_pool

# Global resource manager
_resource_manager: Optional[AsyncResourceManager] = None

async def get_resource_manager() -> AsyncResourceManager:
    """Get global resource manager."""
    global _resource_manager
    
    if _resource_manager is None:
        _resource_manager = AsyncResourceManager()
        await _resource_manager.initialize(
            database_url=os.getenv("DATABASE_URL"),
            max_http_connections=100,
            max_db_connections=20
        )
    
    return _resource_manager

async def cleanup_resources():
    """Clean up global resources."""
    global _resource_manager
    
    if _resource_manager:
        await _resource_manager.close()
        _resource_manager = None
```

### Async Caching

```python
import asyncio
import time
from typing import Dict, Any, Optional, Callable, TypeVar
import weakref
import json
import hashlib

T = TypeVar('T')

class AsyncCache:
    """Thread-safe async cache with TTL."""
    
    def __init__(self, default_ttl: float = 300.0):
        self._cache: Dict[str, Dict[str, Any]] = {}
        self._lock = asyncio.Lock()
        self._default_ttl = default_ttl
        self._cleanup_task: Optional[asyncio.Task] = None
        self._start_cleanup()
    
    def _start_cleanup(self):
        """Start background cleanup task."""
        self._cleanup_task = asyncio.create_task(self._cleanup_expired())
    
    async def _cleanup_expired(self):
        """Background task to clean up expired entries."""
        while True:
            try:
                await asyncio.sleep(60)  # Clean up every minute
                
                async with self._lock:
                    current_time = time.time()
                    expired_keys = [
                        key for key, entry in self._cache.items()
                        if entry['expires_at'] < current_time
                    ]
                    
                    for key in expired_keys:
                        del self._cache[key]
                    
                    if expired_keys:
                        logger.debug(f"Cleaned up {len(expired_keys)} expired cache entries")
                        
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"Error in cache cleanup: {e}")
    
    async def get(self, key: str) -> Optional[Any]:
        """Get value from cache."""
        async with self._lock:
            entry = self._cache.get(key)
            
            if entry is None:
                return None
            
            if entry['expires_at'] < time.time():
                del self._cache[key]
                return None
            
            return entry['value']
    
    async def set(self, key: str, value: Any, ttl: Optional[float] = None) -> None:
        """Set value in cache."""
        expires_at = time.time() + (ttl or self._default_ttl)
        
        async with self._lock:
            self._cache[key] = {
                'value': value,
                'expires_at': expires_at
            }
    
    async def delete(self, key: str) -> bool:
        """Delete key from cache."""
        async with self._lock:
            return self._cache.pop(key, None) is not None
    
    async def clear(self) -> None:
        """Clear all cache entries."""
        async with self._lock:
            self._cache.clear()
    
    async def close(self):
        """Close cache and stop cleanup task."""
        if self._cleanup_task:
            self._cleanup_task.cancel()
            try:
                await self._cleanup_task
            except asyncio.CancelledError:
                pass

def async_cached(ttl: float = 300.0, key_func: Optional[Callable] = None):
    """Decorator for caching async function results."""
    
    def decorator(func: Callable) -> Callable:
        cache = AsyncCache(default_ttl=ttl)
        
        async def wrapper(*args, **kwargs):
            # Generate cache key
            if key_func:
                cache_key = key_func(*args, **kwargs)
            else:
                # Default key generation
                key_data = {
                    'func': f"{func.__module__}.{func.__name__}",
                    'args': args,
                    'kwargs': sorted(kwargs.items())
                }
                cache_key = hashlib.md5(
                    json.dumps(key_data, sort_keys=True, default=str).encode()
                ).hexdigest()
            
            # Try to get from cache
            cached_result = await cache.get(cache_key)
            if cached_result is not None:
                return cached_result
            
            # Execute function and cache result
            result = await func(*args, **kwargs)
            await cache.set(cache_key, result)
            
            return result
        
        # Add cache management methods
        wrapper._cache = cache
        wrapper.cache_clear = cache.clear
        wrapper.cache_info = lambda: {"size": len(cache._cache)}
        
        return wrapper
    
    return decorator

# Usage example
@async_cached(ttl=600.0)  # Cache for 10 minutes
async def expensive_document_analysis(document_id: str) -> Dict[str, Any]:
    """Expensive analysis that benefits from caching."""
    logger.info(f"Performing expensive analysis for document {document_id}")
    
    # Simulate expensive computation
    await asyncio.sleep(2.0)
    
    return {
        "document_id": document_id,
        "analysis_score": 0.85,
        "keywords": ["machine learning", "research", "analysis"],
        "computed_at": time.time()
    }
```

## Testing Async Code

### Async Test Patterns

```python
import pytest
import asyncio
from unittest.mock import AsyncMock, patch, MagicMock
import aiohttp
from aioresponses import aioresponses

class TestAsyncDocumentProcessor:
    """Test async document processor."""
    
    @pytest.mark.asyncio
    async def test_process_document_success(self):
        """Test successful document processing."""
        processor = AsyncDocumentProcessor()
        
        document = {
            "id": "doc123",
            "title": "Test Document",
            "content": "This is test content."
        }
        
        result = await processor.process_document(document)
        
        assert result["id"] == "doc123"
        assert result["processed"] is True
        assert "enhanced_content" in result
    
    @pytest.mark.asyncio
    async def test_process_multiple_documents(self):
        """Test processing multiple documents concurrently."""
        processor = AsyncDocumentProcessor()
        
        documents = [
            {"id": f"doc{i}", "title": f"Document {i}", "content": f"Content {i}"}
            for i in range(5)
        ]
        
        results = await processor.process_documents_batch(documents)
        
        assert len(results) == 5
        assert all(result["processed"] for result in results)
    
    @pytest.mark.asyncio
    async def test_http_client_mocking(self):
        """Test HTTP client with mocked responses."""
        
        with aioresponses() as m:
            # Mock external API response
            m.get(
                'https://api.example.com/documents/doc123',
                payload={'id': 'doc123', 'status': 'processed'}
            )
            
            async with aiohttp.ClientSession() as session:
                async with session.get('https://api.example.com/documents/doc123') as response:
                    data = await response.json()
                    assert data['status'] == 'processed'
    
    @pytest.mark.asyncio
    async def test_database_operations_with_mock(self):
        """Test database operations with mocked pool."""
        
        # Mock database pool
        mock_pool = AsyncMock()
        mock_connection = AsyncMock()
        mock_pool.acquire.return_value.__aenter__.return_value = mock_connection
        
        # Mock query result
        mock_connection.fetch.return_value = [
            {'id': 'doc123', 'title': 'Test Document'}
        ]
        
        # Test repository
        repository = AsyncDocumentRepository(mock_pool)
        result = await repository.get_document('doc123')
        
        assert result['id'] == 'doc123'
        mock_connection.fetch.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_timeout_handling(self):
        """Test timeout handling in async operations."""
        
        async def slow_operation():
            await asyncio.sleep(2.0)
            return "completed"
        
        # Test that timeout is properly handled
        with pytest.raises(asyncio.TimeoutError):
            await asyncio.wait_for(slow_operation(), timeout=1.0)
    
    @pytest.mark.asyncio
    async def test_exception_propagation(self):
        """Test exception propagation in async operations."""
        
        async def failing_operation():
            raise ValueError("Test error")
        
        tasks = [failing_operation() for _ in range(3)]
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        assert all(isinstance(result, ValueError) for result in results)
    
    @pytest.fixture
    async def async_context_manager_fixture(self):
        """Async fixture with context manager."""
        
        async with AsyncDocumentProcessor() as processor:
            yield processor

# Async test utilities
class AsyncTestUtils:
    """Utilities for async testing."""
    
    @staticmethod
    async def wait_for_condition(
        condition_func: Callable[[], bool],
        timeout: float = 5.0,
        interval: float = 0.1
    ) -> bool:
        """Wait for condition to become true."""
        start_time = asyncio.get_event_loop().time()
        
        while asyncio.get_event_loop().time() - start_time < timeout:
            if condition_func():
                return True
            await asyncio.sleep(interval)
        
        return False
    
    @staticmethod
    def create_mock_async_context_manager(return_value=None):
        """Create mock async context manager."""
        
        class MockAsyncContextManager:
            async def __aenter__(self):
                return return_value
            
            async def __aexit__(self, exc_type, exc_val, exc_tb):
                pass
        
        return MockAsyncContextManager()

# Performance testing
@pytest.mark.asyncio
async def test_concurrent_performance():
    """Test performance of concurrent operations."""
    
    async def mock_operation(item_id: str) -> str:
        await asyncio.sleep(0.01)  # Simulate work
        return f"processed_{item_id}"
    
    # Test sequential vs concurrent performance
    items = [f"item_{i}" for i in range(100)]
    
    # Sequential
    start_time = asyncio.get_event_loop().time()
    sequential_results = []
    for item in items:
        result = await mock_operation(item)
        sequential_results.append(result)
    sequential_time = asyncio.get_event_loop().time() - start_time
    
    # Concurrent
    start_time = asyncio.get_event_loop().time()
    tasks = [mock_operation(item) for item in items]
    concurrent_results = await asyncio.gather(*tasks)
    concurrent_time = asyncio.get_event_loop().time() - start_time
    
    # Concurrent should be significantly faster
    assert concurrent_time < sequential_time / 2
    assert len(concurrent_results) == len(sequential_results)
```

This comprehensive async programming guide provides the foundation for building scalable, efficient asynchronous applications in the StudyAssistant project, covering all aspects from basic patterns to advanced error handling and performance optimization.
