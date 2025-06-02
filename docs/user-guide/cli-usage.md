# CLI Usage Guide

The StudyAssistant Command Line Interface (CLI) provides powerful, scriptable access to all system functionality. Designed for power users, researchers who prefer terminal workflows, and automation scenarios, the CLI offers comprehensive control over every aspect of the research assistant.

## CLI Overview

The StudyAssistant CLI is accessed through the main script:
```bash
python scripts/cli.py [command] [options]
```

### Getting Help

```bash
# General help
python scripts/cli.py --help

# Command-specific help
python scripts/cli.py query --help
python scripts/cli.py config --help
```

## Core Commands

### 1. Query Command

The primary research function:

#### Basic Usage
```bash
python scripts/cli.py query "What are the latest developments in transformer architecture?"
```

#### Advanced Query Options
```bash
# Specify number of results
python scripts/cli.py query "your question" --max-results 15

# Choose LLM provider
python scripts/cli.py query "your question" --llm-provider groq

# Set search mode
python scripts/cli.py query "your question" --search-mode semantic

# Adjust hybrid search weights
python scripts/cli.py query "your question" --hybrid-weights 0.6 0.4

# Enable verbose output
python scripts/cli.py query "your question" --verbose

# Save results to file
python scripts/cli.py query "your question" --output results.json

# Specify output format
python scripts/cli.py query "your question" --format json --output research.json
```

#### Query Examples
```bash
# Computer Science Research
python scripts/cli.py query "How do attention mechanisms improve neural machine translation?" --max-results 20

# Biomedical Research  
python scripts/cli.py query "What are the latest CRISPR gene editing techniques?" --llm-provider gemini

# Social Sciences
python scripts/cli.py query "How does remote work affect employee productivity?" --search-mode hybrid
```

### 2. Configuration Commands

#### View Current Configuration
```bash
# Show all configuration settings
python scripts/cli.py config --show

# Show specific configuration section
python scripts/cli.py config --show --section llm
python scripts/cli.py config --show --section search
python scripts/cli.py config --show --section data
```

#### Test Configuration
```bash
# Validate all configuration
python scripts/cli.py config --validate

# Test API connections
python scripts/cli.py config --test-apis

# Test specific API
python scripts/cli.py config --test-api gemini
python scripts/cli.py config --test-api groq
```

#### Update Configuration
```bash
# Set configuration values
python scripts/cli.py config --set llm.default_provider=groq
python scripts/cli.py config --set search.max_results=25
python scripts/cli.py config --set embedding.batch_size=50

# Reset to defaults
python scripts/cli.py config --reset
python scripts/cli.py config --reset --section search
```

### 3. Data Management Commands

#### Update Data Sources
```bash
# Update all data sources
python scripts/cli.py update-sources

# Update specific source
python scripts/cli.py update-sources --source arxiv
python scripts/cli.py update-sources --source web

# Update with specific parameters
python scripts/cli.py update-sources --arxiv-categories "cs.AI,cs.CL" --max-papers 1000
```

#### Manage Document Index
```bash
# Rebuild search index
python scripts/cli.py index --rebuild

# Update index incrementally
python scripts/cli.py index --update

# Optimize index
python scripts/cli.py index --optimize

# Show index statistics
python scripts/cli.py index --stats
```

#### Process Local Documents
```bash
# Add documents to index
python scripts/cli.py add-documents /path/to/documents/

# Add specific file types
python scripts/cli.py add-documents /path/to/docs/ --extensions pdf,txt,md

# Process with specific settings
python scripts/cli.py add-documents /path/to/docs/ --chunk-size 1000 --overlap 200
```

### 4. System Status Commands

#### Health Check
```bash
# System status overview
python scripts/cli.py status

# Detailed system information
python scripts/cli.py status --detailed

# Check specific components
python scripts/cli.py status --component embedding
python scripts/cli.py status --component search
python scripts/cli.py status --component llm
```

#### Performance Monitoring
```bash
# Show system metrics
python scripts/cli.py metrics

# Performance profiling
python scripts/cli.py metrics --profile

# Resource usage
python scripts/cli.py metrics --resources
```

## Advanced CLI Features

### 1. Batch Processing

#### Batch Queries
```bash
# Process queries from file
python scripts/cli.py batch-query --input queries.txt --output results/

# Batch with custom settings
python scripts/cli.py batch-query --input queries.txt --max-results 10 --llm-provider gemini
```

Sample `queries.txt`:
```
What is machine learning?
How do neural networks work?
What are the applications of deep learning?
Explain reinforcement learning algorithms
```

