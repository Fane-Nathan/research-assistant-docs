# Deployment Guide

## Overview

This guide covers production deployment strategies for the StudyAssistant RAG system, including containerization, orchestration, CI/CD, monitoring, and infrastructure management.

## Deployment Architecture

### Production Architecture Overview

```mermaid
graph TB
    subgraph "CDN/Load Balancer"
        CDN[CloudFlare/CDN]
        LB[Load Balancer]
    end
    
    subgraph "Application Tier"
        API1[API Server 1]
        API2[API Server 2]
        API3[API Server N]
        WORKER1[Background Workers]
        WORKER2[ML Workers]
    end
    
    subgraph "Data Tier"
        PG_MASTER[(PostgreSQL Master)]
        PG_REPLICA1[(PostgreSQL Replica 1)]
        PG_REPLICA2[(PostgreSQL Replica 2)]
        REDIS[(Redis Cluster)]
        ES[(Elasticsearch Cluster)]
    end
    
    subgraph "Storage"
        S3[(Object Storage)]
        BACKUP[(Backup Storage)]
    end
    
    subgraph "Monitoring"
        PROM[Prometheus]
        GRAFANA[Grafana]
        LOGS[Log Aggregation]
    end
    
    CDN --> LB
    LB --> API1 & API2 & API3
    API1 & API2 & API3 --> PG_MASTER
    API1 & API2 & API3 --> PG_REPLICA1 & PG_REPLICA2
    API1 & API2 & API3 --> REDIS
    API1 & API2 & API3 --> ES
    WORKER1 & WORKER2 --> PG_MASTER
    WORKER1 & WORKER2 --> REDIS
    WORKER1 & WORKER2 --> ES
    API1 & API2 & API3 --> S3
    PG_MASTER --> BACKUP
    PROM --> API1 & API2 & API3
    GRAFANA --> PROM
    LOGS --> API1 & API2 & API3
```

## Docker Configuration

### Multi-Stage Dockerfile

