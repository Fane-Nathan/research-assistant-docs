# Core APIs Reference

StudyAssistant provides comprehensive APIs for programmatic access to all system functionality. This reference covers the core Python APIs, including classes, methods, and usage examples.

## Overview

The core APIs are organized into several main modules:

```python
from hybrid_search_rag import (
    HybridRecommender,      # Core search functionality
    LLMInterface,           # Language model integration
    DataManager,            # Data management
    ConfigManager,          # Configuration
    EmbeddingService,       # Text embeddings
    QueryProcessor,         # Query handling
)
```

## HybridRecommender API

The main search and recommendation engine.

### Class: `HybridRecommender`

```python
class HybridRecommender:
    """
    Core hybrid search engine combining semantic and keyword search.
    
    Attributes:
        semantic_weight (float): Weight for semantic search results (0.0-1.0)
        keyword_weight (float): Weight for keyword search results (0.0-1.0)
        max_results (int): Maximum number of results to return
        min_relevance_threshold (float): Minimum relevance score for results
    """
    
    def __init__(self, 
                 semantic_weight: float = 0.7,
                 keyword_weight: float = 0.3,
                 config: Optional[Dict] = None):
        """
        Initialize the hybrid recommender.
        
        Args:
            semantic_weight: Weight for semantic search component
            keyword_weight: Weight for keyword search component  
            config: Optional configuration dictionary
            
        Raises:
            ValueError: If weights don't sum to 1.0
            ConfigError: If configuration is invalid
        """
```

### Methods

#### `async search(query: str, **kwargs) -> SearchResults`

Primary search method for finding relevant documents.

```python
async def search(self, 
                query: str,
                max_results: int = 10,
                search_mode: str = "hybrid",
                filters: Optional[Dict] = None,
                rerank: bool = True) -> SearchResults:
    """
    Search for documents matching the query.
    
    Args:
        query: Natural language search query
        max_results: Maximum number of results to return (1-100)
        search_mode: Search strategy ("hybrid", "semantic", "keyword")
        filters: Optional filters (date, author, domain, etc.)
        rerank: Whether to apply re-ranking algorithms
        
    Returns:
        SearchResults: Object containing ranked results and metadata
        
    Raises:
        QueryError: If query is malformed or empty
        SearchError: If search operation fails
        
    Example:
        >>> recommender = HybridRecommender()
        >>> results = await recommender.search(
        ...     "transformer architecture attention mechanisms",
        ...     max_results=15,
        ...     filters={"year": {"gte": 2020}}
        ... )
        >>> print(f"Found {len(results)} papers")
        >>> for result in results:
        ...     print(f"{result.title} (score: {result.relevance_score:.2f})")
    """
```

#### `async get_recommendations(document_id: str, **kwargs) -> SearchResults`

Get documents similar to a given document.

```python
async def get_recommendations(self,
                            document_id: str,
                            max_results: int = 10,
                            similarity_threshold: float = 0.5) -> SearchResults:
    """
    Find documents similar to the specified document.
    
    Args:
        document_id: Unique identifier of the reference document
        max_results: Maximum number of recommendations
        similarity_threshold: Minimum similarity score (0.0-1.0)
        
    Returns:
        SearchResults: Recommended documents with similarity scores
        
    Example:
        >>> paper_id = "arxiv:2106.04554"
        >>> recommendations = await recommender.get_recommendations(
        ...     paper_id, max_results=5
        ... )
    """
```

#### `add_documents(documents: List[Document]) -> None`

Add new documents to the search index.

```python
def add_documents(self, documents: List[Document]) -> None:
    """
    Add documents to the search index.
    
    Args:
        documents: List of Document objects to index
        
    Raises:
        IndexError: If document indexing fails
        ValidationError: If document format is invalid
        
    Example:
        >>> from hybrid_search_rag.data_handling import Document
        >>> doc = Document(
        ...     title="New Research Paper",
        ...     content="Paper content...",
        ...     metadata={"authors": ["Smith, J."], "year": 2024}
        ... )
        >>> recommender.add_documents([doc])
    """
```

### SearchResults Class

