# Command Line Interface Reference

StudyAssistant provides a comprehensive command-line interface for all operations, from document ingestion to query processing and system administration.

## Installation and Setup

Install the StudyAssistant CLI using pip:

```bash
pip install studyassistant-cli
```

Verify installation:
```bash
studyassistant --version
```

## Global Options

All commands support these global options:

| Option | Description | Default |
|--------|-------------|---------|
| `--config PATH` | Path to configuration file | `~/.studyassistant/config.yaml` |
| `--verbose, -v` | Enable verbose output | `False` |
| `--quiet, -q` | Suppress output except errors | `False` |
| `--format {json,yaml,table}` | Output format | `table` |
| `--no-color` | Disable colored output | `False` |

## Document Management Commands

### `studyassistant add`

Add documents to the knowledge base.

**Syntax:**
```bash
studyassistant add [OPTIONS] SOURCE [SOURCE...]
```

**Options:**
| Option | Description | Default |
|--------|-------------|---------|
| `--type {pdf,txt,url,dir}` | Source type | Auto-detect |
| `--recursive, -r` | Process directories recursively | `False` |
| `--batch-size INT` | Batch size for processing | `10` |
| `--force, -f` | Overwrite existing documents | `False` |
| `--metadata FILE` | JSON file with document metadata | `None` |
| `--tags TAGS` | Comma-separated tags | `None` |

**Examples:**

Add a single PDF document:
```bash
studyassistant add paper.pdf
```

Add multiple documents with metadata:
```bash
studyassistant add paper1.pdf paper2.pdf --tags "machine-learning,nlp"
```

Add all PDFs from a directory recursively:
```bash
studyassistant add /research/papers/ --type dir --recursive --force
```

Add document from URL:
```bash
studyassistant add https://arxiv.org/pdf/2301.00001.pdf --type url
```

Add with custom metadata:
```bash
studyassistant add paper.pdf --metadata metadata.json
```

**Metadata JSON Format:**
```json
{
  "title": "Document Title",
  "authors": ["Author 1", "Author 2"],
  "publication_date": "2023-01-01",
  "journal": "Journal Name",
  "tags": ["tag1", "tag2"],
  "custom_fields": {
    "experiment_type": "qualitative",
    "dataset": "custom_dataset"
  }
}
```

### `studyassistant list`

List documents in the knowledge base.

**Syntax:**
```bash
studyassistant list [OPTIONS]
```

**Options:**
| Option | Description | Default |
|--------|-------------|---------|
| `--filter QUERY` | Filter documents by query | `None` |
| `--tags TAGS` | Filter by tags | `None` |
| `--author AUTHOR` | Filter by author | `None` |
| `--date-from DATE` | Filter by date range (start) | `None` |
| `--date-to DATE` | Filter by date range (end) | `None` |
| `--limit INT` | Maximum number of results | `50` |
| `--sort {date,title,author,relevance}` | Sort order | `date` |

**Examples:**

List all documents:
```bash
studyassistant list
```

List documents with specific tags:
```bash
studyassistant list --tags "machine-learning,nlp"
```

List documents by author:
```bash
studyassistant list --author "Smith"
```

List recent documents:
```bash
studyassistant list --date-from "2023-01-01" --sort date
```

### `studyassistant remove`

Remove documents from the knowledge base.

**Syntax:**
```bash
studyassistant remove [OPTIONS] DOCUMENT_ID [DOCUMENT_ID...]
```

**Options:**
| Option | Description | Default |
|--------|-------------|---------|
| `--confirm, -y` | Skip confirmation prompt | `False` |
| `--filter QUERY` | Remove documents matching filter | `None` |
| `--dry-run` | Show what would be removed | `False` |

**Examples:**

Remove specific document:
```bash
studyassistant remove doc_12345 --confirm
```

Remove multiple documents:
```bash
studyassistant remove doc_12345 doc_67890
```

Remove documents matching filter (with dry run):
```bash
studyassistant remove --filter "tag:outdated" --dry-run
```

### `studyassistant update`

Update document metadata.

**Syntax:**
```bash
studyassistant update [OPTIONS] DOCUMENT_ID
```

**Options:**
| Option | Description | Default |
|--------|-------------|---------|
| `--metadata FILE` | JSON file with updated metadata | `None` |
| `--tags TAGS` | Update tags | `None` |
| `--title TITLE` | Update title | `None` |
| `--reprocess` | Reprocess document content | `False` |

**Examples:**

Update document tags:
```bash
studyassistant update doc_12345 --tags "updated,reviewed"
```

Update metadata from file:
```bash
studyassistant update doc_12345 --metadata updated_metadata.json
```

Reprocess document with new settings:
```bash
studyassistant update doc_12345 --reprocess
```

## Query Commands

### `studyassistant query`

Perform research queries against the knowledge base.

**Syntax:**
```bash
studyassistant query [OPTIONS] "QUERY TEXT"
```