```dockerfile
# Dockerfile
FROM python:3.11-slim as builder

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    git \
    && rm -rf /var/lib/apt/lists/*

# Create and activate virtual environment
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Production stage
FROM python:3.11-slim as production

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PATH="/opt/venv/bin:$PATH"

# Install runtime dependencies
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/* \
    && groupadd -r appuser && useradd -r -g appuser appuser

# Copy virtual environment from builder stage
COPY --from=builder /opt/venv /opt/venv

# Create app directory
WORKDIR /app

# Copy application code
COPY --chown=appuser:appuser . .

# Create necessary directories
RUN mkdir -p /app/logs /app/data && \
    chown -R appuser:appuser /app

# Switch to non-root user
USER appuser

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Expose port
EXPOSE 8000

# Default command
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Docker Compose for Production

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/ssl:/etc/nginx/ssl:ro
      - static_volume:/app/static:ro
    depends_on:
      - api
    networks:
      - studyassistant-network
    restart: unless-stopped
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

  api:
    build:
      context: .
      dockerfile: Dockerfile
      target: production
    environment:
      - DATABASE_URL=postgresql://${DB_USER}:${DB_PASSWORD}@postgres:5432/${DB_NAME}
      - REDIS_URL=redis://redis:6379/0
      - ELASTICSEARCH_URL=http://elasticsearch:9200
      - SECRET_KEY=${SECRET_KEY}
      - ENVIRONMENT=production
      - LOG_LEVEL=INFO
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
      elasticsearch:
        condition: service_healthy
    networks:
      - studyassistant-network
    volumes:
      - static_volume:/app/static
      - media_volume:/app/media
    restart: unless-stopped
    deploy:
      replicas: 3
      resources:
        limits:
          memory: 2G
          cpus: '1.0'
        reservations:
          memory: 1G
          cpus: '0.5'
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

  worker:
    build:
      context: .
      dockerfile: Dockerfile
      target: production
    command: ["python", "-m", "celery", "worker", "-A", "app.tasks", "-l", "info", "--concurrency=4"]
    environment:
      - DATABASE_URL=postgresql://${DB_USER}:${DB_PASSWORD}@postgres:5432/${DB_NAME}
      - REDIS_URL=redis://redis:6379/0
      - ELASTICSEARCH_URL=http://elasticsearch:9200
      - SECRET_KEY=${SECRET_KEY}
      - ENVIRONMENT=production
      - LOG_LEVEL=INFO
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - studyassistant-network
    restart: unless-stopped
    deploy:
      replicas: 2
      resources:
        limits:
          memory: 2G
          cpus: '1.0'
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

  beat:
    build:
      context: .
      dockerfile: Dockerfile
      target: production
    command: ["python", "-m", "celery", "beat", "-A", "app.tasks", "-l", "info"]
    environment:
      - DATABASE_URL=postgresql://${DB_USER}:${DB_PASSWORD}@postgres:5432/${DB_NAME}
      - REDIS_URL=redis://redis:6379/0
      - SECRET_KEY=${SECRET_KEY}
      - ENVIRONMENT=production
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - studyassistant-network
    restart: unless-stopped
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: '0.25'

  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: ${DB_NAME}
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_INITDB_ARGS: "--encoding=UTF8 --lc-collate=C --lc-ctype=C"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./postgres/postgresql.conf:/etc/postgresql/postgresql.conf:ro
      - ./postgres/init:/docker-entrypoint-initdb.d:ro
    networks:
      - studyassistant-network
    restart: unless-stopped
    deploy:
      resources:
        limits:
          memory: 4G
          cpus: '2.0'
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER} -d ${DB_NAME}"]
      interval: 10s
      timeout: 5s
      retries: 5
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes --requirepass ${REDIS_PASSWORD}
    environment:
      - REDIS_PASSWORD=${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
      - ./redis/redis.conf:/usr/local/etc/redis/redis.conf:ro
    networks:
      - studyassistant-network
    restart: unless-stopped
    deploy:
      resources:
        limits:
          memory: 2G
          cpus: '1.0'
    healthcheck:
      test: ["CMD", "redis-cli", "--raw", "incr", "ping"]
      interval: 10s
      timeout: 3s
      retries: 5
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.11.0
    environment:
      - node.name=es01
      - cluster.name=studyassistant-cluster
      - discovery.type=single-node
      - bootstrap.memory_lock=true
      - "ES_JAVA_OPTS=-Xms2g -Xmx2g"
      - xpack.security.enabled=true
      - ELASTIC_PASSWORD=${ELASTIC_PASSWORD}
    ulimits:
      memlock:
        soft: -1
        hard: -1
    volumes:
      - elasticsearch_data:/usr/share/elasticsearch/data
      - ./elasticsearch/elasticsearch.yml:/usr/share/elasticsearch/config/elasticsearch.yml:ro
    networks:
      - studyassistant-network
    restart: unless-stopped
    deploy:
      resources:
        limits:
          memory: 4G
          cpus: '2.0'
    healthcheck:
      test: ["CMD-SHELL", "curl -u elastic:${ELASTIC_PASSWORD} -s http://localhost:9200/_cluster/health || exit 1"]
      interval: 30s
      timeout: 10s
      retries: 5
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

  prometheus:
    image: prom/prometheus:latest
    ports:
      - "9090:9090"
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml:ro
      - prometheus_data:/prometheus
    networks:
      - studyassistant-network
    restart: unless-stopped
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--web.console.libraries=/etc/prometheus/console_libraries'
      - '--web.console.templates=/etc/prometheus/consoles'
      - '--storage.tsdb.retention.time=15d'
      - '--web.enable-lifecycle'

  grafana:
    image: grafana/grafana:latest
    ports:
      - "3000:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=${GRAFANA_PASSWORD}
    volumes:
      - grafana_data:/var/lib/grafana
      - ./monitoring/grafana/dashboards:/etc/grafana/provisioning/dashboards:ro
      - ./monitoring/grafana/datasources:/etc/grafana/provisioning/datasources:ro
    networks:
      - studyassistant-network
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
  elasticsearch_data:
  prometheus_data:
  grafana_data:
  static_volume:
  media_volume:

networks:
  studyassistant-network:
    driver: bridge
```

## Kubernetes Deployment

### Namespace and ConfigMap

```yaml
# k8s/namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: studyassistant
  labels:
    name: studyassistant

---
apiVersion: v1
kind: ConfigMap
metadata:
  name: studyassistant-config
  namespace: studyassistant
data:
  ENVIRONMENT: "production"
  LOG_LEVEL: "INFO"
  REDIS_URL: "redis://redis-service:6379/0"
  ELASTICSEARCH_URL: "http://elasticsearch-service:9200"
  DATABASE_HOST: "postgres-service"
  DATABASE_PORT: "5432"
  DATABASE_NAME: "studyassistant"
```

### Application Deployment

```yaml
# k8s/api-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: studyassistant-api
  namespace: studyassistant
  labels:
    app: studyassistant-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: studyassistant-api
  template:
    metadata:
      labels:
        app: studyassistant-api
    spec:
      containers:
      - name: api
        image: studyassistant:latest
        ports:
        - containerPort: 8000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: studyassistant-secrets
              key: database-url
        - name: SECRET_KEY
          valueFrom:
            secretKeyRef:
              name: studyassistant-secrets
              key: secret-key
        envFrom:
        - configMapRef:
            name: studyassistant-config
        resources:
          requests:
            memory: "1Gi"
            cpu: "500m"
          limits:
            memory: "2Gi"
            cpu: "1"
        livenessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 8000
          initialDelaySeconds: 5
          periodSeconds: 5
        volumeMounts:
        - name: static-storage
          mountPath: /app/static
        - name: media-storage
          mountPath: /app/media
      volumes:
      - name: static-storage
        persistentVolumeClaim:
          claimName: static-pvc
      - name: media-storage
        persistentVolumeClaim:
          claimName: media-pvc

---
apiVersion: v1
kind: Service
metadata:
  name: studyassistant-api-service
  namespace: studyassistant
spec:
  selector:
    app: studyassistant-api
  ports:
  - protocol: TCP
    port: 8000
    targetPort: 8000
  type: ClusterIP
```

