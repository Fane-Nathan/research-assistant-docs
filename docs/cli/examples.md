# CLI Examples

This guide provides practical examples of using the StudyAssistant CLI for common research workflows and tasks. Examples are organized by use case and complexity level.

## Quick Start Examples

### Basic Search and Fetch

```bash
# Search for papers on a topic
studyassistant resources search "transformers in NLP"

# Fetch a specific paper
studyassistant resources fetch arxiv:1706.03762

# Search with specific sources
studyassistant resources search "BERT language model" \
  --sources arxiv,semantic_scholar \
  --max-results 20
```

### Configuration Setup

```bash
# Initialize configuration interactively
studyassistant config init --interactive

# Set API credentials
studyassistant config set api.api_key "your-api-key-here"

# Check current configuration
studyassistant config get --all
```

## Research Workflow Examples

### Literature Review Pipeline

Complete workflow for conducting a literature review:

```bash
#!/bin/bash
# literature_review.sh - Automated literature review pipeline

# 1. Define search terms
TOPIC="machine learning interpretability"
DATE_FROM="2020-01-01"
OUTPUT_DIR="./literature_review_$(date +%Y%m%d)"

# Create output directory
mkdir -p "$OUTPUT_DIR"

echo "Starting literature review for: $TOPIC"

# 2. Search multiple sources
echo "Searching ArXiv..."
studyassistant resources search "$TOPIC" \
  --sources arxiv \
  --date-from "$DATE_FROM" \
  --max-results 100 \
  --save-results "$OUTPUT_DIR/arxiv_results.json" \
  --format json

echo "Searching PubMed..."
studyassistant resources search "$TOPIC" \
  --sources pubmed \
  --date-from "$DATE_FROM" \
  --max-results 50 \
  --save-results "$OUTPUT_DIR/pubmed_results.json" \
  --format json

echo "Searching Semantic Scholar..."
studyassistant resources search "$TOPIC" \
  --sources semantic_scholar \
  --date-from "$DATE_FROM" \
  --max-results 75 \
  --save-results "$OUTPUT_DIR/semantic_scholar_results.json" \
  --format json

# 3. Combine and deduplicate results
echo "Processing results..."
studyassistant data import "$OUTPUT_DIR/arxiv_results.json" \
  --format json \
  --skip-duplicates \
  --validate

studyassistant data import "$OUTPUT_DIR/pubmed_results.json" \
  --format json \
  --skip-duplicates \
  --validate

studyassistant data import "$OUTPUT_DIR/semantic_scholar_results.json" \
  --format json \
  --skip-duplicates \
  --validate

# 4. Export combined bibliography
echo "Generating bibliography..."
studyassistant data export \
  --format bibtex \
  --query "$TOPIC" \
  --output-file "$OUTPUT_DIR/bibliography.bib"

# 5. Generate recommendations
echo "Getting recommendations..."
studyassistant query recommend \
  --algorithm hybrid \
  --limit 20 \
  --output "$OUTPUT_DIR/recommendations.json"

echo "Literature review complete! Results saved to: $OUTPUT_DIR"
```

### Paper Analysis Workflow

Detailed analysis of specific papers:

```bash
#!/bin/bash
# analyze_papers.sh - Analyze a list of papers

PAPER_IDS=(
  "arxiv:2106.04554"  # PaLM paper
  "arxiv:2005.14165"  # T5 paper
  "arxiv:1910.13461"  # ELECTRA paper
)

ANALYSIS_DIR="./paper_analysis_$(date +%Y%m%d)"
mkdir -p "$ANALYSIS_DIR"

for paper_id in "${PAPER_IDS[@]}"; do
  echo "Analyzing paper: $paper_id"
  
  # Create directory for this paper
  safe_id=$(echo "$paper_id" | tr ':/' '_')
  paper_dir="$ANALYSIS_DIR/$safe_id"
  mkdir -p "$paper_dir"
  
  # Fetch detailed information
  studyassistant resources fetch "$paper_id" \
    --include-content \
    --include-citations \
    --include-references \
    --output-dir "$paper_dir" \
    --download-pdf \
    --extract-text
  
  # Get related papers
  studyassistant query recommend \
    --based-on "$paper_id" \
    --algorithm content \
    --limit 10 \
    --output "$paper_dir/related_papers.json"
  
  # Search for papers citing this one
  title=$(studyassistant resources fetch "$paper_id" --output json | jq -r '.data.resource.title')
  studyassistant resources search "\"$title\"" \
    --max-results 50 \
    --save-results "$paper_dir/citing_papers.json"
done

echo "Paper analysis complete! Results in: $ANALYSIS_DIR"
```

