# LLM Providers API Integration

The LLM Providers API integration manages connections to multiple large language model providers, offering unified access, intelligent routing, and cost optimization across different AI services.

## Overview

The LLM Providers integration supports:

- **Multi-provider support** (OpenAI, Anthropic, Google, Azure, AWS, local models)
- **Intelligent routing** based on cost, performance, and availability
- **Unified API** with consistent interfaces across providers
- **Cost optimization** with automatic model selection
- **Failover handling** with provider redundancy
- **Usage analytics** and cost tracking

## Supported Providers

### OpenAI

#### Configuration

```http
POST /api/external/llm-providers/openai/configure
Content-Type: application/json
Authorization: Bearer {token}

{
    "api_key": "${OPENAI_API_KEY}",
    "organization": "org-your-org-id",
    "base_url": "https://api.openai.com/v1",
    "timeout": 60,
    "max_retries": 3,
    "models": {
        "enabled": ["gpt-4-turbo", "gpt-4", "gpt-3.5-turbo"],
        "default": "gpt-4-turbo",
        "cost_preferences": {
            "budget_mode": "gpt-3.5-turbo",
            "balanced_mode": "gpt-4-turbo", 
            "performance_mode": "gpt-4"
        }
    },
    "rate_limiting": {
        "requests_per_minute": 3500,
        "tokens_per_minute": 350000
    }
}
```

#### Available Models

```http
GET /api/external/llm-providers/openai/models
Authorization: Bearer {token}
```

**Response:**
```json
{
    "models": [
        {
            "id": "gpt-4-turbo",
            "name": "GPT-4 Turbo",
            "type": "chat",
            "context_length": 128000,
            "max_output_tokens": 4096,
            "training_data_cutoff": "2024-04-01",
            "pricing": {
                "input_tokens": 0.01,
                "output_tokens": 0.03,
                "currency": "USD",
                "per_tokens": 1000
            },
            "capabilities": [
                "text_generation",
                "code_generation", 
                "function_calling",
                "json_mode",
                "vision"
            ],
            "status": "available",
            "performance": {
                "avg_latency": 2.1,
                "throughput": "high",
                "reliability": 0.998
            }
        },
        {
            "id": "gpt-3.5-turbo",
            "name": "GPT-3.5 Turbo",
            "type": "chat",
            "context_length": 16385,
            "max_output_tokens": 4096,
            "training_data_cutoff": "2021-09-01",
            "pricing": {
                "input_tokens": 0.0005,
                "output_tokens": 0.0015,
                "currency": "USD",
                "per_tokens": 1000
            },
            "capabilities": [
                "text_generation",
                "code_generation",
                "function_calling"
            ],
            "status": "available",
            "performance": {
                "avg_latency": 1.2,
                "throughput": "very_high",
                "reliability": 0.999
            }
        }
    ],
    "provider_status": {
        "name": "openai",
        "status": "healthy",
        "last_check": "2024-01-15T10:30:00Z",
        "uptime": 0.999,
        "current_latency": 1.8
    }
}
```

### Anthropic

#### Configuration

```http
POST /api/external/llm-providers/anthropic/configure
Content-Type: application/json
Authorization: Bearer {token}

{
    "api_key": "${ANTHROPIC_API_KEY}",
    "base_url": "https://api.anthropic.com",
    "timeout": 90,
    "max_retries": 3,
    "models": {
        "enabled": ["claude-3-opus", "claude-3-sonnet", "claude-3-haiku"],
        "default": "claude-3-sonnet",
        "specialized_use_cases": {
            "analysis": "claude-3-opus",
            "creative_writing": "claude-3-opus",
            "code_generation": "claude-3-sonnet",
            "quick_responses": "claude-3-haiku"
        }
    },
    "safety_settings": {
        "content_filtering": true,
        "jailbreak_detection": true,
        "constitutional_ai": true
    }
}
```

#### Available Models

```http
GET /api/external/llm-providers/anthropic/models
Authorization: Bearer {token}
```

