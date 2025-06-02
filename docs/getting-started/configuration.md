# Configuration Guide

StudyAssistant offers extensive configuration options to tailor the system to your research needs. This guide covers all configuration aspects from basic setup to advanced customization.

## Configuration Overview

StudyAssistant uses a hierarchical configuration system:

1. **Environment Variables** (`.env` file) - API keys and secrets
2. **Configuration File** (`config.py`) - System parameters and settings
3. **Command Line Arguments** - Runtime overrides
4. **Web Interface Settings** - User preferences in the Streamlit app

## Environment Configuration

### Creating the Environment File

Create a `.env` file in your project root directory:

```bash
# Copy from the example file
cp .env.example .env
```

### Essential Environment Variables

#### Required Configuration
```env
# Google AI API Key (Required)
GOOGLE_API_KEY=your_google_api_key_here

# Project Configuration
PROJECT_NAME=StudyAssistant
ENVIRONMENT=development  # or production
```

#### LLM Provider Configuration
```env
# Primary LLM (Google Gemini)
GOOGLE_API_KEY=your_google_api_key_here
GEMINI_MODEL=gemini-1.5-pro

# Alternative LLM Providers (Optional)
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=llama-3.1-70b-versatile

DEEPSEEK_API_KEY=your_deepseek_api_key_here
DEEPSEEK_MODEL=deepseek-chat

# OpenAI (if using custom integration)
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4
```

#### Data Source Configuration
```env
# arXiv API Configuration
ARXIV_API_BASE_URL=http://export.arxiv.org/api/query
ARXIV_MAX_RESULTS=100
ARXIV_DELAY_SECONDS=3

# Web Scraping Configuration
PLAYWRIGHT_HEADLESS=true
PLAYWRIGHT_TIMEOUT=30000
USER_AGENT=StudyAssistant/1.0 (Research Tool)

# File Processing
MAX_FILE_SIZE_MB=50
SUPPORTED_FORMATS=pdf,txt,md,docx
```

#### System Performance
```env
# Embedding Configuration
EMBEDDING_MODEL=text-embedding-004
EMBEDDING_BATCH_SIZE=100
MAX_EMBEDDING_RETRIES=3

# Search Configuration
HYBRID_SEARCH_WEIGHTS=0.7,0.3  # semantic,keyword
MAX_SEARCH_RESULTS=20
SEARCH_TIMEOUT_SECONDS=30

# Async Processing
MAX_CONCURRENT_REQUESTS=10
REQUEST_TIMEOUT=60
RETRY_ATTEMPTS=3
```

## API Key Setup

### Google AI API Key