## Data Management Examples

### Bulk Import and Processing

```bash
# Import from BibTeX file
studyassistant data import bibliography.bib \
  --format bibtex \
  --batch-size 50 \
  --validate \
  --skip-duplicates \
  --progress \
  --error-file import_errors.log

# Import from CSV with custom mapping
studyassistant data import papers.csv \
  --format csv \
  --validate \
  --update-existing \
  --dry-run  # First run to check what would happen

# Process through text pipeline
studyassistant pipeline run text-processing \
  --input ./imported_papers \
  --output ./processed_papers \
  --parallel 8 \
  --checkpoint-interval 300 \
  --resume
```

### Data Export and Backup

```bash
# Export recent papers to CSV
studyassistant data export \
  --format csv \
  --date-range "2024-01-01,2024-12-31" \
  --fields "title,authors,date,doi,abstract" \
  --output-file papers_2024.csv \
  --limit 1000

# Create filtered export
studyassistant data export \
  --format json \
  --query "machine learning AND (computer vision OR NLP)" \
  --include-content \
  --output-file ml_papers_detailed.json

# Full system backup
studyassistant system backup create \
  --compression gzip \
  --encryption \
  --include db,config,indices \
  --storage local
```

## Advanced Query Examples

### Complex Search Queries

```bash
# Semantic search with filters
studyassistant query search "attention mechanisms transformers" \
  --mode semantic \
  --filters '{
    "year": {"gte": 2020},
    "citation_count": {"gte": 10},
    "categories": ["cs.LG", "cs.CL"]
  }' \
  --limit 20 \
  --explain \
  --highlight

# Hybrid search combining multiple modes
studyassistant query search "BERT fine-tuning downstream tasks" \
  --mode hybrid \
  --min-score 0.7 \
  --include-context \
  --output recommendations.json

# Search with temporal focus
studyassistant query search "large language models" \
  --mode semantic \
  --filters '{
    "date_range": {
      "start": "2023-01-01",
      "end": "2024-01-01"
    }
  }' \
  --sort-by date \
  --limit 50
```

### Recommendation Workflows

```bash
# Content-based recommendations from multiple papers
studyassistant query recommend \
  --based-on "arxiv:1706.03762,arxiv:1810.04805,arxiv:2005.14165" \
  --algorithm content \
  --limit 15 \
  --diversity 0.7 \
  --explain \
  --output diverse_recommendations.json

# User profile-based recommendations
studyassistant query recommend \
  --user-profile ./my_research_profile.json \
  --algorithm collaborative \
  --limit 25 \
  --output personalized_recs.json

# Cross-domain recommendations
studyassistant query recommend \
  --based-on "arxiv:2106.04554" \
  --algorithm hybrid \
  --filters '{
    "categories": ["cs.CV", "cs.RO", "stat.ML"]
  }' \
  --limit 10
```

## Pipeline and Processing Examples

### Custom Text Processing Pipeline

```bash
# Run pipeline with custom configuration
cat > custom_pipeline_config.yaml << EOF
text_processing:
  extraction:
    pdf:
      enable_ocr: true
      extract_tables: true
      extract_figures: true
  preprocessing:
    cleaning:
      remove_headers_footers: true
      fix_hyphenation: true
    normalization:
      expand_contractions: true
  enrichment:
    ner:
      confidence_threshold: 0.9
    keywords:
      max_keywords: 30
      algorithms: ["textrank", "yake"]
EOF

studyassistant pipeline run text-processing \
  --config custom_pipeline_config.yaml \
  --input ./raw_documents \
  --output ./processed_documents \
  --stages "extraction,preprocessing,enrichment" \
  --parallel 6 \
  --progress

# Monitor pipeline progress
studyassistant pipeline status --watch --show-logs
```