**Response:**
```json
{
    "models": [
        {
            "id": "claude-3-opus",
            "name": "Claude 3 Opus",
            "type": "chat",
            "context_length": 200000,
            "max_output_tokens": 4096,
            "training_data_cutoff": "2023-08-01",
            "pricing": {
                "input_tokens": 0.015,
                "output_tokens": 0.075,
                "currency": "USD",
                "per_tokens": 1000
            },
            "capabilities": [
                "text_generation",
                "analysis",
                "reasoning",
                "creative_writing",
                "code_generation"
            ],
            "strengths": [
                "complex_reasoning",
                "nuanced_analysis",
                "creative_tasks",
                "long_context"
            ],
            "status": "available",
            "performance": {
                "avg_latency": 3.2,
                "throughput": "medium",
                "reliability": 0.997
            }
        },
        {
            "id": "claude-3-haiku",
            "name": "Claude 3 Haiku",
            "type": "chat",
            "context_length": 200000,
            "max_output_tokens": 4096,
            "training_data_cutoff": "2023-08-01",
            "pricing": {
                "input_tokens": 0.00025,
                "output_tokens": 0.00125,
                "currency": "USD",
                "per_tokens": 1000
            },
            "capabilities": [
                "text_generation",
                "quick_responses",
                "simple_tasks"
            ],
            "strengths": [
                "speed",
                "cost_efficiency",
                "simple_reasoning"
            ],
            "status": "available",
            "performance": {
                "avg_latency": 0.8,
                "throughput": "very_high",
                "reliability": 0.999
            }
        }
    ]
}
```

### Google (Gemini)

#### Configuration

```http
POST /api/external/llm-providers/google/configure
Content-Type: application/json
Authorization: Bearer {token}

{
    "api_key": "${GOOGLE_API_KEY}",
    "project_id": "your-project-id",
    "base_url": "https://generativelanguage.googleapis.com/v1",
    "models": {
        "enabled": ["gemini-1.5-pro", "gemini-1.5-flash"],
        "default": "gemini-1.5-pro",
        "multimodal": {
            "text_and_image": "gemini-1.5-pro",
            "text_only": "gemini-1.5-flash"
        }
    },
    "safety_settings": {
        "harassment": "BLOCK_MEDIUM_AND_ABOVE",
        "hate_speech": "BLOCK_MEDIUM_AND_ABOVE",
        "sexually_explicit": "BLOCK_MEDIUM_AND_ABOVE",
        "dangerous_content": "BLOCK_MEDIUM_AND_ABOVE"
    }
}
```

### Azure OpenAI

#### Configuration

```http
POST /api/external/llm-providers/azure/configure
Content-Type: application/json
Authorization: Bearer {token}

{
    "api_key": "${AZURE_OPENAI_API_KEY}",
    "endpoint": "${AZURE_OPENAI_ENDPOINT}",
    "api_version": "2024-02-15-preview",
    "deployments": [
        {
            "deployment_name": "gpt-4-turbo-deployment",
            "model": "gpt-4-turbo",
            "version": "turbo-2024-04-09",
            "capacity": 120,
            "region": "East US"
        },
        {
            "deployment_name": "gpt-35-turbo-deployment", 
            "model": "gpt-35-turbo",
            "version": "0125",
            "capacity": 240,
            "region": "East US"
        }
    ],
    "content_filtering": {
        "enabled": true,
        "categories": ["hate", "sexual", "violence", "self_harm"],
        "threshold": "medium"
    }
}
```

## Unified Generation API

### Generate Text

```http
POST /api/external/llm-providers/generate
Content-Type: application/json
Authorization: Bearer {token}

{
    "prompt": "Explain the concept of attention mechanisms in transformer models",
    "messages": [
        {
            "role": "system",
            "content": "You are a helpful AI research assistant."
        },
        {
            "role": "user",
            "content": "I need help understanding transformer architectures"
        }
    ],
    "model_selection": {
        "strategy": "auto",
        "providers": ["openai", "anthropic", "google"],
        "criteria": {
            "cost": 0.3,
            "speed": 0.4,
            "quality": 0.3
        },
        "fallback": true
    },
    "parameters": {
        "temperature": 0.7,
        "max_tokens": 2000,
        "top_p": 0.9,
        "frequency_penalty": 0.1
    },
    "options": {
        "stream": false,
        "include_usage": true,
        "include_provider_info": true
    }
}
```

