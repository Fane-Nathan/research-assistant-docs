# Resource Fetcher API

The Resource Fetcher API provides comprehensive functionality for discovering, retrieving, and managing academic resources from multiple sources including ArXiv, PubMed, Semantic Scholar, and web crawling services.

## Overview

The Resource Fetcher API enables automated discovery and retrieval of academic content with support for multiple data sources, intelligent filtering, deduplication, and content validation. It provides both synchronous and asynchronous processing capabilities.

## Base URL

```
https://api.studyassistant.com/v1/resources
```

## Authentication

All endpoints require authentication using either JWT Bearer tokens or API keys:

```http
Authorization: Bearer <your-jwt-token>
# OR
X-API-Key: <your-api-key>
```

## Endpoints

### Resource Discovery

#### Search Resources

Search for academic resources across multiple sources.

**Endpoint:** `POST /search`

**Request Body:**
```json
{
  "query": "machine learning transformers",
  "sources": ["arxiv", "pubmed", "semantic_scholar"],
  "filters": {
    "date_range": {
      "start": "2023-01-01",
      "end": "2024-01-01"
    },
    "categories": ["cs.LG", "cs.AI"],
    "max_results": 100,
    "sort_by": "relevance"
  },
  "include_abstracts": true,
  "include_metadata": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "search_id": "search_123",
    "total_results": 150,
    "sources_searched": ["arxiv", "pubmed", "semantic_scholar"],
    "results": [
      {
        "id": "arxiv:2301.12345",
        "title": "Attention Is All You Need: A Comprehensive Survey",
        "authors": ["John Doe", "Jane Smith"],
        "source": "arxiv",
        "url": "https://arxiv.org/abs/2301.12345",
        "published_date": "2023-01-15",
        "abstract": "This paper presents a comprehensive survey...",
        "categories": ["cs.LG", "cs.AI"],
        "citations": 45,
        "metadata": {
          "journal": "arXiv preprint",
          "doi": "10.48550/arXiv.2301.12345",
          "pdf_url": "https://arxiv.org/pdf/2301.12345.pdf"
        }
      }
    ],
    "search_metadata": {
      "execution_time": 2.3,
      "cache_hit": false,
      "query_optimization": "applied"
    }
  }
}
```

**Curl Example:**
```bash
curl -X POST "https://api.studyassistant.com/v1/resources/search" \
  -H "Authorization: Bearer <your-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "machine learning transformers",
    "sources": ["arxiv", "pubmed"],
    "filters": {
      "max_results": 50
    }
  }'
```

#### Get Search Results

Retrieve results from a previous search.

**Endpoint:** `GET /search/{search_id}`

**Parameters:**
- `search_id` (path): Search identifier
- `page` (query): Page number (default: 1)
- `limit` (query): Results per page (default: 20, max: 100)

**Response:**
```json
{
  "success": true,
  "data": {
    "search_id": "search_123",
    "page": 1,
    "limit": 20,
    "total_pages": 8,
    "total_results": 150,
    "results": [
      {
        "id": "arxiv:2301.12345",
        "title": "Attention Is All You Need: A Comprehensive Survey",
        "authors": ["John Doe", "Jane Smith"],
        "source": "arxiv",
        "relevance_score": 0.95,
        "summary": "Auto-generated summary of the paper..."
      }
    ]
  }
}
```

### Resource Retrieval

#### Fetch Resource

Retrieve detailed information about a specific resource.

**Endpoint:** `GET /fetch/{resource_id}`

**Parameters:**
- `resource_id` (path): Resource identifier (e.g., `arxiv:2301.12345`)
- `include_content` (query): Include full text content (default: false)
- `include_citations` (query): Include citation information (default: true)
- `include_references` (query): Include reference list (default: true)

