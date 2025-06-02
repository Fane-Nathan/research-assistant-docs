# Coding Standards

This document outlines the coding standards and best practices for the StudyAssistant project to ensure consistent, maintainable, and high-quality code across all components.

## General Principles

### Code Philosophy

1. **Clarity over Cleverness**: Write code that is easy to read and understand
2. **Consistency**: Follow established patterns throughout the codebase
3. **Simplicity**: Prefer simple solutions over complex ones
4. **Documentation**: Code should be self-documenting with clear names and structure
5. **Testing**: All code should be testable and well-tested
6. **Performance**: Optimize for readability first, performance second (unless critical)

### Design Principles

- **Single Responsibility**: Each function/class should have one clear purpose
- **Open/Closed**: Open for extension, closed for modification
- **DRY (Don't Repeat Yourself)**: Eliminate code duplication
- **YAGNI (You Aren't Gonna Need It)**: Don't implement features until needed
- **Composition over Inheritance**: Prefer composition for code reuse

## Code Formatting

### Automated Formatting

All code must be formatted using automated tools:

```bash
# Python formatting
black .
isort .

# JavaScript/TypeScript formatting
npm run format
# or
prettier --write .

# Auto-format on save (VS Code)
{
  "editor.formatOnSave": true,
  "python.formatting.provider": "black",
  "[javascript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

### Line Length

- **Python**: 88 characters (Black default)
- **JavaScript/TypeScript**: 80 characters
- **Documentation**: 80 characters
- **Comments**: 72 characters

### Indentation

- **Python**: 4 spaces
- **JavaScript/TypeScript**: 2 spaces
- **JSON/YAML**: 2 spaces
- **HTML/CSS**: 2 spaces

## Naming Conventions

### Python Naming

```python
# Variables and functions: snake_case
user_name = "john_doe"
database_connection = None

def calculate_similarity_score(text1: str, text2: str) -> float:
    """Calculate similarity between two texts."""
    pass

# Constants: UPPER_SNAKE_CASE
MAX_RETRIES = 3
DEFAULT_TIMEOUT = 30
API_BASE_URL = "https://api.example.com"

# Classes: PascalCase
class DocumentProcessor:
    """Processes academic documents."""
    
    def __init__(self, config: ProcessorConfig):
        self._config = config
        self._cache = {}
    
    # Private methods: _snake_case
    def _validate_document(self, document: Document) -> bool:
        pass
    
    # Public methods: snake_case
    def process_document(self, document: Document) -> ProcessedDocument:
        pass

# Modules/packages: snake_case
# studyassistant/data_manager/
# studyassistant/llm_interface/
```

### JavaScript/TypeScript Naming

```typescript
// Variables and functions: camelCase
const userName = 'johnDoe';
let databaseConnection: Connection | null = null;

function calculateSimilarityScore(text1: string, text2: string): number {
  // Implementation
  return 0;
}

// Constants: UPPER_SNAKE_CASE
const MAX_RETRIES = 3;
const DEFAULT_TIMEOUT = 30;
const API_BASE_URL = 'https://api.example.com';

// Classes and interfaces: PascalCase
interface DocumentProcessor {
  processDocument(document: Document): Promise<ProcessedDocument>;
}

class DefaultDocumentProcessor implements DocumentProcessor {
  private config: ProcessorConfig;
  private cache: Map<string, any>;
  
  constructor(config: ProcessorConfig) {
    this.config = config;
    this.cache = new Map();
  }
  
  // Private methods: camelCase with private modifier
  private validateDocument(document: Document): boolean {
    return true;
  }
  
  // Public methods: camelCase
  public async processDocument(document: Document): Promise<ProcessedDocument> {
    // Implementation
  }
}

// Enums: PascalCase with UPPER_SNAKE_CASE values
enum ProcessingStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED'
}
```

### File and Directory Naming

```
# Python files: snake_case
data_manager.py
llm_interface.py
hybrid_recommender.py

# JavaScript/TypeScript files: kebab-case or camelCase
document-processor.ts
llmInterface.ts
hybrid-recommender.js

# Directories: snake_case or kebab-case
studyassistant/
  data_manager/
  llm_interface/
  external_apis/
  
frontend/
  src/
    components/
    services/
    utils/
```

## Documentation Standards

### Docstrings

#### Python Docstrings (Google Style)

```python
def process_research_paper(
    paper_content: str,
    extraction_config: ExtractionConfig,
    output_format: str = "json"
) -> ProcessedPaper:
    """Process a research paper and extract key information.
    
    This function analyzes academic papers to extract metadata, citations,
    key findings, and other relevant information for research purposes.
    
    Args:
        paper_content: The full text content of the research paper.
        extraction_config: Configuration object specifying what to extract.
        output_format: Output format, either 'json' or 'xml'. Defaults to 'json'.
    
    Returns:
        ProcessedPaper object containing extracted information including:
        - Metadata (title, authors, journal, etc.)
        - Abstract and key findings
        - Citation list with proper formatting
        - Extracted figures and tables
    
    Raises:
        InvalidContentError: If paper content is empty or malformed.
        ProcessingError: If extraction fails due to technical issues.
        ConfigurationError: If extraction_config is invalid.
    
    Example:
        >>> config = ExtractionConfig(extract_citations=True)
        >>> paper_text = "Title: Machine Learning in Academia..."
        >>> result = process_research_paper(paper_text, config)
        >>> print(result.title)
        'Machine Learning in Academia'
    
    Note:
        This function requires significant computational resources for large
        documents. Consider using batch processing for multiple papers.
    """
    pass

class DataManager:
    """Manages data storage and retrieval for the StudyAssistant system.
    
    The DataManager provides a unified interface for interacting with multiple
    data backends including PostgreSQL for relational data, Elasticsearch for
    search functionality, and Redis for caching.
    
    Attributes:
        config: Configuration object containing database connection details.
        connection_pool: Pool of database connections for efficient access.
        cache_manager: Redis-based cache for frequently accessed data.
    
    Example:
        >>> config = DatabaseConfig(postgres_url="postgresql://...")
        >>> dm = DataManager(config)
        >>> await dm.initialize()
        >>> documents = await dm.search_documents("machine learning")
    """
    
    def __init__(self, config: DatabaseConfig):
        """Initialize DataManager with configuration.
        
        Args:
            config: Database configuration including connection strings,
                   pool settings, and cache configuration.
        """
        pass
```

#### TypeScript Documentation (JSDoc)

```typescript
/**
 * Process a research paper and extract key information.
 * 
 * This function analyzes academic papers to extract metadata, citations,
 * key findings, and other relevant information for research purposes.
 * 
 * @param paperContent - The full text content of the research paper
 * @param extractionConfig - Configuration object specifying what to extract
 * @param outputFormat - Output format, either 'json' or 'xml'
 * @returns Promise resolving to ProcessedPaper object
 * 
 * @throws {InvalidContentError} If paper content is empty or malformed
 * @throws {ProcessingError} If extraction fails due to technical issues
 * @throws {ConfigurationError} If extraction_config is invalid
 * 
 * @example
 * ```typescript
 * const config = new ExtractionConfig({ extractCitations: true });
 * const paperText = "Title: Machine Learning in Academia...";
 * const result = await processResearchPaper(paperText, config);
 * console.log(result.title); // "Machine Learning in Academia"
 * ```
 * 
 * @since 1.0.0
 */
async function processResearchPaper(
  paperContent: string,
  extractionConfig: ExtractionConfig,
  outputFormat: 'json' | 'xml' = 'json'
): Promise<ProcessedPaper> {
  // Implementation
}

/**
 * Manages data storage and retrieval for the StudyAssistant system.
 * 
 * The DataManager provides a unified interface for interacting with multiple
 * data backends including PostgreSQL for relational data, Elasticsearch for
 * search functionality, and Redis for caching.
 * 
 * @example
 * ```typescript
 * const config = new DatabaseConfig({ postgresUrl: "postgresql://..." });
 * const dm = new DataManager(config);
 * await dm.initialize();
 * const documents = await dm.searchDocuments("machine learning");
 * ```
 */
class DataManager {
  private config: DatabaseConfig;
  private connectionPool: ConnectionPool;
  private cacheManager: CacheManager;
  
  /**
   * Initialize DataManager with configuration.
   * 
   * @param config - Database configuration including connection strings,
   *                pool settings, and cache configuration
   */
  constructor(config: DatabaseConfig) {
    // Implementation
  }
}
```

### Comments

#### Inline Comments

```python
# Good comments explain WHY, not WHAT
def calculate_relevance_score(query: str, document: str) -> float:
    # Use TF-IDF for initial scoring as it handles academic vocabulary well
    tfidf_score = calculate_tfidf(query, document)
    
    # Apply academic paper specific boosting for title matches
    if query.lower() in document[:200].lower():  # Check first 200 chars (likely title)
        tfidf_score *= 1.5
    
    # Normalize to 0-1 range for consistent API responses
    return min(tfidf_score / 10.0, 1.0)

# Avoid obvious comments
# Bad: increment counter by 1
counter += 1

# Good: Track processed documents for progress reporting
counter += 1
```

#### TODO Comments

```python
# TODO(username): Description of what needs to be done
# TODO(alice): Implement caching for expensive similarity calculations

# FIXME(username): Description of the bug and urgency
# FIXME(bob): Memory leak in batch processing - investigate connection pooling

# HACK(username): Explanation of temporary solution
# HACK(charlie): Workaround for API rate limiting until official solution available

# NOTE(username): Important information for future developers
# NOTE(dave): This algorithm assumes UTF-8 encoding for all input text
```

### API Documentation

All public APIs must include comprehensive documentation:

```python
from typing import Dict, List, Optional, Union
from dataclasses import dataclass

@dataclass
class SearchQuery:
    """Represents a search query for academic content.
    
    Attributes:
        text: The search query text.
        filters: Optional filters to apply to search results.
        limit: Maximum number of results to return.
        offset: Number of results to skip for pagination.
    """
    text: str
    filters: Optional[Dict[str, Union[str, List[str]]]] = None
    limit: int = 10
    offset: int = 0

class SearchAPI:
    """Public API for searching academic content."""
    
    def search(self, query: SearchQuery) -> SearchResults:
        """Search for academic content.
        
        Args:
            query: SearchQuery object containing search parameters.
            
        Returns:
            SearchResults containing matching documents.
            
        Raises:
            InvalidQueryError: If query is malformed.
            SearchServiceError: If search service is unavailable.
        """
        pass
```

## Error Handling

### Exception Hierarchy

```python
# Base exception for all StudyAssistant errors
class StudyAssistantError(Exception):
    """Base exception for all StudyAssistant errors."""
    
    def __init__(self, message: str, error_code: str = None, details: Dict = None):
        super().__init__(message)
        self.error_code = error_code
        self.details = details or {}

# Specific exception categories
class DataError(StudyAssistantError):
    """Base class for data-related errors."""
    pass

class DatabaseConnectionError(DataError):
    """Raised when database connection fails."""
    pass

class DocumentNotFoundError(DataError):
    """Raised when requested document doesn't exist."""
    pass

class ValidationError(StudyAssistantError):
    """Raised when data validation fails."""
    pass

class ExternalServiceError(StudyAssistantError):
    """Raised when external service calls fail."""
    pass

class RateLimitError(ExternalServiceError):
    """Raised when API rate limits are exceeded."""
    pass
```

### Error Handling Patterns

```python
# Use specific exception types
try:
    document = await data_manager.get_document(doc_id)
except DocumentNotFoundError:
    return {"error": "Document not found", "id": doc_id}
except DatabaseConnectionError as e:
    logger.error(f"Database connection failed: {e}")
    return {"error": "Service temporarily unavailable"}

# Provide context in exceptions
def process_document(document_id: str) -> ProcessedDocument:
    try:
        raw_content = fetch_document_content(document_id)
    except HTTPError as e:
        raise ExternalServiceError(
            f"Failed to fetch document {document_id}",
            error_code="FETCH_FAILED",
            details={"document_id": document_id, "http_status": e.status_code}
        ) from e

# Use context managers for resource cleanup
async def process_large_dataset(dataset_path: str):
    async with DatabaseTransaction() as tx:
        try:
            # Process data within transaction
            results = await process_data(dataset_path, tx)
            await tx.commit()
            return results
        except Exception:
            await tx.rollback()
            raise
```

## Type Hints and Validation

### Python Type Hints

```python
from typing import Dict, List, Optional, Union, TypeVar, Generic, Protocol
from dataclasses import dataclass
from enum import Enum

# Use specific types instead of Any when possible
def process_metadata(metadata: Dict[str, Union[str, int, List[str]]]) -> Dict[str, str]:
    """Process document metadata into standardized format."""
    pass

# Use generic types appropriately
T = TypeVar('T')

class Repository(Generic[T]):
    """Generic repository interface for data access."""
    
    async def get(self, id: str) -> Optional[T]:
        pass
    
    async def list(self, filters: Dict[str, Union[str, int]] = None) -> List[T]:
        pass

# Use protocols for structural typing
class Searchable(Protocol):
    """Protocol for searchable objects."""
    
    def get_search_text(self) -> str:
        """Return text content for search indexing."""
        ...
    
    def get_metadata(self) -> Dict[str, str]:
        """Return searchable metadata."""
        ...

# Use dataclasses for data structures
@dataclass(frozen=True)
class SearchResult:
    """Represents a single search result."""
    id: str
    title: str
    content: str
    score: float
    metadata: Dict[str, str]
    
    def __post_init__(self):
        """Validate search result data."""
        if self.score < 0 or self.score > 1:
            raise ValueError("Score must be between 0 and 1")

# Use enums for constants
class ProcessingStatus(Enum):
    """Document processing status values."""
    PENDING = "pending"
    IN_PROGRESS = "in_progress"  
    COMPLETED = "completed"
    FAILED = "failed"
```

### Input Validation

```python
from pydantic import BaseModel, validator, Field
from typing import List, Optional

class DocumentRequest(BaseModel):
    """Request model for document processing."""
    
    content: str = Field(..., min_length=10, max_length=1000000)
    title: Optional[str] = Field(None, max_length=500)
    authors: List[str] = Field(default_factory=list, max_items=20)
    tags: List[str] = Field(default_factory=list, max_items=50)
    
    @validator('content')
    def validate_content(cls, v):
        """Validate document content."""
        if not v.strip():
            raise ValueError('Content cannot be empty')
        return v.strip()
    
    @validator('authors')
    def validate_authors(cls, v):
        """Validate author list."""
        return [author.strip() for author in v if author.strip()]
    
    class Config:
        """Pydantic configuration."""
        str_strip_whitespace = True
        validate_assignment = True
```

## Testing Standards

### Test Structure

```python
# test_document_processor.py
import pytest
from unittest.mock import Mock, patch, AsyncMock
from studyassistant.processors import DocumentProcessor
from studyassistant.exceptions import ValidationError

class TestDocumentProcessor:
    """Test suite for DocumentProcessor class."""
    
    def setup_method(self):
        """Set up test fixtures before each test method."""
        self.processor = DocumentProcessor()
        self.sample_document = {
            "title": "Machine Learning in Academia",
            "content": "This paper explores...",
            "authors": ["Alice Smith", "Bob Jones"]
        }
    
    def test_process_valid_document(self):
        """Test processing of valid document."""
        # Arrange
        expected_result = ProcessedDocument(
            title="Machine Learning in Academia",
            normalized_content="this paper explores...",
            author_count=2
        )
        
        # Act
        result = self.processor.process(self.sample_document)
        
        # Assert
        assert result.title == expected_result.title
        assert result.author_count == expected_result.author_count
    
    def test_process_invalid_document_raises_error(self):
        """Test that invalid document raises ValidationError."""
        # Arrange
        invalid_document = {"title": "", "content": ""}
        
        # Act & Assert
        with pytest.raises(ValidationError) as exc_info:
            self.processor.process(invalid_document)
        
        assert "title cannot be empty" in str(exc_info.value)
    
    @patch('studyassistant.processors.external_api')
    def test_process_with_external_service(self, mock_api):
        """Test processing with mocked external service."""
        # Arrange
        mock_api.enhance_document.return_value = {"enhanced": True}
        
        # Act
        result = self.processor.process_with_enhancement(self.sample_document)
        
        # Assert
        mock_api.enhance_document.assert_called_once_with(self.sample_document)
        assert result.enhanced is True

# Async test example
class TestAsyncDocumentProcessor:
    """Test suite for async document processing."""
    
    @pytest.mark.asyncio
    async def test_async_process_document(self):
        """Test async document processing."""
        processor = AsyncDocumentProcessor()
        
        result = await processor.process(self.sample_document)
        
        assert result is not None
        assert result.processing_time > 0
```

### Test Naming

```python
# Test method naming: test_[unit_under_test]_[scenario]_[expected_result]
def test_search_documents_with_valid_query_returns_results(self):
    pass

def test_search_documents_with_empty_query_raises_validation_error(self):
    pass

def test_search_documents_when_service_unavailable_raises_service_error(self):    
    pass

# Use descriptive test data
@pytest.fixture
def valid_research_paper():
    return {
        "title": "Deep Learning Applications in Natural Language Processing",
        "authors": ["Dr. Alice Smith", "Prof. Bob Wilson"],
        "abstract": "This paper presents novel approaches...",
        "content": "1. Introduction\nNatural language processing...",
        "publication_year": 2023,
        "journal": "Journal of AI Research"
    }

@pytest.fixture
def invalid_research_paper():
    return {
        "title": "",  # Invalid: empty title
        "authors": [],  # Invalid: no authors
        "content": "x" * 10  # Invalid: too short
    }
```

## Performance Guidelines

### Optimization Principles

1. **Measure First**: Profile before optimizing
2. **Optimize Bottlenecks**: Focus on the slowest parts
3. **Consider Readability**: Don't sacrifice clarity for minor gains
4. **Use Appropriate Data Structures**: Choose the right tool for the job

### Common Optimizations

```python
# Use generators for large datasets
def process_large_dataset(dataset_path: str):
    """Process large dataset without loading everything into memory."""
    with open(dataset_path, 'r') as file:
        for line in file:
            # Process one line at a time
            yield process_line(line)

# Use list comprehensions appropriately
# Good: Simple transformations
processed_items = [item.upper() for item in items if item]

# Better for complex logic: Use regular functions
def process_complex_items(items):
    results = []
    for item in items:
        if should_process(item):
            processed = complex_processing(item)
            if processed.is_valid():
                results.append(processed)
    return results

# Use caching for expensive operations
from functools import lru_cache

@lru_cache(maxsize=128)
def expensive_calculation(data: str) -> float:
    """Cache results of expensive calculations."""
    # Complex computation here
    return result

# Use async/await for I/O operations
async def fetch_multiple_documents(doc_ids: List[str]) -> List[Document]:
    """Fetch documents concurrently."""
    tasks = [fetch_document(doc_id) for doc_id in doc_ids]
    return await asyncio.gather(*tasks)
```

## Security Guidelines

### Input Validation

```python
import re
from html import escape

def sanitize_user_input(user_input: str) -> str:
    """Sanitize user input to prevent injection attacks."""
    # Remove potentially dangerous characters
    sanitized = re.sub(r'[<>&"\']', '', user_input)
    
    # Limit length
    sanitized = sanitized[:1000]
    
    # HTML escape for display
    return escape(sanitized)

def validate_query_parameters(params: Dict[str, str]) -> Dict[str, str]:
    """Validate and sanitize query parameters."""
    allowed_params = {'query', 'limit', 'offset', 'sort'}
    
    validated = {}
    for key, value in params.items():
        if key in allowed_params:
            validated[key] = sanitize_user_input(value)
    
    return validated
```

### Secrets Management

```python
import os
from typing import Optional

def get_secret(key: str, default: Optional[str] = None) -> str:
    """Get secret from environment variables."""
    value = os.getenv(key, default)
    
    if value is None:
        raise ValueError(f"Required secret {key} not found in environment")
    
    return value

# Don't commit secrets to code
API_KEY = get_secret('OPENAI_API_KEY')  # Good
# API_KEY = 'sk-abc123...'  # Bad - never do this
```

## Code Review Guidelines

### Review Checklist

#### Functionality
- [ ] Code works as intended
- [ ] Edge cases are handled
- [ ] Error conditions are addressed
- [ ] Tests are comprehensive

#### Code Quality
- [ ] Code follows naming conventions
- [ ] Functions are single-purpose and reasonably sized
- [ ] Complex logic is commented
- [ ] No code duplication

#### Performance
- [ ] No obvious performance issues
- [ ] Appropriate data structures used
- [ ] Database queries are efficient
- [ ] Memory usage is reasonable

#### Security
- [ ] Input validation is present
- [ ] No hardcoded secrets
- [ ] Error messages don't leak information
- [ ] Access controls are appropriate

### Review Comments

```python
# Good review comments are specific and constructive

# Instead of: "This is wrong"
# Write: "This function could return None if the database is empty. 
#        Consider adding a null check or documenting this behavior."

# Instead of: "Fix performance"
# Write: "This loops through all users for each query. Consider adding 
#        an index on the email field or caching frequent lookups."

# Instead of: "Use better names"
# Write: "Consider renaming 'process_stuff' to 'extract_citations' 
#        to better describe what this function does."
```

## Pre-commit Hooks

### Setup

```bash
# Install pre-commit
pip install pre-commit

# Install hooks
pre-commit install
```

### Configuration (.pre-commit-config.yaml)

```yaml
repos:
  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v4.4.0
    hooks:
      - id: trailing-whitespace
      - id: end-of-file-fixer
      - id: check-yaml
      - id: check-added-large-files
      - id: check-merge-conflict

  - repo: https://github.com/psf/black
    rev: 23.3.0
    hooks:
      - id: black
        language_version: python3

  - repo: https://github.com/pycqa/isort
    rev: 5.12.0
    hooks:
      - id: isort

  - repo: https://github.com/pycqa/flake8
    rev: 6.0.0
    hooks:
      - id: flake8
        additional_dependencies: [flake8-docstrings]

  - repo: https://github.com/pre-commit/mirrors-mypy
    rev: v1.3.0
    hooks:
      - id: mypy
        additional_dependencies: [types-requests]
```

These coding standards ensure consistent, maintainable, and high-quality code across the StudyAssistant project. All contributors should follow these guidelines and use the provided tools to maintain code quality.
