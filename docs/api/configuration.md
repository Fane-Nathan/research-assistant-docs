# Configuration API Reference

The StudyAssistant Configuration API provides comprehensive configuration management for all system components. This document details the available configuration endpoints, schemas, and best practices.

## Overview

The Configuration API enables dynamic configuration management, allowing administrators to modify system behavior without restarts. It supports hierarchical configurations, environment-specific settings, and real-time updates.

### Base URL

```
https://api.studyassistant.ai/v1/config
```

### Authentication

All configuration endpoints require administrative authentication:

```http
Authorization: Bearer <admin_token>
```

## Configuration Endpoints

### Get Configuration

Retrieve current configuration for specified components.

```http
GET /config/{component}
```

**Parameters:**

- `component` (path, required): Component name (`global`, `llm`, `search`, `rag`, `database`, `cache`)
- `environment` (query, optional): Environment filter (`development`, `staging`, `production`)
- `format` (query, optional): Response format (`json`, `yaml`, `toml`)

**Example Request:**

```bash
curl -X GET "https://api.studyassistant.ai/v1/config/llm?environment=production" \
  -H "Authorization: Bearer <admin_token>" \
  -H "Accept: application/json"
```

**Response:**

```json
{
  "component": "llm",
  "environment": "production",
  "version": "1.2.0",
  "last_updated": "2024-01-15T10:30:00Z",
  "configuration": {
    "providers": {
      "openai": {
        "enabled": true,
        "api_key": "***",
        "models": {
          "default": "gpt-4-turbo-preview",
          "analysis": "gpt-4-turbo-preview",
          "summary": "gpt-3.5-turbo",
          "qa": "gpt-4-turbo-preview"
        },
        "rate_limits": {
          "requests_per_minute": 60,
          "tokens_per_minute": 90000
        },
        "timeout": 30,
        "retry_attempts": 3
      },
      "anthropic": {
        "enabled": true,
        "api_key": "***",
        "models": {
          "default": "claude-3-opus-20240229",
          "analysis": "claude-3-opus-20240229",
          "summary": "claude-3-sonnet-20240229"
        },
        "rate_limits": {
          "requests_per_minute": 50,
          "tokens_per_minute": 80000
        }
      }
    },
    "routing": {
      "strategy": "cost_optimized",
      "fallback_enabled": true,
      "load_balancing": true,
      "health_check_interval": 60
    },
    "prompt_engineering": {
      "max_context_length": 3000,
      "few_shot_examples": 2,
      "template_version": "2.1.0"
    },
    "response_processing": {
      "validation_enabled": true,
      "fact_checking_enabled": true,
      "citation_extraction": true,
      "quality_threshold": 0.75
    }
  }
}
```

### Update Configuration

Update configuration for a specific component.

```http
PUT /config/{component}
```

**Request Body:**

```json
{
  "environment": "production",
  "configuration": {
    "providers": {
      "openai": {
        "rate_limits": {
          "requests_per_minute": 100,
          "tokens_per_minute": 120000
        }
      }
    }
  },
  "reason": "Increased rate limits for peak usage",
  "apply_immediately": true
}
```

**Response:**

```json
{
  "success": true,
  "message": "Configuration updated successfully",
  "changes_applied": {
    "providers.openai.rate_limits.requests_per_minute": {
      "old_value": 60,
      "new_value": 100
    },
    "providers.openai.rate_limits.tokens_per_minute": {
      "old_value": 90000,
      "new_value": 120000
    }
  },
  "version": "1.2.1",
  "applied_at": "2024-01-15T14:45:00Z"
}
```

### Patch Configuration

Apply partial configuration updates.

```http
PATCH /config/{component}
```

**Request Body:**

```json
{
  "operation": "merge",
  "path": "providers.openai.models",
  "value": {
    "experimental": "gpt-4-turbo-2024-04-09"
  }
}
```

### Get Configuration Schema

Retrieve the configuration schema for validation.

```http
GET /config/{component}/schema
```

**Response:**

```json
{
  "component": "llm",
  "schema_version": "1.0.0",
  "schema": {
    "type": "object",
    "properties": {
      "providers": {
        "type": "object",
        "properties": {
          "openai": {
            "$ref": "#/definitions/OpenAIProvider"
          },
          "anthropic": {
            "$ref": "#/definitions/AnthropicProvider"
          }
        }
      }
    },
    "definitions": {
      "OpenAIProvider": {
        "type": "object",
        "properties": {
          "enabled": {
            "type": "boolean",
            "default": true
          },
          "api_key": {
            "type": "string",
            "format": "secret"
          },
          "models": {
            "$ref": "#/definitions/ModelMapping"
          }
        },
        "required": ["api_key"]
      }
    }
  }
}
```

## Configuration Schemas

### Global Configuration

