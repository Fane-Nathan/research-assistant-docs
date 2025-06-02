# CLI Options Reference

The StudyAssistant Command Line Interface (CLI) provides comprehensive control over the system through command-line options and flags. This reference covers all available commands, options, and their usage patterns.

## Installation

```bash
pip install studyassistant-cli
```

## Global Options

These options are available for all commands:

### Common Options

| Option | Short | Description | Default |
|--------|-------|-------------|---------|
| `--config` | `-c` | Configuration file path | `~/.studyassistant/config.yaml` |
| `--verbose` | `-v` | Increase verbosity level (can be repeated) | `0` |
| `--quiet` | `-q` | Suppress output except errors | `false` |
| `--help` | `-h` | Show help message | - |
| `--version` | `-V` | Show version information | - |
| `--profile` | `-p` | Use specific configuration profile | `default` |
| `--output` | `-o` | Output format (`json`, `yaml`, `table`, `csv`) | `table` |
| `--no-color` | | Disable colored output | `false` |
| `--log-level` | | Set logging level (`debug`, `info`, `warn`, `error`) | `info` |
| `--log-file` | | Log to file instead of stdout | - |

### Authentication Options

| Option | Description | Default |
|--------|-------------|---------|
| `--api-key` | API key for authentication | From config |
| `--token` | JWT token for authentication | From config |
| `--auth-url` | Authentication server URL | From config |
| `--no-auth` | Skip authentication (for public endpoints) | `false` |

### Connection Options

| Option | Description | Default |
|--------|-------------|---------|
| `--base-url` | Base API URL | `https://api.studyassistant.com` |
| `--timeout` | Request timeout in seconds | `30` |
| `--retries` | Number of retry attempts | `3` |
| `--retry-delay` | Delay between retries in seconds | `1` |
| `--insecure` | Skip SSL certificate verification | `false` |

## Command Structure

```bash
studyassistant <command> <subcommand> [options] [arguments]
```

## Core Commands

### Configuration Management

#### `config` - Configuration Management

**Description:** Manage configuration settings for StudyAssistant.

**Usage:**
```bash
studyassistant config <subcommand> [options]
```

**Subcommands:**

##### `config init`
Initialize configuration file with default settings.

```bash
studyassistant config init [options]

Options:
  --force, -f          Overwrite existing configuration
  --template TEMPLATE  Use configuration template (basic, advanced, development)
  --interactive, -i    Interactive configuration setup
  --output-dir DIR     Configuration directory
```

**Example:**
```bash
# Initialize with interactive setup
studyassistant config init --interactive

# Use advanced template
studyassistant config init --template advanced --force
```

##### `config get`
Get configuration values.

```bash
studyassistant config get [key] [options]

Options:
  --profile PROFILE    Configuration profile to use
  --all               Show all configuration values
  --section SECTION   Show specific configuration section
```

**Examples:**
```bash
# Get specific value
studyassistant config get database.host

# Get all values
studyassistant config get --all

# Get specific section
studyassistant config get --section database
```

##### `config set`
Set configuration values.

```bash
studyassistant config set <key> <value> [options]

Options:
  --profile PROFILE    Configuration profile to use
  --type TYPE         Value type (string, int, float, bool, list)
  --encrypted         Encrypt the value
```

**Examples:**
```bash
# Set string value
studyassistant config set database.host localhost

# Set encrypted password
studyassistant config set database.password mypassword --encrypted

# Set boolean value
studyassistant config set features.caching true --type bool
```

##### `config list`
List available configuration profiles and sections.

```bash
studyassistant config list [options]

Options:
  --profiles          List available profiles
  --sections          List configuration sections
  --keys              List all configuration keys
```

##### `config validate`
Validate configuration file syntax and values.

```bash
studyassistant config validate [config-file] [options]

Options:
  --strict            Strict validation mode
  --fix               Attempt to fix common issues
  --schema-file FILE  Custom validation schema
```

### Resource Management

#### `resources` - Resource Operations

**Description:** Search, fetch, and manage academic resources.

**Usage:**
```bash
studyassistant resources <subcommand> [options]
```

**Subcommands:**

##### `resources search`
Search for academic resources across multiple sources.

