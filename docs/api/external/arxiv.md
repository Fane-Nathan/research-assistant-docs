# ArXiv API Integration

The ArXiv API integration provides comprehensive access to the ArXiv preprint repository, enabling automated research paper discovery, metadata extraction, and content retrieval for the StudyAssistant system.

## Overview

The ArXiv integration offers:

- **Paper discovery** with advanced search capabilities
- **Metadata extraction** including authors, abstracts, and categories
- **Full-text retrieval** with PDF processing
- **Citation tracking** and reference extraction
- **Bulk operations** for large-scale data collection
- **Real-time updates** for new publications

## Core Endpoints

### Paper Search

#### Search Papers

```http
GET /api/external/arxiv/search?q=attention+mechanisms&max_results=50&sort_by=relevance
Authorization: Bearer {token}
```

**Query Parameters:**
- `q` (string, required): Search query using ArXiv search syntax
- `max_results` (integer): Maximum papers to return (default: 20, max: 2000)
- `start` (integer): Starting index for pagination (default: 0)
- `sort_by` (string): Sort order (relevance, lastUpdatedDate, submittedDate)
- `sort_order` (string): Sort direction (ascending, descending)
- `category` (string): ArXiv category filter (cs.AI, cs.CL, etc.)
- `date_range` (object): Date range filter

**Response:**
```json
{
    "papers": [
        {
            "id": "2017.06135",
            "title": "Attention Is All You Need",
            "authors": [
                {
                    "name": "Ashish Vaswani",
                    "affiliation": "Google Brain"
                },
                {
                    "name": "Noam Shazeer", 
                    "affiliation": "Google Brain"
                }
            ],
            "abstract": "The dominant sequence transduction models are based on complex recurrent or convolutional neural networks...",
            "categories": ["cs.CL", "cs.AI", "cs.LG"],
            "primary_category": "cs.CL",
            "published": "2017-06-12T17:59:34Z",
            "updated": "2017-06-12T17:59:34Z",
            "doi": "10.48550/arXiv.1706.03762",
            "journal_ref": "31st Conference on Neural Information Processing Systems (NIPS 2017)",
            "comment": "15 pages, 5 figures",
            "links": {
                "abs": "http://arxiv.org/abs/1706.03762v1",
                "pdf": "http://arxiv.org/pdf/1706.03762v1.pdf",
                "html": "http://arxiv.org/html/1706.03762v1"
            },
            "metadata": {
                "version": 1,
                "submission_history": [
                    {
                        "version": "v1",
                        "submitted": "2017-06-12T17:59:34Z"
                    }
                ],
                "licenses": ["http://arxiv.org/licenses/nonexclusive-distrib/1.0/"],
                "msc_classes": [],
                "acm_classes": []
            }
        }
    ],
    "total_results": 1547,
    "start_index": 0,
    "items_per_page": 50,
    "search_metadata": {
        "query": "attention mechanisms",
        "query_parsed": "ti:attention AND ti:mechanisms",
        "search_time": 0.234,
        "total_time": 1.456
    }
}
```

#### Advanced Search

```http
POST /api/external/arxiv/search/advanced
Content-Type: application/json
Authorization: Bearer {token}

{
    "query": {
        "title": "attention mechanisms",
        "author": "vaswani",
        "abstract": "transformer",
        "categories": ["cs.AI", "cs.CL"],
        "date_range": {
            "start": "2017-01-01",
            "end": "2024-01-01"
        }
    },
    "filters": {
        "min_citations": 100,
        "language": "en",
        "has_pdf": true
    },
    "sort": {
        "field": "citation_count",
        "order": "desc"
    },
    "pagination": {
        "limit": 100,
        "offset": 0
    }
}
```

**Response:**
```json
{
    "papers": [...],
    "search_metadata": {
        "query_complexity": "advanced",
        "filters_applied": 4,
        "estimated_total": 2340,
        "search_time": 0.567
    },
    "facets": {
        "categories": [
            {"category": "cs.AI", "count": 1245},
            {"category": "cs.CL", "count": 987},
            {"category": "cs.LG", "count": 856}
        ],
        "years": [
            {"year": 2023, "count": 456},
            {"year": 2022, "count": 389}
        ],
        "top_authors": [
            {"author": "Geoffrey Hinton", "count": 23},
            {"author": "Yann LeCun", "count": 18}
        ]
    }
}
```

### Paper Retrieval

#### Get Paper Details

```http
GET /api/external/arxiv/papers/{arxiv_id}
Authorization: Bearer {token}
```

