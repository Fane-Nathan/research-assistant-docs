# Data Sources

StudyAssistant integrates with multiple academic databases and external services to provide comprehensive research coverage. This guide explains how to configure and use different data sources effectively.

## Overview

StudyAssistant supports various types of data sources:

- **Academic Databases**: arXiv, PubMed, Semantic Scholar
- **Citation Databases**: CrossRef, OpenCitations
- **Preprint Servers**: bioRxiv, medRxiv, SSRN
- **Institutional Repositories**: University repositories, government databases
- **Commercial Databases**: IEEE Xplore, ACM Digital Library (with access)
- **Local Sources**: PDF collections, Zotero libraries, EndNote databases

## Academic Databases

### arXiv

arXiv is a free distribution service for scholarly articles in physics, mathematics, computer science, and related fields.

#### Configuration

```yaml
# config.yaml
data_sources:
  arxiv:
    enabled: true
    base_url: "https://export.arxiv.org/api/query"
    rate_limit: 3  # requests per second
    max_results_per_query: 1000
    categories:
      - "cs.AI"      # Artificial Intelligence
      - "cs.LG"      # Machine Learning
      - "cs.CL"      # Computation and Language
      - "stat.ML"    # Machine Learning (Statistics)
      - "cs.CV"      # Computer Vision
    fields:
      - "title"
      - "abstract"
      - "authors"
      - "categories"
      - "published"
      - "updated"
```

#### Usage Examples

```python
from studyassistant.sources import ArxivSource

# Initialize arXiv source
arxiv = ArxivSource()

# Search by keyword
results = arxiv.search("neural networks", max_results=50)

# Search by category
results = arxiv.search_by_category("cs.AI", max_results=100)

# Search by author
results = arxiv.search_by_author("Geoffrey Hinton")

# Get specific paper
paper = arxiv.get_paper("2301.00001")
```

#### Advanced Queries

```python
# Complex query with boolean operators
query = "ti:\"machine learning\" AND cat:cs.AI"
results = arxiv.search(query, sort_by="relevance")

# Date range search
from datetime import datetime, timedelta
end_date = datetime.now()
start_date = end_date - timedelta(days=90)

results = arxiv.search(
    "deep learning",
    start_date=start_date,
    end_date=end_date
)

# Multi-category search
results = arxiv.search(
    "reinforcement learning",
    categories=["cs.AI", "cs.LG", "stat.ML"]
)
```

### PubMed

PubMed is a database of biomedical and life science literature maintained by the National Center for Biotechnology Information (NCBI).

#### Configuration

```yaml
data_sources:
  pubmed:
    enabled: true
    base_url: "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/"
    api_key: null  # Optional but recommended for higher rate limits
    rate_limit: 10  # requests per second (with API key)
    email: "your.email@domain.com"  # Required by NCBI
    tool_name: "StudyAssistant"
    max_results_per_query: 10000
    databases:
      - "pubmed"
      - "pmc"      # PubMed Central
      - "books"    # NCBI Bookshelf
```

#### Usage Examples

```python
from studyassistant.sources import PubMedSource

# Initialize PubMed source
pubmed = PubMedSource(email="your.email@domain.com")

# Basic search
results = pubmed.search("COVID-19 vaccine", max_results=100)

# MeSH term search
results = pubmed.search_mesh("Artificial Intelligence")

# Author search
results = pubmed.search_author("Smith J[Author]")

# Journal search
results = pubmed.search_journal("Nature", year_range=(2020, 2024))
```

#### Advanced PubMed Queries

```python
# Complex boolean search
query = """
(("artificial intelligence"[MeSH Terms] OR "machine learning"[Title/Abstract])
AND "healthcare"[Title/Abstract])
AND ("2020"[Date - Publication] : "2024"[Date - Publication])
"""
results = pubmed.search(query)

# Clinical trials only
results = pubmed.search(
    "drug therapy",
    publication_types=["Clinical Trial", "Randomized Controlled Trial"]
)

# Free full text only
results = pubmed.search("cancer therapy", free_full_text=True)
```

### Semantic Scholar

Semantic Scholar is an AI-powered research tool for scientific literature, developed by the Allen Institute for AI.

#### Configuration

```yaml
data_sources:
  semantic_scholar:
    enabled: true
    base_url: "https://api.semanticscholar.org/graph/v1/"
    api_key: null  # Optional for higher rate limits
    rate_limit: 100  # requests per second
    fields:
      - "paperId"
      - "title"
      - "abstract"
      - "authors"
      - "year"
      - "citationCount"
      - "references"
      - "citations"
      - "fieldsOfStudy"
```

