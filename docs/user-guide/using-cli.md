# Using the CLI

The StudyAssistant command-line interface provides powerful tools for academic research, enabling you to query academic resources, manage data sources, and perform advanced research operations directly from your terminal.

## Overview

The CLI is built with Python's Click framework and offers a comprehensive set of commands for:
- Querying academic databases
- Managing local document collections
- Configuring system parameters
- Monitoring system performance
- Batch processing research tasks

## Basic Usage

### Quick Query

Perform a simple academic search:

```bash
studyassistant query "machine learning in healthcare"
```

### Interactive Mode

Launch the interactive CLI for multi-step operations:

```bash
studyassistant interactive
```

### Help System

Get help for any command:

```bash
studyassistant --help
studyassistant query --help
```

## Core Commands

### Query Command

The `query` command is the primary interface for academic searches:

```bash
# Basic query
studyassistant query "quantum computing algorithms"

# Query with filters
studyassistant query "neural networks" --year-range 2020-2024 --max-results 50

# Query specific sources
studyassistant query "climate change" --sources arxiv,pubmed

# Save results to file
studyassistant query "AI ethics" --output results.json
```

**Query Options:**
- `--year-range`: Filter by publication year (e.g., `2020-2024`)
- `--max-results`: Maximum number of results (default: 20)
- `--sources`: Comma-separated list of sources (`arxiv`, `pubmed`, `semantic_scholar`)
- `--format`: Output format (`json`, `markdown`, `csv`)
- `--output`: Save results to file

### Data Management

#### Add Documents

```bash
# Add PDF documents
studyassistant add-docs /path/to/papers/*.pdf

# Add from URL
studyassistant add-url https://arxiv.org/pdf/2301.00001.pdf

# Add entire directory
studyassistant add-directory /research/papers --recursive
```

#### List Documents

```bash
# List all documents
studyassistant list-docs

# Filter by keywords
studyassistant list-docs --filter "machine learning"

# Show document details
studyassistant list-docs --verbose
```

#### Remove Documents

```bash
# Remove by ID
studyassistant remove-doc doc_12345

# Remove by pattern
studyassistant remove-docs --pattern "temp_*"

# Clean up orphaned files
studyassistant cleanup
```

### Configuration Management

#### View Configuration

```bash
# Show current configuration
studyassistant config show

# Show specific section
studyassistant config show --section llm
```

#### Update Configuration

```bash
# Set API key
studyassistant config set openai.api_key YOUR_API_KEY

# Update search parameters
studyassistant config set search.max_results 100

# Enable debug mode
studyassistant config set system.debug true
```

#### Reset Configuration

```bash
# Reset to defaults
studyassistant config reset

# Reset specific section
studyassistant config reset --section embedding
```

### System Operations

#### Status Check

```bash
# System health check
studyassistant status

# Detailed diagnostics
studyassistant status --verbose

# Check specific components
studyassistant status --component vector_db
```

#### Performance Monitoring

```bash
# Show system metrics
studyassistant metrics

# Monitor in real-time
studyassistant monitor --interval 5

# Performance report
studyassistant report --period 7d
```

## Advanced Usage

### Batch Operations

#### Batch Queries

Process multiple queries from a file:

```bash
# queries.txt contains one query per line
studyassistant batch-query queries.txt --output-dir results/
```

#### Parallel Processing

```bash
# Process with multiple workers
studyassistant query "AI research" --parallel --workers 4

# Batch processing with parallelization
studyassistant batch-query queries.txt --parallel --workers 8
```

### Pipeline Operations

#### Research Pipeline

Execute a complete research pipeline:

```bash
studyassistant pipeline run research_pipeline.yaml
```

Example pipeline configuration (`research_pipeline.yaml`):

```yaml
name: "AI Ethics Research Pipeline"
steps:
  - name: "initial_search"
    type: "query"
    params:
      query: "artificial intelligence ethics"
      sources: ["arxiv", "pubmed"]
      max_results: 100
  
  - name: "filter_recent"
    type: "filter"
    params:
      year_range: "2022-2024"
      min_citations: 5
  
  - name: "extract_concepts"
    type: "analyze"
    params:
      extract_keywords: true
      generate_summary: true
  
  - name: "export_results"
    type: "export"
    params:
      format: "markdown"
      output: "ai_ethics_research.md"
```

### Custom Scripts

#### Python Script Integration

```bash
# Execute custom research script
studyassistant script run analysis.py --args "topic=ML,years=2023"

# Run with environment variables
studyassistant script run --env ENV=production analysis.py
```

#### Shell Integration

```bash
# Export to environment
eval $(studyassistant env export)

# Use in shell scripts
RESULTS=$(studyassistant query "quantum AI" --format json)
echo $RESULTS | jq '.results[0].title'
```

## Output Formats

### JSON Output

