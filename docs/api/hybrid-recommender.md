# Hybrid Recommender API

The Hybrid Recommender API provides intelligent content recommendation capabilities for the StudyAssistant system, combining multiple recommendation strategies to deliver personalized research suggestions.

## Overview

The Hybrid Recommender integrates multiple recommendation approaches:

- **Content-based filtering** using document embeddings and metadata
- **Collaborative filtering** based on user behavior patterns
- **Neural recommendations** with deep learning models
- **Context-aware suggestions** considering user research context
- **Real-time personalization** with adaptive learning

## Core Endpoints

### Recommendation Generation

#### Get Personalized Recommendations

```http
GET /api/recommendations?user_id={user_id}&limit=20&context=research
Authorization: Bearer {token}
```

**Query Parameters:**
- `user_id` (string, required): User identifier
- `limit` (integer): Maximum recommendations (default: 20, max: 100)
- `context` (string): Recommendation context (research, reading, discovery)
- `diversify` (boolean): Enable diversity in recommendations (default: true)
- `explain` (boolean): Include explanation for recommendations (default: false)

**Response:**
```json
{
    "recommendations": [
        {
            "resource_id": "res_123456789",
            "title": "Advanced Neural Networks in Natural Language Processing",
            "authors": ["Dr. Jane Smith", "Prof. John Doe"],
            "abstract": "This comprehensive study explores...",
            "score": 0.92,
            "confidence": 0.87,
            "recommendation_type": "content_based",
            "reasoning": [
                "Similar to your recent paper on transformers",
                "Matches your research interests in NLP",
                "Cited by papers you've bookmarked"
            ],
            "metadata": {
                "publication_date": "2024-01-15",
                "journal": "Nature Machine Intelligence",
                "citation_count": 156,
                "relevance_tags": ["neural networks", "NLP", "transformers"]
            }
        }
    ],
    "total_candidates": 1500,
    "recommendation_stats": {
        "content_based": 12,
        "collaborative": 5,
        "neural": 3,
        "hybrid": 0
    },
    "diversity_score": 0.78,
    "novelty_score": 0.85,
    "generated_at": "2024-01-15T10:30:00Z"
}
```

#### Get Similar Resources

```http
GET /api/recommendations/similar/{resource_id}?limit=10&threshold=0.7
Authorization: Bearer {token}
```

**Query Parameters:**
- `limit` (integer): Maximum similar resources (default: 10)
- `threshold` (float): Minimum similarity threshold (0.0-1.0)
- `method` (string): Similarity method (cosine, euclidean, jaccard)

**Response:**
```json
{
    "resource_id": "res_123456789",
    "similar_resources": [
        {
            "resource_id": "res_987654321",
            "title": "Transformer Architectures for Text Understanding",
            "similarity_score": 0.89,
            "similarity_type": "semantic",
            "common_keywords": ["transformers", "attention", "NLP"],
            "metadata": {
                "authors": ["Dr. Alice Brown"],
                "publication_date": "2023-12-01",
                "citation_count": 89
            }
        }
    ],
    "similarity_method": "cosine",
    "total_candidates": 5000,
    "computation_time": "45ms"
}
```

### User Preference Management

#### Get User Profile

```http
GET /api/recommendations/users/{user_id}/profile
Authorization: Bearer {token}
```

**Response:**
```json
{
    "user_id": "user_123456",
    "profile": {
        "research_interests": [
            {
                "topic": "Natural Language Processing",
                "weight": 0.85,
                "keywords": ["NLP", "transformers", "BERT", "GPT"],
                "last_updated": "2024-01-15T10:30:00Z"
            },
            {
                "topic": "Machine Learning",
                "weight": 0.72,
                "keywords": ["neural networks", "deep learning", "CNN"],
                "last_updated": "2024-01-10T15:20:00Z"
            }
        ],
        "preferred_sources": [
            {"source": "arxiv", "preference": 0.9},
            {"source": "pubmed", "preference": 0.3}
        ],
        "preferred_authors": [
            {"author": "Geoffrey Hinton", "preference": 0.95},
            {"author": "Yann LeCun", "preference": 0.88}
        ],
        "reading_patterns": {
            "avg_papers_per_week": 12,
            "preferred_length": "medium",
            "preferred_complexity": "advanced",
            "active_hours": ["09:00-12:00", "14:00-17:00"]
        },
        "interaction_history": {
            "total_interactions": 1547,
            "bookmarks": 234,
            "citations": 89,
            "downloads": 456,
            "ratings": 167
        }
    },
    "model_version": "v2.1.0",
    "last_updated": "2024-01-15T10:30:00Z"
}
```