### Database StatefulSet

```yaml
# k8s/postgres-statefulset.yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: postgres
  namespace: studyassistant
spec:
  serviceName: postgres-service
  replicas: 1
  selector:
    matchLabels:
      app: postgres
  template:
    metadata:
      labels:
        app: postgres
    spec:
      containers:
      - name: postgres
        image: postgres:15
        env:
        - name: POSTGRES_DB
          valueFrom:
            secretKeyRef:
              name: postgres-secrets
              key: database-name
        - name: POSTGRES_USER
          valueFrom:
            secretKeyRef:
              name: postgres-secrets
              key: database-user
        - name: POSTGRES_PASSWORD
          valueFrom:
            secretKeyRef:
              name: postgres-secrets
              key: database-password
        ports:
        - containerPort: 5432
        volumeMounts:
        - name: postgres-storage
          mountPath: /var/lib/postgresql/data
        - name: postgres-config
          mountPath: /etc/postgresql/postgresql.conf
          subPath: postgresql.conf
        resources:
          requests:
            memory: "2Gi"
            cpu: "1"
          limits:
            memory: "4Gi"
            cpu: "2"
        livenessProbe:
          exec:
            command:
            - pg_isready
            - -U
            - $(POSTGRES_USER)
            - -d
            - $(POSTGRES_DB)
          initialDelaySeconds: 30
          periodSeconds: 10
      volumes:
      - name: postgres-config
        configMap:
          name: postgres-config
  volumeClaimTemplates:
  - metadata:
      name: postgres-storage
    spec:
      accessModes: ["ReadWriteOnce"]
      resources:
        requests:
          storage: 100Gi
      storageClassName: fast-ssd

---
apiVersion: v1
kind: Service
metadata:
  name: postgres-service
  namespace: studyassistant
spec:
  selector:
    app: postgres
  ports:
  - port: 5432
    targetPort: 5432
  clusterIP: None
```

### Horizontal Pod Autoscaler

```yaml
# k8s/hpa.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: studyassistant-api-hpa
  namespace: studyassistant
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: studyassistant-api
  minReplicas: 3
  maxReplicas: 20
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
  - type: Pods
    pods:
      metric:
        name: http_requests_per_second
      target:
        type: AverageValue
        averageValue: "100"
  behavior:
    scaleDown:
      stabilizationWindowSeconds: 300
      policies:
      - type: Percent
        value: 10
        periodSeconds: 60
    scaleUp:
      stabilizationWindowSeconds: 60
      policies:
      - type: Percent
        value: 50
        periodSeconds: 60
      - type: Pods
        value: 2
        periodSeconds: 60
      selectPolicy: Max
```

## CI/CD Pipeline

