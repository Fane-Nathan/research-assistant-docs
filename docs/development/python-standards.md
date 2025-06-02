# Python Standards

This document provides Python-specific coding standards and best practices for the StudyAssistant project, building upon the general coding standards with Python-specific guidelines.

## Python Version and Compatibility

### Version Requirements

- **Minimum Python Version**: 3.9
- **Recommended Version**: 3.11+
- **Target Compatibility**: Python 3.9-3.12

### Version-Specific Features

```python
# Use Python 3.9+ features when appropriate
from typing import Dict, List, Optional, Union, Annotated
from collections.abc import Sequence, Mapping

# Type hints with built-in collections (3.9+)
def process_documents(docs: list[dict[str, str]]) -> list[str]:
    """Process list of document dictionaries."""
    return [doc['title'] for doc in docs]

# Use match statements for complex conditionals (3.10+)
def handle_response_status(status_code: int) -> str:
    match status_code:
        case 200:
            return "success"
        case 404:
            return "not_found"
        case 429:
            return "rate_limited"
        case code if 500 <= code < 600:
            return "server_error"
        case _:
            return "unknown_error"
```

## Project Structure

### Package Organization

```
studyassistant/
├── __init__.py
├── core/                    # Core functionality
│   ├── __init__.py
│   ├── config.py           # Configuration management
│   ├── exceptions.py       # Custom exception classes
│   └── utils.py            # Common utilities
├── data_manager/           # Data management module
│   ├── __init__.py
│   ├── models.py          # Data models
│   ├── repositories.py    # Data access layer
│   └── services.py        # Business logic
├── llm_interface/          # LLM integration
│   ├── __init__.py
│   ├── providers/         # Provider implementations
│   ├── models.py         # LLM models
│   └── services.py       # LLM services
├── external/              # External API integrations
│   ├── __init__.py
│   ├── arxiv/
│   ├── scholar/
│   └── base.py           # Base client classes
└── tests/                # Test suite
    ├── __init__.py
    ├── unit/             # Unit tests
    ├── integration/      # Integration tests
    └── fixtures/         # Test fixtures
```

### Module Design

```python
# __init__.py - Package initialization
"""StudyAssistant: AI-powered academic research assistant."""

__version__ = "1.0.0"
__author__ = "StudyAssistant Team"

# Public API exports
from .core.config import Config
from .data_manager import DataManager
from .llm_interface import LLMInterface

__all__ = [
    "Config",
    "DataManager", 
    "LLMInterface"
]

# models.py - Data model definitions
"""Data models for the StudyAssistant system."""

from dataclasses import dataclass, field
from datetime import datetime
from typing import Dict, List, Optional
from uuid import UUID, uuid4

@dataclass(frozen=True)
class Document:
    """Represents an academic document."""
    
    id: UUID = field(default_factory=uuid4)
    title: str = ""
    content: str = ""
    authors: List[str] = field(default_factory=list)
    metadata: Dict[str, str] = field(default_factory=dict)
    created_at: datetime = field(default_factory=datetime.utcnow)
    
    def __post_init__(self):
        """Validate document data after initialization."""
        if not self.title.strip():
            raise ValueError("Document title cannot be empty")
        if len(self.content) < 10:
            raise ValueError("Document content too short")

# services.py - Business logic implementation
"""Business logic services for document processing."""

from abc import ABC, abstractmethod
from typing import List, Optional

class DocumentService(ABC):
    """Abstract base class for document services."""
    
    @abstractmethod
    async def process_document(self, document: Document) -> ProcessedDocument:
        """Process a document and return processed version."""
        pass

class DefaultDocumentService(DocumentService):
    """Default implementation of document processing service."""
    
    def __init__(self, 
                 processor: DocumentProcessor,
                 validator: DocumentValidator):
        self._processor = processor
        self._validator = validator
    
    async def process_document(self, document: Document) -> ProcessedDocument:
        """Process document with validation and enhancement."""
        # Validate input
        validation_result = await self._validator.validate(document)
        if not validation_result.is_valid:
            raise ValidationError(validation_result.errors)
        
        # Process document
        return await self._processor.process(document)
```

## Type Hints and Annotations

### Comprehensive Type Annotations

