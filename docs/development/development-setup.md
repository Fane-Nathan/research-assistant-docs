# Development Setup

This guide provides comprehensive instructions for setting up the StudyAssistant development environment across different platforms and development scenarios.

## Prerequisites

### System Requirements

- **Operating System**: Windows 10+, macOS 10.15+, or Linux (Ubuntu 18.04+)
- **Memory**: 8GB RAM minimum, 16GB recommended
- **Storage**: 10GB free space minimum
- **Python**: 3.9+ (3.11 recommended)
- **Node.js**: 16+ (for frontend development)
- **Docker**: Latest stable version (for containerized development)

### Required Tools

```bash
# Essential development tools
git --version          # Git 2.25+
python --version       # Python 3.9+
node --version         # Node.js 16+
docker --version       # Docker 20.10+
docker-compose --version # Docker Compose 1.29+
```

## Quick Start

### 1. Clone Repository

```bash
# Clone the main repository
git clone https://github.com/studyassistant/studyassistant.git
cd studyassistant

# Clone with all submodules
git clone --recursive https://github.com/studyassistant/studyassistant.git
```

### 2. Environment Setup

#### Using Docker (Recommended)

```bash
# Build and start development environment
docker-compose -f docker-compose.dev.yml up -d

# Verify services are running
docker-compose ps

# Access development shell
docker-compose exec app bash
```

#### Using Python Virtual Environment

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
pip install -r requirements-dev.txt
```

### 3. Configuration

```bash
# Copy example configuration
cp .env.example .env

# Edit configuration file
# Set database URLs, API keys, etc.
nano .env
```

### 4. Database Setup

```bash
# Start database services
docker-compose up -d postgres elasticsearch redis

# Run database migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Load sample data (optional)
python manage.py loaddata fixtures/sample_data.json
```

### 5. Verify Installation

```bash
# Run tests
python -m pytest

# Start development server
python manage.py runserver

# Check API health
curl http://localhost:8000/api/health/
```

## Detailed Setup Instructions

### Python Environment Setup

#### Installing Python

##### Windows

```powershell
# Using Windows Package Manager
winget install Python.Python.3.11

# Or download from python.org
# Ensure "Add Python to PATH" is checked during installation

# Verify installation
python --version
pip --version
```

##### macOS

```bash
# Using Homebrew
brew install python@3.11

# Using pyenv (recommended for version management)
brew install pyenv
pyenv install 3.11.0
pyenv global 3.11.0

# Add to shell profile
echo 'export PATH="$(pyenv root)/shims:$PATH"' >> ~/.zshrc
```

##### Linux (Ubuntu/Debian)

```bash
# Update package list
sudo apt update

# Install Python and pip
sudo apt install python3.11 python3.11-venv python3.11-dev python3-pip

# Install build essentials
sudo apt install build-essential libssl-dev libffi-dev

# Set Python 3.11 as default (optional)
sudo update-alternatives --install /usr/bin/python3 python3 /usr/bin/python3.11 1
```

#### Virtual Environment Management

##### Using venv (Standard)

```bash
# Create virtual environment
python -m venv studyassistant-env

# Activate virtual environment
source studyassistant-env/bin/activate  # Linux/macOS
studyassistant-env\Scripts\activate     # Windows

# Deactivate when done
deactivate
```

##### Using conda

```bash
# Create conda environment
conda create -n studyassistant python=3.11

# Activate environment
conda activate studyassistant

# Install pip dependencies
pip install -r requirements.txt
```

##### Using poetry (Advanced)

```bash
# Install poetry
curl -sSL https://install.python-poetry.org | python3 -

# Install dependencies
poetry install

# Activate shell
poetry shell

# Run commands in environment
poetry run python manage.py runserver
```

### Database Setup

#### PostgreSQL Setup

##### Local Installation

```bash
# Ubuntu/Debian
sudo apt install postgresql postgresql-contrib

# macOS
brew install postgresql
brew services start postgresql

# Windows
# Download installer from postgresql.org
```

##### Configuration

```bash
# Create database and user
sudo -u postgres psql

CREATE DATABASE studyassistant;
CREATE USER studyassistant_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE studyassistant TO studyassistant_user;
\q
```

##### Docker Setup

```yaml
# docker-compose.yml excerpt
version: '3.8'
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: studyassistant
      POSTGRES_USER: studyassistant_user
      POSTGRES_PASSWORD: your_password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql

volumes:
  postgres_data:
```

#### Elasticsearch Setup

##### Docker Setup (Recommended)

```yaml
elasticsearch:
  image: elasticsearch:8.11.0
  environment:
    - discovery.type=single-node
    - xpack.security.enabled=false
    - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
  ports:
    - "9200:9200"
    - "9300:9300"
  volumes:
    - elasticsearch_data:/usr/share/elasticsearch/data
```

##### Local Installation

```bash
# Ubuntu/Debian
wget -qO - https://artifacts.elastic.co/GPG-KEY-elasticsearch | sudo apt-key add -
echo "deb https://artifacts.elastic.co/packages/8.x/apt stable main" | sudo tee /etc/apt/sources.list.d/elastic-8.x.list
sudo apt update && sudo apt install elasticsearch