#### Batch Document Processing
```bash
# Process multiple document directories
python scripts/cli.py batch-add --input-list directories.txt

# Parallel processing
python scripts/cli.py batch-add --input-list dirs.txt --parallel --workers 4
```

### 2. Export and Import

#### Export Data
```bash
# Export search results
python scripts/cli.py export --type results --query "your question" --format json

# Export document index
python scripts/cli.py export --type index --output index_backup.json

# Export configuration
python scripts/cli.py export --type config --output my_config.yaml
```

#### Import Data
```bash
# Import documents
python scripts/cli.py import --type documents --input document_export.json

# Import configuration
python scripts/cli.py import --type config --input saved_config.yaml

# Import pre-built index
python scripts/cli.py import --type index --input index_backup.json
```

### 3. Automation and Scripting

#### Scheduled Updates
```bash
# Create update script for cron jobs
#!/bin/bash
cd /path/to/studyassistant
python scripts/cli.py update-sources --quiet
python scripts/cli.py index --update --quiet
```

#### Research Automation
```bash
# Automated research workflow
python scripts/cli.py query "research question" \
  --max-results 20 \
  --output "results_$(date +%Y%m%d).json" \
  --format json \
  --quiet
```

#### Integration Scripts
```bash
# Integration with other tools
python scripts/cli.py query "$1" --format json | jq '.sources[].title'
```

## Output Formats

### 1. JSON Format
```bash
python scripts/cli.py query "your question" --format json --output results.json
```

Sample JSON output:
```json
{
  "query": "What is machine learning?",
  "timestamp": "2024-01-15T10:30:00Z",
  "processing_time": 8.3,
  "ai_response": "Machine learning is a subset of artificial intelligence...",
  "sources": [
    {
      "title": "Machine Learning: A Probabilistic Perspective",
      "authors": ["Kevin P. Murphy"],
      "year": 2012,
      "relevance_score": 0.95,
      "url": "https://example.com/paper.pdf",
      "abstract": "This book provides a comprehensive...",
      "citations": 15420
    }
  ],
  "metadata": {
    "search_mode": "hybrid",
    "llm_provider": "gemini",
    "sources_found": 15,
    "sources_returned": 10
  }
}
```

### 2. CSV Format
```bash
python scripts/cli.py query "your question" --format csv --output results.csv
```

### 3. Plain Text Format
```bash
python scripts/cli.py query "your question" --format text --output results.txt
```

### 4. BibTeX Format
```bash
python scripts/cli.py query "your question" --format bibtex --output references.bib
```

## Environment Variables

Override CLI behavior with environment variables:

```bash
# Set default LLM provider
export STUDYASSISTANT_LLM_PROVIDER=groq

# Set default output format
export STUDYASSISTANT_OUTPUT_FORMAT=json

# Enable debug mode
export STUDYASSISTANT_DEBUG=true

# Set custom config file
export STUDYASSISTANT_CONFIG=/path/to/custom/config.py
```

## CLI Configuration File

Create `~/.studyassistant/cli.yaml` for persistent CLI preferences:

```yaml
# Default CLI settings
defaults:
  max_results: 15
  llm_provider: gemini
  search_mode: hybrid
  output_format: json
  verbose: false

# Output preferences
output:
  directory: ~/research/results
  timestamp: true
  auto_name: true

# Search preferences
search:
  hybrid_weights: [0.7, 0.3]
  min_relevance: 0.1
  enable_reranking: true

# Performance settings
performance:
  timeout: 60
  retries: 3
  parallel_queries: false
```

## Advanced Scripting Examples

### 1. Research Pipeline Script

```bash
#!/bin/bash
# research_pipeline.sh

TOPIC="$1"
DATE=$(date +%Y%m%d)
OUTPUT_DIR="research_${DATE}"

# Create output directory
mkdir -p "$OUTPUT_DIR"

# Main research query
python scripts/cli.py query "What are the latest developments in $TOPIC?" \
  --max-results 20 \
  --format json \
  --output "$OUTPUT_DIR/main_query.json"

# Follow-up queries
python scripts/cli.py query "What are the challenges in $TOPIC?" \
  --max-results 15 \
  --format json \
  --output "$OUTPUT_DIR/challenges.json"

python scripts/cli.py query "What are future directions for $TOPIC research?" \
  --max-results 15 \
  --format json \
  --output "$OUTPUT_DIR/future_directions.json"

# Generate summary report
python scripts/generate_report.py "$OUTPUT_DIR" --output "$OUTPUT_DIR/research_report.pdf"

echo "Research completed. Results in $OUTPUT_DIR/"
```

### 2. Daily Research Updates

