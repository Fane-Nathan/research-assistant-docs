# Embeddings API

The Embeddings API provides comprehensive vector embedding capabilities for the StudyAssistant system, enabling semantic search, similarity matching, and advanced NLP operations.

## Overview

The Embeddings API offers:

- **Multi-model support** for different embedding models and providers
- **Semantic search** with vector similarity matching
- **Batch processing** for efficient large-scale operations
- **Custom embeddings** for domain-specific content
- **Vector storage** with optimized indexing and retrieval
- **Similarity analytics** and clustering capabilities

## Core Endpoints

### Embedding Generation

#### Generate Text Embeddings

```http
POST /api/embeddings/text
Content-Type: application/json
Authorization: Bearer {token}

{
    "texts": [
        "Attention mechanisms in transformer models enable the model to focus on relevant parts of the input sequence.",
        "Neural networks have revolutionized natural language processing through deep learning architectures."
    ],
    "model": "sentence-transformers/all-MiniLM-L6-v2",
    "options": {
        "normalize": true,
        "batch_size": 32,
        "include_metadata": true
    }
}
```

**Response:**
```json
{
    "embeddings": [
        {
            "text": "Attention mechanisms in transformer models...",
            "embedding": [0.1234, -0.5678, 0.9012, ...],
            "dimension": 384,
            "model": "sentence-transformers/all-MiniLM-L6-v2",
            "metadata": {
                "text_length": 89,
                "token_count": 15,
                "language": "en",
                "processing_time": 0.045
            }
        },
        {
            "text": "Neural networks have revolutionized...",
            "embedding": [-0.2341, 0.6785, -0.1092, ...],
            "dimension": 384,
            "model": "sentence-transformers/all-MiniLM-L6-v2",
            "metadata": {
                "text_length": 95,
                "token_count": 16,
                "language": "en",
                "processing_time": 0.042
            }
        }
    ],
    "total_texts": 2,
    "total_processing_time": 0.087,
    "model_info": {
        "name": "sentence-transformers/all-MiniLM-L6-v2",
        "dimension": 384,
        "max_sequence_length": 512,
        "provider": "huggingface"
    }
}
```

#### Generate Document Embeddings

```http
POST /api/embeddings/documents
Content-Type: application/json
Authorization: Bearer {token}

{
    "documents": [
        {
            "id": "doc_123",
            "title": "Attention Is All You Need",
            "abstract": "The dominant sequence transduction models...",
            "content": "Full paper content...",
            "metadata": {
                "authors": ["Ashish Vaswani"],
                "year": 2017,
                "venue": "NIPS"
            }
        }
    ],
    "embedding_strategy": "hierarchical",
    "chunk_options": {
        "chunk_size": 512,
        "overlap": 50,
        "preserve_sentences": true
    },
    "model": "text-embedding-3-large"
}
```

**Response:**
```json
{
    "document_embeddings": [
        {
            "document_id": "doc_123",
            "embeddings": {
                "title": [0.1234, -0.5678, ...],
                "abstract": [-0.2341, 0.6785, ...],
                "content_chunks": [
                    {
                        "chunk_id": 0,
                        "text": "The dominant sequence transduction models...",
                        "embedding": [0.3456, -0.7890, ...],
                        "position": {"start": 0, "end": 512}
                    },
                    {
                        "chunk_id": 1,
                        "text": "In this work, we propose the Transformer...",
                        "embedding": [-0.4567, 0.8901, ...],
                        "position": {"start": 462, "end": 974}
                    }
                ],
                "document_summary": [0.5678, -0.9012, ...]
            },
            "metadata": {
                "total_chunks": 15,
                "avg_chunk_length": 498,
                "processing_time": 2.34,
                "model_used": "text-embedding-3-large"
            }
        }
    ],
    "summary": {
        "total_documents": 1,
        "total_chunks": 15,
        "total_processing_time": 2.34,
        "cost": 0.0156
    }
}
```

### Vector Search

#### Semantic Search

