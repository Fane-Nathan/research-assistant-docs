# Project Structure

Understanding the StudyAssistant project structure is essential for effective development. This guide provides a comprehensive overview of the codebase organization, conventions, and architectural patterns.

## Repository Overview

```
studyassistant/
├── README.md                   # Project overview and quick start
├── LICENSE                     # MIT License
├── pyproject.toml             # Project configuration and dependencies
├── setup.py                   # Package setup script
├── requirements.txt           # Production dependencies
├── requirements-dev.txt       # Development dependencies
├── .gitignore                # Git ignore patterns
├── .github/                  # GitHub workflows and templates
│   ├── workflows/
│   │   ├── ci.yml           # Continuous integration
│   │   ├── release.yml      # Release automation
│   │   └── docs.yml         # Documentation deployment
│   └── ISSUE_TEMPLATE/      # Issue templates
├── docs/                     # Documentation source
├── tests/                    # Test suite
├── scripts/                  # Development and deployment scripts
├── docker/                   # Docker configurations
├── configs/                  # Configuration templates
└── src/                      # Source code
    └── studyassistant/
```

## Source Code Structure

### Core Package Organization

```
src/studyassistant/
├── __init__.py               # Package initialization and main API
├── core/                     # Core business logic
│   ├── __init__.py
│   ├── search.py            # Search orchestration
│   ├── retrieval.py         # Information retrieval
│   ├── generation.py        # Text generation
│   ├── analysis.py          # Content analysis
│   └── pipeline.py          # RAG pipeline implementation
├── data/                     # Data management
│   ├── __init__.py
│   ├── sources/             # Data source implementations
│   │   ├── __init__.py
│   │   ├── arxiv.py        # arXiv integration
│   │   ├── pubmed.py       # PubMed integration
│   │   ├── semantic_scholar.py  # Semantic Scholar API
│   │   ├── local_files.py  # Local file processing
│   │   └── base.py         # Base data source class
│   ├── storage/             # Data storage backends
│   │   ├── __init__.py
│   │   ├── vector_db.py    # Vector database interface
│   │   ├── document_db.py  # Document storage
│   │   ├── cache.py        # Caching layer
│   │   └── index.py        # Search indexing
│   ├── models/              # Data models
│   │   ├── __init__.py
│   │   ├── document.py     # Document model
│   │   ├── query.py        # Query model
│   │   ├── result.py       # Search result model
│   │   └── metadata.py     # Metadata schemas
│   └── processors/          # Data processing
│       ├── __init__.py
│       ├── text_processor.py    # Text processing
│       ├── pdf_processor.py     # PDF extraction
│       ├── citation_processor.py  # Citation parsing
│       └── metadata_extractor.py # Metadata extraction
├── nlp/                      # Natural Language Processing
│   ├── __init__.py
│   ├── embeddings/          # Embedding models
│   │   ├── __init__.py
│   │   ├── sentence_transformer.py
│   │   ├── openai_embeddings.py
│   │   └── custom_embeddings.py
│   ├── search/              # Search algorithms
│   │   ├── __init__.py
│   │   ├── vector_search.py
│   │   ├── keyword_search.py
│   │   ├── hybrid_search.py
│   │   └── ranking.py
│   ├── processing/          # Text processing
│   │   ├── __init__.py
│   │   ├── tokenization.py
│   │   ├── normalization.py
│   │   ├── entity_extraction.py
│   │   └── keyword_extraction.py
│   └── generation/          # Text generation
│       ├── __init__.py
│       ├── llm_interface.py
│       ├── prompt_templates.py
│       └── response_processing.py
├── api/                      # API implementations
│   ├── __init__.py
│   ├── rest/                # REST API server
│   │   ├── __init__.py
│   │   ├── app.py          # FastAPI application
│   │   ├── routes/         # API route handlers
│   │   │   ├── __init__.py
│   │   │   ├── search.py
│   │   │   ├── documents.py
│   │   │   ├── analysis.py
│   │   │   └── admin.py
│   │   ├── middleware/     # API middleware
│   │   ├── auth/          # Authentication
│   │   └── schemas/       # Pydantic schemas
│   └── cli/               # Command-line interface
│       ├── __init__.py
│       ├── main.py        # Main CLI entry point
│       ├── commands/      # CLI command implementations
│       │   ├── __init__.py
│       │   ├── search.py
│       │   ├── config.py
│       │   ├── data.py
│       │   └── admin.py
│       └── utils.py       # CLI utilities
├── web/                   # Web interface
│   ├── __init__.py
│   ├── streamlit_app.py  # Streamlit application
│   ├── components/       # Reusable components
│   ├── pages/           # Application pages
│   └── utils/           # Web utilities
├── config/              # Configuration management
│   ├── __init__.py
│   ├── settings.py      # Settings classes
│   ├── defaults.py      # Default configurations
│   └── validation.py    # Configuration validation
├── utils/               # Utility functions
│   ├── __init__.py
│   ├── logging.py       # Logging configuration
│   ├── metrics.py       # Performance metrics
│   ├── exceptions.py    # Custom exceptions
│   ├── decorators.py    # Utility decorators
│   └── helpers.py       # General helpers
├── integrations/        # External service integrations
│   ├── __init__.py
│   ├── openai.py       # OpenAI integration
│   ├── anthropic.py    # Anthropic integration
│   ├── pinecone.py     # Pinecone vector DB
│   ├── weaviate.py     # Weaviate vector DB
│   └── monitoring.py   # Monitoring services
└── scripts/             # Utility scripts
    ├── __init__.py
    ├── setup_database.py
    ├── migrate_data.py
    ├── backup_restore.py
    └── performance_test.py
```