#### Usage Examples

```python
from studyassistant.sources import SemanticScholarSource

# Initialize Semantic Scholar source
ss = SemanticScholarSource()

# Search papers
results = ss.search("quantum computing", limit=100)

# Get paper details with citations
paper = ss.get_paper("204e3073870fae3d05bcbc2f6a8e263d9b72e776")
citations = ss.get_citations(paper["paperId"])

# Find similar papers
similar = ss.get_similar_papers(paper["paperId"], limit=20)

# Author information
author = ss.get_author("1741101")
author_papers = ss.get_author_papers(author["authorId"])
```

#### Citation Analysis

```python
# Build citation network
def build_citation_network(seed_paper_id, depth=2):
    network = {}
    queue = [(seed_paper_id, 0)]
    visited = set()
    
    while queue:
        paper_id, current_depth = queue.pop(0)
        if current_depth >= depth or paper_id in visited:
            continue
            
        visited.add(paper_id)
        paper = ss.get_paper(paper_id)
        network[paper_id] = paper
        
        # Add citations to queue
        citations = ss.get_citations(paper_id, limit=10)
        for citation in citations:
            if citation["paperId"] not in visited:
                queue.append((citation["paperId"], current_depth + 1))
    
    return network

# Usage
network = build_citation_network("204e3073870fae3d05bcbc2f6a8e263d9b72e776")
```

## Local Data Sources

### PDF Collections

StudyAssistant can process local PDF collections and extract metadata and content.

#### Configuration

```yaml
data_sources:
  local_pdfs:
    enabled: true
    directories:
      - "/path/to/research/papers"
      - "/home/user/Documents/Papers"
    recursive: true
    file_patterns:
      - "*.pdf"
      - "*.PDF"
    extraction:
      text: true
      metadata: true
      images: false
    processing:
      ocr_enabled: true
      language: "en"
      dpi: 300
```

#### Usage Examples

```python
from studyassistant.sources import LocalPDFSource

# Initialize local PDF source
pdf_source = LocalPDFSource("/path/to/papers")

# Process all PDFs in directory
papers = pdf_source.process_directory(recursive=True)

# Process single PDF
paper = pdf_source.process_file("/path/to/paper.pdf")

# Extract specific information
metadata = pdf_source.extract_metadata("/path/to/paper.pdf")
text = pdf_source.extract_text("/path/to/paper.pdf")
references = pdf_source.extract_references("/path/to/paper.pdf")
```

### Zotero Integration

Connect to Zotero libraries for bibliography management.

#### Configuration

```yaml
data_sources:
  zotero:
    enabled: true
    library_type: "user"  # or "group"
    library_id: "your_library_id"
    api_key: "your_zotero_api_key"
    sync_attachments: true
    collections: []  # Empty for all collections
```

#### Usage Examples

```python
from studyassistant.sources import ZoteroSource

# Initialize Zotero source
zotero = ZoteroSource(
    library_id="12345",
    api_key="your_api_key"
)

# Get all items
items = zotero.get_all_items()

# Get items from specific collection
collection_items = zotero.get_collection_items("ABCD1234")

# Search items
results = zotero.search("machine learning")

# Download attachments
zotero.download_attachments(items)
```

## Web Crawling Sources

### Custom Web Sources

Configure custom web crawling for specific academic websites.

#### Configuration

```yaml
data_sources:
  web_crawler:
    enabled: true
    user_agent: "StudyAssistant/1.0"
    rate_limit: 1  # requests per second
    respect_robots_txt: true
    sites:
      - name: "University Repository"
        base_url: "https://repository.university.edu"
        search_endpoint: "/search"
        paper_selectors:
          title: ".paper-title"
          authors: ".authors"
          abstract: ".abstract"
          pdf_link: ".pdf-download"
```

#### Usage Examples

```python
from studyassistant.sources import WebCrawlerSource

# Initialize web crawler
crawler = WebCrawlerSource()

# Add custom site
crawler.add_site({
    "name": "Custom Repository",
    "base_url": "https://papers.example.com",
    "search_endpoint": "/api/search",
    "selectors": {
        "title": ".title",
        "authors": ".authors",
        "abstract": ".abstract"
    }
})

# Search custom site
results = crawler.search_site("Custom Repository", "neural networks")
```

## Data Source Management

### Source Priority and Ranking