1. **Visit Google AI Studio**: [https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
2. **Create Project**: If you don't have a project, create one
3. **Generate API Key**: Click "Create API Key"
4. **Copy Key**: Add to your `.env` file

```env
GOOGLE_API_KEY=AIzaSyD1234567890abcdefghijklmnopqrstuvwxyz
```

### Groq API Key (Optional)
1. **Visit Groq Console**: [https://console.groq.com](https://console.groq.com)
2. **Create Account**: Sign up for a free account
3. **Generate API Key**: Navigate to API Keys section
4. **Add to Environment**:

```env
GROQ_API_KEY=gsk_1234567890abcdefghijklmnopqrstuvwxyz
```

### DeepSeek API Key (Optional)
1. **Visit DeepSeek Platform**: [https://platform.deepseek.com](https://platform.deepseek.com)
2. **Create Account**: Register for an account
3. **Generate API Key**: Go to API management
4. **Configure**:

```env
DEEPSEEK_API_KEY=sk-1234567890abcdefghijklmnopqrstuvwxyz
```

## System Configuration

### Core System Settings

Edit `hybrid_search_rag/config.py` for system-wide settings:

```python
# Data Processing Configuration
DATA_CONFIG = {
    'chunk_size': 1000,
    'chunk_overlap': 200,
    'max_chunks_per_document': 50,
    'text_splitter': 'recursive_character',
}

# Embedding Configuration
EMBEDDING_CONFIG = {
    'model_name': 'text-embedding-004',
    'batch_size': 100,
    'max_retries': 3,
    'timeout': 30,
}

# Search Configuration
SEARCH_CONFIG = {
    'hybrid_weights': [0.7, 0.3],  # [semantic, keyword]
    'max_results': 20,
    'min_score_threshold': 0.1,
    'rerank_top_k': 10,
}

# LLM Configuration
LLM_CONFIG = {
    'temperature': 0.1,
    'max_tokens': 2048,
    'top_p': 0.9,
    'frequency_penalty': 0.0,
    'presence_penalty': 0.0,
}
```

### Logging Configuration

Configure logging levels and outputs:

```python
LOGGING_CONFIG = {
    'level': 'INFO',  # DEBUG, INFO, WARNING, ERROR, CRITICAL
    'format': '%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    'handlers': {
        'file': {
            'enabled': True,
            'filename': 'logs/studyassistant.log',
            'max_size': '10MB',
            'backup_count': 5,
        },
        'console': {
            'enabled': True,
            'level': 'INFO',
        },
    },
}
```

## CLI Configuration

### Command Line Arguments

Override configuration with CLI arguments:

```bash
# Override LLM provider
python scripts/cli.py query "your question" --llm-provider groq

# Set custom embedding model
python scripts/cli.py query "your question" --embedding-model text-embedding-004

# Adjust search parameters
python scripts/cli.py query "your question" --max-results 15 --hybrid-weights 0.6,0.4

# Enable debug logging
python scripts/cli.py query "your question" --log-level DEBUG

# Use custom config file
python scripts/cli.py query "your question" --config-file /path/to/custom/config.py
```

### Configuration File Override

Create custom configuration files for different environments:

```bash
# Development configuration
python scripts/cli.py --config-file configs/development.py

# Production configuration
python scripts/cli.py --config-file configs/production.py

# Research-specific configuration
python scripts/cli.py --config-file configs/research.py
```

## Web Interface Configuration

### Streamlit Configuration

Create `.streamlit/config.toml`:

```toml
[server]
port = 8501
headless = false
enableCORS = false
enableXsrfProtection = false

[browser]
gatherUsageStats = false
serverAddress = "localhost"

[theme]
primaryColor = "#1f77b4"
backgroundColor = "#ffffff"
secondaryBackgroundColor = "#f0f2f6"
textColor = "#262730"
font = "sans serif"
```

### Web App Environment Variables

```env
# Streamlit Configuration
STREAMLIT_SERVER_PORT=8501
STREAMLIT_SERVER_ADDRESS=localhost
STREAMLIT_BROWSER_GATHER_USAGE_STATS=false

# Web App Features
ENABLE_FILE_UPLOAD=true
ENABLE_BATCH_PROCESSING=true
ENABLE_EXPORT_RESULTS=true
MAX_UPLOAD_SIZE_MB=50
```

## Performance Optimization

### For Development Environment

```env
# Reduced resource usage
EMBEDDING_BATCH_SIZE=10
MAX_CONCURRENT_REQUESTS=2
PLAYWRIGHT_HEADLESS=true
CACHE_EMBEDDINGS=true
```

### For Production Environment

```env
# Optimized for performance
EMBEDDING_BATCH_SIZE=100
MAX_CONCURRENT_REQUESTS=20
ENABLE_RESULT_CACHING=true
CACHE_TTL_SECONDS=3600
ENABLE_ASYNC_PROCESSING=true
```

## Data Source Configuration

### arXiv Configuration

```env
# arXiv API Settings
ARXIV_API_BASE_URL=http://export.arxiv.org/api/query
ARXIV_MAX_RESULTS=100
ARXIV_DELAY_SECONDS=3
ARXIV_CATEGORIES=cs.AI,cs.CL,cs.LG,stat.ML
```

### Web Scraping Configuration

```env
# Playwright Settings
PLAYWRIGHT_HEADLESS=true
PLAYWRIGHT_TIMEOUT=30000
PLAYWRIGHT_VIEWPORT_WIDTH=1920
PLAYWRIGHT_VIEWPORT_HEIGHT=1080

# Scraping Limits
MAX_PAGES_PER_DOMAIN=50
SCRAPING_DELAY_SECONDS=1
RESPECT_ROBOTS_TXT=true
```

## Security Configuration

### API Key Security

```env
# Secure API key storage
ENCRYPT_API_KEYS=true
API_KEY_ENCRYPTION_KEY=your_encryption_key_here

# Request rate limiting
RATE_LIMIT_REQUESTS_PER_MINUTE=60
RATE_LIMIT_BURST_SIZE=10
```

### Network Security

```env
# HTTPS Configuration
FORCE_HTTPS=true
SSL_VERIFY=true
TRUSTED_HOSTS=localhost,127.0.0.1,yourdomain.com

# CORS Configuration
CORS_ORIGINS=http://localhost:3000,https://yourdomain.com
```

## Troubleshooting Configuration

### Common Issues

1. **Missing API Keys**: Check `.env` file exists and contains valid keys
2. **Permission Errors**: Ensure proper file permissions on config files
3. **Port Conflicts**: Change `STREAMLIT_SERVER_PORT` if 8501 is in use
4. **Memory Issues**: Reduce `EMBEDDING_BATCH_SIZE` and `MAX_CONCURRENT_REQUESTS`

### Debugging Configuration

```env
# Enable detailed logging
LOG_LEVEL=DEBUG
ENABLE_PERFORMANCE_PROFILING=true
LOG_API_REQUESTS=true
LOG_EMBEDDINGS=true
```

### Configuration Validation

```bash
# Validate configuration
python scripts/cli.py config --validate

# Show current configuration
python scripts/cli.py config --show

# Test API connections
python scripts/cli.py config --test-apis
```

## Configuration Templates

### Research Institution Template

```env
# Institutional Setup
INSTITUTION_NAME=Your University
RESEARCH_DOMAIN=computer_science
ENABLE_COLLABORATION_FEATURES=true
SHARED_CACHE_DIRECTORY=/shared/studyassistant/cache
```

### Personal Research Template

```env
# Personal Research Setup
RESEARCH_FOCUS=machine_learning
ENABLE_PERSONAL_NOTES=true
SYNC_WITH_ZOTERO=true
ZOTERO_API_KEY=your_zotero_key
```

## Next Steps

After configuring StudyAssistant:

1. **[Test Your Setup](./first-query)**: Make your first research query
2. **[Explore the Interface](../user-guide/web-interface)**: Learn the web application
3. **[CLI Usage](../user-guide/cli-usage)**: Master command-line operations
4. **[Advanced Features](../user-guide/advanced-features)**: Unlock full potential

---

**💡 Pro Tip**: Keep your API keys secure and never commit them to version control. Use environment variables and `.env` files that are excluded from Git.
