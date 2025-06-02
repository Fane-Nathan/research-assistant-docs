# External API Integrations

StudyAssistant integrates with various external APIs and services to enhance research capabilities and access additional data sources.

## Supported Integrations

### Academic Databases

#### PubMed API
Access to biomedical and life science literature.

**Setup:**
```python
from studyassistant.integrations import PubMedAPI

pubmed = PubMedAPI()
# No API key required for basic access
```

**Configuration:**
```yaml
integrations:
  pubmed:
    base_url: "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/"
    rate_limit: 3  # requests per second
    max_results: 100
    email: "your-email@example.com"  # Required for large queries
```

**Usage Examples:**

Search for papers:
```python
# Search by query
results = await pubmed.search(
    query="machine learning healthcare",
    max_results=50,
    date_range=("2020-01-01", "2023-12-31")
)

# Search by author
results = await pubmed.search_by_author(
    author="Smith J",
    affiliation="Stanford University"
)

# Get paper details
paper_details = await pubmed.get_paper_details(pmid="12345678")
```

#### arXiv API
Access to preprints in physics, mathematics, computer science, and more.

**Setup:**
```python
from studyassistant.integrations import ArxivAPI

arxiv = ArxivAPI()
```

**Configuration:**
```yaml
integrations:
  arxiv:
    base_url: "http://export.arxiv.org/api/query"
    rate_limit: 1  # requests per second
    max_results: 100
```

**Usage Examples:**

Search papers:
```python
# Search by subject and keywords
results = await arxiv.search(
    query="cat:cs.AI AND ti:transformer",
    max_results=20,
    sort_by="submittedDate",
    sort_order="descending"
)

# Search by author
results = await arxiv.search_by_author("Attention Is All You Need")

# Get paper by ID
paper = await arxiv.get_paper("1706.03762")
```

#### Semantic Scholar API
Academic search and paper recommendations.

**Setup:**
```python
from studyassistant.integrations import SemanticScholarAPI

semantic_scholar = SemanticScholarAPI(api_key="your-api-key")
```

**Configuration:**
```yaml
integrations:
  semantic_scholar:
    api_key: "${SEMANTIC_SCHOLAR_API_KEY}"
    base_url: "https://api.semanticscholar.org/graph/v1/"
    rate_limit: 100  # requests per second (with API key)
    fields: ["title", "abstract", "authors", "citations", "references"]
```

**Usage Examples:**

Search and get recommendations:
```python
# Search papers
results = await semantic_scholar.search_papers(
    query="neural machine translation",
    fields=["title", "abstract", "authors", "year", "citationCount"]
)

# Get paper details with citations
paper = await semantic_scholar.get_paper(
    paper_id="204e3073870fae3d05bcbc2f6a8e263d9b72e776",
    fields=["title", "abstract", "citations", "references"]
)

# Get recommendations
recommendations = await semantic_scholar.get_recommendations(
    paper_id="204e3073870fae3d05bcbc2f6a8e263d9b72e776",
    limit=10
)
```

### Language Model APIs

#### OpenAI API
GPT models for text generation and analysis.

**Setup:**
```python
from studyassistant.integrations import OpenAIAPI

openai_api = OpenAIAPI(api_key="your-openai-key")
```

**Configuration:**
```yaml
integrations:
  openai:
    api_key: "${OPENAI_API_KEY}"
    model: "gpt-3.5-turbo"
    max_tokens: 1000
    temperature: 0.1
    timeout: 30
```

**Usage Examples:**

Generate responses:
```python
# Generate research summary
response = await openai_api.generate_completion(
    messages=[
        {"role": "system", "content": "You are a research assistant."},
        {"role": "user", "content": "Summarize the key findings from these papers: ..."}
    ],
    model="gpt-4",
    max_tokens=500
)

# Generate embeddings
embeddings = await openai_api.create_embeddings(
    texts=["Machine learning in healthcare", "Deep learning applications"],
    model="text-embedding-ada-002"
)
```

