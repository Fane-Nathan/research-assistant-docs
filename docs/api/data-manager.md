# Data Manager API

The Data Manager API provides comprehensive data orchestration capabilities for the StudyAssistant system, including storage management, transaction handling, and data operations across multiple backends.

## Overview

The Data Manager serves as the central hub for all data operations, providing:

- **Multi-backend storage** (PostgreSQL, Elasticsearch, Redis, File System)
- **Transaction management** with ACID compliance
- **Distributed caching** with intelligent invalidation
- **Bulk operations** for high-performance data processing
- **Connection pooling** and resource optimization

## Core Endpoints

### Data Operations

#### Create Resource

```http
POST /api/data/resources
Content-Type: application/json
Authorization: Bearer {token}

{
    "title": "Advanced Neural Networks",
    "authors": ["John Doe", "Jane Smith"],
    "abstract": "This paper presents...",
    "source": "arxiv",
    "source_id": "2024.12345",
    "content": "Full paper content...",
    "metadata": {
        "keywords": ["neural networks", "deep learning"],
        "publication_date": "2024-01-15",
        "journal": "Nature AI"
    }
}
```

**Response:**
```json
{
    "id": "res_123456789",
    "title": "Advanced Neural Networks",
    "status": "created",
    "indexed": true,
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
}
```

#### Get Resource

```http
GET /api/data/resources/{resource_id}
Authorization: Bearer {token}
```

**Response:**
```json
{
    "id": "res_123456789",
    "title": "Advanced Neural Networks",
    "authors": ["John Doe", "Jane Smith"],
    "abstract": "This paper presents...",
    "source": "arxiv",
    "source_id": "2024.12345",
    "content": "Full paper content...",
    "metadata": {
        "keywords": ["neural networks", "deep learning"],
        "publication_date": "2024-01-15",
        "journal": "Nature AI",
        "citation_count": 42,
        "references": ["ref1", "ref2"]
    },
    "embeddings": {
        "title": [0.1, 0.2, ...],
        "abstract": [0.3, 0.4, ...],
        "content": [0.5, 0.6, ...]
    },
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
}
```

#### Update Resource

```http
PUT /api/data/resources/{resource_id}
Content-Type: application/json
Authorization: Bearer {token}

{
    "title": "Advanced Neural Networks - Updated",
    "metadata": {
        "keywords": ["neural networks", "deep learning", "transformer"],
        "citation_count": 45
    }
}
```

#### Delete Resource

```http
DELETE /api/data/resources/{resource_id}
Authorization: Bearer {token}
```

### Bulk Operations

#### Bulk Create

```http
POST /api/data/resources/bulk
Content-Type: application/json
Authorization: Bearer {token}

{
    "resources": [
        {
            "title": "Paper 1",
            "authors": ["Author 1"],
            "abstract": "Abstract 1..."
        },
        {
            "title": "Paper 2",
            "authors": ["Author 2"],
            "abstract": "Abstract 2..."
        }
    ],
    "options": {
        "batch_size": 100,
        "skip_duplicates": true,
        "validate": true
    }
}
```

**Response:**
```json
{
    "job_id": "bulk_job_123",
    "status": "processing",
    "total_count": 2,
    "processed_count": 0,
    "created_count": 0,
    "error_count": 0,
    "estimated_completion": "2024-01-15T10:35:00Z"
}
```

#### Bulk Update

```http
PUT /api/data/resources/bulk
Content-Type: application/json
Authorization: Bearer {token}

{
    "updates": [
        {
            "id": "res_123456789",
            "fields": {
                "metadata.citation_count": 50
            }
        }
    ],
    "options": {
        "upsert": false,
        "batch_size": 100
    }
}
```

### Search Operations

#### Search Resources

```http
GET /api/data/search?q=neural+networks&limit=20&offset=0
Authorization: Bearer {token}
```