```json
{
  "global": {
    "application": {
      "name": "StudyAssistant",
      "version": "2.0.0",
      "environment": "production",
      "debug": false,
      "log_level": "INFO"
    },
    "api": {
      "host": "0.0.0.0",
      "port": 8000,
      "cors_origins": ["https://app.studyassistant.ai"],
      "rate_limiting": {
        "enabled": true,
        "requests_per_minute": 1000,
        "burst_size": 100
      }
    },
    "security": {
      "secret_key": "***",
      "token_expiry": 3600,
      "refresh_token_expiry": 604800,
      "password_hashing": {
        "algorithm": "bcrypt",
        "rounds": 12
      }
    },
    "monitoring": {
      "metrics_enabled": true,
      "health_check_interval": 30,
      "alert_webhooks": [
        "https://hooks.slack.com/services/..."
      ]
    }
  }
}
```

### LLM Configuration

```json
{
  "llm": {
    "providers": {
      "openai": {
        "enabled": true,
        "api_key": "${OPENAI_API_KEY}",
        "organization": "${OPENAI_ORGANIZATION}",
        "base_url": "https://api.openai.com/v1",
        "models": {
          "default": "gpt-4-turbo-preview",
          "analysis": "gpt-4-turbo-preview",
          "summary": "gpt-3.5-turbo",
          "qa": "gpt-4-turbo-preview",
          "embedding": "text-embedding-3-large"
        },
        "rate_limits": {
          "requests_per_minute": 60,
          "tokens_per_minute": 90000,
          "max_concurrent": 10
        },
        "generation_defaults": {
          "temperature": 0.1,
          "max_tokens": 2048,
          "top_p": 0.9,
          "frequency_penalty": 0.0,
          "presence_penalty": 0.0
        },
        "timeout": 30,
        "retry_config": {
          "max_attempts": 3,
          "backoff_factor": 2,
          "retry_on_status": [429, 500, 502, 503, 504]
        }
      },
      "anthropic": {
        "enabled": true,
        "api_key": "${ANTHROPIC_API_KEY}",
        "base_url": "https://api.anthropic.com",
        "models": {
          "default": "claude-3-opus-20240229",
          "analysis": "claude-3-opus-20240229",
          "summary": "claude-3-sonnet-20240229",
          "qa": "claude-3-opus-20240229"
        },
        "rate_limits": {
          "requests_per_minute": 50,
          "tokens_per_minute": 80000
        },
        "generation_defaults": {
          "temperature": 0.1,
          "max_tokens": 2048,
          "top_p": 0.9
        }
      },
      "local": {
        "enabled": false,
        "framework": "transformers",
        "model_name": "microsoft/DialoGPT-large",
        "device": "auto",
        "load_in_8bit": false,
        "max_input_length": 4096
      }
    },
    "routing": {
      "strategy": "cost_optimized",
      "fallback_enabled": true,
      "load_balancing": true,
      "health_check_interval": 60,
      "scoring_weights": {
        "performance": 0.3,
        "cost": 0.4,
        "quality": 0.2,
        "load_balancing": 0.1
      }
    },
    "prompt_engineering": {
      "max_context_length": 3000,
      "few_shot_examples": 2,
      "template_version": "2.1.0",
      "optimization_enabled": true,
      "context_compression": true
    },
    "response_processing": {
      "validation_enabled": true,
      "fact_checking_enabled": true,
      "citation_extraction": true,
      "quality_threshold": 0.75,
      "formatting_style": "academic"
    },
    "caching": {
      "enabled": true,
      "ttl": 3600,
      "max_size": 10000,
      "compression": true
    }
  }
}
```

### Search Configuration

```json
{
  "search": {
    "engines": {
      "elasticsearch": {
        "enabled": true,
        "hosts": ["${ELASTICSEARCH_HOST}"],
        "username": "${ELASTICSEARCH_USERNAME}",
        "password": "${ELASTICSEARCH_PASSWORD}",
        "ssl_verify": true,
        "timeout": 30,
        "max_retries": 3
      },
      "semantic": {
        "enabled": true,
        "model": "all-MiniLM-L6-v2",
        "dimension": 384,
        "similarity_threshold": 0.7
      }
    },
    "indexing": {
      "batch_size": 100,
      "refresh_interval": "30s",
      "number_of_shards": 3,
      "number_of_replicas": 1
    },
    "ranking": {
      "algorithm": "hybrid",
      "weights": {
        "lexical": 0.4,
        "semantic": 0.4,
        "citation": 0.1,
        "recency": 0.1
      },
      "boost_factors": {
        "title": 2.0,
        "abstract": 1.5,
        "keywords": 1.2
      }
    },
    "filters": {
      "default_date_range": 10,
      "min_citation_count": 0,
      "language_filter": ["en"],
      "quality_threshold": 0.6
    }
  }
}
```

### Database Configuration