#### Anthropic Claude API
Claude models for advanced reasoning and analysis.

**Setup:**
```python
from studyassistant.integrations import AnthropicAPI

anthropic_api = AnthropicAPI(api_key="your-anthropic-key")
```

**Configuration:**
```yaml
integrations:
  anthropic:
    api_key: "${ANTHROPIC_API_KEY}"
    model: "claude-3-sonnet-20240229"
    max_tokens: 1000
    temperature: 0.1
```

**Usage Examples:**

```python
# Generate detailed analysis
response = await anthropic_api.generate_completion(
    prompt="Analyze the methodology and findings of this research paper: ...",
    model="claude-3-opus-20240229",
    max_tokens=2000
)
```

### Vector Databases

#### Pinecone
Managed vector database for embeddings.

**Setup:**
```python
from studyassistant.integrations import PineconeIntegration

pinecone = PineconeIntegration(
    api_key="your-pinecone-key",
    environment="us-west1-gcp"
)
```

**Configuration:**
```yaml
integrations:
  pinecone:
    api_key: "${PINECONE_API_KEY}"
    environment: "${PINECONE_ENVIRONMENT}"
    index_name: "studyassistant-index"
    dimension: 384
    metric: "cosine"
```

**Usage Examples:**

```python
# Create index
await pinecone.create_index(
    name="research-papers",
    dimension=384,
    metric="cosine"
)

# Store embeddings
await pinecone.upsert_vectors(
    index_name="research-papers",
    vectors=[
        {
            "id": "paper_1",
            "values": embedding_vector,
            "metadata": {"title": "Paper Title", "author": "Author Name"}
        }
    ]
)

# Search similar vectors
results = await pinecone.query(
    index_name="research-papers",
    vector=query_embedding,
    top_k=10,
    include_metadata=True
)
```

#### Weaviate
Open-source vector database with built-in ML models.

**Setup:**
```python
from studyassistant.integrations import WeaviateIntegration

weaviate = WeaviateIntegration(
    url="http://localhost:8080",
    auth_config=weaviate.auth.AuthApiKey(api_key="your-key")
)
```

**Configuration:**
```yaml
integrations:
  weaviate:
    url: "http://localhost:8080"
    auth_type: "api_key"
    api_key: "${WEAVIATE_API_KEY}"
    schema_class: "ResearchPaper"
```

### Citation Management

#### Zotero API
Sync with Zotero reference manager.

**Setup:**
```python
from studyassistant.integrations import ZoteroAPI

zotero = ZoteroAPI(
    library_id="your-library-id",
    api_key="your-zotero-key",
    library_type="user"  # or "group"
)
```

**Configuration:**
```yaml
integrations:
  zotero:
    library_id: "${ZOTERO_LIBRARY_ID}"
    api_key: "${ZOTERO_API_KEY}"
    library_type: "user"
    sync_interval: 3600  # seconds
```

**Usage Examples:**

```python
# Get all items from library
items = await zotero.get_items(limit=100)

# Search library
results = await zotero.search_items(query="machine learning")

# Add item to library
new_item = await zotero.create_item({
    "itemType": "journalArticle",
    "title": "Paper Title",
    "creators": [{"creatorType": "author", "firstName": "John", "lastName": "Doe"}],
    "publicationTitle": "Journal Name"
})
```

#### Mendeley API
Integration with Mendeley reference manager.

**Setup:**
```python
from studyassistant.integrations import MendeleyAPI

mendeley = MendeleyAPI(
    client_id="your-client-id",
    client_secret="your-client-secret"
)
```

### Cloud Storage

#### Google Drive API
Access documents from Google Drive.

**Setup:**
```python
from studyassistant.integrations import GoogleDriveAPI

drive = GoogleDriveAPI(credentials_path="path/to/credentials.json")
```

**Configuration:**
```yaml
integrations:
  google_drive:
    credentials_path: "${GOOGLE_DRIVE_CREDENTIALS}"
    scopes: ["https://www.googleapis.com/auth/drive.readonly"]
    folder_ids: ["folder_id_1", "folder_id_2"]
```

