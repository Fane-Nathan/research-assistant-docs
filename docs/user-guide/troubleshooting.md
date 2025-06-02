# Troubleshooting

This guide helps you diagnose and resolve common issues when using StudyAssistant. It covers everything from installation problems to performance optimization.

## Quick Diagnostics

### System Health Check

Run the built-in diagnostics to identify common issues:

```bash
# Run comprehensive system check
studyassistant status --full

# Check specific components
studyassistant status --component vector_db
studyassistant status --component api_keys
studyassistant status --component data_sources

# Test connectivity
studyassistant test --all
```

### Log Analysis

Check log files for error details:

```bash
# View recent logs
studyassistant logs --tail 100

# Filter by severity
studyassistant logs --level ERROR --since "1 hour ago"

# Export logs for analysis
studyassistant logs --export troubleshooting_logs.txt --since "24 hours ago"
```

## Installation Issues

### Python Environment Problems

#### Issue: ModuleNotFoundError

```
ModuleNotFoundError: No module named 'studyassistant'
```

**Solutions:**

1. **Verify Installation:**
   ```bash
   pip list | grep studyassistant
   ```

2. **Reinstall Package:**
   ```bash
   pip uninstall studyassistant
   pip install studyassistant
   ```

3. **Check Python Path:**
   ```bash
   python -c "import sys; print(sys.path)"
   which python
   which pip
   ```

4. **Virtual Environment Issues:**
   ```bash
   # Activate correct environment
   source venv/bin/activate  # Linux/Mac
   # or
   venv\Scripts\activate     # Windows
   
   # Verify environment
   which python
   pip install studyassistant
   ```

#### Issue: Permission Errors

```
ERROR: Could not install packages due to an EnvironmentError: [Errno 13] Permission denied
```

**Solutions:**

1. **Use User Installation:**
   ```bash
   pip install --user studyassistant
   ```

2. **Create Virtual Environment:**
   ```bash
   python -m venv studyassistant_env
   source studyassistant_env/bin/activate
   pip install studyassistant
   ```

3. **Fix Permissions (Linux/Mac):**
   ```bash
   sudo chown -R $USER ~/.local/lib/python*/site-packages
   ```

### Dependency Conflicts

#### Issue: Version Conflicts

```
ERROR: pip's dependency resolver does not currently consider all the ways that a package can be installed.
```

**Solutions:**

1. **Create Clean Environment:**
   ```bash
   python -m venv clean_env
   source clean_env/bin/activate
   pip install studyassistant
   ```

2. **Use Conda:**
   ```bash
   conda create -n studyassistant python=3.9
   conda activate studyassistant
   pip install studyassistant
   ```

3. **Manual Dependency Resolution:**
   ```bash
   pip install --upgrade pip
   pip install -r requirements.txt
   pip install studyassistant --no-deps
   ```

## Configuration Issues

### API Key Problems

#### Issue: Invalid API Keys

```
ERROR: Invalid API key for OpenAI
```

**Diagnostic Steps:**

1. **Check API Key Format:**
   ```bash
   studyassistant config show --section openai
   ```

2. **Test API Key:**
   ```bash
   studyassistant test-connection --service openai
   ```

3. **Verify Environment Variables:**
   ```bash
   echo $OPENAI_API_KEY
   echo $ANTHROPIC_API_KEY
   ```

**Solutions:**

1. **Set API Keys Correctly:**
   ```bash
   studyassistant config set openai.api_key "sk-your-key-here"
   studyassistant config set anthropic.api_key "sk-ant-your-key-here"
   ```

2. **Use Environment Variables:**
   ```bash
   export OPENAI_API_KEY="sk-your-key-here"
   export ANTHROPIC_API_KEY="sk-ant-your-key-here"
   ```

3. **Verify Key Permissions:**
   - Check that API keys have appropriate permissions
   - Verify billing/usage limits haven't been exceeded
   - Ensure keys haven't expired

#### Issue: Configuration File Not Found

```
ERROR: Configuration file not found at ~/.studyassistant/config.yaml
```

**Solutions:**

1. **Create Default Configuration:**
   ```bash
   studyassistant config init
   ```

2. **Specify Custom Config Path:**
   ```bash
   export STUDYASSISTANT_CONFIG_PATH=/path/to/config.yaml
   studyassistant config init --path /path/to/config.yaml
   ```