```python
from typing import (
    Any, Dict, List, Optional, Union, Callable, Iterator, 
    Protocol, TypeVar, Generic, Literal, Final, ClassVar
)
from typing_extensions import TypedDict, NotRequired
from collections.abc import Sequence, Mapping, AsyncIterator
from dataclasses import dataclass
from pathlib import Path

# Use specific types instead of Any
UserID = str
DocumentID = str
Score = float

# TypedDict for structured dictionaries
class DocumentMetadata(TypedDict):
    title: str
    authors: List[str]
    publication_year: int
    journal: NotRequired[str]  # Optional field
    doi: NotRequired[str]

# Protocol for structural typing
class Searchable(Protocol):
    """Protocol for objects that can be searched."""
    
    def get_search_terms(self) -> List[str]:
        """Return terms for search indexing."""
        ...
    
    def get_relevance_score(self, query: str) -> Score:
        """Calculate relevance score for query."""
        ...

# Generic types
T = TypeVar('T')
K = TypeVar('K')
V = TypeVar('V')

class Repository(Generic[T]):
    """Generic repository interface."""
    
    async def get(self, id: str) -> Optional[T]:
        """Get entity by ID."""
        pass
    
    async def list(self, **filters: Any) -> List[T]:
        """List entities with optional filters."""
        pass
    
    async def save(self, entity: T) -> T:
        """Save entity and return updated version."""
        pass

# Literal types for restricted values
SearchSort = Literal["relevance", "date", "title", "author"]
ProcessingStatus = Literal["pending", "processing", "completed", "failed"]

# Function type annotations
async def search_documents(
    query: str,
    filters: Optional[Dict[str, Union[str, List[str]]]] = None,
    sort: SearchSort = "relevance",
    limit: int = 10,
    offset: int = 0
) -> AsyncIterator[Document]:
    """Search for documents with comprehensive type hints."""
    pass

# Complex return types
SearchResults = Dict[str, Union[List[Document], int, Dict[str, Any]]]

def complex_search(query: str) -> SearchResults:
    """Return complex search results with typed structure."""
    return {
        "documents": [],
        "total_count": 0,
        "facets": {},
        "query_info": {"processed_query": query}
    }
```

### Type Checking Configuration

```ini
# mypy.ini
[mypy]
python_version = 3.9
warn_return_any = True
warn_unused_configs = True
disallow_untyped_defs = True
disallow_incomplete_defs = True
check_untyped_defs = True
disallow_untyped_decorators = True
no_implicit_optional = True
warn_redundant_casts = True
warn_unused_ignores = True
warn_no_return = True
warn_unreachable = True
strict_equality = True

[mypy-tests.*]
disallow_untyped_defs = False

[mypy-third_party.*]
ignore_missing_imports = True
```

## Dataclasses and Pydantic Models

### Dataclasses for Internal Data

```python
from dataclasses import dataclass, field, asdict
from datetime import datetime
from typing import Dict, List, Optional
from uuid import UUID, uuid4

@dataclass(frozen=True)
class ImmutableDocument:
    """Immutable document representation."""
    
    id: UUID = field(default_factory=uuid4)
    title: str = ""
    content: str = ""
    created_at: datetime = field(default_factory=datetime.utcnow)
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary representation."""
        return asdict(self)

@dataclass
class MutableSearchQuery:
    """Mutable search query with validation."""
    
    text: str
    filters: Dict[str, List[str]] = field(default_factory=dict)
    limit: int = 10
    offset: int = 0
    
    def __post_init__(self):
        """Validate query parameters."""
        if not self.text.strip():
            raise ValueError("Query text cannot be empty")
        if self.limit <= 0 or self.limit > 1000:
            raise ValueError("Limit must be between 1 and 1000")
        if self.offset < 0:
            raise ValueError("Offset cannot be negative")
    
    def add_filter(self, key: str, values: List[str]) -> None:
        """Add filter to query."""
        self.filters[key] = values
    
    def clear_filters(self) -> None:
        """Clear all filters."""
        self.filters.clear()

@dataclass
class ProcessingConfig:
    """Configuration for document processing."""
    
    extract_citations: bool = True
    extract_metadata: bool = True
    clean_text: bool = True
    max_content_length: int = 1_000_000
    
    # Custom field with validation
    processing_timeout: float = field(default=30.0)
    
    def __post_init__(self):
        if self.processing_timeout <= 0:
            raise ValueError("Processing timeout must be positive")
```