**Response:**
```json
{
  "success": true,
  "data": {
    "resource": {
      "id": "arxiv:2301.12345",
      "title": "Attention Is All You Need: A Comprehensive Survey",
      "authors": [
        {
          "name": "John Doe",
          "affiliation": "Stanford University",
          "orcid": "0000-0000-0000-0000"
        }
      ],
      "abstract": "This paper presents a comprehensive survey...",
      "content": "Full paper content here...",
      "metadata": {
        "published_date": "2023-01-15",
        "updated_date": "2023-01-20",
        "journal": "arXiv preprint",
        "categories": ["cs.LG", "cs.AI"],
        "doi": "10.48550/arXiv.2301.12345",
        "pdf_url": "https://arxiv.org/pdf/2301.12345.pdf",
        "citation_count": 45,
        "download_count": 1250
      },
      "citations": [
        {
          "id": "arxiv:1706.03762",
          "title": "Attention Is All You Need",
          "authors": ["Ashish Vaswani", "et al."],
          "year": 2017
        }
      ],
      "references": [
        {
          "id": "ref_1",
          "citation": "Vaswani, A., et al. (2017). Attention is all you need.",
          "doi": "10.5555/3295222.3295349"
        }
      ]
    },
    "retrieval_info": {
      "retrieved_at": "2024-01-01T12:00:00Z",
      "source_freshness": "2023-01-20T10:30:00Z",
      "content_hash": "sha256:abc123...",
      "processing_time": 1.2
    }
  }
}
```

#### Batch Fetch Resources

Retrieve multiple resources in a single request.

**Endpoint:** `POST /fetch/batch`

**Request Body:**
```json
{
  "resource_ids": [
    "arxiv:2301.12345",
    "pubmed:12345678",
    "semantic_scholar:abcd1234"
  ],
  "include_content": false,
  "include_citations": true,
  "parallel_processing": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "batch_id": "batch_456",
    "requested_count": 3,
    "successful_count": 2,
    "failed_count": 1,
    "resources": [
      {
        "id": "arxiv:2301.12345",
        "status": "success",
        "resource": {
          "title": "Attention Is All You Need: A Comprehensive Survey",
          "authors": ["John Doe", "Jane Smith"]
        }
      },
      {
        "id": "pubmed:12345678",
        "status": "success",
        "resource": {
          "title": "Medical AI Applications",
          "authors": ["Dr. Alice Brown"]
        }
      },
      {
        "id": "semantic_scholar:abcd1234",
        "status": "failed",
        "error": {
          "code": "RESOURCE_NOT_FOUND",
          "message": "Resource not found in Semantic Scholar"
        }
      }
    ],
    "processing_info": {
      "total_time": 3.5,
      "parallel_requests": 3,
      "cache_hits": 1
    }
  }
}
```

### Source-Specific Endpoints

#### ArXiv Integration

**Search ArXiv:**
```http
GET /sources/arxiv/search?q=machine%20learning&category=cs.LG&max_results=50
```

**Get ArXiv Paper:**
```http
GET /sources/arxiv/papers/2301.12345
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "2301.12345",
    "title": "Transformer Architecture Survey",
    "authors": ["John Doe", "Jane Smith"],
    "categories": ["cs.LG", "cs.AI"],
    "submitted": "2023-01-15T10:30:00Z",
    "updated": "2023-01-20T15:45:00Z",
    "abstract": "This paper surveys transformer architectures...",
    "pdf_url": "https://arxiv.org/pdf/2301.12345.pdf",
    "comment": "25 pages, 8 figures, submitted to ICLR 2024"
  }
}
```

#### PubMed Integration

**Search PubMed:**
```http
GET /sources/pubmed/search?term=machine%20learning%20healthcare&retmax=50
```

**Get PubMed Article:**
```http
GET /sources/pubmed/articles/12345678
```

**Response:**
```json
{
  "success": true,
  "data": {
    "pmid": "12345678",
    "title": "Machine Learning in Healthcare: A Systematic Review",
    "authors": [
      {
        "name": "Dr. Alice Brown",
        "affiliation": "Harvard Medical School"
      }
    ],
    "journal": "Nature Medicine",
    "publication_date": "2023-03-15",
    "doi": "10.1038/s41591-023-12345-6",
    "abstract": "This systematic review examines...",
    "mesh_terms": ["Machine Learning", "Healthcare", "Artificial Intelligence"],
    "publication_types": ["Journal Article", "Review"]
  }
}
```

#### Semantic Scholar Integration

**Search Semantic Scholar:**
```http
GET /sources/semantic_scholar/search?query=transformers%20nlp&limit=50
```