3. **Manual Configuration Creation:**
   ```yaml
   # ~/.studyassistant/config.yaml
   openai:
     api_key: "your-key-here"
     model: "gpt-4"
   
   anthropic:
     api_key: "your-key-here"
     model: "claude-3-opus-20240229"
   
   data_sources:
     arxiv:
       enabled: true
     pubmed:
       enabled: true
   ```

### Database Issues

#### Issue: Vector Database Connection Failed

```
ERROR: Failed to connect to Pinecone vector database
```

**Diagnostic Steps:**

1. **Check Database Configuration:**
   ```bash
   studyassistant config show --section vector_db
   ```

2. **Test Database Connection:**
   ```bash
   studyassistant test-connection --service pinecone
   ```

3. **Verify Network Connectivity:**
   ```bash
   ping api.pinecone.io
   ```

**Solutions:**

1. **Update Database Configuration:**
   ```bash
   studyassistant config set vector_db.provider pinecone
   studyassistant config set vector_db.api_key "your-pinecone-key"
   studyassistant config set vector_db.environment "your-environment"
   ```

2. **Switch to Local Vector Database:**
   ```bash
   studyassistant config set vector_db.provider local
   studyassistant config set vector_db.path ~/.studyassistant/vector_db
   ```

3. **Reset Database Connection:**
   ```bash
   studyassistant vector-db reset
   studyassistant vector-db init
   ```

## Search and Query Issues

### No Results or Poor Results

#### Issue: Search Returns No Results

**Diagnostic Steps:**

1. **Test Simple Query:**
   ```bash
   studyassistant query "machine learning" --debug
   ```

2. **Check Data Source Status:**
   ```bash
   studyassistant status --sources
   ```

3. **Verify Search Index:**
   ```bash
   studyassistant index status
   ```

**Solutions:**

1. **Rebuild Search Index:**
   ```bash
   studyassistant index rebuild --force
   ```

2. **Check Query Syntax:**
   ```bash
   # Use simpler queries
   studyassistant query "AI" --max-results 10
   
   # Avoid special characters
   studyassistant query "neural networks" --sources arxiv
   ```

3. **Update Data Sources:**
   ```bash
   studyassistant sources refresh --all
   ```

#### Issue: Results Are Not Relevant

**Solutions:**

1. **Improve Query Specificity:**
   ```bash
   # Instead of broad terms
   studyassistant query "AI"
   
   # Use specific terms
   studyassistant query "transformer neural networks NLP"
   ```

2. **Adjust Search Parameters:**
   ```bash
   studyassistant query "machine learning" --similarity-threshold 0.8
   studyassistant query "deep learning" --max-results 50 --min-citations 10
   ```

3. **Use Filters:**
   ```bash
   studyassistant query "computer vision" --year-range 2020-2024 --sources arxiv
   ```

### Performance Issues

#### Issue: Slow Search Performance

**Diagnostic Steps:**

1. **Check System Resources:**
   ```bash
   studyassistant status --resources
   ```

2. **Monitor Query Performance:**
   ```bash
   studyassistant query "test" --profile --debug
   ```

3. **Check Index Size:**
   ```bash
   studyassistant index info
   ```

**Solutions:**

1. **Optimize Search Parameters:**
   ```bash
   # Reduce result count
   studyassistant query "topic" --max-results 20
   
   # Use specific sources
   studyassistant query "topic" --sources arxiv
   
   # Add constraints
   studyassistant query "topic" --year-range 2020-2024
   ```

2. **Clean Up Index:**
   ```bash
   studyassistant index optimize
   studyassistant cache clear
   ```

3. **Adjust Configuration:**
   ```yaml
   # config.yaml
   search:
     max_results: 50
     similarity_threshold: 0.7
     timeout: 30
   
   performance:
     parallel_workers: 4
     batch_size: 100
     cache_ttl: 3600
   ```

#### Issue: High Memory Usage

**Solutions:**

1. **Reduce Batch Size:**
   ```bash
   studyassistant config set processing.batch_size 50
   ```

2. **Enable Streaming:**
   ```bash
   studyassistant config set search.streaming true
   ```

3. **Clear Cache Regularly:**
   ```bash
   studyassistant cache clear --type all
   ```

## Data Source Issues

### arXiv Access Problems

#### Issue: arXiv Rate Limiting

```
ERROR: arXiv API rate limit exceeded
```

**Solutions:**