### Pydantic Models for API Validation

```python
from pydantic import BaseModel, Field, validator, root_validator
from typing import Dict, List, Optional, Union
from datetime import datetime
from enum import Enum

class DocumentType(str, Enum):
    """Supported document types."""
    PAPER = "paper"
    THESIS = "thesis"
    BOOK = "book"
    ARTICLE = "article"

class DocumentCreateRequest(BaseModel):
    """Request model for creating documents."""
    
    title: str = Field(..., min_length=1, max_length=500)
    content: str = Field(..., min_length=10, max_length=1_000_000)
    authors: List[str] = Field(default_factory=list, max_items=20)
    document_type: DocumentType = DocumentType.PAPER
    tags: List[str] = Field(default_factory=list, max_items=50)
    metadata: Dict[str, Union[str, int, float]] = Field(default_factory=dict)
    
    @validator('title')
    def validate_title(cls, v):
        """Validate document title."""
        if not v.strip():
            raise ValueError('Title cannot be empty or whitespace')
        return v.strip()
    
    @validator('authors')
    def validate_authors(cls, v):
        """Validate and clean author list."""
        if not v:
            raise ValueError('At least one author is required')
        
        cleaned_authors = []
        for author in v:
            cleaned = author.strip()
            if cleaned:
                cleaned_authors.append(cleaned)
        
        if not cleaned_authors:
            raise ValueError('At least one valid author is required')
        
        return cleaned_authors
    
    @validator('tags')
    def validate_tags(cls, v):
        """Validate and clean tags."""
        return [tag.strip().lower() for tag in v if tag.strip()]
    
    @root_validator
    def validate_content_type_consistency(cls, values):
        """Validate consistency between content and document type."""
        content = values.get('content', '')
        doc_type = values.get('document_type')
        
        # Example: thesis documents should be longer
        if doc_type == DocumentType.THESIS and len(content) < 5000:
            raise ValueError('Thesis documents should be at least 5000 characters')
        
        return values
    
    class Config:
        """Pydantic configuration."""
        use_enum_values = True
        str_strip_whitespace = True
        validate_assignment = True
        schema_extra = {
            "example": {
                "title": "Machine Learning in Academic Research",
                "content": "This paper explores the applications...",
                "authors": ["Dr. Alice Smith", "Prof. Bob Wilson"],
                "document_type": "paper",
                "tags": ["machine learning", "research", "academia"],
                "metadata": {
                    "journal": "AI Research Quarterly",
                    "publication_year": 2023,
                    "page_count": 25
                }
            }
        }

class DocumentResponse(BaseModel):
    """Response model for document data."""
    
    id: str
    title: str
    content: str
    authors: List[str]
    document_type: DocumentType
    tags: List[str]
    metadata: Dict[str, Union[str, int, float]]
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        orm_mode = True  # Enable SQLAlchemy integration

class SearchRequest(BaseModel):
    """Request model for document search."""
    
    query: str = Field(..., min_length=1, max_length=1000)
    filters: Dict[str, List[str]] = Field(default_factory=dict)
    sort_by: Literal["relevance", "date", "title"] = "relevance"
    sort_order: Literal["asc", "desc"] = "desc"
    limit: int = Field(default=10, ge=1, le=100)
    offset: int = Field(default=0, ge=0)
    
    @validator('query')
    def validate_query(cls, v):
        """Validate search query."""
        cleaned_query = v.strip()
        if not cleaned_query:
            raise ValueError('Query cannot be empty')
        return cleaned_query
```

## Asynchronous Programming

### Async/Await Best Practices