```http
POST /api/embeddings/search
Content-Type: application/json
Authorization: Bearer {token}

{
    "query": "transformer architecture attention mechanisms",
    "query_embedding": [0.1234, -0.5678, 0.9012, ...],
    "search_type": "semantic",
    "filters": {
        "document_types": ["research_paper", "review"],
        "date_range": {
            "start": "2020-01-01",
            "end": "2024-01-01"
        },
        "min_citation_count": 10
    },
    "options": {
        "limit": 20,
        "similarity_threshold": 0.7,
        "include_metadata": true,
        "rerank": true
    }
}
```

**Response:**
```json
{
    "results": [
        {
            "document_id": "doc_123",
            "title": "Attention Is All You Need",
            "similarity_score": 0.92,
            "match_type": "semantic",
            "matched_chunks": [
                {
                    "chunk_id": 2,
                    "text": "The Transformer model architecture is based entirely on attention mechanisms...",
                    "similarity_score": 0.94,
                    "highlighted_text": "The <mark>Transformer</mark> model <mark>architecture</mark> is based entirely on <mark>attention mechanisms</mark>..."
                }
            ],
            "metadata": {
                "authors": ["Ashish Vaswani", "Noam Shazeer"],
                "publication_date": "2017-06-12",
                "citation_count": 89234,
                "source": "arxiv"
            },
            "embedding_metadata": {
                "model_used": "text-embedding-3-large",
                "chunk_count": 15,
                "best_chunk_score": 0.94
            }
        }
    ],
    "search_metadata": {
        "total_candidates": 15420,
        "filtered_candidates": 8934,
        "results_returned": 20,
        "search_time": 0.125,
        "query_embedding_time": 0.045,
        "reranking_enabled": true,
        "reranking_time": 0.089
    },
    "facets": {
        "publication_years": [
            {"year": 2023, "count": 156},
            {"year": 2022, "count": 234}
        ],
        "venues": [
            {"venue": "NIPS", "count": 89},
            {"venue": "ICML", "count": 67}
        ]
    }
}
```

#### Similarity Search

```http
POST /api/embeddings/similarity
Content-Type: application/json
Authorization: Bearer {token}

{
    "reference_embedding": [0.1234, -0.5678, 0.9012, ...],
    "candidate_embeddings": [
        {
            "id": "emb_1",
            "embedding": [0.2345, -0.6789, 0.8123, ...]
        },
        {
            "id": "emb_2", 
            "embedding": [-0.3456, 0.7890, -0.9234, ...]
        }
    ],
    "similarity_metric": "cosine",
    "options": {
        "threshold": 0.5,
        "top_k": 10,
        "normalize": true
    }
}
```

**Response:**
```json
{
    "similarities": [
        {
            "id": "emb_1",
            "similarity_score": 0.87,
            "distance": 0.13,
            "rank": 1
        },
        {
            "id": "emb_2",
            "similarity_score": 0.72,
            "distance": 0.28,
            "rank": 2
        }
    ],
    "metadata": {
        "similarity_metric": "cosine",
        "reference_dimension": 1536,
        "candidates_processed": 2,
        "results_above_threshold": 2,
        "computation_time": 0.003
    }
}
```

### Clustering and Analysis

#### Perform Clustering

```http
POST /api/embeddings/cluster
Content-Type: application/json
Authorization: Bearer {token}

{
    "embeddings": [
        {"id": "doc_1", "embedding": [0.1, 0.2, ...]},
        {"id": "doc_2", "embedding": [0.3, 0.4, ...]},
        {"id": "doc_3", "embedding": [0.5, 0.6, ...]}
    ],
    "algorithm": "kmeans",
    "parameters": {
        "n_clusters": 5,
        "random_state": 42,
        "max_iterations": 300
    },
    "options": {
        "include_centroids": true,
        "include_metrics": true,
        "reduce_dimensions": true,
        "target_dimensions": 2
    }
}
```