```json
{
  "database": {
    "primary": {
      "type": "postgresql",
      "host": "${DB_HOST}",
      "port": 5432,
      "database": "${DB_NAME}",
      "username": "${DB_USERNAME}",
      "password": "${DB_PASSWORD}",
      "ssl_mode": "require",
      "pool_size": 20,
      "max_overflow": 10,
      "pool_timeout": 30,
      "pool_recycle": 3600
    },
    "read_replicas": [
      {
        "host": "${DB_READ_REPLICA_1}",
        "port": 5432,
        "weight": 0.5
      },
      {
        "host": "${DB_READ_REPLICA_2}",
        "port": 5432,
        "weight": 0.5
      }
    ],
    "migrations": {
      "auto_upgrade": false,
      "backup_before_migration": true
    },
    "monitoring": {
      "slow_query_threshold": 1.0,
      "log_queries": false,
      "metrics_interval": 60
    }
  }
}
```

## Configuration Management

### Environment Variables

Configuration supports environment variable interpolation:

```json
{
  "api_key": "${API_KEY}",
  "host": "${HOST:localhost}",
  "port": "${PORT:8000}"
}
```

**Syntax:**
- `${VAR}`: Required environment variable
- `${VAR:default}`: Optional with default value

### Configuration Validation

All configuration updates are validated against JSON schemas:

```python
# Example configuration validation
def validate_configuration(component: str, config: dict) -> ValidationResult:
    schema = get_configuration_schema(component)
    
    try:
        jsonschema.validate(config, schema)
        return ValidationResult(valid=True)
    except jsonschema.ValidationError as e:
        return ValidationResult(
            valid=False,
            errors=[str(e)]
        )
```

### Hot Reloading

Certain configuration changes can be applied without service restart:

**Hot-reloadable settings:**
- Rate limits
- Timeout values
- Feature flags
- Cache settings
- Monitoring thresholds

**Restart-required settings:**
- Database connections
- API keys
- Model configurations
- Core algorithms

### Configuration Versioning

```http
GET /config/{component}/versions
```

**Response:**

```json
{
  "component": "llm",
  "current_version": "1.2.1",
  "versions": [
    {
      "version": "1.2.1",
      "created_at": "2024-01-15T14:45:00Z",
      "created_by": "admin@studyassistant.ai",
      "description": "Increased rate limits for peak usage",
      "changes": 2
    },
    {
      "version": "1.2.0",
      "created_at": "2024-01-15T10:30:00Z",
      "created_by": "system",
      "description": "Initial production configuration",
      "changes": 0
    }
  ]
}
```

### Rollback Configuration

```http
POST /config/{component}/rollback
```

**Request Body:**

```json
{
  "target_version": "1.2.0",
  "reason": "Rollback due to performance issues"
}
```

## Configuration Templates

### Development Template

```yaml
global:
  application:
    environment: development
    debug: true
    log_level: DEBUG
  
llm:
  providers:
    openai:
      enabled: true
      models:
        default: gpt-3.5-turbo
    local:
      enabled: true
      framework: transformers
      model_name: distilgpt2

database:
  primary:
    host: localhost
    database: studyassistant_dev
    pool_size: 5
```

### Production Template

```yaml
global:
  application:
    environment: production
    debug: false
    log_level: INFO
  
llm:
  providers:
    openai:
      enabled: true
      models:
        default: gpt-4-turbo-preview
    anthropic:
      enabled: true
      models:
        default: claude-3-opus-20240229

database:
  primary:
    host: ${DB_HOST}
    ssl_mode: require
    pool_size: 20
  read_replicas: ${DB_READ_REPLICAS}
```

## Best Practices

### Security

1. **Secret Management**: Use environment variables for sensitive data
2. **Access Control**: Limit configuration access to authorized personnel
3. **Audit Logging**: Track all configuration changes
4. **Encryption**: Encrypt sensitive configuration values at rest

### Performance

1. **Lazy Loading**: Load configuration on demand
2. **Caching**: Cache frequently accessed configuration
3. **Validation**: Validate configuration early and thoroughly
4. **Monitoring**: Monitor configuration change impacts

### Reliability

1. **Gradual Rollouts**: Test configuration changes incrementally
2. **Rollback Plans**: Maintain rollback capabilities
3. **Health Checks**: Monitor system health after changes
4. **Backup**: Regular configuration backups

## Error Handling

### Common Error Responses

**Validation Error (400):**

```json
{
  "error": "validation_error",
  "message": "Configuration validation failed",
  "details": {
    "field": "providers.openai.rate_limits.requests_per_minute",
    "error": "Value must be positive integer"
  }
}
```

**Permission Denied (403):**

```json
{
  "error": "permission_denied",
  "message": "Insufficient permissions for configuration changes"
}
```

**Configuration Not Found (404):**

```json
{
  "error": "configuration_not_found",
  "message": "Configuration component 'invalid_component' not found"
}
```

**Conflict (409):**

```json
{
  "error": "configuration_conflict",
  "message": "Configuration was modified by another user",
  "current_version": "1.2.1",
  "attempted_version": "1.2.0"
}
```

This Configuration API provides comprehensive management capabilities while ensuring security, reliability, and ease of use for system administrators.