## Architecture Patterns

### 1. Layered Architecture

The project follows a layered architecture pattern:

```python
# Presentation Layer (API/CLI/Web)
from studyassistant.api.rest.app import app
from studyassistant.api.cli.main import cli
from studyassistant.web.streamlit_app import web_app

# Business Logic Layer (Core)
from studyassistant.core.search import SearchEngine
from studyassistant.core.pipeline import RAGPipeline

# Data Access Layer (Data)
from studyassistant.data.storage.vector_db import VectorDatabase
from studyassistant.data.sources.arxiv import ArxivSource

# Infrastructure Layer (Utils/Integrations)
from studyassistant.utils.logging import setup_logging
from studyassistant.integrations.openai import OpenAIClient
```

### 2. Plugin Architecture

Data sources and processors use a plugin-based architecture:

```python
# Base classes for extensibility
from abc import ABC, abstractmethod

class BaseDataSource(ABC):
    @abstractmethod
    def search(self, query: str) -> List[Document]:
        pass

class BaseProcessor(ABC):
    @abstractmethod
    def process(self, content: str) -> ProcessedContent:
        pass

# Plugin registration
class PluginRegistry:
    def __init__(self):
        self._sources = {}
        self._processors = {}
    
    def register_source(self, name: str, source_class: Type[BaseDataSource]):
        self._sources[name] = source_class
    
    def register_processor(self, name: str, processor_class: Type[BaseProcessor]):
        self._processors[name] = processor_class
```

### 3. Factory Pattern

Used for creating configured instances:

```python
class DatabaseFactory:
    @staticmethod
    def create_vector_db(config: Dict) -> VectorDatabase:
        provider = config.get("provider", "pinecone")
        
        if provider == "pinecone":
            return PineconeVectorDB(config)
        elif provider == "weaviate":
            return WeaviateVectorDB(config)
        elif provider == "local":
            return LocalVectorDB(config)
        else:
            raise ValueError(f"Unknown vector DB provider: {provider}")

class EmbeddingFactory:
    @staticmethod
    def create_embedding_model(config: Dict) -> EmbeddingModel:
        model_type = config.get("type", "sentence_transformer")
        
        if model_type == "sentence_transformer":
            return SentenceTransformerEmbedding(config)
        elif model_type == "openai":
            return OpenAIEmbedding(config)
        else:
            raise ValueError(f"Unknown embedding type: {model_type}")
```