**Response:**
```json
{
    "id": "gen_unified_123456",
    "response": "# Attention Mechanisms in Transformer Models\n\nAttention mechanisms are a fundamental component of transformer models...",
    "provider": "openai",
    "model": "gpt-4-turbo",
    "selection_reason": "Best balance of quality and cost for this query",
    "usage": {
        "prompt_tokens": 145,
        "completion_tokens": 892,
        "total_tokens": 1037
    },
    "cost": {
        "amount": 0.0481,
        "currency": "USD",
        "breakdown": {
            "input_cost": 0.00145,
            "output_cost": 0.02676
        }
    },
    "performance": {
        "response_time": 2.34,
        "provider_latency": 2.12,
        "processing_time": 0.22
    },
    "metadata": {
        "provider_status": "healthy",
        "fallback_used": false,
        "model_version": "gpt-4-turbo-2024-04-09",
        "content_filtered": false
    },
    "created_at": "2024-01-15T10:30:00Z"
}
```

### Model Selection Strategies

#### Automatic Selection

```http
POST /api/external/llm-providers/select-model
Content-Type: application/json
Authorization: Bearer {token}

{
    "task_type": "research_summary",
    "content_length": "long",
    "quality_requirements": "high",
    "budget_constraints": {
        "max_cost_per_request": 0.50,
        "daily_budget": 100.00
    },
    "performance_requirements": {
        "max_latency": 5.0,
        "min_throughput": "medium"
    },
    "provider_preferences": {
        "allowed": ["openai", "anthropic", "google"],
        "excluded": ["azure"]
    }
}
```

**Response:**
```json
{
    "recommended_model": {
        "provider": "anthropic",
        "model": "claude-3-sonnet",
        "reason": "Best balance of quality and cost for research tasks",
        "confidence": 0.87,
        "estimated_cost": 0.34,
        "estimated_latency": 2.8
    },
    "alternatives": [
        {
            "provider": "openai",
            "model": "gpt-4-turbo",
            "reason": "Higher quality but more expensive",
            "estimated_cost": 0.48,
            "estimated_latency": 2.1
        }
    ],
    "selection_factors": {
        "cost_weight": 0.4,
        "quality_weight": 0.4,
        "speed_weight": 0.2
    }
}
```

## Provider Management

### Health Monitoring

```http
GET /api/external/llm-providers/health
Authorization: Bearer {token}
```

**Response:**
```json
{
    "overall_status": "healthy",
    "providers": [
        {
            "name": "openai",
            "status": "healthy",
            "uptime": 0.999,
            "avg_latency": 2.1,
            "error_rate": 0.001,
            "rate_limit_status": {
                "requests_remaining": 2847,
                "tokens_remaining": 285647,
                "reset_time": "2024-01-15T11:00:00Z"
            },
            "last_check": "2024-01-15T10:30:00Z"
        },
        {
            "name": "anthropic",
            "status": "degraded",
            "uptime": 0.987,
            "avg_latency": 4.5,
            "error_rate": 0.013,
            "issues": ["Higher than normal latency"],
            "last_check": "2024-01-15T10:30:00Z"
        },
        {
            "name": "google",
            "status": "maintenance",
            "uptime": 0.950,
            "maintenance_window": {
                "start": "2024-01-15T10:00:00Z",
                "end": "2024-01-15T12:00:00Z",
                "description": "Scheduled maintenance"
            },
            "last_check": "2024-01-15T10:30:00Z"
        }
    ],
    "failover_status": {
        "enabled": true,
        "fallback_order": ["openai", "anthropic", "google"],
        "current_primary": "openai"
    }
}
```

### Usage Analytics

```http
GET /api/external/llm-providers/analytics?period=30d&group_by=provider
Authorization: Bearer {token}
```

**Response:**
```json
{
    "period": {
        "start": "2023-12-16T00:00:00Z",
        "end": "2024-01-15T00:00:00Z"
    },
    "summary": {
        "total_requests": 45230,
        "total_tokens": 8542670,
        "total_cost": 1247.89,
        "avg_cost_per_request": 0.0276,
        "avg_latency": 2.34
    },
    "by_provider": [
        {
            "provider": "openai",
            "requests": 25430,
            "tokens": 5234560,
            "cost": 782.45,
            "percentage": 62.7,
            "avg_latency": 2.1,
            "error_rate": 0.002,
            "models_used": {
                "gpt-4-turbo": {"requests": 15430, "cost": 567.23},
                "gpt-3.5-turbo": {"requests": 10000, "cost": 215.22}
            }
        },
        {
            "provider": "anthropic",
            "requests": 12800,
            "tokens": 2156780,
            "cost": 323.51,
            "percentage": 25.9,
            "avg_latency": 3.2,
            "error_rate": 0.005,
            "models_used": {
                "claude-3-opus": {"requests": 4800, "cost": 234.56},
                "claude-3-sonnet": {"requests": 8000, "cost": 88.95}
            }
        }
    ],
    "cost_trends": {
        "daily_costs": [
            {"date": "2024-01-15", "cost": 45.67},
            {"date": "2024-01-14", "cost": 52.34}
        ],
        "projected_monthly": 1456.78
    },
    "performance_trends": {
        "latency_over_time": [
            {"date": "2024-01-15", "avg_latency": 2.34},
            {"date": "2024-01-14", "avg_latency": 2.12}
        ],
        "error_rates": [
            {"date": "2024-01-15", "error_rate": 0.003},
            {"date": "2024-01-14", "error_rate": 0.002}
        ]
    }
}
```

