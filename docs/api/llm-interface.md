# LLM Interface API

The LLM Interface API provides comprehensive language model integration capabilities for the StudyAssistant system, supporting multiple LLM providers and advanced prompt engineering features.

## Overview

The LLM Interface manages interactions with various language model providers:

- **Multi-provider support** (OpenAI, Anthropic, Google, Azure, local models)
- **Advanced prompt engineering** with templates and optimization
- **Response processing** and validation
- **Cost optimization** with intelligent model selection
- **Context management** for long conversations
- **Streaming responses** for real-time interactions

## Core Endpoints

### Text Generation

#### Generate Response

```http
POST /api/llm/generate
Content-Type: application/json
Authorization: Bearer {token}

{
    "prompt": "Explain the concept of attention mechanisms in transformer models",
    "context": [
        {
            "role": "system",
            "content": "You are a helpful AI research assistant specializing in machine learning."
        },
        {
            "role": "user", 
            "content": "I'm researching transformer architectures"
        }
    ],
    "model": "gpt-4-turbo",
    "parameters": {
        "temperature": 0.7,
        "max_tokens": 2000,
        "top_p": 0.9,
        "frequency_penalty": 0.1
    },
    "options": {
        "stream": false,
        "include_metadata": true,
        "format": "markdown"
    }
}
```

**Response:**
```json
{
    "id": "gen_123456789",
    "response": "# Attention Mechanisms in Transformers\n\nAttention mechanisms are a fundamental component of transformer models that allow the model to focus on different parts of the input sequence when generating each output token...",
    "model": "gpt-4-turbo",
    "usage": {
        "prompt_tokens": 156,
        "completion_tokens": 892,
        "total_tokens": 1048
    },
    "metadata": {
        "finish_reason": "stop",
        "response_time": 2.34,
        "cost": 0.0524,
        "provider": "openai",
        "model_version": "gpt-4-turbo-2024-04-09"
    },
    "quality_scores": {
        "relevance": 0.92,
        "coherence": 0.89,
        "completeness": 0.85,
        "accuracy": 0.94
    },
    "created_at": "2024-01-15T10:30:00Z"
}
```

#### Stream Response

```http
POST /api/llm/generate/stream
Content-Type: application/json
Authorization: Bearer {token}

{
    "prompt": "Write a comprehensive summary of recent advances in large language models",
    "model": "claude-3-opus",
    "parameters": {
        "temperature": 0.6,
        "max_tokens": 3000
    },
    "options": {
        "stream": true,
        "chunk_size": 50
    }
}
```

**Streaming Response (Server-Sent Events):**
```
data: {"id": "stream_123", "chunk": "Recent advances in large language models have been", "type": "content"}

data: {"id": "stream_123", "chunk": " remarkable, particularly in the areas of", "type": "content"}

data: {"id": "stream_123", "chunk": " reasoning capabilities and multimodal understanding.", "type": "content"}

data: {"id": "stream_123", "usage": {"tokens": 1245}, "type": "usage"}

data: {"id": "stream_123", "type": "done"}
```

### Research-Specific Generation

#### Generate Research Summary

```http
POST /api/llm/research/summarize
Content-Type: application/json
Authorization: Bearer {token}

{
    "papers": [
        {
            "id": "res_123456789",
            "title": "Attention Is All You Need",
            "abstract": "The dominant sequence transduction models...",
            "content": "Full paper content..."
        }
    ],
    "summary_type": "comprehensive",
    "focus_areas": ["methodology", "results", "implications"],
    "target_audience": "researchers",
    "max_length": 1000
}
```

**Response:**
```json
{
    "summary": {
        "title": "Research Summary: Transformer Architecture and Attention Mechanisms",
        "content": "## Methodology\n\nThe paper introduces the Transformer architecture...\n\n## Key Results\n\nThe model achieved state-of-the-art performance...\n\n## Implications\n\nThis work has significant implications for...",
        "key_points": [
            "Introduction of self-attention mechanism",
            "Elimination of recurrent layers",
            "Parallel processing capabilities",
            "State-of-the-art translation results"
        ],
        "methodology_summary": "The authors propose a novel architecture...",
        "results_summary": "Experimental results demonstrate...",
        "implications": "This work opens new possibilities..."
    },
    "metadata": {
        "papers_processed": 1,
        "total_tokens": 15420,
        "processing_time": 4.2,
        "confidence_score": 0.91
    }
}
```