## Configuration Management

### Configuration Files

```yaml
# configs/default.yaml
system:
  debug: false
  log_level: "INFO"
  data_dir: "~/.studyassistant"

data_sources:
  arxiv:
    enabled: true
    rate_limit: 3
    max_results: 1000
  
  pubmed:
    enabled: true
    email: null
    api_key: null
    rate_limit: 10

search:
  default_max_results: 20
  similarity_threshold: 0.7
  hybrid_weights:
    vector: 0.6
    keyword: 0.4

llm:
  provider: "openai"
  model: "gpt-4"
  temperature: 0.7
  max_tokens: 1000

vector_db:
  provider: "pinecone"
  dimension: 768
  metric: "cosine"
```

### Configuration Classes

```python
from pydantic import BaseSettings, Field
from typing import Optional, Dict, List

class DataSourceConfig(BaseSettings):
    enabled: bool = True
    rate_limit: int = 10
    max_results: int = 100

class ArxivConfig(DataSourceConfig):
    base_url: str = "https://export.arxiv.org/api/query"
    categories: List[str] = ["cs.AI", "cs.LG"]

class PubMedConfig(DataSourceConfig):
    email: Optional[str] = None
    api_key: Optional[str] = None
    base_url: str = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/"

class SearchConfig(BaseSettings):
    default_max_results: int = 20
    similarity_threshold: float = 0.7
    hybrid_weights: Dict[str, float] = {"vector": 0.6, "keyword": 0.4}

class LLMConfig(BaseSettings):
    provider: str = "openai"
    model: str = "gpt-4"
    temperature: float = 0.7
    max_tokens: int = 1000
    api_key: Optional[str] = Field(None, env="OPENAI_API_KEY")

class StudyAssistantConfig(BaseSettings):
    debug: bool = False
    log_level: str = "INFO"
    data_dir: str = "~/.studyassistant"
    
    # Nested configurations
    arxiv: ArxivConfig = ArxivConfig()
    pubmed: PubMedConfig = PubMedConfig()
    search: SearchConfig = SearchConfig()
    llm: LLMConfig = LLMConfig()
    
    class Config:
        env_prefix = "STUDYASSISTANT_"
        env_nested_delimiter = "__"
```

## Data Models

### Core Data Models

```python
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum

class DocumentType(str, Enum):
    PAPER = "paper"
    PREPRINT = "preprint"
    BOOK = "book"
    CHAPTER = "chapter"
    THESIS = "thesis"
    REPORT = "report"

class Author(BaseModel):
    name: str
    affiliation: Optional[str] = None
    email: Optional[str] = None
    orcid: Optional[str] = None

class Citation(BaseModel):
    title: str
    authors: List[str]
    venue: Optional[str] = None
    year: Optional[int] = None
    doi: Optional[str] = None

class Document(BaseModel):
    id: str = Field(..., description="Unique document identifier")
    title: str
    abstract: Optional[str] = None
    authors: List[Author] = []
    publication_date: Optional[datetime] = None
    venue: Optional[str] = None
    document_type: DocumentType = DocumentType.PAPER
    url: Optional[str] = None
    doi: Optional[str] = None
    keywords: List[str] = []
    citation_count: int = 0
    references: List[Citation] = []
    content: Optional[str] = None  # Full text content
    metadata: Dict[str, Any] = {}
    
    # Processing metadata
    processed_at: Optional[datetime] = None
    embedding_model: Optional[str] = None
    embedding_version: Optional[str] = None

class Query(BaseModel):
    text: str
    intent: Optional[str] = None
    domain: Optional[str] = None
    filters: Dict[str, Any] = {}
    max_results: int = 20
    similarity_threshold: float = 0.7

class SearchResult(BaseModel):
    document: Document
    score: float
    source: str
    highlights: List[str] = []
    explanation: Optional[str] = None
```

## Testing Structure

### Test Organization