### GitHub Actions Workflow

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: test_db
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432
      
      redis:
        image: redis:7
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 6379:6379
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Set up Python
      uses: actions/setup-python@v4
      with:
        python-version: '3.11'
    
    - name: Install dependencies
      run: |
        python -m pip install --upgrade pip
        pip install -r requirements.txt
        pip install -r requirements-dev.txt
    
    - name: Run linting
      run: |
        flake8 src tests
        black --check src tests
        isort --check-only src tests
        mypy src
    
    - name: Run security checks
      run: |
        bandit -r src
        safety check
    
    - name: Run tests
      env:
        DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db
        REDIS_URL: redis://localhost:6379/0
        SECRET_KEY: test-secret-key
      run: |
        pytest tests/ -v --cov=src --cov-report=xml
    
    - name: Upload coverage to Codecov
      uses: codecov/codecov-action@v3
      with:
        file: ./coverage.xml
        fail_ci_if_error: true

  build:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    permissions:
      contents: read
      packages: write
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Log in to Container Registry
      uses: docker/login-action@v3
      with:
        registry: ${{ env.REGISTRY }}
        username: ${{ github.actor }}
        password: ${{ secrets.GITHUB_TOKEN }}
    
    - name: Extract metadata
      id: meta
      uses: docker/metadata-action@v5
      with:
        images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}
        tags: |
          type=ref,event=branch
          type=ref,event=pr
          type=sha,prefix={{branch}}-
          type=raw,value=latest,enable={{is_default_branch}}
    
    - name: Build and push Docker image
      uses: docker/build-push-action@v5
      with:
        context: .
        push: true
        tags: ${{ steps.meta.outputs.tags }}
        labels: ${{ steps.meta.outputs.labels }}
        cache-from: type=gha
        cache-to: type=gha,mode=max

  deploy:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    environment:
      name: production
      url: https://api.yourdomain.com
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Configure kubectl
      run: |
        mkdir -p ~/.kube
        echo "${{ secrets.KUBE_CONFIG }}" | base64 -d > ~/.kube/config
    
    - name: Deploy to Kubernetes
      run: |
        # Update image tag in deployment
        kubectl set image deployment/studyassistant-api api=${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:${{ github.sha }} -n studyassistant
        
        # Wait for rollout to complete
        kubectl rollout status deployment/studyassistant-api -n studyassistant --timeout=300s
    
    - name: Run database migrations
      run: |
        kubectl run migration-job --image=${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:${{ github.sha }} \
          --restart=Never \
          --env="DATABASE_URL=${{ secrets.DATABASE_URL }}" \
          --command -- python -m alembic upgrade head
        
        kubectl wait --for=condition=complete job/migration-job --timeout=300s
        kubectl delete job migration-job
    
    - name: Verify deployment
      run: |
        # Wait for pods to be ready
        kubectl wait --for=condition=ready pod -l app=studyassistant-api -n studyassistant --timeout=300s
        
        # Run health check
        kubectl port-forward service/studyassistant-api-service 8080:8000 -n studyassistant &
        sleep 10
        
        health_status=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/health)
        if [ "$health_status" != "200" ]; then
          echo "Health check failed with status: $health_status"
          exit 1
        fi
        
        echo "Deployment verified successfully"

  notify:
    needs: [test, build, deploy]
    runs-on: ubuntu-latest
    if: always()
    
    steps:
    - name: Notify Slack
      uses: 8398a7/action-slack@v3
      with:
        status: ${{ job.status }}
        channel: '#deployments'
        webhook_url: ${{ secrets.SLACK_WEBHOOK }}
        fields: repo,message,commit,author,action,eventName,ref,workflow
```

### GitLab CI/CD Pipeline

```yaml
# .gitlab-ci.yml
stages:
  - test
  - security
  - build
  - deploy

variables:
  DOCKER_DRIVER: overlay2
  DOCKER_TLS_CERTDIR: "/certs"
  POSTGRES_DB: test_db
  POSTGRES_USER: postgres
  POSTGRES_PASSWORD: postgres
  REDIS_URL: redis://redis:6379/0

test:
  stage: test
  image: python:3.11
  
  services:
    - postgres:15
    - redis:7
  
  variables:
    DATABASE_URL: postgresql://postgres:postgres@postgres:5432/test_db
  
  before_script:
    - pip install -r requirements.txt
    - pip install -r requirements-dev.txt
  
  script:
    - flake8 src tests
    - black --check src tests
    - isort --check-only src tests
    - mypy src
    - pytest tests/ -v --cov=src --cov-report=xml
  
  coverage: '/TOTAL.*\s+(\d+%)$/'
  
  artifacts:
    reports:
      coverage_report:
        coverage_format: cobertura
        path: coverage.xml

security_scan:
  stage: security
  image: python:3.11
  
  before_script:
    - pip install bandit safety
  
  script:
    - bandit -r src -f json -o bandit-report.json
    - safety check --json --output safety-report.json
  
  artifacts:
    reports:
      security_report:
        - bandit-report.json
        - safety-report.json
  
  allow_failure: false

build:
  stage: build
  image: docker:latest
  
  services:
    - docker:dind
  
  before_script:
    - docker login -u $CI_REGISTRY_USER -p $CI_REGISTRY_PASSWORD $CI_REGISTRY
  
  script:
    - docker build -t $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA .
    - docker push $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA
    - docker tag $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA $CI_REGISTRY_IMAGE:latest
    - docker push $CI_REGISTRY_IMAGE:latest
  
  only:
    - main

deploy_staging:
  stage: deploy
  image: bitnami/kubectl:latest
  
  before_script:
    - echo $KUBE_CONFIG | base64 -d > kubeconfig
    - export KUBECONFIG=kubeconfig
  
  script:
    - kubectl set image deployment/studyassistant-api api=$CI_REGISTRY_IMAGE:$CI_COMMIT_SHA -n studyassistant-staging
    - kubectl rollout status deployment/studyassistant-api -n studyassistant-staging
  
  environment:
    name: staging
    url: https://staging-api.yourdomain.com
  
  only:
    - main

deploy_production:
  stage: deploy
  image: bitnami/kubectl:latest
  
  before_script:
    - echo $KUBE_CONFIG | base64 -d > kubeconfig
    - export KUBECONFIG=kubeconfig
  
  script:
    - kubectl set image deployment/studyassistant-api api=$CI_REGISTRY_IMAGE:$CI_COMMIT_SHA -n studyassistant
    - kubectl rollout status deployment/studyassistant-api -n studyassistant
    - kubectl run migration-job --image=$CI_REGISTRY_IMAGE:$CI_COMMIT_SHA --restart=Never --env="DATABASE_URL=$DATABASE_URL" --command -- python -m alembic upgrade head
    - kubectl wait --for=condition=complete job/migration-job --timeout=300s
    - kubectl delete job migration-job
  
  environment:
    name: production
    url: https://api.yourdomain.com
  
  when: manual
  only:
    - main
```

## Environment Configuration

### Production Environment Variables

```bash
# .env.production
# Application
ENVIRONMENT=production
DEBUG=false
SECRET_KEY=your-super-secret-key-generate-new-one
ALLOWED_HOSTS=yourdomain.com,api.yourdomain.com

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/studyassistant
DATABASE_POOL_SIZE=20
DATABASE_MAX_OVERFLOW=30
DATABASE_POOL_TIMEOUT=30

# Redis
REDIS_URL=redis://localhost:6379/0
REDIS_PASSWORD=your-redis-password

# Elasticsearch
ELASTICSEARCH_URL=http://localhost:9200
ELASTICSEARCH_USERNAME=elastic
ELASTICSEARCH_PASSWORD=your-elastic-password

# Security
JWT_SECRET_KEY=your-jwt-secret-key
ENCRYPTION_KEY=your-encryption-key
RATE_LIMIT_ENABLED=true

# External Services
OPENAI_API_KEY=your-openai-api-key
ANTHROPIC_API_KEY=your-anthropic-api-key
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
AWS_REGION=us-east-1
S3_BUCKET_NAME=studyassistant-storage

# Monitoring
SENTRY_DSN=your-sentry-dsn
PROMETHEUS_ENABLED=true
GRAFANA_ENABLED=true

# Logging
LOG_LEVEL=INFO
LOG_FORMAT=json
STRUCTURED_LOGGING=true

# Performance
WORKER_PROCESSES=4
WORKER_CONNECTIONS=1000
MAX_REQUESTS=1000
MAX_REQUESTS_JITTER=100

# Cache
CACHE_TTL=3600
CACHE_MAX_SIZE=1000
```

### Configuration Management

```python
# config/production.py
import os
from typing import Optional
from pydantic import BaseSettings, validator

class ProductionConfig(BaseSettings):
    """Production configuration."""
    
    # Application
    environment: str = "production"
    debug: bool = False
    secret_key: str
    allowed_hosts: list[str] = ["yourdomain.com"]
    
    # Database
    database_url: str
    database_pool_size: int = 20
    database_max_overflow: int = 30
    database_pool_timeout: int = 30
    database_ssl_require: bool = True
    
    # Redis
    redis_url: str
    redis_password: Optional[str] = None
    redis_ssl: bool = True
    
    # Security
    jwt_secret_key: str
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 30
    cors_origins: list[str] = ["https://yourdomain.com"]
    
    # Rate Limiting
    rate_limit_enabled: bool = True
    rate_limit_per_minute: int = 60
    rate_limit_per_hour: int = 1000
    
    # Monitoring
    sentry_dsn: Optional[str] = None
    prometheus_enabled: bool = True
    metrics_port: int = 8001
    
    # Logging
    log_level: str = "INFO"
    log_format: str = "json"
    structured_logging: bool = True
    
    # Performance
    worker_processes: int = 4
    worker_connections: int = 1000
    max_requests: int = 1000
    max_requests_jitter: int = 100
    
    # External Services
    openai_api_key: Optional[str] = None
    anthropic_api_key: Optional[str] = None
    aws_access_key_id: Optional[str] = None
    aws_secret_access_key: Optional[str] = None
    aws_region: str = "us-east-1"
    s3_bucket_name: Optional[str] = None
    
    @validator('allowed_hosts', pre=True)
    def parse_allowed_hosts(cls, v):
        if isinstance(v, str):
            return [host.strip() for host in v.split(',')]
        return v
    
    @validator('cors_origins', pre=True)
    def parse_cors_origins(cls, v):
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(',')]
        return v
    
    class Config:
        env_file = ".env.production"
        case_sensitive = False