#### Generate Literature Review

```http
POST /api/llm/research/literature-review
Content-Type: application/json
Authorization: Bearer {token}

{
    "topic": "Transformer architectures in natural language processing",
    "papers": [
        {"id": "res_123", "relevance_score": 0.95},
        {"id": "res_456", "relevance_score": 0.87},
        {"id": "res_789", "relevance_score": 0.82}
    ],
    "structure": {
        "include_introduction": true,
        "include_methodology_comparison": true,
        "include_results_synthesis": true,
        "include_future_directions": true
    },
    "style": "academic",
    "target_length": 3000
}
```

### Question Answering

#### Answer Research Question

```http
POST /api/llm/qa/research
Content-Type: application/json
Authorization: Bearer {token}

{
    "question": "How do transformer models handle long sequences and what are the computational limitations?",
    "context_papers": ["res_123", "res_456", "res_789"],
    "answer_type": "detailed",
    "include_citations": true,
    "confidence_threshold": 0.8
}
```

**Response:**
```json
{
    "answer": {
        "content": "Transformer models handle long sequences through several key mechanisms, though they face significant computational limitations:\n\n## Attention Mechanism Limitations\n\nThe self-attention mechanism in transformers has quadratic complexity O(n²) with respect to sequence length [1,2]. This means that processing time and memory requirements grow exponentially as sequences get longer.\n\n## Solutions and Approaches\n\n1. **Sparse Attention Patterns**: Models like Longformer and BigBird use sparse attention to reduce complexity [3].\n2. **Hierarchical Processing**: Some approaches break long sequences into chunks [4].\n3. **Linear Attention**: Recent work explores linear attention mechanisms [5].\n\n## Computational Limitations\n\n- Memory requirements scale quadratically\n- Processing time increases exponentially\n- Hardware limitations become bottlenecks\n- Training becomes computationally prohibitive",
        "citations": [
            {
                "id": 1,
                "paper_id": "res_123",
                "title": "Attention Is All You Need",
                "relevance": "Foundational paper explaining attention complexity"
            },
            {
                "id": 2,
                "paper_id": "res_456", 
                "title": "Longformer: The Long-Document Transformer",
                "relevance": "Addresses long sequence limitations"
            }
        ],
        "confidence_score": 0.89,
        "evidence_strength": "strong"
    },
    "metadata": {
        "papers_consulted": 3,
        "processing_time": 3.1,
        "tokens_used": 2456
    }
}
```

### Prompt Management

#### Create Prompt Template

```http
POST /api/llm/prompts/templates
Content-Type: application/json
Authorization: Bearer {token}

{
    "name": "research_summary_template",
    "description": "Template for generating research paper summaries",
    "category": "research",
    "template": "You are an expert researcher. Summarize the following paper focusing on {{focus_areas}}.\n\nPaper Title: {{title}}\nAuthors: {{authors}}\nAbstract: {{abstract}}\n\nProvide a {{summary_length}} summary that covers:\n{{#each focus_areas}}\n- {{this}}\n{{/each}}\n\nFormat the response in {{output_format}}.",
    "variables": [
        {
            "name": "title",
            "type": "string",
            "required": true,
            "description": "Paper title"
        },
        {
            "name": "authors",
            "type": "array",
            "required": true,
            "description": "List of authors"
        },
        {
            "name": "focus_areas",
            "type": "array",
            "required": false,
            "default": ["methodology", "results", "conclusions"],
            "description": "Areas to focus on in summary"
        },
        {
            "name": "summary_length",
            "type": "string",
            "required": false,
            "default": "comprehensive",
            "enum": ["brief", "medium", "comprehensive"],
            "description": "Length of summary"
        },
        {
            "name": "output_format",
            "type": "string",
            "required": false,
            "default": "markdown",
            "enum": ["markdown", "html", "plain"],
            "description": "Output format"
        }
    ],
    "model_preferences": {
        "preferred_models": ["gpt-4", "claude-3-opus"],
        "temperature": 0.3,
        "max_tokens": 2000
    }
}
```