Configure how different sources are prioritized:

```yaml
source_ranking:
  priority:
    1: "semantic_scholar"
    2: "arxiv"
    3: "pubmed"
    4: "local_pdfs"
  weights:
    citation_count: 0.3
    recency: 0.2
    relevance: 0.4
    source_quality: 0.1
```

### Duplicate Detection

Configure duplicate detection across sources:

```python
from studyassistant.deduplication import DuplicateDetector

detector = DuplicateDetector(
    similarity_threshold=0.85,
    fields=["title", "authors", "abstract"],
    algorithms=["jaccard", "cosine", "edit_distance"]
)

# Detect duplicates across sources
unique_papers = detector.deduplicate(all_papers)
```

### Data Quality Filters

Set up quality filters for incoming data:

```yaml
quality_filters:
  min_abstract_length: 100
  min_citation_count: 1
  required_fields: ["title", "authors", "abstract"]
  language_filter: ["en"]
  publication_year_range: [2000, 2024]
  exclude_patterns:
    - "withdrawn"
    - "retracted"
    - "preprint"  # if excluding preprints
```

## Monitoring and Maintenance

### Source Health Monitoring

```python
from studyassistant.monitoring import SourceMonitor

monitor = SourceMonitor()

# Check all source health
health_report = monitor.check_all_sources()

# Monitor specific source
arxiv_status = monitor.check_source("arxiv")

# Set up alerts
monitor.setup_alerts(
    email="admin@example.com",
    thresholds={
        "response_time": 5.0,  # seconds
        "error_rate": 0.05,    # 5%
        "success_rate": 0.95   # 95%
    }
)
```

### Data Freshness

Monitor and update data freshness:

```python
from studyassistant.maintenance import DataFreshnessChecker

checker = DataFreshnessChecker()

# Check data age
freshness_report = checker.check_freshness()

# Update stale data
stale_sources = checker.find_stale_sources(max_age_days=7)
for source in stale_sources:
    source.refresh_data()
```

### Backup and Recovery

```python
from studyassistant.backup import DataBackup

backup = DataBackup(backup_dir="/backups/studyassistant")

# Backup all source data
backup.backup_all_sources()

# Restore from backup
backup.restore_source("arxiv", backup_date="2024-01-15")

# Scheduled backups
backup.schedule_backup(interval="daily", time="02:00")
```

## Best Practices

### 1. Rate Limiting

- Always respect API rate limits
- Use exponential backoff for failed requests
- Monitor your usage quotas
- Consider premium API keys for higher limits

### 2. Data Validation

- Validate all incoming data against schemas
- Implement robust error handling
- Log failed retrievals for analysis
- Set up data quality metrics

### 3. Caching Strategy

- Cache frequently accessed data
- Implement cache invalidation policies
- Use appropriate cache TTL values
- Monitor cache hit rates

### 4. Error Handling

```python
from studyassistant.exceptions import SourceError, RateLimitError

try:
    results = source.search(query)
except RateLimitError as e:
    # Wait and retry with exponential backoff
    time.sleep(e.retry_after)
    results = source.search(query)
except SourceError as e:
    # Log error and try alternative source
    logger.error(f"Source error: {e}")
    results = fallback_source.search(query)
```

### 5. Performance Optimization

- Use asynchronous requests when possible
- Implement connection pooling
- Batch requests when APIs support it
- Monitor and optimize query patterns

## Troubleshooting

### Common Issues

#### API Key Problems

```bash
# Test API connectivity
studyassistant test-connection --source semantic_scholar
studyassistant config set semantic_scholar.api_key YOUR_KEY
```

#### Rate Limiting

```bash
# Check current rate limits
studyassistant status --source-limits

# Adjust rate limits in config
studyassistant config set arxiv.rate_limit 2
```

#### Data Quality Issues

```bash
# Run data quality check
studyassistant quality-check --source arxiv

# Clean invalid records
studyassistant cleanup --remove-invalid
```

### Debug Mode

Enable detailed logging for source operations:

```yaml
logging:
  level: DEBUG
  sources:
    - studyassistant.sources.arxiv
    - studyassistant.sources.pubmed
    - studyassistant.sources.semantic_scholar
```

## Next Steps

- Learn about [Query Techniques](query-techniques.md) for better search results
- Explore [Web Interface](web-interface.md) source management
- Set up [Troubleshooting](troubleshooting.md) for source issues
- Review [API Reference](../api/external/integrations.md) for detailed API documentation