#### Update User Preferences

```http
PUT /api/recommendations/users/{user_id}/preferences
Content-Type: application/json
Authorization: Bearer {token}

{
    "research_interests": [
        {
            "topic": "Computer Vision",
            "weight": 0.8,
            "keywords": ["CNN", "image processing", "object detection"]
        }
    ],
    "preferred_sources": [
        {"source": "ieee", "preference": 0.85}
    ],
    "content_preferences": {
        "min_citation_count": 10,
        "max_age_months": 24,
        "preferred_languages": ["en", "es"],
        "complexity_level": "intermediate"
    }
}
```

### Training and Feedback

#### Submit User Feedback

```http
POST /api/recommendations/feedback
Content-Type: application/json
Authorization: Bearer {token}

{
    "user_id": "user_123456",
    "resource_id": "res_123456789",
    "feedback_type": "rating",
    "value": 4.5,
    "context": "bookmark",
    "timestamp": "2024-01-15T10:30:00Z",
    "metadata": {
        "session_id": "session_789",
        "recommendation_id": "rec_456123",
        "interaction_time": 120
    }
}
```

**Feedback Types:**
- `rating`: Numerical rating (1-5)
- `bookmark`: Boolean bookmark action
- `citation`: Citation in user's work
- `download`: Download action
- `skip`: Explicitly skipped recommendation
- `negative`: Negative feedback (not interested)

#### Batch Feedback Submission

```http
POST /api/recommendations/feedback/batch
Content-Type: application/json
Authorization: Bearer {token}

{
    "feedback_items": [
        {
            "user_id": "user_123456",
            "resource_id": "res_123456789",
            "feedback_type": "rating",
            "value": 4.5,
            "timestamp": "2024-01-15T10:30:00Z"
        },
        {
            "user_id": "user_123456",
            "resource_id": "res_987654321",
            "feedback_type": "bookmark",
            "value": true,
            "timestamp": "2024-01-15T10:31:00Z"
        }
    ]
}
```

### Model Management

#### Get Model Status

```http
GET /api/recommendations/models/status
Authorization: Bearer {token}
```

**Response:**
```json
{
    "models": {
        "content_based": {
            "version": "v2.1.0",
            "status": "active",
            "accuracy": 0.87,
            "last_trained": "2024-01-10T08:00:00Z",
            "training_data_size": 150000,
            "features": {
                "embeddings": "sentence-transformers/all-MiniLM-L6-v2",
                "metadata_features": ["authors", "keywords", "journal"],
                "text_features": ["title", "abstract", "content"]
            }
        },
        "collaborative": {
            "version": "v1.5.0",
            "status": "active",
            "accuracy": 0.82,
            "last_trained": "2024-01-12T10:00:00Z",
            "training_data_size": 50000,
            "algorithm": "matrix_factorization",
            "parameters": {
                "factors": 128,
                "regularization": 0.01,
                "iterations": 100
            }
        },
        "neural": {
            "version": "v3.0.0",
            "status": "training",
            "progress": 0.65,
            "estimated_completion": "2024-01-16T12:00:00Z",
            "architecture": "transformer_based",
            "parameters": {
                "hidden_size": 768,
                "num_layers": 12,
                "attention_heads": 12
            }
        }
    },
    "ensemble": {
        "weights": {
            "content_based": 0.5,
            "collaborative": 0.3,
            "neural": 0.2
        },
        "performance_metrics": {
            "precision_at_10": 0.85,
            "recall_at_10": 0.72,
            "ndcg_at_10": 0.81,
            "diversity": 0.78
        }
    }
}
```

#### Trigger Model Retraining

```http
POST /api/recommendations/models/retrain
Content-Type: application/json
Authorization: Bearer {token}

{
    "model_type": "collaborative",
    "force_retrain": false,
    "training_config": {
        "factors": 256,
        "regularization": 0.005,
        "iterations": 150
    },
    "data_filters": {
        "min_interactions": 5,
        "date_range": {
            "start": "2023-01-01",
            "end": "2024-01-15"
        }
    }
}
```

### Analytics and Insights

#### Get Recommendation Analytics

```http
GET /api/recommendations/analytics?user_id={user_id}&date_range=30d
Authorization: Bearer {token}
```