#### Use Prompt Template

```http
POST /api/llm/prompts/templates/{template_id}/generate
Content-Type: application/json
Authorization: Bearer {token}

{
    "variables": {
        "title": "Attention Is All You Need",
        "authors": ["Ashish Vaswani", "Noam Shazeer"],
        "abstract": "The dominant sequence transduction models...",
        "focus_areas": ["architecture", "performance", "impact"],
        "summary_length": "comprehensive",
        "output_format": "markdown"
    },
    "model": "gpt-4-turbo",
    "parameters": {
        "temperature": 0.4
    }
}
```

### Model Management

#### List Available Models

```http
GET /api/llm/models
Authorization: Bearer {token}
```

**Response:**
```json
{
    "models": [
        {
            "id": "gpt-4-turbo",
            "name": "GPT-4 Turbo",
            "provider": "openai",
            "type": "chat",
            "status": "available",
            "capabilities": ["text-generation", "reasoning", "code"],
            "context_length": 128000,
            "max_output_tokens": 4096,
            "cost_per_1k_tokens": {
                "input": 0.01,
                "output": 0.03
            },
            "performance_metrics": {
                "accuracy": 0.94,
                "speed": "fast",
                "reliability": 0.99
            },
            "best_for": ["complex reasoning", "long context", "research tasks"]
        },
        {
            "id": "claude-3-opus",
            "name": "Claude 3 Opus",
            "provider": "anthropic",
            "type": "chat",
            "status": "available",
            "capabilities": ["text-generation", "analysis", "reasoning"],
            "context_length": 200000,
            "max_output_tokens": 4096,
            "cost_per_1k_tokens": {
                "input": 0.015,
                "output": 0.075
            },
            "performance_metrics": {
                "accuracy": 0.96,
                "speed": "medium",
                "reliability": 0.98
            },
            "best_for": ["analysis", "creative writing", "nuanced reasoning"]
        }
    ],
    "providers": [
        {
            "name": "openai",
            "status": "healthy",
            "latency": "45ms",
            "availability": 0.999
        },
        {
            "name": "anthropic",
            "status": "healthy", 
            "latency": "62ms",
            "availability": 0.998
        }
    ]
}
```

#### Get Model Performance

```http
GET /api/llm/models/{model_id}/performance?period=7d
Authorization: Bearer {token}
```

**Response:**
```json
{
    "model_id": "gpt-4-turbo",
    "period": {
        "start": "2024-01-08T00:00:00Z",
        "end": "2024-01-15T00:00:00Z"
    },
    "metrics": {
        "total_requests": 15420,
        "successful_requests": 15298,
        "failed_requests": 122,
        "success_rate": 0.992,
        "average_latency": 2.34,
        "p95_latency": 4.8,
        "p99_latency": 8.2,
        "total_tokens": 2845670,
        "total_cost": 284.57,
        "cost_per_request": 0.0185
    },
    "quality_metrics": {
        "average_relevance": 0.89,
        "average_coherence": 0.91,
        "user_satisfaction": 4.3,
        "error_rate": 0.008
    },
    "usage_patterns": {
        "peak_hours": ["09:00-11:00", "14:00-16:00"],
        "common_use_cases": [
            {"type": "research_summary", "percentage": 35},
            {"type": "question_answering", "percentage": 28},
            {"type": "literature_review", "percentage": 22},
            {"type": "general_query", "percentage": 15}
        ]
    }
}
```

### Cost Management

#### Get Usage Statistics

```http
GET /api/llm/usage?period=30d&group_by=model
Authorization: Bearer {token}
```