**Options:**
| Option | Description | Default |
|--------|-------------|---------|
| `--max-results INT` | Maximum number of results | `10` |
| `--min-score FLOAT` | Minimum relevance score | `0.0` |
| `--include-snippets` | Include text snippets | `True` |
| `--include-citations` | Include citation information | `True` |
| `--filter FILTER` | Additional filters | `None` |
| `--model {gpt-3.5,gpt-4,claude}` | LLM model to use | `gpt-3.5` |
| `--temperature FLOAT` | Response creativity (0.0-1.0) | `0.1` |
| `--context-length INT` | Maximum context tokens | `4000` |

**Examples:**

Basic query:
```bash
studyassistant query "What are the latest developments in transformer models?"
```

Query with specific parameters:
```bash
studyassistant query "machine learning interpretability" \
  --max-results 5 \
  --min-score 0.7 \
  --model gpt-4
```

Query with filters:
```bash
studyassistant query "neural networks" \
  --filter "author:LeCun OR author:Hinton" \
  --include-citations
```

### `studyassistant search`

Perform document search without LLM generation.

**Syntax:**
```bash
studyassistant search [OPTIONS] "SEARCH QUERY"
```

**Options:**
| Option | Description | Default |
|--------|-------------|---------|
| `--type {semantic,keyword,hybrid}` | Search type | `hybrid` |
| `--max-results INT` | Maximum results | `20` |
| `--threshold FLOAT` | Similarity threshold | `0.5` |
| `--explain` | Show relevance explanations | `False` |

**Examples:**

Semantic search:
```bash
studyassistant search "deep learning optimization" --type semantic
```

Keyword search with explanations:
```bash
studyassistant search "neural network" --type keyword --explain
```

## System Administration Commands

### `studyassistant config`

Manage system configuration.

**Syntax:**
```bash
studyassistant config [SUBCOMMAND] [OPTIONS]
```

**Subcommands:**

#### `config show`
Display current configuration:
```bash
studyassistant config show
studyassistant config show --section api
```

#### `config set`
Set configuration values:
```bash
studyassistant config set api.openai_key "your-api-key"
studyassistant config set search.max_results 50
```

#### `config get`
Get specific configuration value:
```bash
studyassistant config get api.openai_key
```

#### `config reset`
Reset configuration to defaults:
```bash
studyassistant config reset
studyassistant config reset --section search
```

### `studyassistant index`

Manage search indices.

**Syntax:**
```bash
studyassistant index [SUBCOMMAND] [OPTIONS]
```

**Subcommands:**

#### `index build`
Build or rebuild search indices:
```bash
studyassistant index build
studyassistant index build --type vector
studyassistant index build --force
```

#### `index status`
Show index status and statistics:
```bash
studyassistant index status
```

#### `index optimize`
Optimize indices for better performance:
```bash
studyassistant index optimize
studyassistant index optimize --type keyword
```

### `studyassistant stats`

Display system statistics and health information.

**Syntax:**
```bash
studyassistant stats [OPTIONS]
```

**Options:**
| Option | Description | Default |
|--------|-------------|---------|
| `--detailed` | Show detailed statistics | `False` |
| `--export FILE` | Export stats to file | `None` |

**Examples:**

Show basic statistics:
```bash
studyassistant stats
```

Show detailed statistics:
```bash
studyassistant stats --detailed
```

Export statistics to JSON:
```bash
studyassistant stats --export stats.json
```

## Batch Operations

### `studyassistant batch`

Perform batch operations using configuration files.

**Syntax:**
```bash
studyassistant batch [OPTIONS] CONFIG_FILE
```

**Options:**
| Option | Description | Default |
|--------|-------------|---------|
| `--dry-run` | Show operations without executing | `False` |
| `--parallel INT` | Number of parallel processes | `4` |
| `--resume` | Resume from last checkpoint | `False` |

**Batch Configuration Example:**
```yaml
operations:
  - type: add
    sources:
      - path: "/research/papers/*.pdf"
        recursive: true
        tags: ["batch-import", "2023"]
  
  - type: query
    queries:
      - text: "What are the main findings?"
        output: "findings.txt"
      - text: "What methodologies were used?"
        output: "methods.txt"
  
  - type: export
    format: json
    output: "knowledge_base_export.json"
```

**Examples:**

Run batch operations:
```bash
studyassistant batch operations.yaml
```

Dry run to preview operations:
```bash
studyassistant batch operations.yaml --dry-run
```

## Export and Import Commands

### `studyassistant export`

Export knowledge base data.

**Syntax:**
```bash
studyassistant export [OPTIONS] OUTPUT_FILE
```

**Options:**
| Option | Description | Default |
|--------|-------------|---------|
| `--format {json,csv,jsonl}` | Export format | `json` |
| `--include-content` | Include document content | `True` |
| `--include-embeddings` | Include vector embeddings | `False` |
| `--filter FILTER` | Export subset of documents | `None` |