1. **Adjust Rate Limits:**
   ```bash
   studyassistant config set arxiv.rate_limit 2  # requests per second
   studyassistant config set arxiv.retry_delay 5  # seconds
   ```

2. **Use Exponential Backoff:**
   ```yaml
   # config.yaml
   arxiv:
     rate_limit: 2
     retry_attempts: 3
     retry_backoff: exponential
   ```

3. **Batch Requests:**
   ```bash
   studyassistant query "physics" --batch-size 10 --delay 3
   ```

### PubMed Access Issues

#### Issue: PubMed Email Requirement

```
ERROR: Email address required for PubMed API
```

**Solutions:**

1. **Set Email in Configuration:**
   ```bash
   studyassistant config set pubmed.email "your.email@domain.com"
   ```

2. **Use Environment Variable:**
   ```bash
   export PUBMED_EMAIL="your.email@domain.com"
   ```

3. **Get API Key for Higher Limits:**
   ```bash
   studyassistant config set pubmed.api_key "your-ncbi-api-key"
   ```

### Local PDF Processing Issues

#### Issue: PDF Text Extraction Failed

```
ERROR: Could not extract text from PDF
```

**Solutions:**

1. **Install OCR Dependencies:**
   ```bash
   # Ubuntu/Debian
   sudo apt-get install tesseract-ocr

   # macOS
   brew install tesseract

   # Windows
   # Download from https://github.com/tesseract-ocr/tesseract
   ```

2. **Enable OCR Processing:**
   ```bash
   studyassistant config set pdf.ocr_enabled true
   studyassistant config set pdf.ocr_language en
   ```

3. **Check PDF File Permissions:**
   ```bash
   chmod 644 /path/to/pdf/files/*.pdf
   ```

## Web Interface Issues

### Streamlit Application Problems

#### Issue: Streamlit App Won't Start

```
ERROR: Address already in use
```

**Solutions:**

1. **Use Different Port:**
   ```bash
   studyassistant web --port 8502
   ```

2. **Kill Existing Processes:**
   ```bash
   # Find process using port 8501
   lsof -i :8501
   kill -9 <process_id>
   ```

3. **Check Firewall Settings:**
   ```bash
   # Allow port through firewall
   sudo ufw allow 8501
   ```

#### Issue: Web Interface Not Loading

**Solutions:**

1. **Check Browser Console:**
   - Open browser developer tools (F12)
   - Look for JavaScript errors
   - Check network requests

2. **Clear Browser Cache:**
   - Clear cookies and cached data
   - Try incognito/private mode
   - Test different browser

3. **Verify Network Configuration:**
   ```bash
   # Test local connection
   curl http://localhost:8501
   
   # Check if accessible externally
   curl http://your-ip:8501
   ```

## File and Permission Issues

### Directory Access Problems

#### Issue: Permission Denied

```
PermissionError: [Errno 13] Permission denied: '~/.studyassistant/'
```

**Solutions:**

1. **Fix Directory Permissions:**
   ```bash
   chmod 755 ~/.studyassistant/
   chmod -R 644 ~/.studyassistant/*
   ```

2. **Create Directory with Correct Permissions:**
   ```bash
   mkdir -p ~/.studyassistant/
   chmod 755 ~/.studyassistant/
   ```

3. **Use Alternative Directory:**
   ```bash
   export STUDYASSISTANT_HOME=/tmp/studyassistant
   studyassistant config init
   ```

### Disk Space Issues

#### Issue: No Space Left on Device

```
OSError: [Errno 28] No space left on device
```

**Solutions:**

1. **Check Disk Usage:**
   ```bash
   df -h
   du -sh ~/.studyassistant/
   ```

2. **Clean Up Cache:**
   ```bash
   studyassistant cache clear --all
   studyassistant cleanup --remove-temp
   ```

3. **Move Data Directory:**
   ```bash
   studyassistant config set data.directory /path/to/larger/disk
   studyassistant migrate-data ~/.studyassistant /path/to/larger/disk
   ```

## Network and Connectivity Issues

### Proxy and Firewall Problems

#### Issue: Connection Timeout

```
ERROR: Connection timed out
```

**Solutions:**

1. **Configure Proxy Settings:**
   ```bash
   studyassistant config set network.proxy_url "http://proxy.company.com:8080"
   studyassistant config set network.proxy_username "username"
   studyassistant config set network.proxy_password "password"
   ```