**Get Paper Details:**
```http
GET /sources/semantic_scholar/papers/abcd1234
```

### Content Management

#### Download Resource Content

Download full content of a resource.

**Endpoint:** `POST /download`

**Request Body:**
```json
{
  "resource_id": "arxiv:2301.12345",
  "format": "pdf",
  "include_metadata": true,
  "processing_options": {
    "extract_text": true,
    "extract_images": false,
    "extract_tables": true
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "download_id": "download_789",
    "resource_id": "arxiv:2301.12345",
    "status": "processing",
    "estimated_completion": "2024-01-01T12:05:00Z",
    "download_url": null
  }
}
```

#### Get Download Status

Check download processing status.

**Endpoint:** `GET /download/{download_id}`

**Response:**
```json
{
  "success": true,
  "data": {
    "download_id": "download_789",
    "status": "completed",
    "resource_id": "arxiv:2301.12345",
    "download_url": "https://api.studyassistant.com/v1/files/download_789.pdf",
    "content_info": {
      "format": "pdf",
      "size_bytes": 2048576,
      "pages": 25,
      "text_extracted": true,
      "tables_extracted": true,
      "processing_time": 45.2
    },
    "expires_at": "2024-01-02T12:00:00Z"
  }
}
```

### Monitoring and Analytics

#### Get Fetch Statistics

Retrieve fetching statistics and performance metrics.

**Endpoint:** `GET /stats`

**Parameters:**
- `period` (query): Time period (`day`, `week`, `month`) (default: `day`)
- `source` (query): Filter by source (optional)

**Response:**
```json
{
  "success": true,
  "data": {
    "period": "day",
    "date_range": {
      "start": "2024-01-01T00:00:00Z",
      "end": "2024-01-01T23:59:59Z"
    },
    "totals": {
      "searches_performed": 150,
      "resources_fetched": 1250,
      "downloads_initiated": 75,
      "cache_hits": 450,
      "cache_miss": 800
    },
    "by_source": {
      "arxiv": {
        "searches": 80,
        "fetches": 600,
        "success_rate": 0.98
      },
      "pubmed": {
        "searches": 45,
        "fetches": 400,
        "success_rate": 0.95
      },
      "semantic_scholar": {
        "searches": 25,
        "fetches": 250,
        "success_rate": 0.92
      }
    },
    "performance": {
      "average_response_time": 1.8,
      "p95_response_time": 3.2,
      "error_rate": 0.02
    }
  }
}
```

#### Get Source Status

Check the operational status of external sources.

**Endpoint:** `GET /sources/status`

**Response:**
```json
{
  "success": true,
  "data": {
    "overall_status": "operational",
    "last_updated": "2024-01-01T12:00:00Z",
    "sources": {
      "arxiv": {
        "status": "operational",
        "response_time": 0.8,
        "last_check": "2024-01-01T11:58:00Z",
        "uptime_24h": 0.999
      },
      "pubmed": {
        "status": "operational",
        "response_time": 1.2,
        "last_check": "2024-01-01T11:58:00Z",
        "uptime_24h": 0.995
      },
      "semantic_scholar": {
        "status": "degraded",
        "response_time": 3.5,
        "last_check": "2024-01-01T11:58:00Z",
        "uptime_24h": 0.85,
        "issues": ["High response times"]
      }
    }
  }
}
```

### Bulk Operations

#### Bulk Import

Import resources from external lists or bibliographies.

**Endpoint:** `POST /bulk/import`

**Request Body:**
```json
{
  "source_type": "bibtex",
  "content": "@article{doe2023attention,\n  title={Attention Is All You Need},\n  author={Doe, John and Smith, Jane},\n  journal={arXiv preprint arXiv:2301.12345},\n  year={2023}\n}",
  "options": {
    "auto_fetch": true,
    "resolve_duplicates": true,
    "include_abstracts": true
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "import_id": "import_999",
    "status": "processing",
    "total_entries": 25,
    "estimated_completion": "2024-01-01T12:10:00Z"
  }
}
```

#### Get Import Status

Check bulk import progress.

**Endpoint:** `GET /bulk/import/{import_id}`

