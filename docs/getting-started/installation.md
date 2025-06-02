# Installation Guide

This guide will help you install and set up StudyAssistant on your system. StudyAssistant requires Python 3.10+ and several dependencies for optimal performance.

## Prerequisites

### System Requirements
- **Python**: 3.10 or higher
- **Operating System**: Windows, macOS, or Linux
- **Memory**: 8GB RAM minimum (16GB recommended for large datasets)
- **Storage**: 5GB free space for installation and data

### API Keys Required
You'll need API keys for the following services:
- **Google Gemini API**: For embeddings and LLM generation
- **OpenAI API** (optional): Alternative LLM provider
- **Groq API** (optional): Alternative LLM provider

## Installation Methods

### Method 1: Clone from Repository (Recommended for Developers)

```bash
# Clone the repository
git clone https://github.com/your-org/studyassistant.git
cd studyassistant

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
pip install -r requirements_development.txt  # For development features
pip install -r requirements_streamlit.txt    # For web interface
```

### Method 2: pip Installation (Coming Soon)

```bash
# This will be available once the package is published
pip install studyassistant
```

## Required Dependencies

StudyAssistant relies on several key libraries as specified in the [.instructions.md](../../.github/instructions/.instructions.md):

### Core Dependencies
```txt
# NLP and ML Libraries
numpy>=1.21.0
scikit-learn>=1.0.0
nltk>=3.7
sentence-transformers>=2.2.0
transformers>=4.20.0

# Async and Web Processing
aiohttp>=3.8.0
asyncio
playwright>=1.20.0
trafilatura>=1.6.0
beautifulsoup4>=4.11.0

# Document Processing
PyMuPDF>=1.20.0
python-dotenv>=0.19.0

# Search and Retrieval
rank-bm25>=0.2.2
faiss-cpu>=1.7.0  # or faiss-gpu for GPU acceleration

# LLM Integration
openai>=1.0.0
google-generativeai>=0.3.0
```

### Development Dependencies
```txt
# Testing and Quality
pytest>=7.0.0
black>=22.0.0
ruff>=0.0.200
mypy>=0.990

# Logging and Monitoring
rich>=12.0.0
```

## Environment Configuration

### 1. Create Environment File

Create a `.env` file in your project root:

```bash
# Copy the example environment file
cp .env.example .env
```

### 2. Configure API Keys

Edit the `.env` file and add your API keys:

```env
# Google Gemini API
GOOGLE_API_KEY=your_google_api_key_here

# OpenAI API (optional)
OPENAI_API_KEY=your_openai_api_key_here

# Groq API (optional)
GROQ_API_KEY=your_groq_api_key_here

# Configuration
DATA_DIR=./data_hybrid
LOG_LEVEL=INFO
```

### 3. Verify Installation

Run the configuration check:

```bash
python -c "from hybrid_search_rag.config import run_config_checks; run_config_checks()"
```

You should see output confirming your configuration is valid.

## Platform-Specific Setup

### Windows Setup

1. **Install Python 3.10+** from [python.org](https://python.org)
2. **Install Git** from [git-scm.com](https://git-scm.com)
3. **Install Visual Studio Build Tools** (required for some dependencies):
   ```powershell
   # Using chocolatey (if installed)
   choco install visualstudio2022buildtools
   ```

### macOS Setup

1. **Install Homebrew** (if not already installed):
   ```bash
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   ```

2. **Install Python**:
   ```bash
   brew install python@3.10
   ```

### Linux Setup (Ubuntu/Debian)

```bash
# Update package list
sudo apt update

# Install Python and development tools
sudo apt install python3.10 python3.10-venv python3-pip build-essential

# Install additional dependencies for document processing
sudo apt install poppler-utils tesseract-ocr
```

## Browser Setup for Web Crawling

StudyAssistant uses Playwright for advanced web crawling. Install browser dependencies:

```bash
# Install Playwright browsers
playwright install

# Or install specific browsers
playwright install chromium firefox webkit
```

## NLTK Data Setup

Download required NLTK data:

```python
import nltk
nltk.download('punkt')
nltk.download('stopwords')
nltk.download('wordnet')
```

Or run the setup script:

```bash
python -c "import nltk; nltk.download('punkt'); nltk.download('stopwords'); nltk.download('wordnet')"
```

## Verification and Testing

### 1. Run Basic Tests

```bash
# Run the test suite
pytest tests/

# Run specific component tests
pytest tests/test_document_management.py
```

### 2. Test CLI Functionality

```bash
# Test the CLI
python scripts/cli.py --help

# Test basic search functionality
python scripts/cli.py search "machine learning"
```

### 3. Test Web Interface

```bash
# Start the Streamlit web interface
streamlit run app.py
```

Navigate to `http://localhost:8501` to access the web interface.

## Troubleshooting

### Common Issues

#### 1. ImportError: No module named 'playwright'
```bash
pip install playwright
playwright install
```

#### 2. API Key Not Found
- Verify your `.env` file exists and contains valid API keys
- Check that the `.env` file is in the correct directory (project root)
- Ensure no extra spaces around the `=` sign in your `.env` file

#### 3. Memory Issues with Large Datasets
- Increase your system's virtual memory
- Consider using `faiss-gpu` instead of `faiss-cpu` for GPU acceleration
- Reduce batch sizes in `config.py`

#### 4. Network/Proxy Issues
```bash
# Configure proxy settings if needed
export HTTP_PROXY=http://proxy.company.com:8080
export HTTPS_PROXY=http://proxy.company.com:8080
```

### Getting Help

If you encounter issues:

1. **Check the logs**: Look in the `logs/` directory for error messages
2. **Review the troubleshooting guide**: [User Guide > Troubleshooting](../user-guide/troubleshooting.md)
3. **Submit an issue**: [GitHub Issues](https://github.com/your-org/studyassistant/issues)

## Next Steps

Once installation is complete:

1. **[Quick Start Guide](./quick-start.md)**: Get up and running in 5 minutes
2. **[Configuration Guide](./configuration.md)**: Fine-tune your setup
3. **[First Query](./first-query.md)**: Run your first research query

---

*Installation issues? Our [troubleshooting guide](../user-guide/troubleshooting.md) covers common problems and solutions.*