**Usage Examples:**

```python
# List files in folder
files = await drive.list_files(
    folder_id="your-folder-id",
    mime_type="application/pdf"
)

# Download file
content = await drive.download_file(file_id="your-file-id")
```

## Integration Manager

Centralized management of all integrations:

```python
class IntegrationManager:
    def __init__(self, config: IntegrationsConfig):
        self.config = config
        self.active_integrations = {}
        self.rate_limiters = {}
    
    async def initialize_integrations(self):
        """Initialize all configured integrations"""
        for integration_name, integration_config in self.config.integrations.items():
            try:
                integration = await self.create_integration(integration_name, integration_config)
                self.active_integrations[integration_name] = integration
                
                # Set up rate limiting
                if integration_config.get('rate_limit'):
                    self.rate_limiters[integration_name] = RateLimiter(
                        max_calls=integration_config['rate_limit'],
                        time_window=1.0
                    )
                
                logger.info(f"Initialized {integration_name} integration")
                
            except Exception as e:
                logger.error(f"Failed to initialize {integration_name}: {e}")
    
    async def create_integration(self, name: str, config: Dict) -> BaseIntegration:
        """Factory method to create integration instances"""
        integration_classes = {
            'pubmed': PubMedAPI,
            'arxiv': ArxivAPI,
            'semantic_scholar': SemanticScholarAPI,
            'openai': OpenAIAPI,
            'anthropic': AnthropicAPI,
            'pinecone': PineconeIntegration,
            'weaviate': WeaviateIntegration,
            'zotero': ZoteroAPI
        }
        
        integration_class = integration_classes.get(name)
        if not integration_class:
            raise UnsupportedIntegrationError(f"Integration {name} not supported")
        
        return integration_class(**config)
    
    async def execute_with_rate_limit(self, integration_name: str, operation: Callable):
        """Execute operation with rate limiting"""
        rate_limiter = self.rate_limiters.get(integration_name)
        if rate_limiter:
            await rate_limiter.acquire()
        
        try:
            return await operation()
        except Exception as e:
            logger.error(f"Integration {integration_name} operation failed: {e}")
            raise
```

## Error Handling and Retry Logic

```python
class IntegrationErrorHandler:
    def __init__(self):
        self.retry_config = {
            'max_retries': 3,
            'backoff_factor': 2,
            'retry_statuses': [429, 500, 502, 503, 504]
        }
    
    async def execute_with_retry(self, operation: Callable, integration_name: str):
        """Execute operation with exponential backoff retry"""
        for attempt in range(self.retry_config['max_retries'] + 1):
            try:
                return await operation()
                
            except APIRateLimitError as e:
                if attempt < self.retry_config['max_retries']:
                    delay = self.retry_config['backoff_factor'] ** attempt
                    logger.warning(f"{integration_name} rate limit hit, retrying in {delay}s")
                    await asyncio.sleep(delay)
                else:
                    raise
                    
            except APIConnectionError as e:
                if attempt < self.retry_config['max_retries']:
                    delay = self.retry_config['backoff_factor'] ** attempt
                    logger.warning(f"{integration_name} connection error, retrying in {delay}s")
                    await asyncio.sleep(delay)
                else:
                    raise
                    
            except Exception as e:
                logger.error(f"{integration_name} operation failed: {e}")
                raise
```

## Configuration Management

Example complete integration configuration:

```yaml
integrations:
  # Academic databases
  pubmed:
    enabled: true
    email: "researcher@university.edu"
    rate_limit: 3
    
  arxiv:
    enabled: true
    rate_limit: 1
    
  semantic_scholar:
    enabled: true
    api_key: "${SEMANTIC_SCHOLAR_API_KEY}"
    rate_limit: 100
    
  # Language models
  openai:
    enabled: true
    api_key: "${OPENAI_API_KEY}"
    model: "gpt-3.5-turbo"
    max_tokens: 1000
    temperature: 0.1
    
  anthropic:
    enabled: false
    api_key: "${ANTHROPIC_API_KEY}"
    model: "claude-3-sonnet-20240229"
    
  # Vector databases
  pinecone:
    enabled: true
    api_key: "${PINECONE_API_KEY}"
    environment: "${PINECONE_ENVIRONMENT}"
    index_name: "studyassistant"
    
  # Citation management
  zotero:
    enabled: true
    library_id: "${ZOTERO_LIBRARY_ID}"
    api_key: "${ZOTERO_API_KEY}"
    library_type: "user"
    
  # Cloud storage
  google_drive:
    enabled: false
    credentials_path: "${GOOGLE_DRIVE_CREDENTIALS}"

# Global integration settings
integration_settings:
  timeout: 30
  max_concurrent_requests: 10
  cache_responses: true
  cache_ttl: 3600
```

## Usage Examples

### Complete Research Workflow

```python
async def research_workflow(query: str):
    """Complete research workflow using multiple integrations"""
    
    # 1. Search academic databases
    pubmed_results = await pubmed.search(query, max_results=20)
    arxiv_results = await arxiv.search(query, max_results=20)
    
    # 2. Get additional context from Semantic Scholar
    related_papers = []
    for paper in pubmed_results[:5]:
        recommendations = await semantic_scholar.get_recommendations(
            paper_id=paper.semantic_scholar_id
        )
        related_papers.extend(recommendations)
    
    # 3. Process and embed documents
    all_papers = pubmed_results + arxiv_results + related_papers
    processed_papers = []
    
    for paper in all_papers:
        processed = await process_document(paper)
        embeddings = await openai_api.create_embeddings([processed.content])
        
        # Store in vector database
        await pinecone.upsert_vectors([{
            "id": paper.id,
            "values": embeddings[0],
            "metadata": paper.metadata
        }])
        
        processed_papers.append(processed)
    
    # 4. Generate research summary
    context = "\n\n".join([p.content for p in processed_papers[:10]])
    summary = await openai_api.generate_completion(
        messages=[
            {"role": "system", "content": "You are a research assistant."},
            {"role": "user", "content": f"Summarize the key findings about: {query}\n\nContext:\n{context}"}
        ]
    )
    
    # 5. Save to reference manager
    for paper in processed_papers:
        await zotero.create_item(paper.to_zotero_format())
    
    return {
        "summary": summary,
        "papers_found": len(all_papers),
        "papers_processed": len(processed_papers)
    }
```

## Monitoring and Analytics

```python
class IntegrationMetrics:
    def __init__(self):
        self.metrics = {
            'api_calls': Counter(),
            'response_times': Histogram(),
            'error_rates': Counter(),
            'rate_limit_hits': Counter()
        }
    
    def record_api_call(self, integration: str, endpoint: str, duration: float, status: str):
        """Record API call metrics"""
        self.metrics['api_calls'].increment(tags={
            'integration': integration,
            'endpoint': endpoint,
            'status': status
        })
        
        self.metrics['response_times'].observe(duration, tags={
            'integration': integration,
            'endpoint': endpoint
        })
        
        if status == 'error':
            self.metrics['error_rates'].increment(tags={'integration': integration})
        elif status == 'rate_limited':
            self.metrics['rate_limit_hits'].increment(tags={'integration': integration})
```

## Best Practices

1. **Rate Limiting**: Always respect API rate limits and implement exponential backoff
2. **Error Handling**: Implement robust error handling for network issues and API errors
3. **Caching**: Cache API responses to reduce costs and improve performance
4. **Authentication**: Store API keys securely using environment variables
5. **Monitoring**: Track API usage and performance metrics
6. **Fallbacks**: Implement fallback mechanisms when primary integrations fail

## Next Steps

- [Core API Reference →](../core-apis.md)
- [CLI Commands →](../cli/commands.md)
- [Configuration Guide →](../../getting-started/configuration.md)