**Response:**
```json
{
    "paper": {
        "id": "1706.03762",
        "title": "Attention Is All You Need",
        "authors": [...],
        "abstract": "The dominant sequence transduction models...",
        "full_text": "# Attention Is All You Need\n\n## Abstract\n\nThe dominant sequence...",
        "categories": ["cs.CL", "cs.AI", "cs.LG"],
        "published": "2017-06-12T17:59:34Z",
        "updated": "2017-06-12T17:59:34Z",
        "versions": [
            {
                "version": "v1",
                "submitted": "2017-06-12T17:59:34Z",
                "size": "2025kb"
            }
        ],
        "links": {...},
        "metadata": {...}
    },
    "enriched_data": {
        "citations": {
            "count": 89234,
            "recent_count": 1234,
            "h_index": 456
        },
        "references": [
            {
                "title": "Long Short-Term Memory",
                "authors": ["Sepp Hochreiter", "Jürgen Schmidhuber"],
                "year": 1997
            }
        ],
        "related_papers": [
            {
                "id": "1810.04805",
                "title": "BERT: Pre-training of Deep Bidirectional Transformers",
                "similarity_score": 0.87
            }
        ],
        "impact_metrics": {
            "influence_score": 95.6,
            "novelty_score": 88.2,
            "significance_score": 92.1
        }
    },
    "processing_metadata": {
        "pdf_processed": true,
        "text_extracted": true,
        "references_parsed": true,
        "last_updated": "2024-01-15T10:30:00Z"
    }
}
```

#### Download Paper Content

```http
GET /api/external/arxiv/papers/{arxiv_id}/content?format=pdf
Authorization: Bearer {token}
```

**Query Parameters:**
- `format` (string): Content format (pdf, text, html, structured)
- `include_figures` (boolean): Include figures in extraction
- `include_tables` (boolean): Include tables in extraction
- `include_references` (boolean): Extract and parse references

**Response:**
```json
{
    "content": {
        "format": "structured",
        "sections": [
            {
                "title": "Abstract",
                "content": "The dominant sequence transduction models...",
                "page": 1,
                "position": {"start": 0, "end": 512}
            },
            {
                "title": "1 Introduction",
                "content": "Recurrent neural networks, long short-term memory...",
                "page": 1,
                "position": {"start": 512, "end": 1024}
            }
        ],
        "figures": [
            {
                "caption": "The Transformer - model architecture",
                "page": 3,
                "bbox": {"x": 100, "y": 200, "width": 400, "height": 300},
                "image_url": "/api/external/arxiv/papers/1706.03762/figures/1"
            }
        ],
        "tables": [
            {
                "caption": "Results on WMT 2014 English-to-German translation",
                "page": 7,
                "data": [
                    ["Model", "BLEU"],
                    ["Transformer (base)", "27.3"],
                    ["Transformer (big)", "28.4"]
                ]
            }
        ],
        "references": [
            {
                "id": 1,
                "text": "Dzmitry Bahdanau, Kyunghyun Cho, and Yoshua Bengio. Neural machine translation by jointly learning to align and translate. arXiv preprint arXiv:1409.0473, 2014.",
                "parsed": {
                    "authors": ["Dzmitry Bahdanau", "Kyunghyun Cho", "Yoshua Bengio"],
                    "title": "Neural machine translation by jointly learning to align and translate",
                    "venue": "arXiv preprint",
                    "year": 2014,
                    "arxiv_id": "1409.0473"
                }
            }
        ]
    },
    "extraction_metadata": {
        "pdf_size": "2.1MB",
        "pages": 15,
        "extraction_time": 2.34,
        "extraction_quality": 0.96,
        "figures_extracted": 5,
        "tables_extracted": 3,
        "references_extracted": 47
    }
}
```

### Bulk Operations

#### Bulk Paper Retrieval

```http
POST /api/external/arxiv/papers/bulk
Content-Type: application/json
Authorization: Bearer {token}

{
    "paper_ids": [
        "1706.03762",
        "1810.04805", 
        "2005.14165"
    ],
    "include_content": true,
    "include_metadata": true,
    "processing_options": {
        "extract_references": true,
        "extract_figures": false,
        "parallel_processing": true,
        "max_concurrent": 5
    }
}
```

**Response:**
```json
{
    "job_id": "bulk_arxiv_123456",
    "status": "processing",
    "papers": [
        {
            "id": "1706.03762",
            "status": "completed",
            "paper": {...},
            "processing_time": 1.23
        },
        {
            "id": "1810.04805", 
            "status": "processing",
            "progress": 0.65
        },
        {
            "id": "2005.14165",
            "status": "queued"
        }
    ],
    "summary": {
        "total_papers": 3,
        "completed": 1,
        "processing": 1,
        "queued": 1,
        "failed": 0,
        "estimated_completion": "2024-01-15T10:35:00Z"
    }
}
```

### Category and Subject Analysis

#### Get Categories

```http
GET /api/external/arxiv/categories
Authorization: Bearer {token}
```