### Cost Optimization

#### Set Budget Limits

```http
POST /api/external/llm-providers/budgets
Content-Type: application/json
Authorization: Bearer {token}

{
    "global_limits": {
        "daily_limit": 200.00,
        "monthly_limit": 5000.00,
        "per_request_limit": 10.00
    },
    "provider_limits": {
        "openai": {"daily": 120.00, "monthly": 3000.00},
        "anthropic": {"daily": 80.00, "monthly": 2000.00}
    },
    "model_limits": {
        "gpt-4": {"daily": 50.00},
        "claude-3-opus": {"daily": 40.00}
    },
    "alerts": {
        "threshold_percentages": [75, 90, 95],
        "notification_channels": ["email", "webhook"],
        "webhook_url": "https://your-app.com/webhooks/budget"
    },
    "auto_throttling": {
        "enabled": true,
        "fallback_to_cheaper_models": true,
        "pause_at_limit": false
    }
}
```

#### Get Cost Recommendations

```http
GET /api/external/llm-providers/cost-recommendations
Authorization: Bearer {token}
```

**Response:**
```json
{
    "recommendations": [
        {
            "type": "model_substitution",
            "description": "Use GPT-3.5 Turbo for simple tasks instead of GPT-4",
            "potential_savings": 156.78,
            "confidence": 0.89,
            "impact": "minimal",
            "implementation": {
                "suggested_rules": [
                    {
                        "condition": "prompt_length < 100 AND complexity_score < 0.3",
                        "action": "use_model",
                        "model": "gpt-3.5-turbo"
                    }
                ]
            }
        },
        {
            "type": "provider_switching",
            "description": "Use Claude 3 Haiku for quick responses",
            "potential_savings": 89.45,
            "confidence": 0.76,
            "impact": "low",
            "implementation": {
                "suggested_rules": [
                    {
                        "condition": "response_length < 500 AND latency_requirement > 3s",
                        "action": "use_provider",
                        "provider": "anthropic",
                        "model": "claude-3-haiku"
                    }
                ]
            }
        }
    ],
    "current_spending_analysis": {
        "monthly_cost": 1247.89,
        "cost_per_request": 0.0276,
        "most_expensive_operations": [
            {"operation": "research_summary", "cost": 456.78},
            {"operation": "literature_review", "cost": 234.56}
        ]
    },
    "optimization_potential": {
        "total_savings": 246.23,
        "percentage_reduction": 19.7,
        "payback_period": "immediate"
    }
}
```

## Advanced Features

### Function Calling

```http
POST /api/external/llm-providers/generate/function-calling
Content-Type: application/json
Authorization: Bearer {token}

{
    "messages": [
        {
            "role": "user",
            "content": "Search for recent papers on transformer architectures and summarize the key findings"
        }
    ],
    "functions": [
        {
            "name": "search_papers",
            "description": "Search for academic papers",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {"type": "string"},
                    "date_range": {"type": "string"},
                    "max_results": {"type": "integer"}
                },
                "required": ["query"]
            }
        },
        {
            "name": "summarize_papers",
            "description": "Generate summary of papers",
            "parameters": {
                "type": "object",
                "properties": {
                    "papers": {"type": "array"},
                    "focus_areas": {"type": "array"}
                },
                "required": ["papers"]
            }
        }
    ],
    "function_call": "auto",
    "model_selection": {
        "providers": ["openai", "google"],
        "require_function_calling": true
    }
}
```

### Streaming Responses

```http
POST /api/external/llm-providers/generate/stream
Content-Type: application/json
Authorization: Bearer {token}

{
    "messages": [...],
    "model_selection": {"strategy": "fastest"},
    "stream": true,
    "stream_options": {
        "chunk_size": 50,
        "include_usage": true
    }
}
```