**Response:**
```json
{
    "clusters": [
        {
            "cluster_id": 0,
            "centroid": [0.234, -0.567, 0.890, ...],
            "members": [
                {
                    "id": "doc_1",
                    "distance_to_centroid": 0.123,
                    "confidence": 0.89
                },
                {
                    "id": "doc_3", 
                    "distance_to_centroid": 0.156,
                    "confidence": 0.82
                }
            ],
            "size": 2,
            "cohesion": 0.85,
            "topics": ["machine learning", "neural networks"]
        },
        {
            "cluster_id": 1,
            "centroid": [-0.345, 0.678, -0.901, ...],
            "members": [
                {
                    "id": "doc_2",
                    "distance_to_centroid": 0.089,
                    "confidence": 0.94
                }
            ],
            "size": 1,
            "cohesion": 1.0,
            "topics": ["natural language processing"]
        }
    ],
    "metrics": {
        "silhouette_score": 0.76,
        "calinski_harabasz_score": 234.56,
        "davies_bouldin_score": 0.43,
        "inertia": 45.67
    },
    "dimensionality_reduction": {
        "method": "umap",
        "original_dimensions": 1536,
        "reduced_dimensions": 2,
        "explained_variance": 0.78,
        "coordinates": [
            {"id": "doc_1", "x": 1.23, "y": -0.45},
            {"id": "doc_2", "x": -2.34, "y": 1.67},
            {"id": "doc_3", "x": 0.89, "y": -0.12}
        ]
    }
}
```

#### Topic Analysis

```http
POST /api/embeddings/topics
Content-Type: application/json
Authorization: Bearer {token}

{
    "document_embeddings": [
        {"id": "doc_1", "embedding": [...], "text": "Attention mechanisms..."},
        {"id": "doc_2", "embedding": [...], "text": "Convolutional neural networks..."}
    ],
    "analysis_type": "topic_modeling",
    "parameters": {
        "num_topics": 10,
        "min_topic_size": 3,
        "diversity": 0.5
    },
    "include_keywords": true,
    "include_representative_docs": true
}
```

**Response:**
```json
{
    "topics": [
        {
            "topic_id": 0,
            "label": "Transformer Architectures",
            "size": 45,
            "coherence_score": 0.87,
            "keywords": [
                {"word": "attention", "weight": 0.234},
                {"word": "transformer", "weight": 0.189},
                {"word": "self-attention", "weight": 0.156},
                {"word": "encoder", "weight": 0.134},
                {"word": "decoder", "weight": 0.121}
            ],
            "representative_documents": [
                {
                    "id": "doc_1",
                    "title": "Attention Is All You Need",
                    "relevance_score": 0.94
                }
            ],
            "centroid_embedding": [0.123, -0.456, ...]
        }
    ],
    "topic_hierarchy": {
        "root_topics": [0, 1, 2],
        "parent_child_relationships": [
            {"parent": 0, "children": [3, 4]},
            {"parent": 1, "children": [5, 6]}
        ]
    },
    "visualization_data": {
        "tsne_coordinates": [
            {"topic_id": 0, "x": 1.23, "y": -0.45},
            {"topic_id": 1, "x": -2.34, "y": 1.67}
        ],
        "topic_distances": [
            {"topic1": 0, "topic2": 1, "distance": 0.67}
        ]
    }
}
```

### Model Management

#### List Available Models

```http
GET /api/embeddings/models
Authorization: Bearer {token}
```

**Response:**
```json
{
    "models": [
        {
            "id": "text-embedding-3-large",
            "name": "OpenAI Text Embedding 3 Large",
            "provider": "openai",
            "dimension": 3072,
            "max_input_tokens": 8191,
            "cost_per_1k_tokens": 0.00013,
            "performance": {
                "mteb_score": 64.6,
                "retrieval_accuracy": 0.89,
                "classification_accuracy": 0.92
            },
            "languages": ["en", "es", "fr", "de", "it", "pt", "ru", "ja", "ko", "zh"],
            "use_cases": ["semantic_search", "classification", "clustering"],
            "status": "available"
        },
        {
            "id": "sentence-transformers/all-MiniLM-L6-v2",
            "name": "All MiniLM L6 v2",
            "provider": "huggingface",
            "dimension": 384,
            "max_input_tokens": 512,
            "cost_per_1k_tokens": 0.0,
            "performance": {
                "mteb_score": 56.3,
                "retrieval_accuracy": 0.81,
                "classification_accuracy": 0.84
            },
            "languages": ["en"],
            "use_cases": ["semantic_search", "clustering", "paraphrase_detection"],
            "status": "available"
        }
    ],
    "providers": [
        {
            "name": "openai",
            "status": "healthy",
            "models_available": 3,
            "avg_latency": "120ms"
        },
        {
            "name": "huggingface",
            "status": "healthy", 
            "models_available": 15,
            "avg_latency": "45ms"
        }
    ]
}
```