### Batch Processing with Error Handling

```bash
#!/bin/bash
# batch_process_with_retry.sh

BATCH_SIZE=20
MAX_RETRIES=3
INPUT_DIR="./papers_to_process"
OUTPUT_DIR="./processed_papers"
ERROR_DIR="./processing_errors"

mkdir -p "$OUTPUT_DIR" "$ERROR_DIR"

# Process in batches with retry logic
find "$INPUT_DIR" -name "*.pdf" | while IFS= read -r file; do
  filename=$(basename "$file" .pdf)
  retry_count=0
  
  while [ $retry_count -lt $MAX_RETRIES ]; do
    echo "Processing $filename (attempt $((retry_count + 1)))"
    
    if studyassistant pipeline run text-processing \
       --input "$file" \
       --output "$OUTPUT_DIR/$filename" \
       --config batch_config.yaml 2>"$ERROR_DIR/$filename.error"; then
      echo "✓ Successfully processed $filename"
      break
    else
      retry_count=$((retry_count + 1))
      echo "✗ Failed to process $filename (attempt $retry_count)"
      
      if [ $retry_count -eq $MAX_RETRIES ]; then
        echo "✗ Max retries reached for $filename"
        mv "$file" "$ERROR_DIR/"
      else
        sleep $((retry_count * 5))  # Exponential backoff
      fi
    fi
  done
done
```

## System Administration Examples

### Monitoring and Maintenance

```bash
# System health check script
#!/bin/bash
# health_check.sh

echo "=== StudyAssistant System Health Check ==="
echo "Date: $(date)"
echo

# Check system status
echo "System Status:"
studyassistant system status --detailed --format table

# Check service logs for errors
echo -e "\nRecent Errors:"
studyassistant system logs \
  --level error \
  --since "1 hour ago" \
  --tail 20

# Check index health
echo -e "\nIndex Status:"
studyassistant data index status

# Check recent activity
echo -e "\nRecent Activity:"
studyassistant resources search "" \
  --max-results 1 \
  --output json | \
  jq '.metadata.total_documents' | \
  xargs -I {} echo "Total documents indexed: {}"

# Performance metrics
echo -e "\nPerformance Metrics:"
studyassistant system status --format json | \
  jq '.performance | {
    avg_response_time: .avg_response_time,
    cache_hit_rate: .cache_hit_rate,
    active_connections: .active_connections
  }'
```

### Database Maintenance

```bash
# Database optimization script
#!/bin/bash
# db_maintenance.sh

echo "Starting database maintenance..."

# Create backup before maintenance
echo "Creating backup..."
backup_id=$(studyassistant system backup create \
  --compression gzip \
  --include db \
  --output json | jq -r '.backup_id')

echo "Backup created: $backup_id"

# Optimize indices
echo "Optimizing search indices..."
studyassistant data index optimize --progress

# Update statistics
echo "Updating database statistics..."
studyassistant data index update --background

# Cleanup old logs
echo "Cleaning up old logs..."
studyassistant system logs --cleanup --older-than "30 days"

echo "Database maintenance complete!"
```

## Integration Examples

### GitHub Actions Workflow

```yaml
# .github/workflows/research_update.yml
name: Daily Research Update

on:
  schedule:
    - cron: '0 9 * * *'  # Daily at 9 AM UTC
  workflow_dispatch:

jobs:
  research_update:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout repository
      uses: actions/checkout@v3
    
    - name: Setup Python
      uses: actions/setup-python@v4
      with:
        python-version: '3.9'
    
    - name: Install StudyAssistant CLI
      run: pip install studyassistant-cli
    
    - name: Configure StudyAssistant
      env:
        STUDYASSISTANT_API_KEY: ${{ secrets.STUDYASSISTANT_API_KEY }}
      run: |
        studyassistant config set api.api_key "$STUDYASSISTANT_API_KEY"
    
    - name: Search for new papers
      run: |
        studyassistant resources search "machine learning" \
          --date-from $(date -d '1 day ago' '+%Y-%m-%d') \
          --sources arxiv \
          --max-results 20 \
          --save-results daily_papers.json
    
    - name: Generate report
      run: |
        echo "# Daily Research Update - $(date)" > daily_report.md
        echo "" >> daily_report.md
        studyassistant resources search "machine learning" \
          --date-from $(date -d '1 day ago' '+%Y-%m-%d') \
          --format table >> daily_report.md
    
    - name: Commit results
      run: |
        git config --local user.email "action@github.com"
        git config --local user.name "GitHub Action"
        git add daily_papers.json daily_report.md
        git commit -m "Daily research update - $(date +%Y-%m-%d)" || exit 0
        git push
```