```python
import asyncio
import aiohttp
from typing import List, Dict, Any
from contextlib import asynccontextmanager

class AsyncDocumentProcessor:
    """Async document processor with proper resource management."""
    
    def __init__(self, max_concurrent: int = 10):
        self._semaphore = asyncio.Semaphore(max_concurrent)
        self._session: Optional[aiohttp.ClientSession] = None
    
    async def __aenter__(self):
        """Async context manager entry."""
        self._session = aiohttp.ClientSession()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Async context manager exit."""
        if self._session:
            await self._session.close()
    
    async def process_document(self, document: Document) -> ProcessedDocument:
        """Process single document with concurrency control."""
        async with self._semaphore:
            # Simulate async processing
            await asyncio.sleep(0.1)
            
            # Use session for HTTP requests
            if self._session:
                async with self._session.get(f"https://api.example.com/enhance/{document.id}") as response:
                    enhancement_data = await response.json()
            
            return ProcessedDocument(
                id=document.id,
                title=document.title,
                processed_content=self._process_content(document.content),
                enhancement=enhancement_data
            )
    
    async def process_documents_batch(self, documents: List[Document]) -> List[ProcessedDocument]:
        """Process multiple documents concurrently."""
        tasks = [self.process_document(doc) for doc in documents]
        return await asyncio.gather(*tasks, return_exceptions=True)
    
    async def process_documents_stream(self, documents: List[Document]) -> AsyncIterator[ProcessedDocument]:
        """Process documents as a stream for memory efficiency."""
        for document in documents:
            try:
                result = await self.process_document(document)
                yield result
            except Exception as e:
                # Log error and continue
                logger.error(f"Failed to process document {document.id}: {e}")
                continue

# Usage example
async def main():
    """Example usage of async document processor."""
    documents = await load_documents()
    
    async with AsyncDocumentProcessor(max_concurrent=5) as processor:
        # Process all at once
        results = await processor.process_documents_batch(documents)
        
        # Or process as stream
        async for processed_doc in processor.process_documents_stream(documents):
            await save_processed_document(processed_doc)

# Async database operations
class AsyncRepository:
    """Async repository with proper connection management."""
    
    def __init__(self, connection_pool):
        self._pool = connection_pool
    
    @asynccontextmanager
    async def get_connection(self):
        """Get database connection from pool."""
        async with self._pool.acquire() as connection:
            yield connection
    
    async def get_document(self, doc_id: str) -> Optional[Document]:
        """Get document by ID."""
        async with self.get_connection() as conn:
            query = "SELECT * FROM documents WHERE id = $1"
            row = await conn.fetchrow(query, doc_id)
            return Document(**row) if row else None
    
    async def save_document(self, document: Document) -> Document:
        """Save document to database."""
        async with self.get_connection() as conn:
            query = """
                INSERT INTO documents (id, title, content, authors)
                VALUES ($1, $2, $3, $4)
                ON CONFLICT (id) DO UPDATE SET
                    title = EXCLUDED.title,
                    content = EXCLUDED.content,
                    authors = EXCLUDED.authors,
                    updated_at = NOW()
                RETURNING *
            """
            row = await conn.fetchrow(
                query, document.id, document.title, 
                document.content, document.authors
            )
            return Document(**row)
```

### Error Handling in Async Code

```python
import asyncio
from typing import List, Union
import logging

logger = logging.getLogger(__name__)

class AsyncErrorHandler:
    """Handle errors in async operations."""
    
    @staticmethod
    async def with_retry(
        coro, 
        max_retries: int = 3, 
        delay: float = 1.0,
        backoff: float = 2.0,
        exceptions: tuple = (Exception,)
    ):
        """Retry async operation with exponential backoff."""
        for attempt in range(max_retries + 1):
            try:
                return await coro
            except exceptions as e:
                if attempt == max_retries:
                    logger.error(f"Final attempt failed: {e}")
                    raise
                
                wait_time = delay * (backoff ** attempt)
                logger.warning(f"Attempt {attempt + 1} failed: {e}. Retrying in {wait_time}s")
                await asyncio.sleep(wait_time)
    
    @staticmethod
    async def gather_with_error_handling(
        *coros, 
        return_exceptions: bool = True,
        max_errors: int = None
    ) -> List[Union[Any, Exception]]:
        """Gather coroutines with error handling."""
        results = await asyncio.gather(*coros, return_exceptions=return_exceptions)
        
        if max_errors is not None:
            error_count = sum(1 for r in results if isinstance(r, Exception))
            if error_count > max_errors:
                raise RuntimeError(f"Too many errors: {error_count} > {max_errors}")
        
        return results

# Example usage
async def fetch_document_with_retry(doc_id: str) -> Document:
    """Fetch document with automatic retry."""
    async def _fetch():
        async with aiohttp.ClientSession() as session:
            async with session.get(f"/api/documents/{doc_id}") as response:
                response.raise_for_status()
                data = await response.json()
                return Document(**data)
    
    return await AsyncErrorHandler.with_retry(
        _fetch(),
        max_retries=3,
        exceptions=(aiohttp.ClientError, asyncio.TimeoutError)
    )
```