```bash
studyassistant resources search <query> [options]

Options:
  --sources SOURCES       Comma-separated list of sources (arxiv,pubmed,semantic_scholar)
  --max-results N         Maximum number of results
  --date-from DATE        Start date filter (YYYY-MM-DD)
  --date-to DATE          End date filter (YYYY-MM-DD)
  --categories CATS       Filter by categories
  --sort-by FIELD         Sort by field (relevance, date, citations)
  --include-abstracts     Include abstracts in results
  --save-results FILE     Save results to file
  --format FORMAT         Output format (json, csv, bibtex)
```

**Examples:**
```bash
# Basic search
studyassistant resources search "machine learning transformers"

# Search with filters
studyassistant resources search "deep learning" \
  --sources arxiv,pubmed \
  --date-from 2023-01-01 \
  --max-results 50

# Save results to file
studyassistant resources search "NLP" \
  --save-results nlp_papers.json \
  --format json
```

##### `resources fetch`
Fetch detailed information about specific resources.

```bash
studyassistant resources fetch <resource-id> [options]

Options:
  --include-content       Include full text content
  --include-citations     Include citation information
  --include-references    Include reference list
  --download-pdf          Download PDF file
  --output-dir DIR        Output directory for downloads
  --extract-text          Extract text from PDF
  --extract-tables        Extract tables from content
```

**Examples:**
```bash
# Fetch basic information
studyassistant resources fetch arxiv:2301.12345

# Fetch with full content
studyassistant resources fetch arxiv:2301.12345 \
  --include-content \
  --download-pdf \
  --output-dir ./downloads
```

##### `resources batch-fetch`
Fetch multiple resources from a list.

```bash
studyassistant resources batch-fetch <resource-list> [options]

Options:
  --input-file FILE       Input file with resource IDs
  --input-format FORMAT   Input format (txt, json, csv, bibtex)
  --parallel N            Number of parallel downloads
  --continue-on-error     Continue processing on individual errors
  --output-dir DIR        Output directory
  --progress              Show progress bar
```

**Examples:**
```bash
# Batch fetch from file
studyassistant resources batch-fetch \
  --input-file paper_ids.txt \
  --parallel 5 \
  --progress

# Batch fetch from JSON
studyassistant resources batch-fetch \
  --input-file resources.json \
  --input-format json \
  --output-dir ./batch_downloads
```

### Data Management

#### `data` - Data Operations

**Description:** Manage data storage, indexing, and processing operations.

**Usage:**
```bash
studyassistant data <subcommand> [options]
```

**Subcommands:**

##### `data import`
Import data from various sources and formats.

```bash
studyassistant data import <source> [options]

Options:
  --format FORMAT         Input format (json, csv, bibtex, xml)
  --batch-size N          Processing batch size
  --validate              Validate data before import
  --skip-duplicates       Skip duplicate entries
  --update-existing       Update existing entries
  --dry-run               Show what would be imported without importing
  --progress              Show progress information
  --error-file FILE       Log errors to file
```

**Examples:**
```bash
# Import from JSON file
studyassistant data import papers.json --format json --validate

# Import with duplicate handling
studyassistant data import bibliography.bib \
  --format bibtex \
  --skip-duplicates \
  --progress
```

##### `data export`
Export data in various formats.

```bash
studyassistant data export [options]

Options:
  --format FORMAT         Output format (json, csv, bibtex, xml)
  --query QUERY           Filter query
  --fields FIELDS         Comma-separated list of fields to export
  --output-file FILE      Output file path
  --include-content       Include full content
  --date-range RANGE      Date range filter
  --limit N               Maximum number of records
```

**Examples:**
```bash
# Export all data to JSON
studyassistant data export --format json --output-file export.json

# Export filtered data
studyassistant data export \
  --format csv \
  --query "machine learning" \
  --fields "title,authors,date" \
  --output-file ml_papers.csv
```

##### `data index`
Manage search indices and embeddings.

```bash
studyassistant data index <operation> [options]

Operations:
  rebuild                 Rebuild search index
  update                  Update index incrementally
  optimize                Optimize index performance
  status                  Show index status

Options:
  --index-name NAME       Specific index to operate on
  --force                 Force operation without confirmation
  --background            Run operation in background
  --progress              Show progress information
```

**Examples:**
```bash
# Rebuild search index
studyassistant data index rebuild --progress

# Update specific index
studyassistant data index update --index-name documents
```

### Pipeline Operations

#### `pipeline` - Processing Pipeline Management

**Description:** Manage and monitor data processing pipelines.

**Usage:**
```bash
studyassistant pipeline <subcommand> [options]
```