#### Compare Models

```http
POST /api/embeddings/models/compare
Content-Type: application/json
Authorization: Bearer {token}

{
    "models": [
        "text-embedding-3-large",
        "sentence-transformers/all-MiniLM-L6-v2"
    ],
    "test_queries": [
        "attention mechanisms in transformers",
        "neural network architectures",
        "natural language processing techniques"
    ],
    "evaluation_metrics": [
        "retrieval_accuracy",
        "semantic_similarity",
        "speed",
        "cost_efficiency"
    ]
}
```

### Storage and Indexing

#### Store Embeddings

```http
POST /api/embeddings/store
Content-Type: application/json
Authorization: Bearer {token}

{
    "embeddings": [
        {
            "id": "emb_123",
            "embedding": [0.1234, -0.5678, ...],
            "metadata": {
                "document_id": "doc_123",
                "chunk_id": 0,
                "text": "Attention mechanisms enable...",
                "model": "text-embedding-3-large",
                "created_at": "2024-01-15T10:30:00Z"
            }
        }
    ],
    "index_name": "research_papers",
    "options": {
        "create_index_if_not_exists": true,
        "batch_size": 1000,
        "update_existing": false
    }
}
```

**Response:**
```json
{
    "stored_count": 1,
    "skipped_count": 0,
    "failed_count": 0,
    "index_info": {
        "name": "research_papers",
        "total_vectors": 156789,
        "dimension": 3072,
        "index_type": "hnsw",
        "distance_metric": "cosine"
    },
    "performance": {
        "storage_time": 0.234,
        "indexing_time": 0.156,
        "total_time": 0.390
    }
}
```

#### Query Vector Index

```http
POST /api/embeddings/index/{index_name}/query
Content-Type: application/json
Authorization: Bearer {token}

{
    "query_vector": [0.1234, -0.5678, 0.9012, ...],
    "top_k": 20,
    "filters": {
        "metadata.document_type": "research_paper",
        "metadata.publication_year": {"gte": 2020}
    },
    "options": {
        "include_metadata": true,
        "include_vectors": false,
        "ef": 128
    }
}
```

**Response:**
```json
{
    "results": [
        {
            "id": "emb_123",
            "score": 0.92,
            "metadata": {
                "document_id": "doc_123",
                "chunk_id": 0,
                "text": "Attention mechanisms enable...",
                "document_type": "research_paper",
                "publication_year": 2023
            }
        }
    ],
    "query_metadata": {
        "candidates_examined": 1000,
        "query_time": 0.045,
        "index_name": "research_papers",
        "total_vectors_in_index": 156789
    }
}
```

## Configuration

### Model Configuration

```yaml
embeddings:
  models:
    default_model: "text-embedding-3-large"
    fallback_model: "sentence-transformers/all-MiniLM-L6-v2"
    
    providers:
      openai:
        api_key: ${OPENAI_API_KEY}
        base_url: "https://api.openai.com/v1"
        timeout: 60
        max_retries: 3
        
      huggingface:
        api_key: ${HUGGINGFACE_API_KEY}
        cache_dir: "/cache/huggingface"
        device: "cuda"
        
  processing:
    batch_size: 32
    max_text_length: 8192
    normalize_embeddings: true
    
  storage:
    backend: "weaviate"
    connection:
      host: "localhost"
      port: 8080
      auth_key: ${WEAVIATE_API_KEY}
      
    indexing:
      distance_metric: "cosine"
      ef_construction: 200
      max_connections: 64
      
  performance:
    cache_embeddings: true
    cache_ttl: 86400
    parallel_processing: true
    max_workers: 8
```

### Search Configuration

```yaml
embeddings:
  search:
    default_similarity_threshold: 0.7
    max_results: 1000
    default_limit: 20
    
    reranking:
      enabled: true
      model: "cross-encoder/ms-marco-MiniLM-L-6-v2"
      top_k_for_reranking: 100
      
    clustering:
      default_algorithm: "kmeans"
      max_clusters: 50
      min_cluster_size: 3
      
    topic_modeling:
      algorithm: "bertopic"
      min_topic_size: 5
      diversity: 0.5
      top_k_words: 10
```