## Error Handling and Exceptions

### Custom Exception Hierarchy

```python
"""Custom exceptions for StudyAssistant."""

from typing import Dict, Any, Optional, List
import traceback

class StudyAssistantError(Exception):
    """Base exception for all StudyAssistant errors."""
    
    def __init__(
        self, 
        message: str, 
        error_code: Optional[str] = None,
        details: Optional[Dict[str, Any]] = None,
        cause: Optional[Exception] = None
    ):
        super().__init__(message)
        self.message = message
        self.error_code = error_code
        self.details = details or {}
        self.cause = cause
        self.traceback_str = traceback.format_exc() if cause else None
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert exception to dictionary for logging/API responses."""
        return {
            "error_type": self.__class__.__name__,
            "message": self.message,
            "error_code": self.error_code,
            "details": self.details,
            "traceback": self.traceback_str
        }

class ValidationError(StudyAssistantError):
    """Raised when input validation fails."""
    
    def __init__(self, field_errors: Dict[str, List[str]], message: str = "Validation failed"):
        super().__init__(message, error_code="VALIDATION_ERROR", details={"field_errors": field_errors})
        self.field_errors = field_errors

class DataError(StudyAssistantError):
    """Base class for data-related errors."""
    pass

class DocumentNotFoundError(DataError):
    """Raised when requested document doesn't exist."""
    
    def __init__(self, document_id: str):
        super().__init__(
            f"Document with ID '{document_id}' not found",
            error_code="DOCUMENT_NOT_FOUND",
            details={"document_id": document_id}
        )

class DatabaseError(DataError):
    """Raised when database operations fail."""
    
    def __init__(self, operation: str, table: str, cause: Exception):
        super().__init__(
            f"Database {operation} failed on table '{table}': {cause}",
            error_code="DATABASE_ERROR",
            details={"operation": operation, "table": table},
            cause=cause
        )

class ExternalServiceError(StudyAssistantError):
    """Raised when external service calls fail."""
    
    def __init__(self, service: str, endpoint: str, status_code: int, response_text: str):
        super().__init__(
            f"External service '{service}' call failed",
            error_code="EXTERNAL_SERVICE_ERROR",
            details={
                "service": service,
                "endpoint": endpoint,
                "status_code": status_code,
                "response": response_text
            }
        )

class RateLimitError(ExternalServiceError):
    """Raised when API rate limits are exceeded."""
    
    def __init__(self, service: str, retry_after: Optional[int] = None):
        super().__init__(
            service, 
            "rate_limit", 
            429, 
            f"Rate limit exceeded for {service}"
        )
        self.retry_after = retry_after
        self.details["retry_after"] = retry_after

class ProcessingError(StudyAssistantError):
    """Raised when document processing fails."""
    
    def __init__(self, document_id: str, stage: str, cause: Exception):
        super().__init__(
            f"Processing failed for document '{document_id}' at stage '{stage}'",
            error_code="PROCESSING_ERROR",
            details={"document_id": document_id, "stage": stage},
            cause=cause
        )
```

### Error Handling Patterns