**Response:**
```json
{
    "period": {
        "start": "2023-12-16T00:00:00Z",
        "end": "2024-01-15T00:00:00Z"
    },
    "total_cost": 1247.89,
    "total_tokens": 8542670,
    "total_requests": 45230,
    "breakdown": {
        "by_model": [
            {
                "model": "gpt-4-turbo",
                "requests": 25430,
                "tokens": 5234560,
                "cost": 782.45,
                "percentage": 62.7
            },
            {
                "model": "claude-3-opus",
                "requests": 12800,
                "tokens": 2156780,
                "cost": 323.51,
                "percentage": 25.9
            },
            {
                "model": "gpt-3.5-turbo",
                "requests": 7000,
                "tokens": 1151330,
                "cost": 141.93,
                "percentage": 11.4
            }
        ],
        "by_use_case": [
            {
                "use_case": "research_summary",
                "cost": 437.76,
                "percentage": 35.1
            },
            {
                "use_case": "question_answering",
                "cost": 349.41,
                "percentage": 28.0
            }
        ]
    },
    "trends": {
        "daily_cost": [
            {"date": "2024-01-15", "cost": 45.67},
            {"date": "2024-01-14", "cost": 52.34}
        ],
        "cost_prediction": {
            "next_30_days": 1456.78,
            "confidence": 0.87
        }
    }
}
```

#### Set Cost Limits

```http
POST /api/llm/limits
Content-Type: application/json
Authorization: Bearer {token}

{
    "daily_limit": 100.00,
    "monthly_limit": 2000.00,
    "per_request_limit": 5.00,
    "model_limits": {
        "gpt-4-turbo": {"daily": 80.00},
        "claude-3-opus": {"daily": 50.00}
    },
    "alerts": {
        "threshold_percentages": [75, 90, 95],
        "notification_channels": ["email", "webhook"]
    }
}
```

## Advanced Features

### Context Management

#### Create Conversation Context

```http
POST /api/llm/contexts
Content-Type: application/json
Authorization: Bearer {token}

{
    "name": "Research Discussion - Transformers",
    "description": "Long-form discussion about transformer architectures",
    "system_prompt": "You are an expert AI researcher discussing transformer models",
    "max_context_length": 32000,
    "context_strategy": "sliding_window",
    "retention_policy": {
        "important_messages": "always_keep",
        "recent_messages": 50,
        "summary_threshold": 100
    }
}
```

#### Add to Context

```http
POST /api/llm/contexts/{context_id}/messages
Content-Type: application/json
Authorization: Bearer {token}

{
    "role": "user",
    "content": "Can you explain the differences between encoder-only, decoder-only, and encoder-decoder transformers?",
    "metadata": {
        "timestamp": "2024-01-15T10:30:00Z",
        "importance": "high",
        "tags": ["architecture", "comparison"]
    }
}
```

### Response Validation

#### Validate Response Quality

```http
POST /api/llm/validate
Content-Type: application/json
Authorization: Bearer {token}

{
    "response": "Transformer models are neural network architectures...",
    "prompt": "Explain transformer architectures",
    "validation_criteria": {
        "relevance": {"threshold": 0.8},
        "accuracy": {"threshold": 0.9, "fact_check": true},
        "completeness": {"threshold": 0.7},
        "coherence": {"threshold": 0.8},
        "safety": {"check_harmful_content": true}
    }
}
```

**Response:**
```json
{
    "validation_result": {
        "overall_score": 0.89,
        "passed": true,
        "criteria_scores": {
            "relevance": 0.92,
            "accuracy": 0.91,
            "completeness": 0.85,
            "coherence": 0.88,
            "safety": 1.0
        },
        "issues": [],
        "suggestions": [
            "Consider adding more examples",
            "Include references to recent research"
        ]
    },
    "fact_check_results": [
        {
            "claim": "Transformers use self-attention mechanisms",
            "accuracy": 1.0,
            "confidence": 0.99,
            "sources": ["Vaswani et al., 2017"]
        }
    ]
}
```

## Configuration

### Provider Configuration