```
tests/
├── conftest.py                 # Pytest configuration and fixtures
├── unit/                       # Unit tests
│   ├── core/
│   │   ├── test_search.py
│   │   ├── test_retrieval.py
│   │   └── test_pipeline.py
│   ├── data/
│   │   ├── sources/
│   │   │   ├── test_arxiv.py
│   │   │   ├── test_pubmed.py
│   │   │   └── test_semantic_scholar.py
│   │   └── processors/
│   │       ├── test_text_processor.py
│   │       └── test_pdf_processor.py
│   ├── nlp/
│   │   ├── test_embeddings.py
│   │   ├── test_search.py
│   │   └── test_processing.py
│   └── api/
│       ├── test_rest_api.py
│       └── test_cli.py
├── integration/                # Integration tests
│   ├── test_end_to_end.py
│   ├── test_data_pipeline.py
│   └── test_api_integration.py
├── performance/                # Performance tests
│   ├── test_search_performance.py
│   ├── test_embedding_performance.py
│   └── load_test.py
├── fixtures/                   # Test data and fixtures
│   ├── sample_documents.json
│   ├── test_papers/
│   └── mock_responses/
└── utils/                      # Test utilities
    ├── helpers.py
    ├── mocks.py
    └── data_generators.py
```

### Test Categories

#### Unit Tests

```python
# tests/unit/core/test_search.py
import pytest
from unittest.mock import Mock, patch
from studyassistant.core.search import SearchEngine
from studyassistant.data.models.query import Query

class TestSearchEngine:
    def setup_method(self):
        self.mock_retriever = Mock()
        self.mock_ranker = Mock()
        self.search_engine = SearchEngine(
            retriever=self.mock_retriever,
            ranker=self.mock_ranker
        )
    
    def test_search_basic_query(self):
        # Arrange
        query = Query(text="machine learning")
        mock_results = [Mock(score=0.9), Mock(score=0.8)]
        self.mock_retriever.retrieve.return_value = mock_results
        self.mock_ranker.rank.return_value = mock_results
        
        # Act
        results = self.search_engine.search(query)
        
        # Assert
        assert len(results) == 2
        self.mock_retriever.retrieve.assert_called_once_with(query)
        self.mock_ranker.rank.assert_called_once()
    
    @pytest.mark.parametrize("query_text,expected_intent", [
        ("what is machine learning", "definition"),
        ("compare CNN and RNN", "comparison"),
        ("how to implement transformer", "methodology")
    ])
    def test_query_intent_detection(self, query_text, expected_intent):
        query = Query(text=query_text)
        intent = self.search_engine.detect_intent(query)
        assert intent == expected_intent
```

#### Integration Tests

```python
# tests/integration/test_end_to_end.py
import pytest
from studyassistant import StudyAssistant
from studyassistant.config.settings import StudyAssistantConfig

class TestEndToEndWorkflow:
    @pytest.fixture
    def study_assistant(self):
        config = StudyAssistantConfig(
            debug=True,
            llm__provider="mock"  # Use mock provider for testing
        )
        return StudyAssistant(config=config)
    
    async def test_complete_search_workflow(self, study_assistant):
        # Test complete workflow from query to response
        query = "transformer neural networks attention mechanism"
        
        results = await study_assistant.search(query, max_results=10)
        
        assert len(results) > 0
        assert all(result.score > 0 for result in results)
        assert all(result.document.title for result in results)
    
    async def test_document_processing_workflow(self, study_assistant, sample_pdf):
        # Test document upload and processing
        doc_id = study_assistant.add_document(sample_pdf)
        
        # Verify document was processed
        document = study_assistant.get_document(doc_id)
        assert document is not None
        assert document.content is not None
        assert len(document.keywords) > 0
```

## Development Workflows

### Git Workflow

```bash
# Feature development workflow
git checkout main
git pull origin main
git checkout -b feature/new-search-algorithm

# Make changes and commit
git add .
git commit -m "feat: implement semantic search algorithm"

# Push and create pull request
git push origin feature/new-search-algorithm
```

### Code Quality Checks