### Cron Job Scripts

```bash
# Add to crontab with: crontab -e
# 0 2 * * * /home/user/scripts/nightly_index_update.sh
# 0 8 * * 1 /home/user/scripts/weekly_recommendations.sh

# nightly_index_update.sh
#!/bin/bash
cd /home/user/studyassistant
source venv/bin/activate

# Update search index
studyassistant data index update --background

# Generate daily statistics
studyassistant system status --format json > "stats/daily_$(date +%Y%m%d).json"

# weekly_recommendations.sh
#!/bin/bash
cd /home/user/studyassistant
source venv/bin/activate

# Generate weekly recommendations
studyassistant query recommend \
  --algorithm hybrid \
  --limit 50 \
  --output "recommendations/weekly_$(date +%Y%m%d).json"

# Email report (requires mail command)
studyassistant query recommend \
  --algorithm hybrid \
  --limit 10 \
  --format table | \
  mail -s "Weekly Research Recommendations" user@example.com
```

## Scripting Best Practices

### Error Handling and Logging

```bash
#!/bin/bash
# robust_script.sh - Example with proper error handling

set -euo pipefail  # Exit on error, undefined vars, pipe failures

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_FILE="$SCRIPT_DIR/script.log"
TEMP_DIR=$(mktemp -d)

# Cleanup function
cleanup() {
  rm -rf "$TEMP_DIR"
}
trap cleanup EXIT

# Logging function
log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" | tee -a "$LOG_FILE"
}

# Error handling function
handle_error() {
  log "ERROR: Command failed with exit code $1"
  log "ERROR: Line $2"
  log "ERROR: Command: $3"
  exit 1
}
trap 'handle_error $? $LINENO "$BASH_COMMAND"' ERR

# Main script logic
log "Starting research data update"

# Check system status first
if ! studyassistant system status --format json | jq -e '.healthy' > /dev/null; then
  log "ERROR: System is not healthy, aborting"
  exit 1
fi

# Perform operations with error checking
log "Searching for new papers..."
studyassistant resources search "deep learning" \
  --date-from "$(date -d '1 week ago' '+%Y-%m-%d')" \
  --max-results 100 \
  --save-results "$TEMP_DIR/new_papers.json"

log "Importing new papers..."
studyassistant data import "$TEMP_DIR/new_papers.json" \
  --format json \
  --skip-duplicates \
  --error-file "$TEMP_DIR/import_errors.log"

if [ -s "$TEMP_DIR/import_errors.log" ]; then
  log "WARNING: Some import errors occurred:"
  cat "$TEMP_DIR/import_errors.log" | tee -a "$LOG_FILE"
fi

log "Update completed successfully"
```

### Configuration Management

```bash
# config_profiles.sh - Manage multiple configuration profiles

# Development profile
studyassistant config set --profile development api.base_url "http://localhost:8000"
studyassistant config set --profile development output.verbose true
studyassistant config set --profile development data.batch_size 10

# Production profile
studyassistant config set --profile production api.base_url "https://api.studyassistant.com"
studyassistant config set --profile production output.verbose false
studyassistant config set --profile production data.batch_size 100

# Research profile for large-scale operations
studyassistant config set --profile research data.parallel_workers 16
studyassistant config set --profile research api.timeout 120
studyassistant config set --profile research output.format json

# Use specific profile
export STUDYASSISTANT_PROFILE=research
studyassistant resources search "transformers" --max-results 1000
```

## Performance Optimization Examples

### Parallel Processing