**Query Parameters:**
- `q` (string): Search query
- `limit` (integer): Maximum results (default: 20, max: 100)
- `offset` (integer): Pagination offset (default: 0)
- `sort` (string): Sort field (title, date, relevance)
- `order` (string): Sort order (asc, desc)
- `filters` (object): Additional filters

**Response:**
```json
{
    "total": 150,
    "limit": 20,
    "offset": 0,
    "results": [
        {
            "id": "res_123456789",
            "title": "Advanced Neural Networks",
            "authors": ["John Doe", "Jane Smith"],
            "abstract": "This paper presents...",
            "score": 0.95,
            "highlighted": {
                "title": "Advanced <em>Neural Networks</em>",
                "abstract": "This paper presents <em>neural network</em> architectures..."
            }
        }
    ],
    "facets": {
        "authors": [
            {"name": "John Doe", "count": 25},
            {"name": "Jane Smith", "count": 20}
        ],
        "sources": [
            {"name": "arxiv", "count": 80},
            {"name": "pubmed", "count": 70}
        ]
    }
}
```

#### Advanced Search

```http
POST /api/data/search/advanced
Content-Type: application/json
Authorization: Bearer {token}

{
    "query": {
        "bool": {
            "must": [
                {"match": {"title": "neural networks"}},
                {"range": {"publication_date": {"gte": "2020-01-01"}}}
            ],
            "filter": [
                {"terms": {"authors": ["John Doe", "Jane Smith"]}}
            ]
        }
    },
    "aggregations": {
        "authors": {"terms": {"field": "authors"}},
        "yearly_counts": {"date_histogram": {"field": "publication_date", "interval": "year"}}
    },
    "highlight": {
        "fields": {
            "title": {},
            "abstract": {"fragment_size": 150}
        }
    }
}
```

### Transaction Management

#### Begin Transaction

```http
POST /api/data/transactions
Content-Type: application/json
Authorization: Bearer {token}

{
    "isolation_level": "READ_COMMITTED",
    "timeout": 300,
    "description": "Bulk resource import"
}
```

**Response:**
```json
{
    "transaction_id": "txn_123456789",
    "status": "active",
    "isolation_level": "READ_COMMITTED",
    "timeout": 300,
    "created_at": "2024-01-15T10:30:00Z",
    "expires_at": "2024-01-15T10:35:00Z"
}
```

#### Commit Transaction

```http
POST /api/data/transactions/{transaction_id}/commit
Authorization: Bearer {token}
```

#### Rollback Transaction

```http
POST /api/data/transactions/{transaction_id}/rollback
Authorization: Bearer {token}
```

### Cache Management

#### Get Cache Statistics

```http
GET /api/data/cache/stats
Authorization: Bearer {token}
```

**Response:**
```json
{
    "redis": {
        "status": "connected",
        "memory_used": "256MB",
        "keys_total": 15420,
        "hit_rate": 0.87,
        "miss_rate": 0.13
    },
    "application": {
        "size": "128MB",
        "entries": 8340,
        "hit_rate": 0.92,
        "evictions": 234
    },
    "query_cache": {
        "size": "64MB",
        "entries": 2450,
        "hit_rate": 0.78
    }
}
```

#### Clear Cache

```http
DELETE /api/data/cache
Authorization: Bearer {token}
```

**Query Parameters:**
- `pattern` (string): Key pattern to clear (optional)
- `type` (string): Cache type (redis, application, query, all)

### Storage Management

#### Get Storage Statistics

```http
GET /api/data/storage/stats
Authorization: Bearer {token}
```