# macOS
brew tap elastic/tap
brew install elastic/elasticsearch/elasticsearch-full

# Start service
sudo systemctl start elasticsearch  # Linux
brew services start elasticsearch   # macOS
```

#### Redis Setup

##### Docker Setup

```yaml
redis:
  image: redis:7-alpine
  ports:
    - "6379:6379"
  volumes:
    - redis_data:/data
  command: redis-server --appendonly yes
```

##### Local Installation

```bash
# Ubuntu/Debian
sudo apt install redis-server

# macOS
brew install redis

# Start service
sudo systemctl start redis-server  # Linux
brew services start redis          # macOS
```

### Environment Configuration

#### Environment Variables

Create `.env` file in project root:

```bash
# Database Configuration
DATABASE_URL=postgresql://studyassistant_user:your_password@localhost:5432/studyassistant
ELASTICSEARCH_URL=http://localhost:9200
REDIS_URL=redis://localhost:6379/0

# API Keys
OPENAI_API_KEY=your_openai_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key
GOOGLE_API_KEY=your_google_api_key

# Security
SECRET_KEY=your_secret_key_here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# External Services
ARXIV_API_BASE_URL=http://export.arxiv.org/api/query
SEMANTIC_SCHOLAR_API_KEY=your_semantic_scholar_key

# Logging
LOG_LEVEL=INFO
LOG_FILE=logs/studyassistant.log

# Performance
CELERY_BROKER_URL=redis://localhost:6379/1
CELERY_RESULT_BACKEND=redis://localhost:6379/2
```

#### Configuration Validation

```python
# scripts/validate_config.py
import os
from dotenv import load_dotenv

def validate_environment():
    load_dotenv()
    
    required_vars = [
        'DATABASE_URL',
        'ELASTICSEARCH_URL', 
        'REDIS_URL',
        'SECRET_KEY'
    ]
    
    missing_vars = []
    for var in required_vars:
        if not os.getenv(var):
            missing_vars.append(var)
    
    if missing_vars:
        print(f"Missing required environment variables: {missing_vars}")
        return False
    
    print("Environment configuration is valid!")
    return True

if __name__ == "__main__":
    validate_environment()
```

### Development Dependencies

#### Python Dependencies

```bash
# Install development dependencies
pip install -r requirements-dev.txt

# Key development packages:
# pytest - Testing framework
# black - Code formatting
# flake8 - Linting
# mypy - Type checking
# pre-commit - Git hooks
# jupyter - Interactive development
# debugpy - Debugging support
```

#### Node.js Dependencies (Frontend)

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Key packages:
# react - UI framework
# typescript - Type safety
# jest - Testing
# eslint - Linting
# prettier - Code formatting
```

### IDE Configuration

#### VS Code Setup

Install recommended extensions:

```json
{
  "recommendations": [
    "ms-python.python",
    "ms-python.black-formatter",
    "ms-python.flake8",
    "ms-python.mypy-type-checker",
    "ms-toolsai.jupyter",
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-typescript-next"
  ]
}
```

Workspace settings (`.vscode/settings.json`):

```json
{
  "python.defaultInterpreterPath": "./venv/bin/python",
  "python.formatting.provider": "black",
  "python.linting.enabled": true,
  "python.linting.flake8Enabled": true,
  "python.linting.mypyEnabled": true,
  "python.testing.pytestEnabled": true,
  "python.testing.pytestPath": "pytest",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.organizeImports": true
  }
}
```

#### PyCharm Setup

1. Open project directory
2. Configure Python interpreter to use virtual environment
3. Enable Django support in Settings → Languages & Frameworks → Django
4. Configure database connection in Database tool window
5. Set up run configurations for Django server and tests

### Development Workflow

#### Git Configuration

```bash
# Configure git
git config user.name "Your Name"
git config user.email "your.email@example.com"

# Install pre-commit hooks
pre-commit install

# Test pre-commit hooks
pre-commit run --all-files
```

#### Branch Strategy

```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Regular commits
git add .
git commit -m "feat: add new feature"

# Push to remote
git push origin feature/your-feature-name

# Create pull request via GitHub/GitLab
```

#### Testing Setup

```bash
# Run all tests
python -m pytest

# Run with coverage
python -m pytest --cov=studyassistant

# Run specific test file
python -m pytest tests/test_data_manager.py

# Run with verbose output
python -m pytest -v

# Run integration tests
python -m pytest tests/integration/
```

### Docker Development Environment

#### Complete Docker Setup