# Singleton pattern for configuration
_config = None

def get_config() -> ProductionConfig:
    """Get production configuration instance."""
    global _config
    if _config is None:
        _config = ProductionConfig()
    return _config
```

## Monitoring & Observability

### Prometheus Configuration

```yaml
# monitoring/prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - "rules/*.yml"

alerting:
  alertmanagers:
    - static_configs:
        - targets:
          - alertmanager:9093

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  - job_name: 'studyassistant-api'
    static_configs:
      - targets: ['api:8001']
    metrics_path: /metrics
    scrape_interval: 10s

  - job_name: 'postgres'
    static_configs:
      - targets: ['postgres-exporter:9187']

  - job_name: 'redis'
    static_configs:
      - targets: ['redis-exporter:9121']

  - job_name: 'elasticsearch'
    static_configs:
      - targets: ['elasticsearch-exporter:9114']

  - job_name: 'nginx'
    static_configs:
      - targets: ['nginx-exporter:9113']

  - job_name: 'node'
    static_configs:
      - targets: ['node-exporter:9100']
```

### Grafana Dashboard Configuration

```json
{
  "dashboard": {
    "id": null,
    "title": "StudyAssistant API Monitoring",
    "tags": ["studyassistant", "api"],
    "timezone": "browser",
    "panels": [
      {
        "id": 1,
        "title": "Request Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(http_requests_total[5m])",
            "legendFormat": "{{method}} {{endpoint}}"
          }
        ],
        "yAxes": [
          {
            "label": "Requests/sec"
          }
        ]
      },
      {
        "id": 2,
        "title": "Response Time",
        "type": "graph",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))",
            "legendFormat": "95th percentile"
          },
          {
            "expr": "histogram_quantile(0.50, rate(http_request_duration_seconds_bucket[5m]))",
            "legendFormat": "50th percentile"
          }
        ]
      },
      {
        "id": 3,
        "title": "Error Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(http_requests_total{status=~\"4..|5..\"}[5m]) / rate(http_requests_total[5m])",
            "legendFormat": "Error Rate"
          }
        ]
      }
    ],
    "time": {
      "from": "now-1h",
      "to": "now"
    },
    "refresh": "5s"
  }
}
```

## Backup & Recovery

### Database Backup Strategy

```bash
#!/bin/bash
# scripts/backup.sh