**Response:**
```json
{
    "postgresql": {
        "status": "connected",
        "database_size": "2.5GB",
        "tables": {
            "resources": {"size": "1.8GB", "rows": 125000},
            "embeddings": {"size": "500MB", "rows": 125000},
            "metadata": {"size": "200MB", "rows": 125000}
        },
        "connections": {
            "active": 8,
            "idle": 12,
            "total": 20
        }
    },
    "elasticsearch": {
        "status": "connected",
        "cluster_health": "green",
        "indices": {
            "resources": {"size": "1.2GB", "docs": 125000},
            "embeddings": {"size": "800MB", "docs": 125000}
        },
        "shards": {
            "active": 6,
            "relocating": 0,
            "initializing": 0
        }
    },
    "filesystem": {
        "total_size": "500GB",
        "used_size": "50GB",
        "available_size": "450GB",
        "files": 125000
    }
}
```

#### Health Check

```http
GET /api/data/health
Authorization: Bearer {token}
```

**Response:**
```json
{
    "status": "healthy",
    "timestamp": "2024-01-15T10:30:00Z",
    "services": {
        "postgresql": {
            "status": "healthy",
            "response_time": "2ms",
            "last_check": "2024-01-15T10:30:00Z"
        },
        "elasticsearch": {
            "status": "healthy",
            "response_time": "5ms",
            "last_check": "2024-01-15T10:30:00Z"
        },
        "redis": {
            "status": "healthy",
            "response_time": "1ms",
            "last_check": "2024-01-15T10:30:00Z"
        }
    },
    "performance": {
        "avg_response_time": "3ms",
        "requests_per_second": 450,
        "error_rate": 0.01
    }
}
```

## Data Models

### Resource Schema

```json
{
    "id": "string (UUID)",
    "title": "string (required)",
    "authors": ["string"],
    "abstract": "string",
    "content": "string",
    "source": "string (arxiv|pubmed|web|manual)",
    "source_id": "string",
    "url": "string",
    "metadata": {
        "keywords": ["string"],
        "publication_date": "string (ISO 8601)",
        "journal": "string",
        "doi": "string",
        "citation_count": "integer",
        "references": ["string"],
        "language": "string",
        "content_type": "string"
    },
    "embeddings": {
        "title": ["float"],
        "abstract": ["float"],
        "content": ["float"]
    },
    "status": "string (draft|published|archived)",
    "created_at": "string (ISO 8601)",
    "updated_at": "string (ISO 8601)"
}
```

### Bulk Operation Schema

```json
{
    "job_id": "string",
    "status": "string (pending|processing|completed|failed)",
    "total_count": "integer",
    "processed_count": "integer",
    "created_count": "integer",
    "updated_count": "integer",
    "error_count": "integer",
    "errors": [
        {
            "index": "integer",
            "error": "string",
            "details": "object"
        }
    ],
    "created_at": "string (ISO 8601)",
    "updated_at": "string (ISO 8601)",
    "completed_at": "string (ISO 8601)"
}
```

## Configuration

### Storage Configuration

```yaml
data_manager:
  storage:
    postgresql:
      host: localhost
      port: 5432
      database: studyassistant
      username: sa_user
      password: ${POSTGRES_PASSWORD}
      pool_size: 20
      max_overflow: 10
      pool_timeout: 30
      
    elasticsearch:
      hosts: ["localhost:9200"]
      username: elastic
      password: ${ELASTIC_PASSWORD}
      timeout: 30
      max_retries: 3
      
    redis:
      host: localhost
      port: 6379
      password: ${REDIS_PASSWORD}
      db: 0
      pool_size: 10
      
    filesystem:
      base_path: /data/studyassistant
      max_file_size: 100MB
      allowed_extensions: [".pdf", ".txt", ".html"]
```

### Cache Configuration

```yaml
data_manager:
  cache:
    redis:
      default_ttl: 3600
      max_memory: 1GB
      eviction_policy: allkeys-lru
      
    application:
      max_size: 100MB
      ttl: 1800
      cleanup_interval: 300
      
    query_cache:
      max_size: 50MB
      ttl: 900
      max_entries: 10000
```

## Error Handling

### Common Error Codes