```bash
studyassistant query "neural networks" --format json
```

```json
{
  "query": "neural networks",
  "total_results": 25,
  "results": [
    {
      "id": "arxiv:2301.00001",
      "title": "Advanced Neural Network Architectures",
      "authors": ["Smith, J.", "Doe, A."],
      "abstract": "This paper presents...",
      "url": "https://arxiv.org/abs/2301.00001",
      "published": "2023-01-01",
      "citations": 42,
      "relevance_score": 0.95
    }
  ]
}
```

### Markdown Output

```bash
studyassistant query "deep learning" --format markdown --output research.md
```

### CSV Output

```bash
studyassistant query "computer vision" --format csv --output papers.csv
```

## Environment Variables

### Configuration

```bash
export STUDYASSISTANT_CONFIG_PATH=/custom/config.yaml
export STUDYASSISTANT_DATA_DIR=/data/research
export STUDYASSISTANT_CACHE_DIR=/tmp/studyassistant
```

### API Keys

```bash
export OPENAI_API_KEY=your_openai_key
export ANTHROPIC_API_KEY=your_anthropic_key
export PINECONE_API_KEY=your_pinecone_key
```

### Debug Settings

```bash
export STUDYASSISTANT_DEBUG=true
export STUDYASSISTANT_LOG_LEVEL=DEBUG
export STUDYASSISTANT_PROFILE=true
```

## Shell Completion

### Bash

```bash
# Add to ~/.bashrc
eval "$(_STUDYASSISTANT_COMPLETE=bash_source studyassistant)"
```

### Zsh

```bash
# Add to ~/.zshrc
eval "$(_STUDYASSISTANT_COMPLETE=zsh_source studyassistant)"
```

### Fish

```bash
# Add to ~/.config/fish/config.fish
eval (env _STUDYASSISTANT_COMPLETE=fish_source studyassistant)
```

## Common Workflows

### Literature Review Workflow

```bash
# 1. Initial broad search
studyassistant query "machine learning healthcare" --max-results 200 --output initial.json

# 2. Filter by recent publications
studyassistant filter initial.json --year-range 2022-2024 --output recent.json

# 3. Extract key concepts
studyassistant analyze recent.json --extract-keywords --output analysis.json

# 4. Generate summary report
studyassistant report analysis.json --format markdown --output literature_review.md
```

### Paper Discovery Workflow

```bash
# 1. Query multiple sources
studyassistant query "reinforcement learning" --sources all --max-results 100

# 2. Find related papers
studyassistant related --paper-id arxiv:2301.00001 --max-related 20

# 3. Build citation network
studyassistant citations --paper-id arxiv:2301.00001 --depth 2

# 4. Visualize network
studyassistant visualize citations.json --output network.html
```

### Data Collection Workflow

```bash
# 1. Set up monitoring for new papers
studyassistant monitor setup --query "quantum machine learning" --frequency daily

# 2. Collect from multiple sources
studyassistant collect --sources arxiv,pubmed --query "AI safety" --since yesterday

# 3. Process and store
studyassistant process collected_papers/ --extract-text --generate-embeddings

# 4. Update search index
studyassistant index rebuild
```

## Troubleshooting

### Common Issues

#### Connection Problems

```bash
# Test API connectivity
studyassistant test-connection --service arxiv
studyassistant test-connection --service openai

# Check network configuration
studyassistant config show --section network
```

#### Performance Issues

```bash
# Check system resources
studyassistant status --resources

# Clear cache
studyassistant cache clear

# Optimize database
studyassistant optimize --vacuum
```

#### Configuration Problems

```bash
# Validate configuration
studyassistant config validate

# Reset corrupted config
studyassistant config reset --force

# Backup and restore
studyassistant config backup config_backup.yaml
studyassistant config restore config_backup.yaml
```

### Debug Mode

Enable verbose debugging:

```bash
studyassistant --debug query "test query"
studyassistant --verbose --log-level DEBUG status
```

### Getting Help

- Use `--help` with any command for detailed usage information
- Check the log files in `~/.studyassistant/logs/` for error details
- Visit the [GitHub Issues](https://github.com/StudyAssistant/issues) page for known problems
- Join the [Discord community](https://discord.gg/studyassistant) for support

## Performance Tips

1. **Use parallel processing** for batch operations with `--parallel`
2. **Cache frequently used queries** with `--cache-ttl`
3. **Optimize search parameters** to reduce API calls
4. **Use filters** to narrow results before processing
5. **Monitor resource usage** with `studyassistant status --resources`

## Next Steps

- Explore the [Web Interface](web-interface.md) for visual research workflows
- Learn about [Data Sources](data-sources.md) configuration
- Master [Query Techniques](query-techniques.md) for better results
- Set up [Troubleshooting](troubleshooting.md) for common issues