```python
class SearchResults:
    """Container for search results and metadata."""
    
    def __init__(self, 
                 results: List[SearchResult],
                 query: str,
                 total_found: int,
                 processing_time: float):
        self.results = results
        self.query = query
        self.total_found = total_found
        self.processing_time = processing_time
        
    def __len__(self) -> int:
        """Return number of results."""
        return len(self.results)
        
    def __iter__(self):
        """Iterate over results."""
        return iter(self.results)
        
    def to_dict(self) -> Dict:
        """Convert to dictionary format."""
        return {
            "query": self.query,
            "total_found": self.total_found,
            "processing_time": self.processing_time,
            "results": [result.to_dict() for result in self.results]
        }
        
    def to_dataframe(self) -> 'pandas.DataFrame':
        """Convert to pandas DataFrame."""
        import pandas as pd
        return pd.DataFrame([result.to_dict() for result in self.results])
```

### SearchResult Class

```python
class SearchResult:
    """Individual search result with document and relevance information."""
    
    def __init__(self,
                 document: Document,
                 relevance_score: float,
                 explanation: Optional[str] = None):
        self.document = document
        self.relevance_score = relevance_score
        self.explanation = explanation
        
    @property
    def title(self) -> str:
        """Document title."""
        return self.document.title
        
    @property
    def authors(self) -> List[str]:
        """Document authors."""
        return self.document.metadata.get("authors", [])
        
    @property
    def year(self) -> Optional[int]:
        """Publication year."""
        return self.document.metadata.get("year")
        
    def to_dict(self) -> Dict:
        """Convert to dictionary format."""
        return {
            "title": self.title,
            "authors": self.authors,
            "year": self.year,
            "relevance_score": self.relevance_score,
            "url": self.document.metadata.get("url"),
            "abstract": self.document.metadata.get("abstract"),
            "explanation": self.explanation
        }
```

## LLMInterface API

Interface for Large Language Model operations.

### Class: `LLMInterface`

```python
class LLMInterface:
    """
    Interface for Large Language Model providers.
    
    Supports multiple providers: Gemini, Groq, DeepSeek, OpenAI
    """
    
    def __init__(self,
                 provider: str = "gemini",
                 model_name: Optional[str] = None,
                 api_key: Optional[str] = None,
                 **kwargs):
        """
        Initialize LLM interface.
        
        Args:
            provider: LLM provider ("gemini", "groq", "deepseek", "openai")
            model_name: Specific model to use (uses provider default if None)
            api_key: API key for the provider
            **kwargs: Additional provider-specific parameters
        """
```

### Methods

#### `async generate_response(prompt: str, **kwargs) -> LLMResponse`

Generate text response from the language model.

```python
async def generate_response(self,
                          prompt: str,
                          max_tokens: int = 2048,
                          temperature: float = 0.1,
                          top_p: float = 0.9,
                          system_prompt: Optional[str] = None) -> LLMResponse:
    """
    Generate response from the language model.
    
    Args:
        prompt: Input prompt for the model
        max_tokens: Maximum tokens in response
        temperature: Sampling temperature (0.0-2.0)
        top_p: Nucleus sampling parameter
        system_prompt: Optional system/instruction prompt
        
    Returns:
        LLMResponse: Generated text with metadata
        
    Example:
        >>> llm = LLMInterface(provider="gemini")
        >>> response = await llm.generate_response(
        ...     "Explain transformer architecture",
        ...     max_tokens=1000,
        ...     temperature=0.2
        ... )
        >>> print(response.text)
    """
```

#### `async generate_with_context(query: str, context: List[Document], **kwargs) -> LLMResponse`

Generate response using retrieved documents as context.

```python
async def generate_with_context(self,
                              query: str,
                              context: List[Document],
                              max_context_length: int = 8000,
                              citation_style: str = "academic") -> LLMResponse:
    """
    Generate response using document context.
    
    Args:
        query: User's research question
        context: Retrieved documents for context
        max_context_length: Maximum context tokens
        citation_style: Citation format ("academic", "numbered", "author-year")
        
    Returns:
        LLMResponse: Generated response with citations
    """
```

### LLMResponse Class