**Response:**
```json
{
    "categories": [
        {
            "id": "cs.AI",
            "name": "Artificial Intelligence",
            "description": "Covers all areas of AI except Vision, Robotics, Machine Learning, Multiagent Systems, and Computation and Language (Natural Language Processing)",
            "parent": "cs",
            "paper_count": 45230,
            "recent_papers": 1234,
            "subcategories": []
        },
        {
            "id": "cs.CL",
            "name": "Computation and Language",
            "description": "Covers natural language processing. Roughly includes material in ACM Subject Class I.2.7",
            "parent": "cs", 
            "paper_count": 38940,
            "recent_papers": 987,
            "subcategories": []
        }
    ],
    "category_hierarchy": {
        "cs": {
            "name": "Computer Science",
            "subcategories": ["cs.AI", "cs.CL", "cs.CV", "cs.LG", "cs.RO"]
        },
        "math": {
            "name": "Mathematics", 
            "subcategories": ["math.AG", "math.AT", "math.CA"]
        }
    },
    "trending_categories": [
        {
            "category": "cs.LG",
            "growth_rate": 0.25,
            "recent_submissions": 567
        }
    ]
}
```

#### Get Category Statistics

```http
GET /api/external/arxiv/categories/{category_id}/stats?period=30d
Authorization: Bearer {token}
```

**Response:**
```json
{
    "category": "cs.AI",
    "period": {
        "start": "2023-12-16T00:00:00Z",
        "end": "2024-01-15T00:00:00Z"
    },
    "statistics": {
        "total_papers": 1247,
        "daily_average": 41.6,
        "growth_rate": 0.15,
        "unique_authors": 2894,
        "institutions": 567
    },
    "trends": {
        "submission_pattern": [
            {"date": "2024-01-15", "count": 45},
            {"date": "2024-01-14", "count": 38}
        ],
        "top_keywords": [
            {"keyword": "neural networks", "frequency": 234},
            {"keyword": "deep learning", "frequency": 189}
        ],
        "top_authors": [
            {"author": "Geoffrey Hinton", "papers": 3},
            {"author": "Yann LeCun", "papers": 2}
        ]
    },
    "related_categories": [
        {
            "category": "cs.LG",
            "overlap_score": 0.78,
            "shared_papers": 456
        }
    ]
}
```

### Real-time Updates

#### Subscribe to Updates

```http
POST /api/external/arxiv/subscriptions
Content-Type: application/json
Authorization: Bearer {token}

{
    "name": "AI Research Updates",
    "filters": {
        "categories": ["cs.AI", "cs.LG"],
        "keywords": ["attention", "transformer", "neural network"],
        "authors": ["Geoffrey Hinton", "Yann LeCun"],
        "min_citation_potential": 0.7
    },
    "notification_settings": {
        "frequency": "daily",
        "max_papers": 50,
        "include_abstracts": true,
        "webhook_url": "https://your-app.com/webhooks/arxiv"
    }
}
```

**Response:**
```json
{
    "subscription_id": "sub_arxiv_123456",
    "status": "active",
    "created_at": "2024-01-15T10:30:00Z",
    "next_notification": "2024-01-16T09:00:00Z",
    "estimated_papers_per_day": 15
}
```

#### Get Update Feed

```http
GET /api/external/arxiv/feeds/{subscription_id}?since=2024-01-14T00:00:00Z
Authorization: Bearer {token}
```

**Response:**
```json
{
    "subscription_id": "sub_arxiv_123456",
    "updates": [
        {
            "paper_id": "2024.12345",
            "title": "Novel Attention Mechanisms for Language Models",
            "authors": ["Jane Doe", "John Smith"],
            "published": "2024-01-15T08:00:00Z",
            "matched_filters": ["keywords: attention", "categories: cs.AI"],
            "relevance_score": 0.89,
            "citation_potential": 0.82
        }
    ],
    "total_updates": 12,
    "period": {
        "start": "2024-01-14T00:00:00Z",
        "end": "2024-01-15T10:30:00Z"
    }
}
```

## Configuration

### API Configuration

```yaml
external_apis:
  arxiv:
    base_url: "http://export.arxiv.org/api/query"
    rate_limiting:
      requests_per_second: 3
      burst_size: 10
      backoff_factor: 2
      max_retries: 3
      
    caching:
      enabled: true
      ttl: 86400  # 24 hours
      cache_searches: true
      cache_papers: true
      
    content_processing:
      pdf_extraction: true
      reference_parsing: true
      figure_extraction: false
      parallel_downloads: 5
      
    quality_filters:
      min_abstract_length: 100
      language_detection: true
      spam_filtering: true
      duplicate_detection: true
```

### Search Configuration