set -e

# Configuration
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-studyassistant}"
DB_USER="${DB_USER:-postgres}"
BACKUP_DIR="${BACKUP_DIR:-/backups}"
S3_BUCKET="${S3_BUCKET:-studyassistant-backups}"
RETENTION_DAYS="${RETENTION_DAYS:-30}"

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Generate backup filename with timestamp
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/studyassistant_${TIMESTAMP}.sql"
COMPRESSED_FILE="${BACKUP_FILE}.gz"

echo "Starting database backup..."

# Create database dump
pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
    --verbose --clean --no-owner --no-privileges \
    --format=custom --compress=9 \
    --file="$BACKUP_FILE"

# Compress backup
gzip "$BACKUP_FILE"

echo "Backup created: $COMPRESSED_FILE"

# Upload to S3 if configured
if [ -n "$S3_BUCKET" ] && command -v aws &> /dev/null; then
    echo "Uploading backup to S3..."
    aws s3 cp "$COMPRESSED_FILE" "s3://$S3_BUCKET/database/" --storage-class STANDARD_IA
    echo "Backup uploaded to S3"
fi

# Clean up old local backups
find "$BACKUP_DIR" -name "studyassistant_*.sql.gz" -mtime +$RETENTION_DAYS -delete

# Verify backup integrity
echo "Verifying backup integrity..."
gunzip -c "$COMPRESSED_FILE" | head -n 50 > /dev/null
echo "Backup verification completed"

echo "Backup process completed successfully"
```

### Automated Backup with Cron

```bash
# crontab entry for automated backups
# Run backup daily at 2 AM
0 2 * * * /opt/studyassistant/scripts/backup.sh >> /var/log/studyassistant-backup.log 2>&1

# Run backup verification weekly
0 3 * * 0 /opt/studyassistant/scripts/verify-backup.sh >> /var/log/studyassistant-backup-verify.log 2>&1
```

### Disaster Recovery Procedure

```bash
#!/bin/bash
# scripts/restore.sh

set -e

BACKUP_FILE="$1"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-studyassistant}"
DB_USER="${DB_USER:-postgres}"

if [ -z "$BACKUP_FILE" ]; then
    echo "Usage: $0 <backup_file>"
    exit 1
fi

echo "Starting database restoration from $BACKUP_FILE"

# Create database if it doesn't exist
createdb -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" "$DB_NAME" || true

# Restore database
if [[ "$BACKUP_FILE" == *.gz ]]; then
    gunzip -c "$BACKUP_FILE" | pg_restore -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" --verbose --clean
else
    pg_restore -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" --verbose --clean "$BACKUP_FILE"
fi

echo "Database restoration completed"

# Run migrations to ensure schema is up to date
echo "Running database migrations..."
python -m alembic upgrade head

echo "Restoration process completed successfully"
```

## Health Checks & Readiness

### Comprehensive Health Check

```python
# health/checker.py
from typing import Dict, Any, List
import asyncio
import time
from enum import Enum
from dataclasses import dataclass
import psutil
import asyncpg
import redis.asyncio as redis
from elasticsearch import AsyncElasticsearch

class HealthStatus(Enum):
    HEALTHY = "healthy"
    DEGRADED = "degraded"
    UNHEALTHY = "unhealthy"

@dataclass
class HealthCheck:
    name: str
    status: HealthStatus
    response_time_ms: float
    details: Dict[str, Any]
    error: str = None

