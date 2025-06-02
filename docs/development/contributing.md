# Contributing to StudyAssistant

Welcome to the StudyAssistant project! We're excited to have you contribute to advancing AI-powered research assistance. This guide will help you get started with contributing code, documentation, and improvements to the project.

## Table of Contents

- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Contribution Workflow](#contribution-workflow)
- [Types of Contributions](#types-of-contributions)
- [Community Guidelines](#community-guidelines)

## Getting Started

### Prerequisites

Before you begin, ensure you have:

- **Python 3.8+** installed
- **Git** for version control
- **GitHub account** for pull requests
- **Basic knowledge** of machine learning and NLP concepts
- **Familiarity** with async Python programming

### Quick Setup

```bash
# Fork the repository on GitHub, then clone your fork
git clone https://github.com/YOUR_USERNAME/Research-Assistant.git
cd Research-Assistant

# Add upstream remote
git remote add upstream https://github.com/Fane-Nathan/Research-Assistant.git

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install development dependencies
pip install -r requirements-dev.txt

# Install pre-commit hooks
pre-commit install

# Run tests to verify setup
pytest tests/
```

## Development Setup

### Development Environment

#### 1. Virtual Environment Setup

```bash
# Create isolated Python environment
python -m venv studyassistant-dev
source studyassistant-dev/bin/activate

# Upgrade pip and install build tools
pip install --upgrade pip setuptools wheel
```

#### 2. Install Dependencies

```bash
# Install core dependencies
pip install -r requirements.txt

# Install development dependencies
pip install -r requirements-dev.txt

# Install package in editable mode
pip install -e .
```

#### 3. Environment Configuration

Create a development `.env` file:

```bash
cp .env.example .env.dev
```

Edit `.env.dev` with development settings:

```env
# Development Environment
ENVIRONMENT=development
DEBUG=true
LOG_LEVEL=DEBUG

# API Keys (use test keys for development)
GOOGLE_API_KEY=your_development_api_key

# Development Database
DATABASE_URL=sqlite:///dev_studyassistant.db

# Development Settings
ENABLE_PROFILING=true
CACHE_EMBEDDINGS=true
MAX_CONCURRENT_REQUESTS=2
```

#### 4. IDE Configuration

**VS Code Setup** (`.vscode/settings.json`):

```json
{
    "python.defaultInterpreterPath": "./venv/bin/python",
    "python.linting.enabled": true,
    "python.linting.pylintEnabled": false,
    "python.linting.flake8Enabled": true,
    "python.linting.mypyEnabled": true,
    "python.formatting.provider": "black",
    "python.sortImports.args": ["--profile", "black"],
    "python.testing.pytestEnabled": true,
    "python.testing.pytestArgs": ["tests/"],
    "files.exclude": {
        "**/__pycache__": true,
        "**/*.pyc": true,
        ".pytest_cache": true,
        ".mypy_cache": true
    }
}
```

### Development Dependencies

The project uses several development tools:

```python
# requirements-dev.txt
pytest>=7.0.0                  # Testing framework
pytest-asyncio>=0.21.0         # Async testing support
pytest-cov>=4.0.0              # Coverage reporting
black>=23.0.0                  # Code formatting
isort>=5.12.0                  # Import sorting
flake8>=6.0.0                  # Linting
mypy>=1.0.0                    # Type checking
pre-commit>=3.0.0              # Git hooks
sphinx>=6.0.0                  # Documentation
sphinx-rtd-theme>=1.2.0        # Documentation theme
jupyter>=1.0.0                 # Notebooks for experimentation
ipykernel>=6.0.0               # Jupyter kernel
```

## Project Structure

Understanding the codebase organization:

```
Research-Assistant/
├── hybrid_search_rag/              # Main package
│   ├── __init__.py
│   ├── config.py                   # Configuration management
│   ├── data_handling/              # Data ingestion and management
│   │   ├── __init__.py
│   │   ├── data_manager.py         # Data storage and retrieval
│   │   └── resource_fetcher.py     # External data fetching
│   ├── embedding_services/         # Text embedding services
│   │   ├── __init__.py
│   │   ├── gemini_embedder.py      # Google Gemini embeddings
│   │   └── manual_embedder.py      # Alternative embedding services
│   ├── llm_services/               # Language model services
│   │   ├── __init__.py
│   │   └── llm_interface.py        # LLM provider interface
│   ├── retrieval_algorithm/        # Search and retrieval
│   │   ├── __init__.py
│   │   └── hybrid_recommender.py   # Hybrid search implementation
│   ├── text_processing/            # NLP and text processing
│   │   ├── __init__.py
│   │   └── nltk_processor.py       # Text preprocessing
│   └── evaluation/                 # Evaluation and metrics
│       ├── __init__.py
│       ├── evaluator.py            # System evaluation
│       └── metrics.py              # Performance metrics
├── scripts/                        # CLI and utility scripts
│   ├── cli.py                      # Main CLI interface
│   ├── data_ingestion.py           # Data ingestion scripts
│   └── evaluation_runner.py        # Evaluation automation
├── tests/                          # Test suite
│   ├── unit/                       # Unit tests
│   ├── integration/                # Integration tests
│   ├── conftest.py                 # Pytest configuration
│   └── test_data/                  # Test datasets
├── docs/                           # Documentation source
├── notebooks/                      # Jupyter notebooks for research
├── app.py                          # Streamlit web application
├── requirements.txt                # Production dependencies
├── requirements-dev.txt            # Development dependencies
├── setup.py                        # Package setup
├── pyproject.toml                  # Project configuration
└── README.md                       # Project overview
```

### Key Modules

#### Core Components

- **`config.py`**: Centralized configuration management
- **`hybrid_recommender.py`**: Main search and recommendation engine
- **`llm_interface.py`**: Large language model integration
- **`data_manager.py`**: Document storage and retrieval

#### Service Layers

- **`embedding_services/`**: Text embedding generation and management
- **`text_processing/`**: NLP preprocessing and text analysis
- **`evaluation/`**: System performance evaluation and metrics

#### User Interfaces

- **`scripts/cli.py`**: Command-line interface
- **`app.py`**: Streamlit web application

## Coding Standards

### Python Style Guide

We follow **PEP 8** with some specific conventions:

#### Code Formatting

```python
# Use Black for automatic formatting
black --line-length 88 --target-version py38 .

# Use isort for import organization  
isort --profile black .
```

#### Type Hints

**Required for all public functions**:

```python
from typing import List, Dict, Optional, Union, Tuple
import asyncio

async def search_documents(
    query: str,
    max_results: int = 10,
    filters: Optional[Dict[str, Union[str, int]]] = None
) -> List[SearchResult]:
    """
    Search for documents matching the query.
    
    Args:
        query: Search query string
        max_results: Maximum number of results to return
        filters: Optional filters to apply
        
    Returns:
        List of search results sorted by relevance
        
    Raises:
        QueryError: If query is malformed
        SearchError: If search operation fails
    """
    pass
```

#### Docstring Format

Use **Google-style docstrings**:

```python
class HybridRecommender:
    """
    Hybrid search engine combining semantic and keyword search.
    
    This class implements a sophisticated search algorithm that combines
    vector-based semantic search with traditional keyword matching using
    BM25 scoring.
    
    Attributes:
        semantic_weight: Weight for semantic search component (0.0-1.0)
        keyword_weight: Weight for keyword search component (0.0-1.0)
        
    Example:
        >>> recommender = HybridRecommender(semantic_weight=0.7)
        >>> results = await recommender.search("machine learning")
        >>> print(f"Found {len(results)} papers")
    """
    
    def __init__(self, semantic_weight: float = 0.7):
        """
        Initialize the hybrid recommender.
        
        Args:
            semantic_weight: Weight for semantic search (0.0-1.0).
                           Keyword weight is automatically set to 1-semantic_weight.
                           
        Raises:
            ValueError: If semantic_weight is not between 0 and 1.
        """
```

#### Error Handling

**Structured exception hierarchy**:

```python
# Custom exceptions in exceptions.py
class StudyAssistantError(Exception):
    """Base exception for StudyAssistant."""
    pass

class ConfigurationError(StudyAssistantError):
    """Configuration-related errors."""
    pass

class QueryError(StudyAssistantError):
    """Query processing errors."""
    pass

class SearchError(StudyAssistantError):
    """Search operation errors."""
    pass

# Usage in code
async def process_query(query: str) -> SearchResults:
    if not query.strip():
        raise QueryError("Query cannot be empty")
        
    try:
        return await self._execute_search(query)
    except ConnectionError as e:
        raise SearchError(f"Search service unavailable: {e}") from e
    except Exception as e:
        raise SearchError(f"Unexpected search error: {e}") from e
```

#### Async Programming Patterns

**Prefer async/await for I/O operations**:

```python
import asyncio
import aiohttp
from typing import List

async def fetch_multiple_papers(urls: List[str]) -> List[str]:
    """
    Fetch multiple papers concurrently.
    
    Args:
        urls: List of paper URLs to fetch
        
    Returns:
        List of paper contents in the same order as URLs
    """
    async with aiohttp.ClientSession() as session:
        tasks = [fetch_single_paper(session, url) for url in urls]
        return await asyncio.gather(*tasks, return_exceptions=True)

async def fetch_single_paper(session: aiohttp.ClientSession, url: str) -> str:
    """Fetch a single paper with error handling."""
    try:
        async with session.get(url, timeout=30) as response:
            response.raise_for_status()
            return await response.text()
    except asyncio.TimeoutError:
        raise PaperFetchError(f"Timeout fetching {url}")
    except aiohttp.ClientError as e:
        raise PaperFetchError(f"Error fetching {url}: {e}")
```

### Configuration Management

**Centralized configuration pattern**:

```python
# config.py
import os
from typing import Dict, Any
from dataclasses import dataclass

@dataclass
class LLMConfig:
    """Configuration for LLM services."""
    provider: str = "gemini"
    model: str = "gemini-1.5-pro"
    temperature: float = 0.1
    max_tokens: int = 2048
    
@dataclass
class SearchConfig:
    """Configuration for search operations."""
    semantic_weight: float = 0.7
    keyword_weight: float = 0.3
    max_results: int = 20
    min_relevance_threshold: float = 0.1

class Config:
    """Main configuration class."""
    
    def __init__(self):
        self.llm = LLMConfig()
        self.search = SearchConfig()
        self._load_from_environment()
        
    def _load_from_environment(self):
        """Load configuration from environment variables."""
        # LLM configuration
        if provider := os.getenv("LLM_PROVIDER"):
            self.llm.provider = provider
        if model := os.getenv("LLM_MODEL"):
            self.llm.model = model
            
        # Search configuration
        if weight := os.getenv("SEMANTIC_WEIGHT"):
            self.search.semantic_weight = float(weight)
```

## Testing Guidelines

### Test Structure

We use **pytest** with async support:

```python
# tests/unit/test_hybrid_recommender.py
import pytest
import pytest_asyncio
from unittest.mock import Mock, AsyncMock

from hybrid_search_rag import HybridRecommender
from hybrid_search_rag.exceptions import QueryError

class TestHybridRecommender:
    """Test suite for HybridRecommender class."""
    
    @pytest.fixture
    def recommender(self):
        """Create a test recommender instance."""
        return HybridRecommender(semantic_weight=0.7)
    
    @pytest.fixture
    def mock_documents(self):
        """Create mock documents for testing."""
        return [
            Mock(title="Paper 1", content="Content 1"),
            Mock(title="Paper 2", content="Content 2"),
        ]
    
    @pytest_asyncio.async_test
    async def test_search_valid_query(self, recommender):
        """Test search with valid query."""
        # Arrange
        query = "machine learning"
        
        # Act
        results = await recommender.search(query)
        
        # Assert
        assert isinstance(results, SearchResults)
        assert len(results) >= 0
    
    @pytest_asyncio.async_test
    async def test_search_empty_query_raises_error(self, recommender):
        """Test that empty query raises QueryError."""
        with pytest.raises(QueryError, match="Query cannot be empty"):
            await recommender.search("")
    
    def test_init_invalid_weights_raises_error(self):
        """Test initialization with invalid weights."""
        with pytest.raises(ValueError, match="Weights must sum to 1.0"):
            HybridRecommender(semantic_weight=1.5)
```

### Test Categories

#### Unit Tests

Test individual components in isolation:

```python
# tests/unit/test_text_processing.py
from hybrid_search_rag.text_processing import TextProcessor

def test_clean_text():
    """Test text cleaning functionality."""
    processor = TextProcessor()
    
    # Test cases
    test_cases = [
        ("Hello\n\nWorld", "Hello World"),
        ("  Extra   spaces  ", "Extra spaces"),
        ("Remove<tags>here</tags>", "Removehere"),
    ]
    
    for input_text, expected in test_cases:
        result = processor.clean_text(input_text)
        assert result == expected
```

#### Integration Tests

Test component interactions:

```python
# tests/integration/test_search_pipeline.py
@pytest_asyncio.async_test
async def test_end_to_end_search():
    """Test complete search pipeline."""
    # Setup
    recommender = HybridRecommender()
    query = "transformer architecture"
    
    # Execute
    results = await recommender.search(query, max_results=5)
    
    # Verify
    assert len(results) <= 5
    for result in results:
        assert result.relevance_score > 0
        assert result.document.title
        assert result.document.content
```

#### Performance Tests

Test system performance:

```python
# tests/performance/test_search_performance.py
import time
import pytest

@pytest.mark.performance
@pytest_asyncio.async_test
async def test_search_response_time():
    """Test search response time under normal load."""
    recommender = HybridRecommender()
    
    start_time = time.time()
    results = await recommender.search("machine learning", max_results=10)
    end_time = time.time()
    
    response_time = end_time - start_time
    assert response_time < 5.0, f"Search took {response_time:.2f}s (should be < 5s)"
```

### Running Tests

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=hybrid_search_rag --cov-report=html

# Run specific test categories
pytest tests/unit/                    # Unit tests only
pytest tests/integration/             # Integration tests only
pytest -m "not performance"          # Skip performance tests

# Run with verbose output
pytest -v

# Run tests in parallel
pytest -n auto
```

### Test Configuration

**pytest.ini**:

```ini
[tool:pytest]
testpaths = tests
python_files = test_*.py
python_classes = Test*
python_functions = test_*
addopts = 
    --strict-markers
    --disable-warnings
    --tb=short
markers =
    unit: Unit tests
    integration: Integration tests
    performance: Performance tests
    slow: Slow tests that can be skipped in CI
asyncio_mode = auto
```

## Contribution Workflow

### 1. Fork and Clone

```bash
# Fork repository on GitHub
# Clone your fork
git clone https://github.com/YOUR_USERNAME/Research-Assistant.git
cd Research-Assistant

# Add upstream remote
git remote add upstream https://github.com/Fane-Nathan/Research-Assistant.git
```

### 2. Create Feature Branch

```bash
# Fetch latest changes
git fetch upstream
git checkout main
git merge upstream/main

# Create feature branch
git checkout -b feature/your-feature-name

# Or for bug fixes
git checkout -b fix/issue-description
```

### 3. Make Changes

```bash
# Make your changes
# Edit files...

# Add and commit changes
git add .
git commit -m "feat: add new search algorithm

- Implement semantic search with transformers
- Add relevance scoring
- Update tests and documentation"
```

### 4. Commit Message Format

We use **Conventional Commits**:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**Types:**
- `feat`: New features
- `fix`: Bug fixes
- `docs`: Documentation changes
- `style`: Code style changes (no logic changes)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**

```bash
# Feature addition
git commit -m "feat(search): implement hybrid search algorithm"

# Bug fix
git commit -m "fix(llm): handle API rate limiting errors"

# Documentation update
git commit -m "docs: update API reference with new endpoints"

# Breaking change
git commit -m "feat!: change search API interface

BREAKING CHANGE: search() now returns SearchResults object instead of list"
```

### 5. Run Tests and Checks

```bash
# Run full test suite
pytest

# Run linting
flake8 hybrid_search_rag/ tests/

# Run type checking
mypy hybrid_search_rag/

# Run formatting checks
black --check .
isort --check-only .

# Or run all checks with pre-commit
pre-commit run --all-files
```

### 6. Push and Create Pull Request

```bash
# Push to your fork
git push origin feature/your-feature-name

# Create pull request on GitHub
# Use the GitHub web interface or GitHub CLI
gh pr create --title "feat: add new search algorithm" --body "Description of changes"
```

### 7. Code Review Process

1. **Automated Checks**: CI runs tests and quality checks
2. **Peer Review**: Other contributors review your code
3. **Address Feedback**: Make requested changes
4. **Approval**: Maintainers approve the changes
5. **Merge**: Changes are merged into main branch

## Types of Contributions

### 1. Bug Fixes

**Process:**
1. Create issue describing the bug
2. Fork and create fix branch
3. Write test that reproduces the bug
4. Fix the bug
5. Ensure test passes
6. Submit pull request

**Example:**

```python
# Before fix - bug in search scoring
def calculate_relevance_score(semantic_score: float, keyword_score: float) -> float:
    return semantic_score + keyword_score  # Bug: scores can exceed 1.0

# After fix
def calculate_relevance_score(semantic_score: float, keyword_score: float) -> float:
    """Calculate normalized relevance score."""
    raw_score = semantic_score + keyword_score
    return min(raw_score, 1.0)  # Ensure score doesn't exceed 1.0
```

### 2. Feature Development

**Process:**
1. Discuss feature in GitHub issues
2. Create design document for complex features
3. Implement feature with tests
4. Update documentation
5. Submit pull request

**Feature Development Checklist:**
- [ ] Feature design documented
- [ ] Implementation follows coding standards
- [ ] Comprehensive tests added
- [ ] Documentation updated
- [ ] Performance impact assessed
- [ ] Backward compatibility maintained

### 3. Documentation Improvements

**Types of documentation contributions:**
- API documentation
- User guides and tutorials
- Code comments and docstrings
- Architecture documentation
- Examples and demos

### 4. Performance Optimizations

**Process:**
1. Profile current performance
2. Identify bottlenecks
3. Implement optimizations
4. Benchmark improvements
5. Ensure no functionality regression

**Example optimization:**

```python
# Before - inefficient batch processing
async def process_documents(documents: List[Document]) -> List[ProcessedDocument]:
    results = []
    for doc in documents:
        processed = await process_single_document(doc)
        results.append(processed)
    return results

# After - concurrent processing
async def process_documents(documents: List[Document]) -> List[ProcessedDocument]:
    tasks = [process_single_document(doc) for doc in documents]
    return await asyncio.gather(*tasks)
```

### 5. Testing Improvements

**Areas for testing contributions:**
- Unit test coverage
- Integration test scenarios
- Performance benchmarks
- Edge case testing
- Mock and fixture improvements

## Community Guidelines

### Code of Conduct

We are committed to providing a welcoming and inclusive environment for all contributors. Please read and follow our [Code of Conduct](CODE_OF_CONDUCT.md).

### Communication Channels

- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: General questions and discussions
- **Pull Requests**: Code review and collaboration
- **Documentation**: Project wiki and guides

### Recognition

We appreciate all contributions! Contributors are recognized through:
- **Contributors list** in README
- **Changelog** acknowledgments
- **GitHub contributor stats**
- **Special thanks** in release notes

## Development Resources

### Useful Tools

- **GitHub CLI**: `gh` for easier GitHub interaction
- **Pre-commit**: Automated code quality checks
- **pytest-xdist**: Parallel test execution
- **coverage.py**: Code coverage analysis
- **mypy**: Static type checking

### Learning Resources

- **AsyncIO Programming**: [Python AsyncIO Documentation](https://docs.python.org/3/library/asyncio.html)
- **Machine Learning**: [Scikit-learn User Guide](https://scikit-learn.org/stable/user_guide.html)
- **NLP Concepts**: [Hugging Face Course](https://huggingface.co/course/)
- **Software Engineering**: [Effective Python](https://effectivepython.com/)

### Getting Help

If you need help with development:

1. **Check existing documentation** and issues
2. **Search GitHub discussions** for similar questions
3. **Ask in GitHub discussions** for general questions
4. **Create GitHub issue** for bugs or feature requests
5. **Join community chat** (if available) for real-time help

---

**Thank you for contributing to StudyAssistant!** Your efforts help advance AI-powered research assistance and benefit the entire academic community.

**Next Steps:**
- **[Development Setup](./development-setup)**: Detailed environment setup
- **[Testing Guide](./testing)**: Comprehensive testing documentation  
- **[Code Quality](./code-quality)**: Advanced quality assurance practices