```yaml
external_apis:
  arxiv:
    search:
      default_max_results: 50
      absolute_max_results: 2000
      default_sort: "relevance"
      
      query_expansion:
        enabled: true
        synonyms: true
        stemming: true
        
      result_enhancement:
        citation_lookup: true
        related_papers: true
        author_disambiguation: true
        
    subscriptions:
      max_subscriptions_per_user: 10
      max_papers_per_notification: 100
      notification_frequency: ["hourly", "daily", "weekly"]
```

## Rate Limiting and Quotas

### Default Limits

| Operation | Free Tier | Premium | Enterprise |
|-----------|-----------|---------|------------|
| Search requests | 100/hour | 1000/hour | 10000/hour |
| Paper downloads | 50/day | 500/day | 5000/day |
| Bulk operations | 5/day | 50/day | 500/day |
| Subscriptions | 3 active | 20 active | 100 active |

### ArXiv API Limits

The underlying ArXiv API has the following restrictions:
- 3 requests per second
- Maximum 2000 results per query
- No more than 1 concurrent connection per client

## Error Handling

### Common Error Codes

| Code | Description | Status |
|------|-------------|--------|
| `ARXIV_001` | Paper not found | 404 |
| `ARXIV_002` | Invalid ArXiv ID format | 400 |
| `ARXIV_003` | Rate limit exceeded | 429 |
| `ARXIV_004` | ArXiv service unavailable | 503 |
| `ARXIV_005` | PDF download failed | 502 |
| `ARXIV_006` | Search query too complex | 400 |
| `ARXIV_007` | Subscription limit exceeded | 403 |

### Error Response Format

```json
{
    "error": {
        "code": "ARXIV_001",
        "message": "Paper not found",
        "details": {
            "arxiv_id": "1706.03762",
            "suggestion": "Check if the ArXiv ID is correct"
        },
        "retry_after": null
    }
}
```

## SDK Examples

### Python SDK

```python
from studyassistant.client import ArxivClient

# Initialize client
client = ArxivClient(
    base_url="https://api.studyassistant.com",
    api_key="your_api_key"
)

# Search papers
papers = client.search(
    query="attention mechanisms transformer",
    max_results=50,
    category="cs.AI",
    sort_by="relevance"
)

# Get paper details
paper = client.get_paper("1706.03762", include_content=True)

# Bulk download
job = client.bulk_download([
    "1706.03762",
    "1810.04805"
], include_content=True)

# Monitor bulk job
status = client.get_job_status(job.id)

# Subscribe to updates
subscription = client.subscribe({
    "categories": ["cs.AI"],
    "keywords": ["attention", "transformer"],
    "frequency": "daily"
})

# Advanced search
results = client.advanced_search({
    "title": "attention",
    "author": "vaswani",
    "date_range": {"start": "2017-01-01", "end": "2024-01-01"}
})
```

### JavaScript SDK

```javascript
import { ArxivClient } from '@studyassistant/client';

const client = new ArxivClient({
    baseUrl: 'https://api.studyassistant.com',
    apiKey: 'your_api_key'
});

// Search papers
const papers = await client.search({
    query: 'attention mechanisms transformer',
    maxResults: 50,
    category: 'cs.AI',
    sortBy: 'relevance'
});

// Get paper with full content
const paper = await client.getPaper('1706.03762', {
    includeContent: true,
    extractReferences: true,
    extractFigures: false
});

// Real-time subscription
const subscription = await client.createSubscription({
    name: 'AI Research Updates',
    filters: {
        categories: ['cs.AI', 'cs.LG'],
        keywords: ['attention', 'transformer']
    },
    webhookUrl: 'https://your-app.com/webhooks/arxiv'
});

// Get category statistics
const stats = await client.getCategoryStats('cs.AI', {
    period: '30d',
    includeTrends: true
});
```

## Best Practices

### Search Optimization

1. **Use specific queries**: More specific queries return more relevant results
2. **Leverage categories**: Filter by ArXiv categories for better precision
3. **Combine filters**: Use date ranges and author filters effectively
4. **Pagination**: Use pagination for large result sets

### Content Processing

1. **Batch downloads**: Use bulk operations for multiple papers
2. **Content caching**: Cache frequently accessed papers
3. **Quality filtering**: Apply minimum quality thresholds
4. **Error handling**: Implement retry logic for failed downloads

### Rate Limit Management

1. **Request spacing**: Respect rate limits to avoid throttling
2. **Efficient queries**: Design queries to minimize API calls
3. **Caching strategy**: Cache results to reduce redundant requests
4. **Monitoring**: Track usage against quotas

## See Also

- [Resource Fetcher API](../resource-fetcher.md) - Multi-source resource fetching
- [Data Manager API](../data-manager.md) - Resource storage and management
- [LLM Providers API](./llm-providers.md) - Language model integrations
- [Web Crawling API](./web-crawling.md) - Web content extraction