```python
class LLMResponse:
    """Response from language model with metadata."""
    
    def __init__(self,
                 text: str,
                 metadata: Dict,
                 citations: Optional[List[Citation]] = None):
        self.text = text
        self.metadata = metadata
        self.citations = citations or []
        
    @property
    def token_count(self) -> int:
        """Number of tokens in response."""
        return self.metadata.get("token_count", 0)
        
    @property
    def model_used(self) -> str:
        """Model that generated the response."""
        return self.metadata.get("model", "unknown")
        
    def to_dict(self) -> Dict:
        """Convert to dictionary format."""
        return {
            "text": self.text,
            "metadata": self.metadata,
            "citations": [citation.to_dict() for citation in self.citations]
        }
```

## DataManager API

Handles document storage, retrieval, and management.

### Class: `DataManager`

```python
class DataManager:
    """
    Manages document storage and retrieval operations.
    """
    
    def __init__(self, storage_backend: str = "local", **config):
        """
        Initialize data manager.
        
        Args:
            storage_backend: Storage type ("local", "cloud", "database")
            **config: Backend-specific configuration
        """
```

### Methods

#### `async store_document(document: Document) -> str`

Store a document and return its ID.

```python
async def store_document(self, document: Document) -> str:
    """
    Store a document in the data store.
    
    Args:
        document: Document object to store
        
    Returns:
        str: Unique document identifier
        
    Raises:
        StorageError: If document storage fails
        ValidationError: If document is invalid
    """
```

#### `async get_document(document_id: str) -> Document`

Retrieve a document by ID.

```python
async def get_document(self, document_id: str) -> Document:
    """
    Retrieve document by ID.
    
    Args:
        document_id: Unique document identifier
        
    Returns:
        Document: Retrieved document
        
    Raises:
        DocumentNotFoundError: If document doesn't exist
    """
```

#### `async search_documents(query: Dict) -> List[Document]`

Search documents using metadata queries.

```python
async def search_documents(self, 
                         query: Dict,
                         limit: int = 100,
                         offset: int = 0) -> List[Document]:
    """
    Search documents using metadata queries.
    
    Args:
        query: MongoDB-style query dictionary
        limit: Maximum results to return
        offset: Number of results to skip
        
    Returns:
        List[Document]: Matching documents
        
    Example:
        >>> query = {
        ...     "metadata.year": {"$gte": 2020},
        ...     "metadata.authors": {"$in": ["Smith, J."]}
        ... }
        >>> docs = await data_manager.search_documents(query)
    """
```

## EmbeddingService API

Handles text embedding generation and management.

### Class: `EmbeddingService`

```python
class EmbeddingService:
    """
    Service for generating and managing text embeddings.
    """
    
    def __init__(self,
                 model_name: str = "text-embedding-004",
                 batch_size: int = 100,
                 cache_embeddings: bool = True):
        """
        Initialize embedding service.
        
        Args:
            model_name: Embedding model to use
            batch_size: Batch size for embedding generation
            cache_embeddings: Whether to cache generated embeddings
        """
```

### Methods

#### `async embed_text(text: str) -> List[float]`

Generate embedding for a single text.

```python
async def embed_text(self, text: str) -> List[float]:
    """
    Generate embedding for text.
    
    Args:
        text: Input text to embed
        
    Returns:
        List[float]: Embedding vector
        
    Example:
        >>> embedding_service = EmbeddingService()
        >>> vector = await embedding_service.embed_text("Hello world")
        >>> print(f"Embedding dimension: {len(vector)}")
    """
```

#### `async embed_batch(texts: List[str]) -> List[List[float]]`

Generate embeddings for multiple texts efficiently.

```python
async def embed_batch(self, texts: List[str]) -> List[List[float]]:
    """
    Generate embeddings for multiple texts.
    
    Args:
        texts: List of texts to embed
        
    Returns:
        List[List[float]]: List of embedding vectors
    """
```

## Document Classes

### Document Class

```python
class Document:
    """
    Represents a research document with content and metadata.
    """
    
    def __init__(self,
                 title: str,
                 content: str,
                 metadata: Optional[Dict] = None,
                 document_id: Optional[str] = None):
        """
        Initialize document.
        
        Args:
            title: Document title
            content: Full text content
            metadata: Additional document information
            document_id: Unique identifier (auto-generated if None)
        """
        self.title = title
        self.content = content
        self.metadata = metadata or {}
        self.document_id = document_id or self._generate_id()
        
    def to_dict(self) -> Dict:
        """Convert to dictionary format."""
        return {
            "document_id": self.document_id,
            "title": self.title,
            "content": self.content,
            "metadata": self.metadata
        }
        
    @classmethod
    def from_dict(cls, data: Dict) -> 'Document':
        """Create document from dictionary."""
        return cls(
            title=data["title"],
            content=data["content"],
            metadata=data.get("metadata", {}),
            document_id=data.get("document_id")
        )
```