**Streaming Response (Server-Sent Events):**
```
data: {"id": "stream_123", "provider": "openai", "model": "gpt-4-turbo", "type": "start"}

data: {"id": "stream_123", "chunk": "Transformer architectures have revolutionized", "type": "content"}

data: {"id": "stream_123", "chunk": " the field of natural language processing", "type": "content"}

data: {"id": "stream_123", "usage": {"tokens": 245}, "cost": 0.0234, "type": "usage"}

data: {"id": "stream_123", "type": "done"}
```

## Configuration

### Global Configuration

```yaml
external_apis:
  llm_providers:
    default_strategy: "cost_balanced"
    failover_enabled: true
    max_retries: 3
    timeout: 60
    
    cost_management:
      daily_budget: 500.00
      monthly_budget: 10000.00
      auto_optimization: true
      
    performance:
      cache_responses: true
      cache_ttl: 3600
      parallel_requests: false
      
    providers:
      openai:
        enabled: true
        priority: 1
        api_key: ${OPENAI_API_KEY}
        
      anthropic:
        enabled: true
        priority: 2
        api_key: ${ANTHROPIC_API_KEY}
        
      google:
        enabled: true
        priority: 3
        api_key: ${GOOGLE_API_KEY}
```

### Model Selection Rules

```yaml
external_apis:
  llm_providers:
    selection_rules:
      - name: "budget_mode"
        conditions:
          - cost_limit: 0.01
        action:
          provider: "openai"
          model: "gpt-3.5-turbo"
          
      - name: "research_tasks"
        conditions:
          - task_type: "research_summary"
          - quality_requirement: "high"
        action:
          provider: "anthropic"
          model: "claude-3-opus"
          
      - name: "quick_responses"
        conditions:
          - latency_requirement: "<2s"
        action:
          provider: "anthropic"
          model: "claude-3-haiku"
```

## Error Handling

### Common Error Codes

| Code | Description | Status |
|------|-------------|--------|
| `LLM_PROV_001` | Provider not configured | 400 |
| `LLM_PROV_002` | All providers unavailable | 503 |
| `LLM_PROV_003` | Rate limit exceeded | 429 |
| `LLM_PROV_004` | Model not supported | 400 |
| `LLM_PROV_005` | Budget limit exceeded | 402 |
| `LLM_PROV_006` | Content filtering triggered | 422 |
| `LLM_PROV_007` | Provider API error | 502 |

## SDK Examples

### Python SDK

```python
from studyassistant.client import LLMProvidersClient

# Initialize client
client = LLMProvidersClient(
    base_url="https://api.studyassistant.com",
    api_key="your_api_key"
)

# Generate with automatic provider selection
response = client.generate(
    prompt="Explain transformer architectures",
    strategy="cost_balanced",
    providers=["openai", "anthropic"],
    max_cost=0.50
)

# Configure provider
client.configure_provider("openai", {
    "api_key": "your_openai_key",
    "models": ["gpt-4-turbo", "gpt-3.5-turbo"]
})

# Get provider analytics
analytics = client.get_analytics(
    period="30d",
    group_by="provider"
)

# Set budget limits
client.set_budget_limits({
    "daily_limit": 200.00,
    "provider_limits": {
        "openai": 120.00,
        "anthropic": 80.00
    }
})
```

### JavaScript SDK

```javascript
import { LLMProvidersClient } from '@studyassistant/client';

const client = new LLMProvidersClient({
    baseUrl: 'https://api.studyassistant.com',
    apiKey: 'your_api_key'
});

// Generate with custom selection criteria
const response = await client.generate({
    messages: [
        { role: 'user', content: 'Explain attention mechanisms' }
    ],
    modelSelection: {
        strategy: 'auto',
        criteria: {
            cost: 0.3,
            speed: 0.4,
            quality: 0.3
        }
    }
});

// Stream responses
const stream = client.generateStream({
    prompt: 'Write a literature review',
    modelSelection: { strategy: 'fastest' }
});

for await (const chunk of stream) {
    console.log(chunk.content);
}

// Monitor provider health
const health = await client.getProviderHealth();
```

## See Also

- [LLM Interface API](../llm-interface.md) - Core LLM interface
- [Configuration API](../configuration.md) - System configuration
- [ArXiv API](./arxiv.md) - Academic paper access
- [Web Crawling API](./web-crawling.md) - Web content extraction