```bash
# Run all quality checks
make check

# Individual checks
make lint      # Run linting (flake8, black, isort)
make type      # Run type checking (mypy)
make test      # Run test suite
make coverage  # Generate coverage report
```

### Release Process

```bash
# Version bumping
bump2version patch  # For bug fixes
bump2version minor  # For new features
bump2version major  # For breaking changes

# Build and publish
make build
make publish
```

## Documentation Structure

### Documentation Organization

```
docs/
├── index.md                    # Main documentation index
├── getting-started/           # User onboarding
├── user-guide/               # User documentation
├── architecture/             # Technical architecture
├── api/                      # API documentation
├── development/              # Developer documentation
├── deployment/               # Deployment guides
└── reference/                # Reference materials
```

### API Documentation Generation

```python
# scripts/generate_api_docs.py
import inspect
from typing import get_type_hints
from studyassistant import StudyAssistant

def generate_api_docs():
    """Generate API documentation from docstrings and type hints"""
    
    classes = [StudyAssistant]
    
    for cls in classes:
        doc = f"# {cls.__name__}\n\n"
        doc += f"{cls.__doc__}\n\n"
        
        # Document methods
        for name, method in inspect.getmembers(cls, inspect.ismethod):
            if not name.startswith('_'):
                doc += f"## {name}\n\n"
                doc += f"{method.__doc__}\n\n"
                
                # Add type hints
                hints = get_type_hints(method)
                if hints:
                    doc += "**Parameters:**\n\n"
                    for param, type_hint in hints.items():
                        if param != 'return':
                            doc += f"- `{param}`: {type_hint}\n"
        
        # Write to file
        with open(f"docs/api/{cls.__name__.lower()}.md", "w") as f:
            f.write(doc)
```

## Performance Considerations

### Profiling Setup

```python
# scripts/profile_performance.py
import cProfile
import pstats
from studyassistant import StudyAssistant

def profile_search():
    """Profile search performance"""
    sa = StudyAssistant()
    
    # Profile search operation
    profiler = cProfile.Profile()
    profiler.enable()
    
    results = sa.search("machine learning", max_results=100)
    
    profiler.disable()
    
    # Generate performance report
    stats = pstats.Stats(profiler)
    stats.sort_stats('cumulative')
    stats.print_stats(20)
    
    return results

if __name__ == "__main__":
    profile_search()
```

### Memory Management

```python
# Memory-efficient data processing
import gc
from typing import Iterator

class DataProcessor:
    def process_documents_batch(self, documents: Iterator[Document], 
                               batch_size: int = 100) -> Iterator[ProcessedDocument]:
        """Process documents in batches to manage memory"""
        
        batch = []
        for document in documents:
            batch.append(document)
            
            if len(batch) >= batch_size:
                # Process batch
                processed_batch = self._process_batch(batch)
                yield from processed_batch
                
                # Clear batch and force garbage collection
                batch.clear()
                gc.collect()
        
        # Process remaining documents
        if batch:
            processed_batch = self._process_batch(batch)
            yield from processed_batch
```

## Deployment Considerations

### Docker Configuration

```dockerfile
# docker/Dockerfile
FROM python:3.9-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code
COPY src/ src/
COPY configs/ configs/

# Install package
RUN pip install -e .

# Expose port
EXPOSE 8000

# Start application
CMD ["uvicorn", "studyassistant.api.rest.app:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Environment Configuration

```yaml
# docker-compose.yml
version: '3.8'

services:
  studyassistant:
    build: .
    ports:
      - "8000:8000"
    environment:
      - STUDYASSISTANT_DEBUG=false
      - STUDYASSISTANT_LLM__API_KEY=${OPENAI_API_KEY}
    volumes:
      - ./data:/app/data
      - ./logs:/app/logs
    depends_on:
      - redis
      - postgres
  
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
  
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: studyassistant
      POSTGRES_USER: sa_user
      POSTGRES_PASSWORD: sa_password
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

This project structure provides a solid foundation for scalable development, maintainability, and deployment of the StudyAssistant system. The modular architecture allows for easy extension and modification of individual components while maintaining clear separation of concerns.