## Usage Examples

### Basic Search Example

```python
import asyncio
from hybrid_search_rag import HybridRecommender

async def basic_search():
    # Initialize recommender
    recommender = HybridRecommender()
    
    # Perform search
    results = await recommender.search(
        "machine learning transformer architecture",
        max_results=10
    )
    
    # Process results
    print(f"Found {len(results)} papers:")
    for result in results:
        print(f"- {result.title} (score: {result.relevance_score:.2f})")
        print(f"  Authors: {', '.join(result.authors)}")
        print(f"  Year: {result.year}")
        print()

# Run the example
asyncio.run(basic_search())
```

### RAG Pipeline Example

```python
import asyncio
from hybrid_search_rag import HybridRecommender, LLMInterface

async def rag_pipeline():
    # Initialize components
    recommender = HybridRecommender()
    llm = LLMInterface(provider="gemini")
    
    # Research query
    query = "How do attention mechanisms work in transformer models?"
    
    # Retrieve relevant documents
    search_results = await recommender.search(query, max_results=5)
    
    # Extract documents for context
    context_docs = [result.document for result in search_results]
    
    # Generate AI response
    response = await llm.generate_with_context(
        query=query,
        context=context_docs,
        max_context_length=6000
    )
    
    # Display results
    print("AI Response:")
    print(response.text)
    print(f"\nBased on {len(context_docs)} sources:")
    for i, result in enumerate(search_results, 1):
        print(f"{i}. {result.title} (relevance: {result.relevance_score:.2f})")

asyncio.run(rag_pipeline())
```

### Document Management Example

```python
import asyncio
from hybrid_search_rag import DataManager, Document

async def document_management():
    # Initialize data manager
    data_manager = DataManager()
    
    # Create a new document
    doc = Document(
        title="My Research Paper",
        content="This is the content of my research paper...",
        metadata={
            "authors": ["Jane Doe", "John Smith"],
            "year": 2024,
            "journal": "AI Research Journal",
            "keywords": ["machine learning", "neural networks"]
        }
    )
    
    # Store the document
    doc_id = await data_manager.store_document(doc)
    print(f"Stored document with ID: {doc_id}")
    
    # Retrieve the document
    retrieved_doc = await data_manager.get_document(doc_id)
    print(f"Retrieved: {retrieved_doc.title}")
    
    # Search for documents
    query = {"metadata.year": {"$gte": 2024}}
    recent_docs = await data_manager.search_documents(query)
    print(f"Found {len(recent_docs)} recent documents")

asyncio.run(document_management())
```

## Error Handling

All APIs use structured exception handling:

```python
from hybrid_search_rag.exceptions import (
    QueryError,
    SearchError,
    LLMError,
    DocumentNotFoundError,
    ConfigurationError
)

async def robust_search():
    try:
        recommender = HybridRecommender()
        results = await recommender.search("machine learning")
        
    except QueryError as e:
        print(f"Query error: {e}")
        # Handle malformed query
        
    except SearchError as e:
        print(f"Search error: {e}")
        # Handle search system issues
        
    except Exception as e:
        print(f"Unexpected error: {e}")
        # Handle other errors
```

## Configuration

All APIs support configuration through environment variables and config files:

```python
# Using environment variables
import os
os.environ['GOOGLE_API_KEY'] = 'your-api-key'
os.environ['HYBRID_SEMANTIC_WEIGHT'] = '0.8'

# Using configuration dictionary
config = {
    'llm': {
        'provider': 'gemini',
        'model': 'gemini-1.5-pro',
        'temperature': 0.1
    },
    'search': {
        'semantic_weight': 0.7,
        'max_results': 20
    }
}

recommender = HybridRecommender(config=config)
```

---

**Next Steps**: Explore specific API modules:
- **[CLI Reference](./cli/commands)**: Command-line interface documentation
- **[External APIs](./external/integrations)**: Third-party service integrations
- **[Configuration API](./core/configuration)**: Advanced configuration options