**Response:**
```json
{
  "success": true,
  "data": {
    "import_id": "import_999",
    "status": "completed",
    "progress": {
      "total_entries": 25,
      "processed": 25,
      "successful": 23,
      "failed": 2,
      "duplicates_found": 3
    },
    "results": {
      "imported_resources": 20,
      "updated_resources": 3,
      "failed_imports": [
        {
          "entry": "Invalid DOI format",
          "error": "INVALID_DOI"
        }
      ]
    },
    "completion_time": "2024-01-01T12:08:30Z"
  }
}
```

## Configuration

### Source Configuration

Configure individual source adapters:

```json
{
  "sources": {
    "arxiv": {
      "enabled": true,
      "rate_limit": 5,
      "timeout": 30,
      "cache_ttl": 3600,
      "categories": ["cs.LG", "cs.AI", "cs.CL"]
    },
    "pubmed": {
      "enabled": true,
      "api_key": "your-ncbi-api-key",
      "rate_limit": 10,
      "timeout": 20,
      "cache_ttl": 7200
    },
    "semantic_scholar": {
      "enabled": true,
      "api_key": "your-semantic-scholar-key",
      "rate_limit": 100,
      "timeout": 15,
      "cache_ttl": 1800
    }
  }
}
```

### Caching Configuration

```json
{
  "caching": {
    "enabled": true,
    "backend": "redis",
    "default_ttl": 3600,
    "max_cache_size": "1GB",
    "cache_compression": true,
    "cache_warming": {
      "enabled": true,
      "popular_queries": 100,
      "refresh_interval": 3600
    }
  }
}
```

## Error Handling

### Source Errors

```json
{
  "success": false,
  "error": {
    "code": "SOURCE_UNAVAILABLE",
    "message": "ArXiv service is temporarily unavailable",
    "details": {
      "source": "arxiv",
      "retry_after": 300,
      "alternative_sources": ["semantic_scholar"]
    }
  }
}
```

### Rate Limit Errors

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "API rate limit exceeded for PubMed",
    "details": {
      "source": "pubmed",
      "limit": 10,
      "window": 60,
      "retry_after": 45
    }
  }
}
```

### Resource Not Found

```json
{
  "success": false,
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "Resource not found in any configured source",
    "details": {
      "resource_id": "invalid:123456",
      "sources_checked": ["arxiv", "pubmed", "semantic_scholar"]
    }
  }
}
```

## SDKs and Libraries

### Python SDK

```python
from studyassistant import ResourceFetcher

# Initialize fetcher
fetcher = ResourceFetcher(api_key="your-api-key")

# Search resources
results = fetcher.search(
    query="machine learning transformers",
    sources=["arxiv", "pubmed"],
    max_results=50
)

# Fetch specific resource
resource = fetcher.fetch("arxiv:2301.12345", include_content=True)

# Batch fetch
resources = fetcher.batch_fetch([
    "arxiv:2301.12345",
    "pubmed:12345678"
])
```

### JavaScript SDK

```javascript
import { ResourceFetcher } from '@studyassistant/resources';

// Initialize fetcher
const fetcher = new ResourceFetcher({
  apiKey: 'your-api-key'
});

// Search resources
const results = await fetcher.search({
  query: 'machine learning transformers',
  sources: ['arxiv', 'pubmed'],
  maxResults: 50
});

// Fetch resource
const resource = await fetcher.fetch('arxiv:2301.12345');
```

## Best Practices

1. **Caching**: Enable caching for frequently accessed resources
2. **Rate Limiting**: Respect source-specific rate limits
3. **Error Handling**: Implement retry logic with exponential backoff
4. **Batch Processing**: Use batch operations for multiple resources
5. **Source Diversity**: Query multiple sources for comprehensive coverage
6. **Content Validation**: Validate retrieved content before processing
7. **Monitoring**: Monitor source availability and performance
8. **Deduplication**: Implement deduplication across sources

## See Also

- [Data Manager API](data-manager.md)
- [Hybrid Recommender API](hybrid-recommender.md)
- [External APIs](../external-apis/)
- [Resource Fetcher Architecture](../architecture/components/resource-fetcher.md)