```python
import logging
from contextlib import contextmanager
from typing import Type, Union, Callable, Any

logger = logging.getLogger(__name__)

class ErrorHandler:
    """Centralized error handling utilities."""
    
    @staticmethod
    @contextmanager
    def handle_errors(
        operation: str,
        reraise: bool = True,
        default_return: Any = None,
        log_level: int = logging.ERROR
    ):
        """Context manager for consistent error handling."""
        try:
            yield
        except StudyAssistantError:
            # Re-raise our custom exceptions
            if reraise:
                raise
            return default_return
        except Exception as e:
            logger.log(log_level, f"Unexpected error in {operation}: {e}")
            if reraise:
                # Wrap in our exception hierarchy
                raise StudyAssistantError(
                    f"Unexpected error in {operation}",
                    error_code="UNEXPECTED_ERROR",
                    cause=e
                )
            return default_return
    
    @staticmethod
    def safe_execute(
        func: Callable,
        *args,
        default_return: Any = None,
        operation_name: str = None,
        **kwargs
    ) -> Any:
        """Safely execute function with error handling."""
        operation = operation_name or func.__name__
        
        try:
            return func(*args, **kwargs)
        except StudyAssistantError as e:
            logger.error(f"Known error in {operation}: {e}")
            return default_return
        except Exception as e:
            logger.error(f"Unexpected error in {operation}: {e}")
            return default_return

# Usage examples
class DocumentService:
    """Document service with comprehensive error handling."""
    
    def __init__(self, repository: DocumentRepository):
        self._repository = repository
    
    async def get_document(self, doc_id: str) -> Optional[Document]:
        """Get document with error handling."""
        with ErrorHandler.handle_errors("get_document", reraise=False, default_return=None):
            document = await self._repository.get(doc_id)
            if not document:
                raise DocumentNotFoundError(doc_id)
            return document
    
    async def create_document(self, request: DocumentCreateRequest) -> Document:
        """Create document with validation and error handling."""
        try:
            # Validate request
            if not request.title.strip():
                raise ValidationError({"title": ["Title cannot be empty"]})
            
            # Create document
            document = Document(
                title=request.title,
                content=request.content,
                authors=request.authors
            )
            
            # Save to repository
            return await self._repository.save(document)
            
        except ValidationError:
            # Re-raise validation errors
            raise
        except Exception as e:
            # Wrap unexpected errors
            logger.error(f"Failed to create document: {e}")
            raise ProcessingError("unknown", "document_creation", e)
    
    async def process_document_batch(self, documents: List[Document]) -> List[ProcessedDocument]:
        """Process documents with partial failure handling."""
        results = []
        errors = []
        
        for doc in documents:
            try:
                processed = await self._process_single_document(doc)
                results.append(processed)
            except Exception as e:
                error_info = {
                    "document_id": doc.id,
                    "error": str(e),
                    "error_type": type(e).__name__
                }
                errors.append(error_info)
                logger.warning(f"Failed to process document {doc.id}: {e}")
        
        if errors:
            logger.warning(f"Batch processing completed with {len(errors)} errors out of {len(documents)} documents")
        
        return results
```

## Logging and Debugging

### Logging Configuration

```python
import logging
import logging.config
from datetime import datetime
from typing import Dict, Any
import json

# Logging configuration
LOGGING_CONFIG = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "standard": {
            "format": "%(asctime)s [%(levelname)s] %(name)s: %(message)s"
        },
        "detailed": {
            "format": "%(asctime)s [%(levelname)s] %(name)s [%(filename)s:%(lineno)d]: %(message)s"
        },
        "json": {
            "()": "studyassistant.logging.JsonFormatter"
        }
    },
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
            "level": "INFO",
            "formatter": "standard",
            "stream": "ext://sys.stdout"
        },
        "file": {
            "class": "logging.handlers.RotatingFileHandler",
            "level": "DEBUG",
            "formatter": "detailed",
            "filename": "logs/studyassistant.log",
            "maxBytes": 10485760,  # 10MB
            "backupCount": 5
        },
        "json_file": {
            "class": "logging.handlers.RotatingFileHandler",
            "level": "INFO",
            "formatter": "json",
            "filename": "logs/studyassistant.json.log",
            "maxBytes": 10485760,
            "backupCount": 5
        }
    },
    "loggers": {
        "studyassistant": {
            "level": "DEBUG",
            "handlers": ["console", "file", "json_file"],
            "propagate": False
        },
        "httpx": {
            "level": "WARNING",
            "handlers": ["console"],
            "propagate": False
        }
    },
    "root": {
        "level": "INFO",
        "handlers": ["console"]
    }
}

class JsonFormatter(logging.Formatter):
    """JSON formatter for structured logging."""
    
    def format(self, record: logging.LogRecord) -> str:
        """Format log record as JSON."""
        log_data = {
            "timestamp": datetime.utcnow().isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "module": record.module,
            "function": record.funcName,
            "line": record.lineno
        }
        
        # Add extra fields if present
        if hasattr(record, 'extra_data'):
            log_data.update(record.extra_data)
        
        # Add exception info if present
        if record.exc_info:
            log_data["exception"] = self.formatException(record.exc_info)
        
        return json.dumps(log_data)

# Logger setup utility
def setup_logging(config_dict: Dict[str, Any] = None):
    """Set up logging configuration."""
    config = config_dict or LOGGING_CONFIG
    logging.config.dictConfig(config)

# Structured logging helper
class StructuredLogger:
    """Helper for structured logging with context."""
    
    def __init__(self, name: str):
        self.logger = logging.getLogger(name)
    
    def log_with_context(self, level: int, message: str, **context):
        """Log message with additional context."""
        extra_data = {"extra_data": context}
        self.logger.log(level, message, extra=extra_data)
    
    def info(self, message: str, **context):
        """Log info message with context."""
        self.log_with_context(logging.INFO, message, **context)
    
    def error(self, message: str, **context):
        """Log error message with context."""
        self.log_with_context(logging.ERROR, message, **context)
    
    def debug(self, message: str, **context):
        """Log debug message with context."""
        self.log_with_context(logging.DEBUG, message, **context)

# Usage example
logger = StructuredLogger(__name__)

async def process_document(document: Document) -> ProcessedDocument:
    """Process document with structured logging."""
    logger.info(
        "Starting document processing",
        document_id=document.id,
        document_title=document.title,
        content_length=len(document.content)
    )
    
    start_time = datetime.utcnow()
    
    try:
        # Processing logic here
        result = await _perform_processing(document)
        
        processing_time = (datetime.utcnow() - start_time).total_seconds()
        
        logger.info(
            "Document processing completed",
            document_id=document.id,
            processing_time_seconds=processing_time,
            output_size=len(result.content)
        )
        
        return result
        
    except Exception as e:
        processing_time = (datetime.utcnow() - start_time).total_seconds()
        
        logger.error(
            "Document processing failed",
            document_id=document.id,
            processing_time_seconds=processing_time,
            error_type=type(e).__name__,
            error_message=str(e)
        )
        raise
```