**Examples:**

Export entire knowledge base:
```bash
studyassistant export knowledge_base.json
```

Export metadata only:
```bash
studyassistant export metadata.csv --format csv --include-content false
```

Export filtered documents:
```bash
studyassistant export recent_papers.json --filter "date:>2023-01-01"
```

### `studyassistant import`

Import data into knowledge base.

**Syntax:**
```bash
studyassistant import [OPTIONS] INPUT_FILE
```

**Options:**
| Option | Description | Default |
|--------|-------------|---------|
| `--format {json,csv,jsonl}` | Input format | Auto-detect |
| `--merge-strategy {replace,skip,update}` | Conflict resolution | `skip` |
| `--validate` | Validate data before import | `True` |

**Examples:**

Import from JSON export:
```bash
studyassistant import knowledge_base.json
```

Import with conflict resolution:
```bash
studyassistant import data.json --merge-strategy update
```

## Monitoring and Debugging

### `studyassistant logs`

View system logs and debugging information.

**Syntax:**
```bash
studyassistant logs [OPTIONS]
```

**Options:**
| Option | Description | Default |
|--------|-------------|---------|
| `--level {debug,info,warning,error}` | Log level filter | `info` |
| `--lines INT` | Number of lines to show | `50` |
| `--follow, -f` | Follow log output | `False` |
| `--component COMPONENT` | Filter by component | `None` |

**Examples:**

View recent logs:
```bash
studyassistant logs
```

Follow error logs:
```bash
studyassistant logs --level error --follow
```

### `studyassistant test`

Test system components and connectivity.

**Syntax:**
```bash
studyassistant test [OPTIONS] [COMPONENT]
```

**Components:** `api`, `database`, `search`, `embeddings`, `all`

**Examples:**

Test all components:
```bash
studyassistant test
```

Test specific component:
```bash
studyassistant test api
```

Test with verbose output:
```bash
studyassistant test --verbose
```

## Environment Variables

StudyAssistant CLI respects the following environment variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `STUDYASSISTANT_CONFIG` | Configuration file path | `~/.studyassistant/config.yaml` |
| `STUDYASSISTANT_HOME` | Data directory | `~/.studyassistant` |
| `STUDYASSISTANT_LOG_LEVEL` | Log level | `INFO` |
| `OPENAI_API_KEY` | OpenAI API key | None |
| `ANTHROPIC_API_KEY` | Anthropic API key | None |

## Shell Completion

Enable shell completion for better command-line experience:

**Bash:**
```bash
eval "$(_STUDYASSISTANT_COMPLETE=bash_source studyassistant)"
```

**Zsh:**
```bash
eval "$(_STUDYASSISTANT_COMPLETE=zsh_source studyassistant)"
```

**Fish:**
```bash
eval (env _STUDYASSISTANT_COMPLETE=fish_source studyassistant)
```

## Exit Codes

The CLI uses standard exit codes:

| Code | Meaning |
|------|---------|
| 0 | Success |
| 1 | General error |
| 2 | Configuration error |
| 3 | API error |
| 4 | Database error |
| 5 | Network error |

## Examples and Use Cases

### Research Workflow Example

```bash
# 1. Add research papers
studyassistant add /research/papers/ --recursive --tags "research-2023"

# 2. Build search index
studyassistant index build

# 3. Perform research queries
studyassistant query "What are the latest trends in deep learning?" > trends.txt

# 4. Search for specific papers
studyassistant search "transformer architecture" --type semantic

# 5. Export findings
studyassistant export research_findings.json --filter "tag:research-2023"
```

### Automated Processing Script

```bash
#!/bin/bash

# Automated daily research processing
echo "Starting daily research processing..."

# Add new papers from watch directory
studyassistant add /watch/papers/ --recursive --force

# Optimize search indices
studyassistant index optimize

# Generate daily research summary
studyassistant query "What are the key findings from today's papers?" \
  --filter "date:today" > daily_summary.txt

# Export updated knowledge base
studyassistant export daily_backup.json

echo "Daily processing complete!"
```

## Troubleshooting

### Common Issues

**Issue:** Command not found
```bash
# Solution: Ensure CLI is installed and in PATH
pip install studyassistant-cli
which studyassistant
```

**Issue:** Configuration errors
```bash
# Solution: Check and reset configuration
studyassistant config show
studyassistant test
studyassistant config reset
```

**Issue:** API connection failures
```bash
# Solution: Test API connectivity
studyassistant test api
studyassistant config get api.openai_key
```

**Issue:** Search performance issues
```bash
# Solution: Optimize indices
studyassistant index status
studyassistant index optimize
```

For more detailed troubleshooting, see the [Troubleshooting Guide](../user-guide/troubleshooting.md).

## Next Steps

- [Core API Reference →](./core-apis.md)
- [External API Integration →](./external/integrations.md)
- [Web Interface Guide →](../user-guide/web-interface.md)