class SystemHealthChecker:
    """Comprehensive system health checker."""
    
    def __init__(self, config):
        self.config = config
        self.checks = [
            self._check_database,
            self._check_redis,
            self._check_elasticsearch,
            self._check_disk_space,
            self._check_memory_usage,
            self._check_external_services,
        ]
    
    async def run_all_checks(self) -> Dict[str, Any]:
        """Run all health checks."""
        start_time = time.time()
        results = []
        
        # Run checks concurrently
        tasks = [self._run_check(check) for check in self.checks]
        check_results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Process results
        overall_status = HealthStatus.HEALTHY
        for result in check_results:
            if isinstance(result, Exception):
                results.append(HealthCheck(
                    name="unknown",
                    status=HealthStatus.UNHEALTHY,
                    response_time_ms=0,
                    details={},
                    error=str(result)
                ))
                overall_status = HealthStatus.UNHEALTHY
            else:
                results.append(result)
                if result.status == HealthStatus.UNHEALTHY:
                    overall_status = HealthStatus.UNHEALTHY
                elif result.status == HealthStatus.DEGRADED and overall_status == HealthStatus.HEALTHY:
                    overall_status = HealthStatus.DEGRADED
        
        total_time = (time.time() - start_time) * 1000
        
        return {
            "status": overall_status.value,
            "timestamp": time.time(),
            "total_check_time_ms": total_time,
            "checks": [
                {
                    "name": check.name,
                    "status": check.status.value,
                    "response_time_ms": check.response_time_ms,
                    "details": check.details,
                    "error": check.error
                }
                for check in results
            ]
        }
    
    async def _run_check(self, check_func) -> HealthCheck:
        """Run individual health check with timing."""
        start_time = time.time()
        try:
            result = await check_func()
            result.response_time_ms = (time.time() - start_time) * 1000
            return result
        except Exception as e:
            return HealthCheck(
                name=check_func.__name__.replace('_check_', ''),
                status=HealthStatus.UNHEALTHY,
                response_time_ms=(time.time() - start_time) * 1000,
                details={},
                error=str(e)
            )
    
    async def _check_database(self) -> HealthCheck:
        """Check database connectivity and performance."""
        try:
            conn = await asyncpg.connect(self.config.database_url)
            
            # Test basic query
            start_time = time.time()
            result = await conn.fetchval("SELECT 1")
            query_time = (time.time() - start_time) * 1000
            
            # Check connection pool status
            pool_info = await conn.fetchrow("""
                SELECT 
                    count(*) as total_connections,
                    count(*) FILTER (WHERE state = 'active') as active_connections
                FROM pg_stat_activity 
                WHERE datname = current_database()
            """)
            
            await conn.close()
            
            status = HealthStatus.HEALTHY
            if query_time > 100:  # > 100ms is degraded
                status = HealthStatus.DEGRADED
            if query_time > 1000:  # > 1s is unhealthy
                status = HealthStatus.UNHEALTHY
            
            return HealthCheck(
                name="database",
                status=status,
                response_time_ms=0,  # Will be set by _run_check
                details={
                    "query_time_ms": query_time,
                    "total_connections": pool_info["total_connections"],
                    "active_connections": pool_info["active_connections"]
                }
            )
            
        except Exception as e:
            return HealthCheck(
                name="database",
                status=HealthStatus.UNHEALTHY,
                response_time_ms=0,
                details={},
                error=str(e)
            )
    
    async def _check_redis(self) -> HealthCheck:
        """Check Redis connectivity and performance."""
        try:
            client = redis.from_url(self.config.redis_url)
            
            # Test ping
            start_time = time.time()
            await client.ping()
            ping_time = (time.time() - start_time) * 1000
            
            # Get info
            info = await client.info()
            
            await client.close()
            
            status = HealthStatus.HEALTHY
            if ping_time > 50:  # > 50ms is degraded
                status = HealthStatus.DEGRADED
            if ping_time > 500:  # > 500ms is unhealthy
                status = HealthStatus.UNHEALTHY
            
            return HealthCheck(
                name="redis",
                status=status,
                response_time_ms=0,
                details={
                    "ping_time_ms": ping_time,
                    "connected_clients": info.get("connected_clients", 0),
                    "used_memory_human": info.get("used_memory_human", "unknown")
                }
            )
            
        except Exception as e:
            return HealthCheck(
                name="redis",
                status=HealthStatus.UNHEALTHY,
                response_time_ms=0,
                details={},
                error=str(e)
            )
    
    async def _check_elasticsearch(self) -> HealthCheck:
        """Check Elasticsearch connectivity and cluster health."""
        try:
            es = AsyncElasticsearch([self.config.elasticsearch_url])
            
            # Test cluster health
            start_time = time.time()
            health = await es.cluster.health()
            health_time = (time.time() - start_time) * 1000
            
            await es.close()
            
            # Determine status based on cluster health
            cluster_status = health["status"]
            if cluster_status == "green":
                status = HealthStatus.HEALTHY
            elif cluster_status == "yellow":
                status = HealthStatus.DEGRADED
            else:
                status = HealthStatus.UNHEALTHY
            
            return HealthCheck(
                name="elasticsearch",
                status=status,
                response_time_ms=0,
                details={
                    "health_time_ms": health_time,
                    "cluster_status": cluster_status,
                    "number_of_nodes": health["number_of_nodes"],
                    "active_primary_shards": health["active_primary_shards"]
                }
            )
            
        except Exception as e:
            return HealthCheck(
                name="elasticsearch",
                status=HealthStatus.UNHEALTHY,
                response_time_ms=0,
                details={},
                error=str(e)
            )
    
    async def _check_disk_space(self) -> HealthCheck:
        """Check disk space usage."""
        try:
            disk_usage = psutil.disk_usage('/')
            usage_percent = (disk_usage.used / disk_usage.total) * 100
            
            status = HealthStatus.HEALTHY
            if usage_percent > 80:  # > 80% is degraded
                status = HealthStatus.DEGRADED
            if usage_percent > 90:  # > 90% is unhealthy
                status = HealthStatus.UNHEALTHY
            
            return HealthCheck(
                name="disk_space",
                status=status,
                response_time_ms=0,
                details={
                    "usage_percent": usage_percent,
                    "free_gb": disk_usage.free / (1024**3),
                    "total_gb": disk_usage.total / (1024**3)
                }
            )
            
        except Exception as e:
            return HealthCheck(
                name="disk_space",
                status=HealthStatus.UNHEALTHY,
                response_time_ms=0,
                details={},
                error=str(e)
            )
    
    async def _check_memory_usage(self) -> HealthCheck:
        """Check memory usage."""
        try:
            memory = psutil.virtual_memory()
            usage_percent = memory.percent
            
            status = HealthStatus.HEALTHY
            if usage_percent > 80:  # > 80% is degraded
                status = HealthStatus.DEGRADED
            if usage_percent > 90:  # > 90% is unhealthy
                status = HealthStatus.UNHEALTHY
            
            return HealthCheck(
                name="memory",
                status=status,
                response_time_ms=0,
                details={
                    "usage_percent": usage_percent,
                    "available_gb": memory.available / (1024**3),
                    "total_gb": memory.total / (1024**3)
                }
            )
            
        except Exception as e:
            return HealthCheck(
                name="memory",
                status=HealthStatus.UNHEALTHY,
                response_time_ms=0,
                details={},
                error=str(e)
            )
    
    async def _check_external_services(self) -> HealthCheck:
        """Check external service dependencies."""
        try:
            # This would check external APIs like OpenAI, Anthropic, etc.
            # For now, return healthy if no critical external dependencies
            
            return HealthCheck(
                name="external_services",
                status=HealthStatus.HEALTHY,
                response_time_ms=0,
                details={
                    "message": "No critical external dependencies configured"
                }
            )
            
        except Exception as e:
            return HealthCheck(
                name="external_services",
                status=HealthStatus.UNHEALTHY,
                response_time_ms=0,
                details={},
                error=str(e)
            )