**Subcommands:**

##### `pipeline run`
Execute processing pipeline on data.

```bash
studyassistant pipeline run <pipeline-name> [options]

Options:
  --input INPUT           Input data source
  --output OUTPUT         Output destination
  --config CONFIG         Pipeline configuration file
  --stages STAGES         Comma-separated list of stages to run
  --skip-stages STAGES    Stages to skip
  --parallel N            Number of parallel workers
  --resume                Resume from last checkpoint
  --checkpoint-interval N Checkpoint interval in seconds
```

**Examples:**
```bash
# Run full pipeline
studyassistant pipeline run text-processing \
  --input ./raw_papers \
  --output ./processed_papers \
  --parallel 4

# Run specific stages
studyassistant pipeline run text-processing \
  --stages extraction,preprocessing \
  --resume
```

##### `pipeline status`
Check pipeline execution status.

```bash
studyassistant pipeline status [pipeline-id] [options]

Options:
  --watch                 Watch status in real-time
  --show-logs             Include log output
  --filter STATUS         Filter by status (running, completed, failed)
```

##### `pipeline list`
List available pipelines and their configurations.

```bash
studyassistant pipeline list [options]

Options:
  --available             Show available pipeline templates
  --running               Show currently running pipelines
  --history               Show pipeline execution history
```

### Analysis and Query

#### `query` - Query and Search Operations

**Description:** Execute queries and retrieve information from the knowledge base.

**Usage:**
```bash
studyassistant query <subcommand> [options]
```

**Subcommands:**

##### `query search`
Search the knowledge base with natural language queries.

```bash
studyassistant query search <query> [options]

Options:
  --mode MODE             Search mode (semantic, keyword, hybrid)
  --limit N               Maximum number of results
  --min-score SCORE       Minimum relevance score
  --filters FILTERS       JSON filter criteria
  --include-context       Include context in results
  --explain               Show search explanation
  --highlight             Highlight matching terms
```

**Examples:**
```bash
# Semantic search
studyassistant query search "attention mechanisms in transformers" \
  --mode semantic \
  --limit 10

# Search with filters
studyassistant query search "deep learning" \
  --filters '{"year": {"gte": 2020}}' \
  --explain
```

##### `query recommend`
Get recommendations based on preferences or content.

```bash
studyassistant query recommend [options]

Options:
  --based-on RESOURCE     Base recommendations on specific resource
  --user-profile PROFILE  Use user profile for recommendations
  --algorithm ALGO        Recommendation algorithm (collaborative, content, hybrid)
  --limit N               Number of recommendations
  --diversity SCORE       Diversity score (0.0-1.0)
  --explain               Explain recommendation reasoning
```

**Examples:**
```bash
# Content-based recommendations
studyassistant query recommend \
  --based-on arxiv:2301.12345 \
  --algorithm content \
  --limit 5

# User profile recommendations
studyassistant query recommend \
  --user-profile research_profile.json \
  --algorithm hybrid
```

### System Operations

#### `system` - System Management

**Description:** Manage system operations, monitoring, and maintenance.

**Usage:**
```bash
studyassistant system <subcommand> [options]
```

**Subcommands:**

##### `system status`
Check system health and status.

```bash
studyassistant system status [options]

Options:
  --detailed              Show detailed status information
  --services              Check specific services
  --format FORMAT         Output format (table, json, yaml)
  --watch                 Monitor status continuously
```

##### `system logs`
View and manage system logs.

```bash
studyassistant system logs [options]

Options:
  --service SERVICE       Show logs for specific service
  --level LEVEL           Filter by log level
  --since TIME            Show logs since timestamp
  --tail N                Show last N lines
  --follow                Follow log output
  --grep PATTERN          Filter logs by pattern
```

**Examples:**
```bash
# View recent logs
studyassistant system logs --tail 100

# Follow API logs
studyassistant system logs --service api --follow

# Filter error logs
studyassistant system logs --level error --since "1 hour ago"
```

##### `system backup`
Create and manage system backups.

```bash
studyassistant system backup <operation> [options]

Operations:
  create                  Create new backup
  restore                 Restore from backup
  list                    List available backups
  delete                  Delete backup

Options:
  --backup-id ID          Specific backup identifier
  --include COMPONENTS    Components to backup (db, config, indices)
  --exclude COMPONENTS    Components to exclude
  --compression TYPE      Compression type (gzip, bzip2, none)
  --encryption            Encrypt backup
  --storage STORAGE       Storage backend (local, s3, gcs)
```