```yaml
# docker-compose.dev.yml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile.dev
    volumes:
      - .:/app
      - /app/node_modules
    ports:
      - "8000:8000"
      - "3000:3000"
    environment:
      - DEBUG=True
      - DATABASE_URL=postgresql://studyassistant:password@postgres:5432/studyassistant
      - ELASTICSEARCH_URL=http://elasticsearch:9200
      - REDIS_URL=redis://redis:6379/0
    depends_on:
      - postgres
      - elasticsearch
      - redis

  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: studyassistant
      POSTGRES_USER: studyassistant
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  elasticsearch:
    image: elasticsearch:8.11.0
    environment:
      - discovery.type=single-node
      - xpack.security.enabled=false
      - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
    volumes:
      - elasticsearch_data:/usr/share/elasticsearch/data
    ports:
      - "9200:9200"

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
    ports:
      - "6379:6379"

  celery:
    build:
      context: .
      dockerfile: Dockerfile.dev
    command: celery -A studyassistant worker -l info
    volumes:
      - .:/app
    environment:
      - DATABASE_URL=postgresql://studyassistant:password@postgres:5432/studyassistant
      - REDIS_URL=redis://redis:6379/0
    depends_on:
      - postgres
      - redis

volumes:
  postgres_data:
  elasticsearch_data:
  redis_data:
```

#### Development Dockerfile

```dockerfile
# Dockerfile.dev
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    git \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs

# Copy Python requirements
COPY requirements.txt requirements-dev.txt ./

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt -r requirements-dev.txt

# Copy package.json for frontend
COPY frontend/package*.json ./frontend/

# Install Node dependencies
RUN cd frontend && npm install

# Copy application code
COPY . .

# Expose ports
EXPOSE 8000 3000

# Start development servers
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
```

### Troubleshooting

#### Common Issues

##### Python Installation Issues

```bash
# If Python not found
which python3
ls -la /usr/bin/python*

# Fix Python path
export PATH="/usr/local/bin:$PATH"

# Reinstall Python
sudo apt remove python3 python3-pip
sudo apt install python3.11 python3.11-venv python3-pip
```

##### Virtual Environment Issues

```bash
# If venv creation fails
python -m pip install --upgrade pip
python -m pip install virtualenv

# Clear pip cache
pip cache purge

# Use system site packages if needed
python -m venv --system-site-packages venv
```

##### Database Connection Issues

```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Test connection
psql -h localhost -U studyassistant_user -d studyassistant

# Reset password
sudo -u postgres psql
\password studyassistant_user
```

##### Port Conflicts

```bash
# Check port usage
netstat -tlnp | grep :8000
lsof -i :8000

# Kill process using port
kill -9 $(lsof -ti:8000)
```

#### Performance Issues

##### Slow Database Queries

```bash
# Enable query logging
echo "log_statement = 'all'" >> /etc/postgresql/13/main/postgresql.conf
sudo systemctl restart postgresql

# Monitor slow queries
tail -f /var/log/postgresql/postgresql-13-main.log
```

##### Memory Issues

```bash
# Check memory usage
free -h
ps aux --sort=-%mem | head

# Adjust Docker memory limits
docker-compose -f docker-compose.dev.yml config
```

### Development Scripts

#### Useful Development Commands

```bash
# scripts/dev.sh
#!/bin/bash

# Development helper script

case $1 in
  "setup")
    echo "Setting up development environment..."
    python -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt -r requirements-dev.txt
    cp .env.example .env
    echo "Setup complete! Edit .env file and run 'python manage.py migrate'"
    ;;
  
  "test")
    echo "Running tests..."
    python -m pytest --cov=studyassistant
    ;;
  
  "lint")
    echo "Running linters..."
    black .
    flake8 .
    mypy .
    ;;
  
  "migrate")
    echo "Running database migrations..."
    python manage.py makemigrations
    python manage.py migrate
    ;;
  
  "reset-db")
    echo "Resetting database..."
    python manage.py flush --noinput
    python manage.py migrate
    python manage.py createsuperuser
    ;;
  
  *)
    echo "Usage: $0 {setup|test|lint|migrate|reset-db}"
    exit 1
    ;;
esac
```

#### Database Management Scripts

```python
# scripts/db_manager.py
import os
import subprocess
import sys
from datetime import datetime

def create_backup():
    """Create database backup"""
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_file = f"backups/studyassistant_{timestamp}.sql"
    
    os.makedirs("backups", exist_ok=True)
    
    cmd = [
        "pg_dump",
        "-h", "localhost",
        "-U", "studyassistant_user",
        "-d", "studyassistant",
        "-f", backup_file
    ]
    
    subprocess.run(cmd, check=True)
    print(f"Backup created: {backup_file}")

def restore_backup(backup_file):
    """Restore database from backup"""
    cmd = [
        "psql",
        "-h", "localhost", 
        "-U", "studyassistant_user",
        "-d", "studyassistant",
        "-f", backup_file
    ]
    
    subprocess.run(cmd, check=True)
    print(f"Database restored from: {backup_file}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python db_manager.py {backup|restore <file>}")
        sys.exit(1)
    
    if sys.argv[1] == "backup":
        create_backup()
    elif sys.argv[1] == "restore" and len(sys.argv) == 3:
        restore_backup(sys.argv[2])
    else:
        print("Usage: python db_manager.py {backup|restore <file>}")
```

This development setup guide provides comprehensive instructions for establishing a robust development environment for the StudyAssistant project, covering multiple platforms, development scenarios, and common troubleshooting situations.