### Debugging Utilities

```python
import functools
import time
from typing import Callable, Any
import logging

logger = logging.getLogger(__name__)

def debug_trace(func: Callable) -> Callable:
    """Decorator to trace function calls for debugging."""
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        func_name = f"{func.__module__}.{func.__name__}"
        logger.debug(f"TRACE: Entering {func_name}")
        logger.debug(f"TRACE: Args: {args[:3]}{'...' if len(args) > 3 else ''}")
        logger.debug(f"TRACE: Kwargs: {list(kwargs.keys())}")
        
        start_time = time.time()
        try:
            result = func(*args, **kwargs)
            execution_time = time.time() - start_time
            logger.debug(f"TRACE: {func_name} completed in {execution_time:.3f}s")
            return result
        except Exception as e:
            execution_time = time.time() - start_time
            logger.debug(f"TRACE: {func_name} failed after {execution_time:.3f}s: {e}")
            raise
    
    return wrapper

def performance_monitor(threshold_seconds: float = 1.0):
    """Decorator to monitor function performance."""
    def decorator(func: Callable) -> Callable:
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            start_time = time.time()
            result = func(*args, **kwargs)
            execution_time = time.time() - start_time
            
            if execution_time > threshold_seconds:
                logger.warning(
                    f"Slow function detected: {func.__name__} took {execution_time:.3f}s"
                )
            
            return result
        return wrapper
    return decorator

# Development debugging helpers
class DebugHelper:
    """Helper utilities for debugging."""
    
    @staticmethod
    def dump_object(obj: Any, name: str = "object") -> None:
        """Dump object details for debugging."""
        logger.debug(f"=== {name} ===")
        logger.debug(f"Type: {type(obj)}")
        logger.debug(f"Dir: {[attr for attr in dir(obj) if not attr.startswith('_')]}")
        
        if hasattr(obj, '__dict__'):
            logger.debug(f"Attributes: {obj.__dict__}")
    
    @staticmethod
    def memory_usage() -> str:
        """Get current memory usage information."""
        import psutil
        import os
        
        process = psutil.Process(os.getpid())
        memory_info = process.memory_info()
        
        return f"Memory: RSS={memory_info.rss / 1024 / 1024:.1f}MB, VMS={memory_info.vms / 1024 / 1024:.1f}MB"
```

This comprehensive Python standards document provides specific guidelines for Python development within the StudyAssistant project, covering type hints, async programming, error handling, logging, and debugging practices.