**Query Parameters:**
- `user_id` (string): User identifier (optional, admin only for all users)
- `date_range` (string): Time range (7d, 30d, 90d, 1y)
- `granularity` (string): Data granularity (hour, day, week, month)

**Response:**
```json
{
    "period": {
        "start": "2023-12-16T00:00:00Z",
        "end": "2024-01-15T23:59:59Z",
        "granularity": "day"
    },
    "metrics": {
        "total_recommendations": 2340,
        "clicked_recommendations": 1456,
        "click_through_rate": 0.622,
        "avg_recommendation_score": 0.78,
        "diversity_score": 0.82,
        "novelty_score": 0.76
    },
    "performance_by_type": {
        "content_based": {
            "count": 1170,
            "ctr": 0.65,
            "avg_score": 0.81
        },
        "collaborative": {
            "count": 702,
            "ctr": 0.58,
            "avg_score": 0.74
        },
        "neural": {
            "count": 468,
            "ctr": 0.63,
            "avg_score": 0.79
        }
    },
    "trending_topics": [
        {
            "topic": "Large Language Models",
            "recommendation_count": 234,
            "engagement_rate": 0.78
        },
        {
            "topic": "Computer Vision",
            "recommendation_count": 189,
            "engagement_rate": 0.71
        }
    ],
    "time_series": [
        {
            "date": "2024-01-15",
            "recommendations": 78,
            "clicks": 49,
            "ctr": 0.628
        }
    ]
}
```

### A/B Testing

#### Create A/B Test

```http
POST /api/recommendations/ab-tests
Content-Type: application/json
Authorization: Bearer {token}

{
    "name": "Neural vs Content-Based Comparison",
    "description": "Compare neural recommendation model against content-based",
    "variants": [
        {
            "name": "control",
            "model_config": {
                "content_based": 0.7,
                "collaborative": 0.3,
                "neural": 0.0
            },
            "traffic_allocation": 0.5
        },
        {
            "name": "treatment",
            "model_config": {
                "content_based": 0.3,
                "collaborative": 0.2,
                "neural": 0.5
            },
            "traffic_allocation": 0.5
        }
    ],
    "success_metrics": ["ctr", "engagement_time", "bookmark_rate"],
    "duration_days": 14,
    "min_sample_size": 1000
}
```

**Response:**
```json
{
    "test_id": "ab_test_123",
    "status": "active",
    "start_date": "2024-01-15T10:30:00Z",
    "estimated_end_date": "2024-01-29T10:30:00Z",
    "current_participants": 0,
    "target_participants": 2000
}
```

#### Get A/B Test Results

```http
GET /api/recommendations/ab-tests/{test_id}/results
Authorization: Bearer {token}
```

**Response:**
```json
{
    "test_id": "ab_test_123",
    "status": "completed",
    "duration": "14 days",
    "participants": 2156,
    "results": {
        "control": {
            "participants": 1078,
            "metrics": {
                "ctr": 0.62,
                "engagement_time": 145.3,
                "bookmark_rate": 0.18
            }
        },
        "treatment": {
            "participants": 1078,
            "metrics": {
                "ctr": 0.68,
                "engagement_time": 167.8,
                "bookmark_rate": 0.22
            }
        }
    },
    "statistical_significance": {
        "ctr": {"p_value": 0.032, "significant": true},
        "engagement_time": {"p_value": 0.018, "significant": true},
        "bookmark_rate": {"p_value": 0.089, "significant": false}
    },
    "recommendation": "Deploy treatment variant - significant improvement in CTR and engagement"
}
```

## Configuration

### Model Configuration

```yaml
hybrid_recommender:
  models:
    content_based:
      embedding_model: "sentence-transformers/all-MiniLM-L6-v2"
      similarity_threshold: 0.7
      max_candidates: 1000
      features:
        - title
        - abstract
        - keywords
        - authors
        
    collaborative:
      algorithm: "matrix_factorization"
      factors: 128
      regularization: 0.01
      iterations: 100
      min_interactions: 5
      
    neural:
      architecture: "transformer"
      hidden_size: 768
      num_layers: 12
      attention_heads: 12
      dropout: 0.1
      learning_rate: 0.0001
      
  ensemble:
    default_weights:
      content_based: 0.5
      collaborative: 0.3
      neural: 0.2
    adaptive_weighting: true
    
  training:
    batch_size: 256
    epochs: 50
    validation_split: 0.2
    early_stopping_patience: 5
    
  performance:
    cache_recommendations: true
    cache_ttl: 3600
    max_concurrent_requests: 100
    timeout: 30
```