```bash
#!/bin/bash
# daily_updates.sh

# Update data sources
python scripts/cli.py update-sources --quiet

# Check for new papers in key areas
TOPICS=("machine learning" "natural language processing" "computer vision")

for topic in "${TOPICS[@]}"; do
  python scripts/cli.py query "recent advances in $topic" \
    --max-results 5 \
    --format json \
    --output "daily_updates/$(date +%Y%m%d)_${topic// /_}.json" \
    --quiet
done

# Send summary email (requires additional email script)
python scripts/send_daily_summary.py
```

### 3. Literature Review Assistant

```bash
#!/bin/bash
# literature_review.sh

RESEARCH_QUESTION="$1"
OUTPUT_PREFIX="literature_review"

# Comprehensive search
python scripts/cli.py query "$RESEARCH_QUESTION" \
  --max-results 50 \
  --format json \
  --output "${OUTPUT_PREFIX}_comprehensive.json"

# Methodology focus
python scripts/cli.py query "methodologies for $RESEARCH_QUESTION" \
  --max-results 30 \
  --format json \
  --output "${OUTPUT_PREFIX}_methods.json"

# Recent developments
python scripts/cli.py query "recent research on $RESEARCH_QUESTION" \
  --max-results 25 \
  --format json \
  --output "${OUTPUT_PREFIX}_recent.json"

# Generate BibTeX
python scripts/cli.py query "$RESEARCH_QUESTION" \
  --max-results 50 \
  --format bibtex \
  --output "${OUTPUT_PREFIX}_references.bib"

echo "Literature review data collected. Files:"
ls -la ${OUTPUT_PREFIX}_*
```

## Performance Optimization

### 1. Faster Queries
```bash
# Use semantic search only for speed
python scripts/cli.py query "your question" --search-mode semantic

# Reduce result count
python scripts/cli.py query "your question" --max-results 5

# Skip re-ranking
python scripts/cli.py query "your question" --no-rerank
```

### 2. Batch Optimization
```bash
# Parallel batch processing
python scripts/cli.py batch-query --input queries.txt --parallel --workers 4

# Use faster LLM provider for batch jobs
python scripts/cli.py batch-query --input queries.txt --llm-provider groq
```

### 3. Resource Management
```bash
# Limit memory usage
python scripts/cli.py query "your question" --max-memory 4GB

# Set timeout limits
python scripts/cli.py query "your question" --timeout 30
```

## Error Handling and Debugging

### 1. Debug Mode
```bash
# Enable verbose debugging
python scripts/cli.py query "your question" --debug

# Log to file
python scripts/cli.py query "your question" --log-file debug.log

# Increase log level
python scripts/cli.py query "your question" --log-level DEBUG
```

### 2. Error Recovery
```bash
# Retry on failure
python scripts/cli.py query "your question" --retries 3

# Fallback LLM provider
python scripts/cli.py query "your question" --fallback-llm groq

# Continue on partial failure
python scripts/cli.py batch-query --input queries.txt --continue-on-error
```

### 3. Validation
```bash
# Validate before processing
python scripts/cli.py query "your question" --validate-only

# Dry run mode
python scripts/cli.py update-sources --dry-run

# Check prerequisites
python scripts/cli.py check-requirements
```

## Integration with Other Tools

### 1. Version Control Integration
```bash
# Save query with git commit
python scripts/cli.py query "your question" --output results.json
git add results.json
git commit -m "Research query: your question"
```

### 2. Citation Manager Integration
```bash
# Export to Zotero format
python scripts/cli.py query "your question" --format zotero --output zotero_import.json

# Export to Mendeley format
python scripts/cli.py query "your question" --format mendeley --output mendeley_import.bib
```

### 3. Document Processing Pipeline
```bash
# Process and add to research database
find /path/to/papers -name "*.pdf" | \
  xargs python scripts/cli.py add-documents --batch
```

## Best Practices

### 1. Query Optimization
- **Use specific terminology**: Include field-specific keywords
- **Structure questions clearly**: Well-formed research questions get better results
- **Iterate and refine**: Use initial results to improve subsequent queries

### 2. Automation
- **Use configuration files**: Maintain consistent settings across runs
- **Log everything**: Keep records of automated processes
- **Error handling**: Always include error recovery in scripts

### 3. Performance
- **Batch similar queries**: More efficient than individual requests
- **Use appropriate timeouts**: Balance thoroughness with speed
- **Monitor resource usage**: Especially for large batch jobs

---

**Next Steps**: Master advanced CLI usage with:
- **[Query Techniques](./query-techniques)**: Advanced search strategies
- **[Automation Scripts](../development/automation)**: Building research workflows
- **[API Integration](../api/core-apis)**: Programmatic access to StudyAssistant
