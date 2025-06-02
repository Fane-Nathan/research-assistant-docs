# Quick Start Guide

Get StudyAssistant up and running in under 10 minutes! This guide will take you from installation to your first successful research query.

## Prerequisites

Before we begin, ensure you have:
- **Python 3.8+** installed on your system
- **Git** for cloning the repository
- An **internet connection** for downloading dependencies and accessing APIs

## Step 1: Installation

### Clone the Repository
```bash
git clone https://github.com/Fane-Nathan/Research-Assistant.git
cd Research-Assistant
```

### Install Dependencies
```bash
pip install -r requirements.txt
```

### Verify Installation
```bash
python scripts/cli.py --help
```

You should see the StudyAssistant CLI help menu.

## Step 2: Configuration

### Set Up API Keys
StudyAssistant requires API keys for optimal functionality. Create a `.env` file in the project root:

```bash
# Copy the example environment file
cp .env.example .env
```

Edit the `.env` file with your API keys:

```env
# Required: Google AI API Key for embeddings and LLM
GOOGLE_API_KEY=your_google_api_key_here

# Optional: Additional LLM providers
GROQ_API_KEY=your_groq_api_key_here
DEEPSEEK_API_KEY=your_deepseek_api_key_here

# Optional: Web scraping configuration
PLAYWRIGHT_HEADLESS=true
```

### Get Your Google API Key
1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create a new API key
3. Copy the key to your `.env` file

## Step 3: Your First Query

### Using the Web Interface
Launch the Streamlit web application:

```bash
streamlit run app.py
```

1. Open your browser to `http://localhost:8501`
2. Enter your research question in the text area
3. Click "Get Answer" and wait for the AI-powered response

### Using the Command Line
For power users, try the CLI:

```bash
python scripts/cli.py query "What are the latest developments in transformer architecture?"
```

## Step 4: Understanding the Results

StudyAssistant provides comprehensive responses that include:

- **📝 AI-Generated Answer**: Synthesized response based on retrieved documents
- **📚 Source Documents**: Relevant papers and articles used to generate the answer
- **🔗 Citations**: Direct links to source materials
- **📊 Relevance Scores**: Confidence metrics for retrieved information

## Example Query Walkthrough

Let's try a sample research question:

**Query**: *"How does attention mechanism work in neural networks?"*

**Expected Response Structure**:
```
🤖 AI Answer:
The attention mechanism is a neural network component that allows models to focus on specific parts of input sequences...

📚 Sources Found:
1. "Attention Is All You Need" - Vaswani et al. (2017)
   Relevance: 95%
   
2. "Neural Machine Translation by Jointly Learning to Align and Translate" - Bahdanau et al. (2014)
   Relevance: 87%

3. "Show, Attend and Tell: Neural Image Caption Generation with Visual Attention" - Xu et al. (2015)
   Relevance: 82%
```

## Customizing Your Experience

### Data Sources
By default, StudyAssistant searches:
- arXiv preprints
- Web-scraped academic content
- Uploaded PDF documents

### Search Parameters
Adjust search behavior in the web interface:
- **Number of Results**: Control how many sources to retrieve
- **Search Mode**: Choose between semantic, keyword, or hybrid search
- **LLM Provider**: Select your preferred language model

## Next Steps

Now that you have StudyAssistant running, explore these areas:

### 📖 Learn the Interface
- **[Web Interface Guide](../user-guide/web-interface)**: Master the Streamlit application
- **[CLI Usage](../user-guide/cli-usage)**: Advanced command-line operations

### ⚙️ Advanced Configuration
- **[Configuration Guide](./configuration)**: Detailed setup and customization options
- **[Data Sources](../user-guide/data-sources)**: Adding and managing research sources

### 🔧 Troubleshooting
Having issues? Check our troubleshooting guide:
- **[Common Issues](../user-guide/troubleshooting)**: Solutions to frequent problems
- **[FAQ](../user-guide/faq)**: Frequently asked questions

## Quick Reference Commands

### Essential CLI Commands
```bash
# Basic query
python scripts/cli.py query "your research question"

# Check system status
python scripts/cli.py status

# Update data sources
python scripts/cli.py update-sources

# View configuration
python scripts/cli.py config --show
```

### Web Interface Shortcuts
- **Ctrl+Enter**: Submit query
- **Ctrl+K**: Focus search box
- **Ctrl+R**: Refresh results
- **Ctrl+S**: Save current session

## Getting Help

Need assistance? Here are your options:

- **📖 Documentation**: Browse our comprehensive guides
- **🐛 Issues**: Report bugs on [GitHub Issues](https://github.com/Fane-Nathan/Research-Assistant/issues)
- **💬 Discussions**: Join community discussions
- **📧 Contact**: Reach out to the development team

---

**🎉 Congratulations!** You've successfully set up StudyAssistant and made your first research query. You're now ready to accelerate your research workflow with AI-powered assistance.

**Next recommended read**: [Web Interface Guide](../user-guide/web-interface) to master the full capabilities of StudyAssistant.