### Recommendation Settings

```yaml
hybrid_recommender:
  recommendations:
    default_limit: 20
    max_limit: 100
    diversification:
      enabled: true
      algorithm: "mmr"
      lambda: 0.5
      
    novelty:
      enabled: true
      decay_factor: 0.1
      time_window: "30d"
      
    personalization:
      min_interactions: 10
      profile_update_frequency: "24h"
      cold_start_strategy: "popular"
      
    filtering:
      min_quality_score: 0.6
      exclude_seen: true
      exclude_negative_feedback: true
      language_filtering: true
```

## Error Handling

### Common Error Codes

| Code | Description | Status |
|------|-------------|--------|
| `REC_001` | User profile not found | 404 |
| `REC_002` | Invalid recommendation parameters | 400 |
| `REC_003` | Model not available | 503 |
| `REC_004` | Insufficient training data | 422 |
| `REC_005` | Recommendation timeout | 408 |
| `REC_006` | A/B test not found | 404 |
| `REC_007` | Invalid feedback format | 400 |

### Error Response Format

```json
{
    "error": {
        "code": "REC_001",
        "message": "User profile not found",
        "details": {
            "user_id": "user_123456",
            "suggestion": "Initialize user profile with preferences"
        }
    }
}
```

## Rate Limiting

| Operation | Free Tier | Premium | Enterprise |
|-----------|-----------|---------|------------|
| Get recommendations | 100/hour | 1000/hour | 10000/hour |
| Submit feedback | 500/hour | 2000/hour | Unlimited |
| Analytics queries | 20/hour | 100/hour | 1000/hour |
| Model operations | 5/day | 50/day | 500/day |

## SDK Examples

### Python SDK

```python
from studyassistant.client import RecommenderClient

# Initialize client
client = RecommenderClient(
    base_url="https://api.studyassistant.com",
    api_key="your_api_key"
)

# Get personalized recommendations
recommendations = client.get_recommendations(
    user_id="user_123456",
    limit=20,
    context="research",
    diversify=True
)

# Submit feedback
client.submit_feedback(
    user_id="user_123456",
    resource_id="res_123456789",
    feedback_type="rating",
    value=4.5
)

# Update user preferences
client.update_preferences(
    user_id="user_123456",
    research_interests=[
        {
            "topic": "Computer Vision",
            "weight": 0.8,
            "keywords": ["CNN", "image processing"]
        }
    ]
)

# Get similar resources
similar = client.get_similar_resources(
    resource_id="res_123456789",
    limit=10,
    threshold=0.7
)
```

### JavaScript SDK

```javascript
import { RecommenderClient } from '@studyassistant/client';

const client = new RecommenderClient({
    baseUrl: 'https://api.studyassistant.com',
    apiKey: 'your_api_key'
});

// Get recommendations with explanation
const recommendations = await client.getRecommendations({
    userId: 'user_123456',
    limit: 20,
    context: 'research',
    explain: true
});

// Batch feedback submission
await client.submitBatchFeedback([
    {
        userId: 'user_123456',
        resourceId: 'res_123456789',
        feedbackType: 'rating',
        value: 4.5
    },
    {
        userId: 'user_123456',
        resourceId: 'res_987654321',
        feedbackType: 'bookmark',
        value: true
    }
]);

// Get recommendation analytics
const analytics = await client.getAnalytics({
    userId: 'user_123456',
    dateRange: '30d',
    granularity: 'day'
});
```

## Performance Optimization

### Best Practices

1. **Batch Operations**: Submit feedback in batches for better performance
2. **Caching**: Leverage recommendation caching for frequently accessed users
3. **Async Processing**: Use async endpoints for model training and updates
4. **Profile Optimization**: Keep user profiles updated for better recommendations
5. **A/B Testing**: Continuously test and optimize recommendation strategies

### Monitoring Metrics

- Recommendation latency
- Click-through rates
- Model accuracy metrics
- User engagement rates
- System resource usage

## See Also

- [Data Manager API](./data-manager.md) - Resource data management
- [LLM Interface API](./llm-interface.md) - Language model integration
- [Embeddings API](./embeddings.md) - Vector embeddings
- [Architecture: Hybrid Recommender](../architecture/components/hybrid-recommender.md) - Component architecture