2. **Set Environment Variables:**
   ```bash
   export HTTP_PROXY="http://proxy.company.com:8080"
   export HTTPS_PROXY="http://proxy.company.com:8080"
   export NO_PROXY="localhost,127.0.0.1"
   ```

3. **Adjust Timeout Settings:**
   ```bash
   studyassistant config set network.timeout 60
   studyassistant config set network.retry_attempts 5
   ```

### SSL Certificate Issues

#### Issue: SSL Certificate Verification Failed

```
ERROR: SSL certificate verification failed
```

**Solutions:**

1. **Update CA Certificates:**
   ```bash
   # Ubuntu/Debian
   sudo apt-get update && sudo apt-get install ca-certificates
   
   # macOS
   brew install ca-certificates
   ```

2. **Configure Certificate Path:**
   ```bash
   studyassistant config set network.ca_bundle_path /path/to/ca-bundle.pem
   ```

3. **Disable SSL Verification (NOT RECOMMENDED for production):**
   ```bash
   studyassistant config set network.verify_ssl false
   ```

## Advanced Troubleshooting

### Debug Mode

Enable comprehensive debugging:

```bash
# Enable debug logging
studyassistant config set logging.level DEBUG
studyassistant config set logging.file ~/.studyassistant/debug.log

# Run with debug flags
studyassistant --debug --verbose query "test"

# Profile performance
studyassistant --profile query "test"
```

### Memory and Performance Analysis

```python
# Python script for memory profiling
import tracemalloc
from studyassistant import StudyAssistant

tracemalloc.start()

sa = StudyAssistant()
results = sa.search("machine learning", max_results=100)

current, peak = tracemalloc.get_traced_memory()
print(f"Current memory usage: {current / 1024 / 1024:.1f} MB")
print(f"Peak memory usage: {peak / 1024 / 1024:.1f} MB")

tracemalloc.stop()
```

### Database Diagnostics

```bash
# Check database integrity
studyassistant db check --repair

# Export database for analysis
studyassistant db export --format sql --output debug_db.sql

# Reset database if corrupted
studyassistant db reset --confirm
studyassistant db init
```

## Getting Help

### Community Support

1. **GitHub Issues:**
   - Search existing issues: https://github.com/StudyAssistant/studyassistant/issues
   - Create detailed issue reports with logs and system information

2. **Discord Community:**
   - Join the community: https://discord.gg/studyassistant
   - Ask questions in appropriate channels

3. **Documentation:**
   - Check the latest documentation
   - Search for similar issues

### Creating Bug Reports

Include the following information in bug reports:

```bash
# System information
studyassistant --version
python --version
pip list | grep studyassistant

# Configuration (remove sensitive data)
studyassistant config show --safe

# Recent logs
studyassistant logs --tail 50 --level ERROR

# Test commands that reproduce the issue
studyassistant query "test" --debug 2>&1 | tee error_log.txt
```

### Professional Support

For enterprise users or complex issues:

1. **Enterprise Support:** Contact enterprise@studyassistant.com
2. **Custom Solutions:** Reach out for custom implementations
3. **Training and Consulting:** Available for teams and organizations

## Prevention and Maintenance

### Regular Maintenance Tasks

```bash
# Weekly maintenance script
#!/bin/bash

# Update search index
studyassistant index optimize

# Clear old cache
studyassistant cache clear --older-than 7d

# Check system health
studyassistant status --full

# Backup configuration
studyassistant config backup weekly_backup.yaml

# Update data sources
studyassistant sources refresh --incremental
```

### Monitoring Setup

```yaml
# monitoring.yaml
alerts:
  disk_space:
    threshold: 90%
    action: "cleanup_cache"
  
  api_errors:
    threshold: 5%
    window: "1hour"
    action: "send_notification"
  
  response_time:
    threshold: 10s
    action: "optimize_index"

notifications:
  email: "admin@yourorg.com"
  slack_webhook: "https://hooks.slack.com/..."
```

### Best Practices

1. **Regular Backups:** Backup configuration and data regularly
2. **Monitor Resources:** Keep track of disk space and memory usage
3. **Update Dependencies:** Keep Python packages up to date
4. **Test Changes:** Test configuration changes in development first
5. **Document Issues:** Keep track of common issues and solutions

This troubleshooting guide should help you resolve most common issues with StudyAssistant. For issues not covered here, please check the community resources or create a detailed bug report.