## Error Handling

### Common Error Codes

| Code | Description | Status |
|------|-------------|--------|
| `EMB_001` | Model not available | 503 |
| `EMB_002` | Text too long for model | 413 |
| `EMB_003` | Invalid embedding dimension | 400 |
| `EMB_004` | Index not found | 404 |
| `EMB_005` | Similarity threshold invalid | 400 |
| `EMB_006` | Clustering failed | 500 |
| `EMB_007` | Storage backend error | 502 |

### Error Response Format

```json
{
    "error": {
        "code": "EMB_002",
        "message": "Text too long for model",
        "details": {
            "text_length": 10240,
            "max_length": 8192,
            "model": "text-embedding-3-large"
        },
        "suggestions": [
            "Split text into smaller chunks",
            "Use a model with larger context window"
        ]
    }
}
```

## Rate Limiting

| Operation | Free Tier | Premium | Enterprise |
|-----------|-----------|---------|------------|
| Text embeddings | 1000/hour | 10000/hour | 100000/hour |
| Document embeddings | 100/hour | 1000/hour | 10000/hour |
| Vector search | 2000/hour | 20000/hour | Unlimited |
| Clustering operations | 10/hour | 100/hour | 1000/hour |

## SDK Examples

### Python SDK

```python
from studyassistant.client import EmbeddingsClient

# Initialize client
client = EmbeddingsClient(
    base_url="https://api.studyassistant.com",
    api_key="your_api_key"
)

# Generate embeddings
embeddings = client.embed_texts([
    "Attention mechanisms in transformers",
    "Neural network architectures"
], model="text-embedding-3-large")

# Semantic search
results = client.search(
    query="transformer attention",
    limit=20,
    similarity_threshold=0.7,
    filters={"publication_year": {"gte": 2020}}
)

# Document embeddings
doc_embeddings = client.embed_documents([
    {
        "id": "doc_1",
        "title": "Paper Title",
        "content": "Full paper content..."
    }
], embedding_strategy="hierarchical")

# Clustering
clusters = client.cluster(
    embeddings=embeddings,
    algorithm="kmeans",
    n_clusters=5
)

# Store embeddings
client.store_embeddings(
    embeddings=embeddings,
    index_name="research_papers"
)
```

### JavaScript SDK

```javascript
import { EmbeddingsClient } from '@studyassistant/client';

const client = new EmbeddingsClient({
    baseUrl: 'https://api.studyassistant.com',
    apiKey: 'your_api_key'
});

// Generate embeddings
const embeddings = await client.embedTexts([
    'Attention mechanisms in transformers',
    'Neural network architectures'
], {
    model: 'text-embedding-3-large',
    normalize: true
});

// Similarity search
const similar = await client.findSimilar({
    referenceEmbedding: embeddings[0].embedding,
    candidates: otherEmbeddings,
    topK: 10,
    threshold: 0.7
});

// Topic analysis
const topics = await client.analyzeTopics({
    documentEmbeddings: docEmbeddings,
    numTopics: 10,
    includeKeywords: true
});

// Vector search
const searchResults = await client.vectorSearch({
    indexName: 'research_papers',
    queryVector: queryEmbedding,
    topK: 20,
    filters: { documentType: 'research_paper' }
});
```

## Performance Optimization

### Best Practices

1. **Batch Processing**: Process multiple texts in single requests
2. **Model Selection**: Choose appropriate models for your use case
3. **Caching**: Cache frequently used embeddings
4. **Chunking**: Split long documents into appropriate chunks
5. **Indexing**: Use optimized vector indices for search

### Monitoring Metrics

- Embedding generation latency
- Search query performance
- Index build times
- Storage utilization
- Model accuracy metrics

## See Also

- [Data Manager API](./data-manager.md) - Document storage and retrieval
- [LLM Interface API](./llm-interface.md) - Language model integration
- [Hybrid Recommender API](./hybrid-recommender.md) - Recommendation system
- [Architecture: Text Processing](../architecture/components/text-processing.md) - NLP pipeline architecture