```bash
# parallel_search.sh - Search multiple topics in parallel

topics=(
  "machine learning"
  "deep learning"
  "natural language processing"
  "computer vision"
  "reinforcement learning"
)

# Function to search a single topic
search_topic() {
  local topic="$1"
  local safe_topic=$(echo "$topic" | tr ' ' '_')
  
  echo "Searching: $topic"
  studyassistant resources search "$topic" \
    --max-results 50 \
    --save-results "results_${safe_topic}.json" \
    --format json
  
  echo "Completed: $topic"
}

# Export function for parallel execution
export -f search_topic

# Run searches in parallel
printf '%s\n' "${topics[@]}" | xargs -n 1 -P 5 -I {} bash -c 'search_topic "$@"' _ {}

echo "All searches completed!"
```

### Batch Operations with Progress Tracking

```bash
# batch_with_progress.sh

total_files=$(find ./papers -name "*.pdf" | wc -l)
processed=0

find ./papers -name "*.pdf" | while IFS= read -r file; do
  processed=$((processed + 1))
  percentage=$((processed * 100 / total_files))
  
  echo "Processing file $processed/$total_files ($percentage%): $(basename "$file")"
  
  studyassistant pipeline run text-processing \
    --input "$file" \
    --output "./processed/$(basename "$file" .pdf)" \
    --quiet
  
  # Update progress bar
  printf "\rProgress: ["
  for ((i=0; i<50; i++)); do
    if [ $((i * 2)) -lt $percentage ]; then
      printf "="
    else
      printf " "
    fi
  done
  printf "] %d%%" $percentage
done

echo -e "\nBatch processing complete!"
```

## Troubleshooting Examples

### Debug and Diagnostic Scripts

```bash
# diagnose.sh - Comprehensive diagnostic script

echo "StudyAssistant Diagnostic Report"
echo "================================"
echo "Generated: $(date)"
echo

# System information
echo "System Information:"
echo "- OS: $(uname -s)"
echo "- Architecture: $(uname -m)"
echo "- Python: $(python3 --version 2>&1)"
echo "- CLI Version: $(studyassistant --version 2>&1)"
echo

# Configuration check
echo "Configuration:"
studyassistant config validate
echo

# Connectivity test
echo "Connectivity Test:"
if studyassistant system status --quiet; then
  echo "✓ API connectivity: OK"
else
  echo "✗ API connectivity: FAILED"
fi

# Authentication test
echo "Authentication Test:"
if studyassistant config get api.api_key > /dev/null 2>&1; then
  echo "✓ API key configured"
  if studyassistant resources search "test" --max-results 1 --quiet > /dev/null 2>&1; then
    echo "✓ Authentication: OK"
  else
    echo "✗ Authentication: FAILED"
  fi
else
  echo "✗ API key not configured"
fi

# Recent errors
echo "Recent Errors (last 24 hours):"
studyassistant system logs \
  --level error \
  --since "24 hours ago" \
  --tail 10 2>/dev/null || echo "No log access or no errors found"
```

### Performance Testing

```bash
# performance_test.sh

echo "Performance Test Suite"
echo "====================="

# Test search performance
echo "Testing search performance..."
start_time=$(date +%s.%N)
studyassistant resources search "machine learning" --max-results 10 --quiet
end_time=$(date +%s.%N)
search_time=$(echo "$end_time - $start_time" | bc)
echo "Search time: ${search_time}s"

# Test fetch performance
echo "Testing fetch performance..."
start_time=$(date +%s.%N)
studyassistant resources fetch arxiv:1706.03762 --quiet
end_time=$(date +%s.%N)
fetch_time=$(echo "$end_time - $start_time" | bc)
echo "Fetch time: ${search_time}s"

# Memory usage test
echo "Memory usage during operations:"
studyassistant resources search "deep learning" --max-results 100 &
search_pid=$!
sleep 2
ps -o pid,vsz,rss,comm $search_pid 2>/dev/null || echo "Process completed"
wait $search_pid
```

## See Also

- [CLI Options Reference](options.md)
- [Configuration Guide](../getting-started/configuration.md)
- [API Documentation](../api/)
- [Troubleshooting Guide](../troubleshooting/)