**Examples:**
```bash
# Create full backup
studyassistant system backup create \
  --compression gzip \
  --encryption

# Restore from backup
studyassistant system backup restore \
  --backup-id backup_20240101_120000
```

## Environment Variables

The CLI respects the following environment variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `STUDYASSISTANT_CONFIG` | Configuration file path | `~/.studyassistant/config.yaml` |
| `STUDYASSISTANT_API_KEY` | API key for authentication | - |
| `STUDYASSISTANT_BASE_URL` | Base API URL | `https://api.studyassistant.com` |
| `STUDYASSISTANT_PROFILE` | Configuration profile to use | `default` |
| `STUDYASSISTANT_LOG_LEVEL` | Default log level | `info` |
| `STUDYASSISTANT_NO_COLOR` | Disable colored output | `false` |
| `STUDYASSISTANT_TIMEOUT` | Request timeout in seconds | `30` |

## Configuration File

The CLI uses YAML configuration files. Example structure:

```yaml
# ~/.studyassistant/config.yaml
default:
  api:
    base_url: "https://api.studyassistant.com"
    api_key: "your-api-key"
    timeout: 30
    retries: 3
  
  output:
    format: "table"
    color: true
    verbose: false
  
  sources:
    arxiv:
      enabled: true
      rate_limit: 5
    pubmed:
      enabled: true
      api_key: "ncbi-api-key"
  
  data:
    batch_size: 100
    parallel_workers: 4
    cache_enabled: true

development:
  api:
    base_url: "http://localhost:8000"
    timeout: 60
  output:
    verbose: true
    log_level: "debug"
```

## Exit Codes

The CLI uses standard exit codes:

| Code | Description |
|------|-------------|
| `0` | Success |
| `1` | General error |
| `2` | Invalid arguments or options |
| `3` | Configuration error |
| `4` | Authentication error |
| `5` | Network/connection error |
| `6` | Data validation error |
| `7` | Resource not found |
| `8` | Permission denied |
| `9` | Service unavailable |
| `10` | Timeout error |

## Shell Completion

Enable shell completion for better CLI experience:

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

## Advanced Usage Patterns

### Scripting and Automation

```bash
#!/bin/bash
# Automated research pipeline script

# Search for papers
studyassistant resources search "transformer architecture" \
  --sources arxiv \
  --date-from 2023-01-01 \
  --max-results 100 \
  --save-results papers.json \
  --format json

# Process papers through pipeline
studyassistant pipeline run text-processing \
  --input papers.json \
  --output processed/ \
  --parallel 4

# Index processed content
studyassistant data index update --progress

# Generate recommendations
studyassistant query recommend \
  --algorithm hybrid \
  --limit 20 \
  --output recommendations.json
```

### Batch Processing

```bash
# Process multiple queries from file
while IFS= read -r query; do
  studyassistant resources search "$query" \
    --max-results 10 \
    --save-results "results_$(echo "$query" | tr ' ' '_').json"
done < queries.txt
```

### Monitoring and Alerting

```bash
# System health check script
#!/bin/bash
STATUS=$(studyassistant system status --format json)
if ! echo "$STATUS" | jq -e '.healthy' > /dev/null; then
  echo "System unhealthy: $STATUS"
  # Send alert
fi
```

## Troubleshooting

### Common Issues

1. **Authentication Errors**
   ```bash
   # Check API key
   studyassistant config get api.api_key
   
   # Test authentication
   studyassistant system status
   ```

2. **Configuration Issues**
   ```bash
   # Validate configuration
   studyassistant config validate
   
   # Reset to defaults
   studyassistant config init --force
   ```

3. **Network Issues**
   ```bash
   # Test connectivity
   studyassistant system status --detailed
   
   # Increase timeout
   studyassistant --timeout 60 resources search "test"
   ```

### Debug Mode

Enable debug mode for troubleshooting:

```bash
# Enable verbose output
studyassistant -vv command subcommand

# Enable debug logging
studyassistant --log-level debug command subcommand

# Save debug logs to file
studyassistant --log-file debug.log --log-level debug command subcommand
```

## See Also

- [CLI Examples](examples.md)
- [Configuration Guide](../getting-started/configuration.md)
- [API Documentation](../api/)
- [Development Setup](../development/development-setup.md)