```yaml
llm_interface:
  providers:
    openai:
      api_key: ${OPENAI_API_KEY}
      base_url: https://api.openai.com/v1
      timeout: 60
      max_retries: 3
      retry_delay: 1
      
    anthropic:
      api_key: ${ANTHROPIC_API_KEY}
      base_url: https://api.anthropic.com
      timeout: 90
      max_retries: 3
      
    azure_openai:
      api_key: ${AZURE_OPENAI_API_KEY}
      endpoint: ${AZURE_OPENAI_ENDPOINT}
      api_version: "2024-02-15-preview"
      
  model_selection:
    strategy: "cost_performance_balanced"
    fallback_model: "gpt-3.5-turbo"
    auto_retry: true
    
  cost_management:
    daily_limit: 500.00
    monthly_limit: 10000.00
    alert_thresholds: [0.75, 0.90, 0.95]
    
  quality_control:
    validation_enabled: true
    min_quality_score: 0.7
    fact_checking: true
    safety_filtering: true
```

### Response Processing

```yaml
llm_interface:
  processing:
    default_format: "markdown"
    post_processing:
      - "grammar_check"
      - "citation_formatting"
      - "fact_verification"
      
    caching:
      enabled: true
      ttl: 3600
      cache_key_strategy: "prompt_hash"
      
    streaming:
      chunk_size: 50
      buffer_size: 1024
      timeout: 300
```

## Error Handling

### Common Error Codes

| Code | Description | Status |
|------|-------------|--------|
| `LLM_001` | Model not available | 503 |
| `LLM_002` | Invalid prompt format | 400 |
| `LLM_003` | Token limit exceeded | 413 |
| `LLM_004` | Rate limit exceeded | 429 |
| `LLM_005` | Provider API error | 502 |
| `LLM_006` | Cost limit exceeded | 402 |
| `LLM_007` | Context not found | 404 |
| `LLM_008` | Response validation failed | 422 |

## SDK Examples

### Python SDK

```python
from studyassistant.client import LLMClient

# Initialize client
client = LLMClient(
    base_url="https://api.studyassistant.com",
    api_key="your_api_key"
)

# Generate response
response = client.generate(
    prompt="Explain transformer architectures",
    model="gpt-4-turbo",
    temperature=0.7,
    max_tokens=2000
)

# Stream response
for chunk in client.generate_stream(
    prompt="Write a comprehensive literature review",
    model="claude-3-opus"
):
    print(chunk.content, end="")

# Research-specific generation
summary = client.research.summarize(
    papers=[{"id": "res_123", "title": "Attention Is All You Need"}],
    summary_type="comprehensive",
    focus_areas=["methodology", "results"]
)

# Use prompt template
result = client.prompts.generate_from_template(
    template_id="research_summary_template",
    variables={
        "title": "Paper Title",
        "authors": ["Author 1", "Author 2"],
        "focus_areas": ["methodology", "results"]
    }
)
```

### JavaScript SDK

```javascript
import { LLMClient } from '@studyassistant/client';

const client = new LLMClient({
    baseUrl: 'https://api.studyassistant.com',
    apiKey: 'your_api_key'
});

// Generate with context
const response = await client.generate({
    prompt: 'Explain attention mechanisms',
    context: [
        { role: 'system', content: 'You are an AI research expert' },
        { role: 'user', content: 'I need help understanding transformers' }
    ],
    model: 'gpt-4-turbo',
    parameters: {
        temperature: 0.7,
        maxTokens: 2000
    }
});

// Research Q&A
const answer = await client.research.answerQuestion({
    question: 'How do transformers handle long sequences?',
    contextPapers: ['res_123', 'res_456'],
    includeCitations: true
});

// Cost management
const usage = await client.usage.getStatistics({
    period: '30d',
    groupBy: 'model'
});
```

## See Also

- [Data Manager API](./data-manager.md) - Resource data access
- [Hybrid Recommender API](./hybrid-recommender.md) - Recommendation integration  
- [Embeddings API](./embeddings.md) - Vector embeddings for LLM context
- [Architecture: LLM Interface](../architecture/components/llm-interface.md) - Component architecture