| Code | Description | Status |
|------|-------------|--------|
| `DATA_001` | Resource not found | 404 |
| `DATA_002` | Invalid resource data | 400 |
| `DATA_003` | Duplicate resource | 409 |
| `DATA_004` | Storage backend unavailable | 503 |
| `DATA_005` | Transaction timeout | 408 |
| `DATA_006` | Bulk operation failed | 422 |
| `DATA_007` | Search query invalid | 400 |
| `DATA_008` | Cache operation failed | 500 |

### Error Response Format

```json
{
    "error": {
        "code": "DATA_001",
        "message": "Resource not found",
        "details": {
            "resource_id": "res_123456789",
            "requested_at": "2024-01-15T10:30:00Z"
        },
        "suggestions": [
            "Check if the resource ID is correct",
            "Verify the resource hasn't been deleted"
        ]
    }
}
```

## Rate Limiting

The Data Manager API implements rate limiting based on:

- **User tier**: Different limits for free, premium, and enterprise users
- **Operation type**: Higher limits for read operations, lower for writes
- **Resource usage**: Dynamic limits based on system load

### Default Limits

| Operation | Free Tier | Premium | Enterprise |
|-----------|-----------|---------|------------|
| GET requests | 1000/hour | 5000/hour | Unlimited |
| POST/PUT requests | 100/hour | 1000/hour | 10000/hour |
| Bulk operations | 10/hour | 100/hour | 1000/hour |
| Search queries | 500/hour | 2000/hour | Unlimited |

## Performance Optimization

### Best Practices

1. **Batch Operations**: Use bulk endpoints for multiple operations
2. **Caching**: Leverage cache headers and ETags for conditional requests
3. **Pagination**: Always use pagination for large result sets
4. **Field Selection**: Request only needed fields using `fields` parameter
5. **Indexing**: Ensure proper indexing for search queries

### Monitoring

Monitor key metrics:

- Response times
- Error rates
- Cache hit ratios
- Database connection pool usage
- Search query performance

## SDK Examples

### Python SDK

```python
from studyassistant.client import DataManagerClient

# Initialize client
client = DataManagerClient(
    base_url="https://api.studyassistant.com",
    api_key="your_api_key"
)

# Create resource
resource = client.resources.create({
    "title": "Advanced Neural Networks",
    "authors": ["John Doe"],
    "abstract": "This paper presents...",
    "source": "arxiv",
    "source_id": "2024.12345"
})

# Search resources
results = client.resources.search(
    query="neural networks",
    limit=20,
    filters={"source": "arxiv"}
)

# Bulk operations
job = client.resources.bulk_create([
    {"title": "Paper 1", "authors": ["Author 1"]},
    {"title": "Paper 2", "authors": ["Author 2"]}
])

# Monitor bulk job
status = client.jobs.get_status(job.id)
```

### JavaScript SDK

```javascript
import { DataManagerClient } from '@studyassistant/client';

// Initialize client
const client = new DataManagerClient({
    baseUrl: 'https://api.studyassistant.com',
    apiKey: 'your_api_key'
});

// Create resource
const resource = await client.resources.create({
    title: 'Advanced Neural Networks',
    authors: ['John Doe'],
    abstract: 'This paper presents...',
    source: 'arxiv',
    sourceId: '2024.12345'
});

// Search with advanced options
const results = await client.resources.search({
    query: 'neural networks',
    limit: 20,
    sort: 'relevance',
    filters: { source: 'arxiv' }
});

// Transaction example
const transaction = await client.transactions.begin();
try {
    await client.resources.create(resource1, { transaction });
    await client.resources.create(resource2, { transaction });
    await transaction.commit();
} catch (error) {
    await transaction.rollback();
    throw error;
}
```

## See Also

- [Configuration API](./configuration.md) - API configuration management
- [Authentication API](./authentication.md) - User authentication
- [Resource Fetcher API](./resource-fetcher.md) - External resource fetching
- [Hybrid Recommender API](./hybrid-recommender.md) - Recommendation system
- [Architecture: Data Manager](../architecture/components/data-manager.md) - Component architecture