```

## Best Practices

### Deployment Checklist

1. **Pre-deployment**
   - ✅ Run comprehensive test suite
   - ✅ Security vulnerability scan
   - ✅ Performance testing under load
   - ✅ Database migration testing
   - ✅ Backup verification
   - ✅ Configuration validation

2. **Deployment Process**
   - ✅ Blue-green deployment or rolling update
   - ✅ Database migrations with rollback plan
   - ✅ Health check validation
   - ✅ Smoke tests on production
   - ✅ Monitoring alert validation
   - ✅ Load balancer health checks

3. **Post-deployment**
   - ✅ Monitor error rates and performance
   - ✅ Verify all services are healthy
   - ✅ Check log aggregation is working
   - ✅ Validate backup processes
   - ✅ Test rollback procedures
   - ✅ Update documentation

### Production Hardening

1. **Security Hardening**
   - Use non-root containers
   - Enable security contexts in Kubernetes
   - Regular security patches and updates
   - Network policies and firewalls
   - Secret management (not in containers)
   - TLS everywhere with proper certificates

2. **Performance Optimization**
   - Resource limits and requests
   - Horizontal pod autoscaling
   - Connection pooling and caching
   - CDN for static assets
   - Database read replicas
   - Async processing for heavy tasks

3. **Reliability**
   - Circuit breakers for external services
   - Retry mechanisms with exponential backoff
   - Graceful shutdown handling
   - Health checks and readiness probes
   - Database connection recovery
   - Rate limiting and throttling

### Common Pitfalls

1. **Configuration Management**
   - Don't hardcode secrets in containers
   - Use proper environment-specific configs
   - Validate configuration at startup
   - Use configuration management tools

2. **Database Management**
   - Always test migrations before production
   - Have rollback plans for schema changes
   - Monitor connection pool sizes
   - Set up proper indexing and query optimization

3. **Monitoring & Alerting**
   - Set up meaningful alerts (not just infrastructure)
   - Monitor business metrics, not just technical ones
   - Use structured logging with correlation IDs
   - Implement distributed tracing for complex workflows

## Related Documentation

- [Scalability Guide](scalability.md) - Scaling strategies and patterns
- [Security Guide](security.md) - Security configurations for production
- [Performance Optimization](performance-optimization.md) - Production performance tuning
- [Monitoring](../architecture/monitoring.md) - Comprehensive monitoring setup
