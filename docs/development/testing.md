# Testing

Comprehensive testing strategy and implementation guide for the StudyAssistant project.

## Overview

StudyAssistant implements a multi-layered testing strategy covering unit tests, integration tests, end-to-end tests, performance tests, and specialized testing for AI/ML components.

## Testing Architecture

### Testing Pyramid

```mermaid
graph TB
    A[E2E Tests<br/>~5%] --> B[Integration Tests<br/>~25%]
    B --> C[Unit Tests<br/>~70%]
    
    D[Performance Tests] --> A
    E[Security Tests] --> A
    F[ML Model Tests] --> B
    G[API Contract Tests] --> B
```

## Test Organization

### Directory Structure

```
tests/
├── unit/                     # Unit tests
│   ├── components/
│   ├── services/
│   ├── utils/
│   └── conftest.py
├── integration/              # Integration tests
│   ├── api/
│   ├── database/
│   ├── external_services/
│   └── conftest.py
├── e2e/                     # End-to-end tests
│   ├── scenarios/
│   ├── fixtures/
│   └── conftest.py
├── performance/             # Performance tests
│   ├── load_tests/
│   ├── stress_tests/
│   └── benchmarks/
├── ml/                      # ML-specific tests
│   ├── model_tests/
│   ├── data_validation/
│   └── evaluation/
├── fixtures/                # Test data and fixtures
│   ├── sample_papers/
│   ├── mock_responses/
│   └── test_databases/
└── utils/                   # Test utilities
    ├── factories.py
    ├── assertions.py
    └── mocks.py
```

## Unit Testing

### Test Setup and Configuration

```python
# tests/conftest.py
import pytest
import asyncio
from unittest.mock import AsyncMock, Mock
import tempfile
from pathlib import Path
from typing import Dict, Any, Generator

from studyassistant.core.config import Settings
from studyassistant.core.database import DatabaseManager
from studyassistant.services.arxiv_client import ArxivClient

@pytest.fixture(scope="session")
def event_loop():
    """Create an instance of the default event loop for the test session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()

@pytest.fixture
def test_settings() -> Settings:
    """Create test settings configuration."""
    return Settings(
        database_url="sqlite:///:memory:",
        log_level="DEBUG",
        testing=True,
        cache_enabled=False,
        external_apis_enabled=False
    )

@pytest.fixture
async def database_manager(test_settings):
    """Create test database manager."""
    db_manager = DatabaseManager(test_settings)
    await db_manager.initialize()
    yield db_manager
    await db_manager.close()

@pytest.fixture
def temp_directory() -> Generator[Path, None, None]:
    """Create temporary directory for tests."""
    with tempfile.TemporaryDirectory() as temp_dir:
        yield Path(temp_dir)

@pytest.fixture
def mock_arxiv_client():
    """Create mock ArXiv client."""
    client = Mock(spec=ArxivClient)
    client.fetch_paper = AsyncMock()
    client.search_papers = AsyncMock()
    return client

@pytest.fixture
def sample_paper_data() -> Dict[str, Any]:
    """Sample paper data for testing."""
    return {
        "id": "2301.07041",
        "title": "Large Language Models and Scientific Discovery",
        "abstract": "This paper explores the use of large language models...",
        "authors": ["John Doe", "Jane Smith"],
        "published": "2023-01-17",
        "categories": ["cs.AI", "cs.CL"],
        "pdf_url": "https://arxiv.org/pdf/2301.07041.pdf"
    }
```

### Component Unit Tests

```python
# tests/unit/components/test_resource_fetcher.py
import pytest
from unittest.mock import AsyncMock, Mock, patch
from datetime import datetime

from studyassistant.components.resource_fetcher import ResourceFetcher
from studyassistant.exceptions import ExternalServiceError, ValidationError

class TestResourceFetcher:
    """Test suite for ResourceFetcher component."""
    
    @pytest.fixture
    def resource_fetcher(self, test_settings, mock_arxiv_client):
        """Create ResourceFetcher instance for testing."""
        return ResourceFetcher(
            settings=test_settings,
            arxiv_client=mock_arxiv_client
        )
    
    @pytest.mark.asyncio
    async def test_fetch_paper_success(self, resource_fetcher, mock_arxiv_client, sample_paper_data):
        """Test successful paper fetching."""
        # Arrange
        paper_id = "2301.07041"
        mock_arxiv_client.fetch_paper.return_value = sample_paper_data
        
        # Act
        result = await resource_fetcher.fetch_paper(paper_id)
        
        # Assert
        assert result is not None
        assert result["id"] == paper_id
        assert result["title"] == sample_paper_data["title"]
        mock_arxiv_client.fetch_paper.assert_called_once_with(paper_id)
    
    @pytest.mark.asyncio
    async def test_fetch_paper_invalid_id(self, resource_fetcher):
        """Test fetching paper with invalid ID."""
        # Arrange
        invalid_id = ""
        
        # Act & Assert
        with pytest.raises(ValidationError) as exc_info:
            await resource_fetcher.fetch_paper(invalid_id)
        
        assert "Invalid paper ID" in str(exc_info.value)
    
    @pytest.mark.asyncio
    async def test_fetch_paper_api_error(self, resource_fetcher, mock_arxiv_client):
        """Test handling of API errors."""
        # Arrange
        paper_id = "2301.07041"
        mock_arxiv_client.fetch_paper.side_effect = ExternalServiceError(
            "ArXiv service unavailable"
        )
        
        # Act & Assert
        with pytest.raises(ExternalServiceError):
            await resource_fetcher.fetch_paper(paper_id)
    
    @pytest.mark.asyncio
    async def test_fetch_multiple_papers(self, resource_fetcher, mock_arxiv_client, sample_paper_data):
        """Test fetching multiple papers."""
        # Arrange
        paper_ids = ["2301.07041", "2301.07042", "2301.07043"]
        mock_arxiv_client.fetch_paper.return_value = sample_paper_data
        
        # Act
        results = await resource_fetcher.fetch_multiple_papers(paper_ids)
        
        # Assert
        assert len(results) == 3
        assert all(result is not None for result in results)
        assert mock_arxiv_client.fetch_paper.call_count == 3
    
    @pytest.mark.asyncio
    async def test_fetch_papers_with_failures(self, resource_fetcher, mock_arxiv_client, sample_paper_data):
        """Test fetching papers with some failures."""
        # Arrange
        paper_ids = ["2301.07041", "invalid", "2301.07043"]
        
        def mock_fetch(paper_id):
            if paper_id == "invalid":
                raise ExternalServiceError("Paper not found")
            return sample_paper_data
        
        mock_arxiv_client.fetch_paper.side_effect = mock_fetch
        
        # Act
        results = await resource_fetcher.fetch_multiple_papers(
            paper_ids, 
            raise_on_error=False
        )
        
        # Assert
        assert len(results) == 2  # Only successful fetches
        assert all(result is not None for result in results)
    
    @pytest.mark.asyncio
    async def test_caching_behavior(self, resource_fetcher, mock_arxiv_client, sample_paper_data):
        """Test paper caching functionality."""
        # Arrange
        paper_id = "2301.07041"
        mock_arxiv_client.fetch_paper.return_value = sample_paper_data
        
        # Act - First fetch
        result1 = await resource_fetcher.fetch_paper(paper_id)
        
        # Act - Second fetch (should use cache)
        result2 = await resource_fetcher.fetch_paper(paper_id)
        
        # Assert
        assert result1 == result2
        # Should only call external API once due to caching
        mock_arxiv_client.fetch_paper.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_rate_limiting(self, resource_fetcher, mock_arxiv_client, sample_paper_data):
        """Test rate limiting functionality."""
        # Arrange
        resource_fetcher.rate_limit = 2  # 2 requests per second
        mock_arxiv_client.fetch_paper.return_value = sample_paper_data
        
        # Act
        start_time = datetime.now()
        paper_ids = ["2301.07041", "2301.07042", "2301.07043"]
        
        results = await resource_fetcher.fetch_multiple_papers(paper_ids)
        end_time = datetime.now()
        
        # Assert
        assert len(results) == 3
        # Should take at least 1 second due to rate limiting
        assert (end_time - start_time).total_seconds() >= 1.0
```

### Service Unit Tests

```python
# tests/unit/services/test_text_processor.py
import pytest
from unittest.mock import Mock, patch

from studyassistant.services.text_processor import TextProcessor
from studyassistant.exceptions import ProcessingError

class TestTextProcessor:
    """Test suite for TextProcessor service."""
    
    @pytest.fixture
    def text_processor(self, test_settings):
        """Create TextProcessor instance for testing."""
        return TextProcessor(settings=test_settings)
    
    def test_clean_text_basic(self, text_processor):
        """Test basic text cleaning."""
        # Arrange
        dirty_text = "  This is a test   with extra spaces.  \n\n"
        
        # Act
        result = text_processor.clean_text(dirty_text)
        
        # Assert
        assert result == "This is a test with extra spaces."
    
    def test_clean_text_html_removal(self, text_processor):
        """Test HTML tag removal."""
        # Arrange
        html_text = "<p>This is <strong>bold</strong> text with <a href='#'>links</a>.</p>"
        
        # Act
        result = text_processor.clean_text(html_text)
        
        # Assert
        assert result == "This is bold text with links."
        assert "<" not in result
        assert ">" not in result
    
    def test_extract_keywords(self, text_processor):
        """Test keyword extraction."""
        # Arrange
        text = """
        Machine learning and artificial intelligence are transforming
        scientific research. Natural language processing enables
        automated analysis of research papers.
        """
        
        # Act
        keywords = text_processor.extract_keywords(text, top_k=5)
        
        # Assert
        assert len(keywords) <= 5
        assert any("machine learning" in kw.lower() for kw in keywords)
        assert any("artificial intelligence" in kw.lower() for kw in keywords)
    
    def test_chunk_text(self, text_processor):
        """Test text chunking functionality."""
        # Arrange
        long_text = "This is a sentence. " * 100  # 100 sentences
        
        # Act
        chunks = text_processor.chunk_text(long_text, max_chunk_size=500)
        
        # Assert
        assert len(chunks) > 1
        assert all(len(chunk) <= 500 for chunk in chunks)
        assert "".join(chunks).replace(" ", "") == long_text.replace(" ", "")
    
    def test_extract_citations(self, text_processor):
        """Test citation extraction."""
        # Arrange
        text_with_citations = """
        Recent work by Smith et al. (2023) demonstrates improvements.
        See also [1] and [Zhang et al., 2022] for related approaches.
        arXiv:2301.07041 provides additional insights.
        """
        
        # Act
        citations = text_processor.extract_citations(text_with_citations)
        
        # Assert
        assert len(citations) > 0
        assert any("Smith et al." in citation for citation in citations)
        assert any("2301.07041" in citation for citation in citations)
    
    @pytest.mark.asyncio
    async def test_process_text_async(self, text_processor):
        """Test asynchronous text processing."""
        # Arrange
        texts = [
            "First document text for processing.",
            "Second document with different content.",
            "Third document for batch processing."
        ]
        
        # Act
        results = await text_processor.process_batch(texts)
        
        # Assert
        assert len(results) == 3
        assert all(result["cleaned_text"] for result in results)
        assert all(result["keywords"] for result in results)
    
    def test_language_detection(self, text_processor):
        """Test language detection."""
        # Arrange
        english_text = "This is an English text document."
        spanish_text = "Este es un documento de texto en español."
        
        # Act
        lang_en = text_processor.detect_language(english_text)
        lang_es = text_processor.detect_language(spanish_text)
        
        # Assert
        assert lang_en == "en"
        assert lang_es == "es"
    
    def test_text_statistics(self, text_processor):
        """Test text statistics calculation."""
        # Arrange
        text = """
        This is a test document. It contains multiple sentences.
        The document has several words and characters.
        """
        
        # Act
        stats = text_processor.get_text_statistics(text)
        
        # Assert
        assert stats["word_count"] > 0
        assert stats["sentence_count"] > 0
        assert stats["character_count"] > 0
        assert stats["avg_sentence_length"] > 0
    
    def test_error_handling(self, text_processor):
        """Test error handling for invalid inputs."""
        # Act & Assert
        with pytest.raises(ProcessingError):
            text_processor.clean_text(None)
        
        with pytest.raises(ProcessingError):
            text_processor.extract_keywords("")
```

## Integration Testing

### Database Integration Tests

```python
# tests/integration/database/test_paper_repository.py
import pytest
from datetime import datetime

from studyassistant.repositories.paper_repository import PaperRepository
from studyassistant.models.paper import Paper
from studyassistant.exceptions import DatabaseError

class TestPaperRepository:
    """Integration tests for PaperRepository."""
    
    @pytest.fixture
    async def paper_repository(self, database_manager):
        """Create PaperRepository with test database."""
        return PaperRepository(database_manager)
    
    @pytest.fixture
    def sample_paper(self) -> Paper:
        """Create sample paper for testing."""
        return Paper(
            arxiv_id="2301.07041",
            title="Test Paper",
            abstract="This is a test abstract.",
            authors=["John Doe", "Jane Smith"],
            published_date=datetime.now(),
            categories=["cs.AI"],
            pdf_url="https://arxiv.org/pdf/2301.07041.pdf"
        )
    
    @pytest.mark.asyncio
    async def test_save_and_retrieve_paper(self, paper_repository, sample_paper):
        """Test saving and retrieving a paper."""
        # Act - Save paper
        saved_paper = await paper_repository.save(sample_paper)
        
        # Assert - Paper has ID
        assert saved_paper.id is not None
        
        # Act - Retrieve paper
        retrieved_paper = await paper_repository.get_by_id(saved_paper.id)
        
        # Assert - Retrieved paper matches saved paper
        assert retrieved_paper is not None
        assert retrieved_paper.arxiv_id == sample_paper.arxiv_id
        assert retrieved_paper.title == sample_paper.title
    
    @pytest.mark.asyncio
    async def test_find_by_arxiv_id(self, paper_repository, sample_paper):
        """Test finding paper by ArXiv ID."""
        # Arrange
        await paper_repository.save(sample_paper)
        
        # Act
        found_paper = await paper_repository.find_by_arxiv_id(sample_paper.arxiv_id)
        
        # Assert
        assert found_paper is not None
        assert found_paper.arxiv_id == sample_paper.arxiv_id
    
    @pytest.mark.asyncio
    async def test_search_papers(self, paper_repository):
        """Test paper search functionality."""
        # Arrange - Create multiple papers
        papers = [
            Paper(
                arxiv_id=f"2301.0704{i}",
                title=f"Machine Learning Paper {i}",
                abstract=f"Abstract about machine learning topic {i}",
                authors=["Author A"],
                published_date=datetime.now(),
                categories=["cs.AI"]
            )
            for i in range(3)
        ]
        
        for paper in papers:
            await paper_repository.save(paper)
        
        # Act
        results = await paper_repository.search("machine learning")
        
        # Assert
        assert len(results) == 3
        assert all("Machine Learning" in paper.title for paper in results)
    
    @pytest.mark.asyncio
    async def test_update_paper(self, paper_repository, sample_paper):
        """Test updating a paper."""
        # Arrange
        saved_paper = await paper_repository.save(sample_paper)
        
        # Act - Update paper
        saved_paper.title = "Updated Test Paper"
        updated_paper = await paper_repository.update(saved_paper)
        
        # Assert
        assert updated_paper.title == "Updated Test Paper"
        
        # Verify in database
        retrieved_paper = await paper_repository.get_by_id(updated_paper.id)
        assert retrieved_paper.title == "Updated Test Paper"
    
    @pytest.mark.asyncio
    async def test_delete_paper(self, paper_repository, sample_paper):
        """Test deleting a paper."""
        # Arrange
        saved_paper = await paper_repository.save(sample_paper)
        
        # Act
        await paper_repository.delete(saved_paper.id)
        
        # Assert
        deleted_paper = await paper_repository.get_by_id(saved_paper.id)
        assert deleted_paper is None
    
    @pytest.mark.asyncio
    async def test_batch_operations(self, paper_repository):
        """Test batch save operations."""
        # Arrange
        papers = [
            Paper(
                arxiv_id=f"2301.0704{i}",
                title=f"Batch Paper {i}",
                abstract=f"Batch abstract {i}",
                authors=["Batch Author"],
                published_date=datetime.now(),
                categories=["cs.AI"]
            )
            for i in range(10)
        ]
        
        # Act
        saved_papers = await paper_repository.save_batch(papers)
        
        # Assert
        assert len(saved_papers) == 10
        assert all(paper.id is not None for paper in saved_papers)
    
    @pytest.mark.asyncio
    async def test_concurrent_access(self, paper_repository, sample_paper):
        """Test concurrent database access."""
        import asyncio
        
        # Arrange
        async def save_paper(paper_data):
            paper = Paper(**paper_data)
            return await paper_repository.save(paper)
        
        paper_data_list = [
            {
                "arxiv_id": f"2301.0704{i}",
                "title": f"Concurrent Paper {i}",
                "abstract": f"Concurrent abstract {i}",
                "authors": ["Concurrent Author"],
                "published_date": datetime.now(),
                "categories": ["cs.AI"]
            }
            for i in range(5)
        ]
        
        # Act - Concurrent saves
        tasks = [save_paper(data) for data in paper_data_list]
        results = await asyncio.gather(*tasks)
        
        # Assert
        assert len(results) == 5
        assert all(paper.id is not None for paper in results)
```

### External Service Integration Tests

```python
# tests/integration/external_services/test_arxiv_integration.py
import pytest
import aiohttp
from unittest.mock import patch, Mock

from studyassistant.services.arxiv_client import ArxivClient
from studyassistant.exceptions import ExternalServiceError, RateLimitError

class TestArxivIntegration:
    """Integration tests for ArXiv service."""
    
    @pytest.fixture
    def arxiv_client(self, test_settings):
        """Create ArXiv client for testing."""
        return ArxivClient(settings=test_settings)
    
    @pytest.mark.asyncio
    @pytest.mark.integration
    async def test_fetch_real_paper(self, arxiv_client):
        """Test fetching a real paper from ArXiv."""
        # Note: This test requires internet connection
        paper_id = "1706.03762"  # "Attention Is All You Need" paper
        
        # Act
        paper = await arxiv_client.fetch_paper(paper_id)
        
        # Assert
        assert paper is not None
        assert paper["id"] == paper_id
        assert "attention" in paper["title"].lower()
        assert len(paper["authors"]) > 0
    
    @pytest.mark.asyncio
    async def test_mock_arxiv_response(self, arxiv_client):
        """Test ArXiv client with mocked responses."""
        mock_response_data = """
        <?xml version="1.0" encoding="UTF-8"?>
        <feed xmlns="http://www.w3.org/2005/Atom">
            <entry>
                <id>http://arxiv.org/abs/2301.07041v1</id>
                <updated>2023-01-17T18:59:59Z</updated>
                <published>2023-01-17T18:59:59Z</published>
                <title>Test Paper Title</title>
                <summary>Test paper abstract content.</summary>
                <author>
                    <name>John Doe</name>
                </author>
                <category term="cs.AI" />
                <link href="http://arxiv.org/pdf/2301.07041v1.pdf" type="application/pdf" />
            </entry>
        </feed>
        """
        
        with patch('aiohttp.ClientSession.get') as mock_get:
            mock_response = Mock()
            mock_response.text.return_value = mock_response_data
            mock_response.status = 200
            mock_get.return_value.__aenter__.return_value = mock_response
            
            # Act
            paper = await arxiv_client.fetch_paper("2301.07041")
            
            # Assert
            assert paper["title"] == "Test Paper Title"
            assert "John Doe" in paper["authors"]
    
    @pytest.mark.asyncio
    async def test_rate_limiting_handling(self, arxiv_client):
        """Test rate limiting behavior."""
        with patch('aiohttp.ClientSession.get') as mock_get:
            # Mock rate limit response
            mock_response = Mock()
            mock_response.status = 429
            mock_response.headers = {"Retry-After": "60"}
            mock_get.return_value.__aenter__.return_value = mock_response
            
            # Act & Assert
            with pytest.raises(RateLimitError) as exc_info:
                await arxiv_client.fetch_paper("test-id")
            
            assert "rate limited" in str(exc_info.value).lower()
    
    @pytest.mark.asyncio
    async def test_search_papers(self, arxiv_client):
        """Test paper search functionality."""
        with patch('aiohttp.ClientSession.get') as mock_get:
            mock_response_data = """
            <?xml version="1.0" encoding="UTF-8"?>
            <feed xmlns="http://www.w3.org/2005/Atom">
                <entry>
                    <id>http://arxiv.org/abs/2301.07041v1</id>
                    <title>Machine Learning Paper 1</title>
                    <summary>First ML paper abstract.</summary>
                    <author><name>Author A</name></author>
                </entry>
                <entry>
                    <id>http://arxiv.org/abs/2301.07042v1</id>
                    <title>Machine Learning Paper 2</title>
                    <summary>Second ML paper abstract.</summary>
                    <author><name>Author B</name></author>
                </entry>
            </feed>
            """
            
            mock_response = Mock()
            mock_response.text.return_value = mock_response_data
            mock_response.status = 200
            mock_get.return_value.__aenter__.return_value = mock_response
            
            # Act
            papers = await arxiv_client.search_papers("machine learning", max_results=2)
            
            # Assert
            assert len(papers) == 2
            assert all("Machine Learning" in paper["title"] for paper in papers)
    
    @pytest.mark.asyncio
    async def test_connection_error_handling(self, arxiv_client):
        """Test handling of connection errors."""
        with patch('aiohttp.ClientSession.get') as mock_get:
            mock_get.side_effect = aiohttp.ClientConnectionError("Connection failed")
            
            # Act & Assert
            with pytest.raises(ExternalServiceError):
                await arxiv_client.fetch_paper("test-id")
    
    @pytest.mark.asyncio
    async def test_timeout_handling(self, arxiv_client):
        """Test handling of request timeouts."""
        with patch('aiohttp.ClientSession.get') as mock_get:
            mock_get.side_effect = asyncio.TimeoutError("Request timed out")
            
            # Act & Assert
            with pytest.raises(ExternalServiceError):
                await arxiv_client.fetch_paper("test-id")
```

## End-to-End Testing

### E2E Test Scenarios

```python
# tests/e2e/scenarios/test_research_workflow.py
import pytest
import asyncio
from pathlib import Path

from studyassistant.main import StudyAssistant
from studyassistant.core.config import Settings

class TestResearchWorkflow:
    """End-to-end tests for complete research workflows."""
    
    @pytest.fixture
    async def study_assistant(self, temp_directory):
        """Create StudyAssistant instance for E2E testing."""
        settings = Settings(
            database_url=f"sqlite:///{temp_directory}/test.db",
            data_directory=temp_directory,
            testing=True
        )
        
        assistant = StudyAssistant(settings)
        await assistant.initialize()
        yield assistant
        await assistant.cleanup()
    
    @pytest.mark.asyncio
    @pytest.mark.e2e
    async def test_complete_paper_analysis_workflow(self, study_assistant):
        """Test complete workflow from paper fetch to analysis."""
        # Arrange
        paper_id = "1706.03762"  # Attention Is All You Need
        
        # Act - Step 1: Fetch paper
        paper = await study_assistant.fetch_paper(paper_id)
        assert paper is not None
        
        # Act - Step 2: Process and store paper
        stored_paper = await study_assistant.store_paper(paper)
        assert stored_paper.id is not None
        
        # Act - Step 3: Generate embeddings
        embeddings = await study_assistant.generate_embeddings(stored_paper)
        assert embeddings is not None
        assert len(embeddings) > 0
        
        # Act - Step 4: Find similar papers
        similar_papers = await study_assistant.find_similar_papers(
            stored_paper, 
            limit=5
        )
        assert len(similar_papers) <= 5
        
        # Act - Step 5: Generate summary
        summary = await study_assistant.generate_summary(stored_paper)
        assert summary is not None
        assert len(summary) > 0
    
    @pytest.mark.asyncio
    @pytest.mark.e2e
    async def test_batch_processing_workflow(self, study_assistant):
        """Test batch processing of multiple papers."""
        # Arrange
        paper_ids = [
            "1706.03762",  # Attention Is All You Need
            "1512.03385",  # ResNet
            "1409.1556"    # Neural Machine Translation
        ]
        
        # Act - Batch fetch papers
        papers = await study_assistant.fetch_papers_batch(paper_ids)
        assert len(papers) == len(paper_ids)
        
        # Act - Batch process papers
        results = await study_assistant.process_papers_batch(papers)
        assert len(results) == len(papers)
        
        # Assert - All papers processed successfully
        for result in results:
            assert result["status"] == "success"
            assert result["embeddings"] is not None
            assert result["summary"] is not None
    
    @pytest.mark.asyncio
    @pytest.mark.e2e
    async def test_search_and_recommendation_workflow(self, study_assistant):
        """Test search and recommendation workflow."""
        # Arrange - First populate with some papers
        paper_ids = ["1706.03762", "1512.03385"]
        papers = await study_assistant.fetch_papers_batch(paper_ids)
        await study_assistant.process_papers_batch(papers)
        
        # Act - Search for papers
        search_results = await study_assistant.search_papers(
            query="attention mechanism neural networks",
            limit=10
        )
        assert len(search_results) > 0
        
        # Act - Get recommendations based on interests
        user_interests = ["machine learning", "neural networks", "attention"]
        recommendations = await study_assistant.get_recommendations(
            interests=user_interests,
            limit=5
        )
        assert len(recommendations) <= 5
    
    @pytest.mark.asyncio
    @pytest.mark.e2e
    async def test_error_recovery_workflow(self, study_assistant):
        """Test error recovery in workflows."""
        # Arrange - Mix of valid and invalid paper IDs
        paper_ids = ["1706.03762", "invalid-id", "1512.03385"]
        
        # Act - Process with error handling
        results = await study_assistant.fetch_papers_batch(
            paper_ids, 
            continue_on_error=True
        )
        
        # Assert - Should get results for valid IDs only
        successful_results = [r for r in results if r is not None]
        assert len(successful_results) == 2  # Only valid papers
    
    @pytest.mark.asyncio
    @pytest.mark.e2e 
    async def test_data_persistence_workflow(self, study_assistant):
        """Test data persistence across sessions."""
        # Arrange
        paper_id = "1706.03762"
        
        # Act - First session: fetch and store
        paper = await study_assistant.fetch_paper(paper_id)
        stored_paper = await study_assistant.store_paper(paper)
        paper_db_id = stored_paper.id
        
        # Act - Simulate new session: retrieve from storage
        retrieved_paper = await study_assistant.get_paper_by_id(paper_db_id)
        
        # Assert - Data persisted correctly
        assert retrieved_paper is not None
        assert retrieved_paper.arxiv_id == paper_id
        assert retrieved_paper.title == stored_paper.title
    
    @pytest.mark.asyncio
    @pytest.mark.e2e
    async def test_concurrent_processing_workflow(self, study_assistant):
        """Test concurrent processing capabilities."""
        # Arrange
        paper_ids = [f"test-{i:04d}" for i in range(10)]
        
        # Mock concurrent processing
        async def process_single_paper(paper_id):
            # Simulate processing time
            await asyncio.sleep(0.1)
            return {"id": paper_id, "status": "processed"}
        
        # Act - Process papers concurrently
        tasks = [process_single_paper(pid) for pid in paper_ids]
        results = await asyncio.gather(*tasks)
        
        # Assert
        assert len(results) == 10
        assert all(r["status"] == "processed" for r in results)
```

## Performance Testing

### Load Testing

```python
# tests/performance/load_tests/test_api_load.py
import pytest
import asyncio
import time
from statistics import mean, median
from typing import List, Dict, Any

class TestAPILoadPerformance:
    """Load testing for API endpoints."""
    
    @pytest.mark.performance
    @pytest.mark.asyncio
    async def test_concurrent_paper_fetching(self, study_assistant):
        """Test concurrent paper fetching performance."""
        # Arrange
        paper_ids = ["1706.03762"] * 50  # Same paper, 50 concurrent requests
        
        # Act
        start_time = time.time()
        
        async def fetch_paper(paper_id):
            start = time.time()
            result = await study_assistant.fetch_paper(paper_id)
            end = time.time()
            return {
                "result": result,
                "duration": end - start,
                "success": result is not None
            }
        
        tasks = [fetch_paper(pid) for pid in paper_ids]
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        end_time = time.time()
        total_duration = end_time - start_time
        
        # Analyze results
        successful_results = [r for r in results if isinstance(r, dict) and r["success"]]
        durations = [r["duration"] for r in successful_results]
        
        # Assert performance expectations
        assert len(successful_results) >= 45  # At least 90% success rate
        assert total_duration < 30  # Complete within 30 seconds
        assert mean(durations) < 2.0  # Average response time < 2s
        assert median(durations) < 1.5  # Median response time < 1.5s
    
    @pytest.mark.performance
    @pytest.mark.asyncio
    async def test_database_query_performance(self, study_assistant):
        """Test database query performance under load."""
        # Arrange - Pre-populate database
        papers = []
        for i in range(100):
            paper = await study_assistant.fetch_paper("1706.03762")
            paper["id"] = f"test-{i:04d}"
            papers.append(paper)
        
        await study_assistant.store_papers_batch(papers)
        
        # Act - Concurrent queries
        async def search_papers():
            start = time.time()
            results = await study_assistant.search_papers("attention", limit=10)
            end = time.time()
            return {
                "result_count": len(results),
                "duration": end - start
            }
        
        start_time = time.time()
        tasks = [search_papers() for _ in range(20)]
        results = await asyncio.gather(*tasks)
        end_time = time.time()
        
        # Analyze results
        durations = [r["duration"] for r in results]
        
        # Assert performance expectations
        assert all(r["result_count"] > 0 for r in results)
        assert max(durations) < 1.0  # No query takes > 1 second
        assert mean(durations) < 0.5  # Average query time < 0.5s
    
    @pytest.mark.performance
    @pytest.mark.asyncio
    async def test_memory_usage_under_load(self, study_assistant):
        """Test memory usage during heavy processing."""
        import psutil
        import gc
        
        process = psutil.Process()
        initial_memory = process.memory_info().rss / 1024 / 1024  # MB
        
        # Process large batch of papers
        paper_ids = ["1706.03762"] * 100
        papers = await study_assistant.fetch_papers_batch(paper_ids)
        
        # Process embeddings for all papers
        for paper in papers:
            await study_assistant.generate_embeddings(paper)
            
        # Force garbage collection
        gc.collect()
        
        final_memory = process.memory_info().rss / 1024 / 1024  # MB
        memory_growth = final_memory - initial_memory
        
        # Assert reasonable memory usage
        assert memory_growth < 500  # Memory growth < 500MB
```

### Benchmark Tests

```python
# tests/performance/benchmarks/test_embedding_benchmarks.py
import pytest
import time
import numpy as np
from typing import List

class TestEmbeddingBenchmarks:
    """Benchmark tests for embedding generation."""
    
    @pytest.mark.benchmark
    @pytest.mark.asyncio
    async def test_embedding_generation_speed(self, study_assistant, benchmark):
        """Benchmark embedding generation speed."""
        text = "This is a sample research paper abstract for benchmarking."
        
        # Benchmark function
        def generate_embedding():
            return study_assistant.embedding_service.generate_embedding(text)
        
        # Run benchmark
        result = benchmark(generate_embedding)
        
        # Assert reasonable performance
        assert result is not None
        assert len(result) > 0
    
    @pytest.mark.benchmark
    @pytest.mark.asyncio
    async def test_batch_embedding_performance(self, study_assistant):
        """Test batch embedding generation performance."""
        texts = [
            f"Sample research paper abstract number {i} for performance testing."
            for i in range(100)
        ]
        
        # Test single embeddings
        start_time = time.time()
        single_results = []
        for text in texts:
            embedding = await study_assistant.generate_embedding(text)
            single_results.append(embedding)
        single_duration = time.time() - start_time
        
        # Test batch embeddings
        start_time = time.time()
        batch_results = await study_assistant.generate_embeddings_batch(texts)
        batch_duration = time.time() - start_time
        
        # Assert batch processing is faster
        assert len(batch_results) == len(texts)
        assert batch_duration < single_duration
        
        # Verify embedding quality is similar
        for single, batch in zip(single_results, batch_results):
            cosine_similarity = np.dot(single, batch) / (
                np.linalg.norm(single) * np.linalg.norm(batch)
            )
            assert cosine_similarity > 0.95  # Very similar embeddings
```

## ML Model Testing

### Model Validation Tests

```python
# tests/ml/model_tests/test_embedding_model.py
import pytest
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity

from studyassistant.ml.embedding_model import EmbeddingModel

class TestEmbeddingModel:
    """Tests for embedding model functionality and quality."""
    
    @pytest.fixture
    def embedding_model(self, test_settings):
        """Create embedding model for testing."""
        return EmbeddingModel(settings=test_settings)
    
    def test_embedding_consistency(self, embedding_model):
        """Test that same text produces consistent embeddings."""
        text = "Machine learning is a subset of artificial intelligence."
        
        # Generate embeddings multiple times
        embedding1 = embedding_model.encode(text)
        embedding2 = embedding_model.encode(text)
        
        # Assert consistency
        cosine_sim = cosine_similarity([embedding1], [embedding2])[0][0]
        assert cosine_sim > 0.99  # Should be nearly identical
    
    def test_semantic_similarity(self, embedding_model):
        """Test that semantically similar texts have similar embeddings."""
        # Similar texts
        text1 = "Machine learning algorithms for data analysis"
        text2 = "Data analysis using machine learning techniques"
        
        # Different texts
        text3 = "Cooking recipes for Italian cuisine"
        
        # Generate embeddings
        emb1 = embedding_model.encode(text1)
        emb2 = embedding_model.encode(text2)
        emb3 = embedding_model.encode(text3)
        
        # Calculate similarities
        sim_12 = cosine_similarity([emb1], [emb2])[0][0]
        sim_13 = cosine_similarity([emb1], [emb3])[0][0]
        
        # Assert semantic similarity
        assert sim_12 > sim_13  # Similar texts more similar than different
        assert sim_12 > 0.7  # Strong similarity for related texts
        assert sim_13 < 0.5  # Low similarity for unrelated texts
    
    def test_embedding_dimensions(self, embedding_model):
        """Test embedding output dimensions."""
        text = "Test text for dimension checking."
        embedding = embedding_model.encode(text)
        
        # Assert expected dimensions
        expected_dim = embedding_model.model.get_sentence_embedding_dimension()
        assert len(embedding) == expected_dim
        assert isinstance(embedding, np.ndarray)
    
    def test_batch_processing(self, embedding_model):
        """Test batch embedding generation."""
        texts = [
            "First research paper abstract.",
            "Second paper about machine learning.",
            "Third paper on natural language processing."
        ]
        
        # Generate embeddings
        embeddings = embedding_model.encode_batch(texts)
        
        # Assert correct output
        assert len(embeddings) == len(texts)
        assert all(isinstance(emb, np.ndarray) for emb in embeddings)
        
        # Check that different texts produce different embeddings
        for i in range(len(embeddings)):
            for j in range(i + 1, len(embeddings)):
                similarity = cosine_similarity([embeddings[i]], [embeddings[j]])[0][0]
                assert similarity < 0.95  # Should be somewhat different
    
    def test_empty_text_handling(self, embedding_model):
        """Test handling of empty or invalid text."""
        # Test empty string
        empty_embedding = embedding_model.encode("")
        assert empty_embedding is not None
        assert len(empty_embedding) > 0
        
        # Test whitespace only
        whitespace_embedding = embedding_model.encode("   \n\t  ")
        assert whitespace_embedding is not None
        
        # Test None handling
        with pytest.raises(ValueError):
            embedding_model.encode(None)
```

### Data Validation Tests

```python
# tests/ml/data_validation/test_data_quality.py
import pytest
import pandas as pd
from typing import List, Dict, Any

from studyassistant.ml.data_validator import DataValidator
from studyassistant.exceptions import DataValidationError

class TestDataQuality:
    """Tests for data quality and validation."""
    
    @pytest.fixture
    def data_validator(self, test_settings):
        """Create data validator for testing."""
        return DataValidator(settings=test_settings)
    
    @pytest.fixture
    def sample_paper_dataset(self) -> pd.DataFrame:
        """Create sample paper dataset for testing."""
        return pd.DataFrame([
            {
                "id": "2301.07041",
                "title": "Large Language Models",
                "abstract": "This paper discusses large language models...",
                "authors": ["John Doe", "Jane Smith"],
                "published": "2023-01-17",
                "categories": ["cs.AI", "cs.CL"]
            },
            {
                "id": "2301.07042", 
                "title": "Neural Networks",
                "abstract": "Neural networks for image recognition...",
                "authors": ["Alice Johnson"],
                "published": "2023-01-18",
                "categories": ["cs.CV"]
            }
        ])
    
    def test_validate_paper_schema(self, data_validator, sample_paper_dataset):
        """Test paper data schema validation."""
        # Act
        is_valid, errors = data_validator.validate_paper_schema(sample_paper_dataset)
        
        # Assert
        assert is_valid
        assert len(errors) == 0
    
    def test_detect_missing_values(self, data_validator):
        """Test detection of missing values."""
        # Arrange - Dataset with missing values
        df = pd.DataFrame([
            {"id": "1", "title": "Paper 1", "abstract": None},
            {"id": "2", "title": None, "abstract": "Abstract 2"},
            {"id": "3", "title": "Paper 3", "abstract": "Abstract 3"}
        ])
        
        # Act
        missing_report = data_validator.detect_missing_values(df)
        
        # Assert
        assert missing_report["abstract"]["count"] == 1
        assert missing_report["title"]["count"] == 1
        assert missing_report["id"]["count"] == 0
    
    def test_detect_duplicates(self, data_validator, sample_paper_dataset):
        """Test duplicate detection."""
        # Arrange - Add duplicate
        duplicate_row = sample_paper_dataset.iloc[0].copy()
        df_with_duplicates = pd.concat([sample_paper_dataset, duplicate_row.to_frame().T])
        
        # Act
        duplicates = data_validator.detect_duplicates(df_with_duplicates, subset=["id"])
        
        # Assert
        assert len(duplicates) == 1  # One duplicate pair
    
    def test_validate_text_quality(self, data_validator):
        """Test text quality validation."""
        texts = [
            "This is a high-quality research paper abstract with sufficient content.",
            "Short text.",  # Too short
            "A" * 10000,   # Too long
            "",             # Empty
            "Normal length text for research purposes and analysis."
        ]
        
        # Act
        quality_scores = data_validator.validate_text_quality(texts)
        
        # Assert
        assert quality_scores[0] > 0.8  # High quality
        assert quality_scores[1] < 0.5  # Low quality (too short)
        assert quality_scores[2] < 0.5  # Low quality (too long)
        assert quality_scores[3] == 0.0  # No quality (empty)
        assert quality_scores[4] > 0.6  # Acceptable quality
    
    def test_validate_date_formats(self, data_validator):
        """Test date format validation."""
        dates = [
            "2023-01-17",      # Valid ISO format
            "2023/01/17",      # Valid alternative format
            "invalid-date",    # Invalid
            "2023-13-01",      # Invalid month
            None               # Missing
        ]
        
        # Act
        valid_dates = data_validator.validate_date_formats(dates)
        
        # Assert
        assert valid_dates[0] is True
        assert valid_dates[1] is True
        assert valid_dates[2] is False
        assert valid_dates[3] is False
        assert valid_dates[4] is False
    
    def test_data_distribution_analysis(self, data_validator, sample_paper_dataset):
        """Test data distribution analysis."""
        # Act
        distribution_report = data_validator.analyze_data_distribution(sample_paper_dataset)
        
        # Assert
        assert "categories" in distribution_report
        assert "published" in distribution_report
        assert distribution_report["categories"]["unique_count"] > 0
    
    def test_outlier_detection(self, data_validator):
        """Test outlier detection in text lengths."""
        texts = [
            "Normal abstract length text" * 10,    # Normal
            "Short",                               # Outlier (too short)
            "Normal abstract length text" * 12,    # Normal
            "Very " * 1000,                        # Outlier (too long)
            "Normal abstract length text" * 8      # Normal
        ]
        
        # Act
        outliers = data_validator.detect_text_length_outliers(texts)
        
        # Assert
        assert 1 in outliers  # Short text
        assert 3 in outliers  # Long text
        assert 0 not in outliers  # Normal text
```

## Test Utilities and Fixtures

### Test Factories

```python
# tests/utils/factories.py
import factory
from datetime import datetime, timedelta
from typing import List, Dict, Any

from studyassistant.models.paper import Paper
from studyassistant.models.user import User

class PaperFactory(factory.Factory):
    """Factory for creating test Paper instances."""
    
    class Meta:
        model = Paper
    
    arxiv_id = factory.Sequence(lambda n: f"2301.0704{n}")
    title = factory.Faker("sentence", nb_words=6)
    abstract = factory.Faker("text", max_nb_chars=500)
    authors = factory.List([
        factory.Faker("name") for _ in range(factory.Faker("random_int", min=1, max=4))
    ])
    published_date = factory.Faker(
        "date_time_between", 
        start_date=datetime.now() - timedelta(days=365),
        end_date=datetime.now()
    )
    categories = factory.List([
        factory.Faker("random_element", elements=["cs.AI", "cs.CL", "cs.CV", "cs.LG"])
        for _ in range(factory.Faker("random_int", min=1, max=3))
    ])
    pdf_url = factory.LazyAttribute(lambda obj: f"https://arxiv.org/pdf/{obj.arxiv_id}.pdf")

class UserFactory(factory.Factory):
    """Factory for creating test User instances."""
    
    class Meta:
        model = User
    
    username = factory.Faker("user_name")
    email = factory.Faker("email")
    interests = factory.List([
        factory.Faker("random_element", elements=[
            "machine learning", "neural networks", "natural language processing",
            "computer vision", "artificial intelligence"
        ])
        for _ in range(factory.Faker("random_int", min=2, max=5))
    ])

# Usage examples
def create_sample_papers(count: int = 10) -> List[Paper]:
    """Create sample papers for testing."""
    return PaperFactory.create_batch(count)

def create_ml_paper() -> Paper:
    """Create a machine learning focused paper."""
    return PaperFactory.create(
        title="Advanced Machine Learning Techniques",
        abstract="This paper explores advanced machine learning algorithms...",
        categories=["cs.AI", "cs.LG"]
    )
```

### Custom Assertions

```python
# tests/utils/assertions.py
import numpy as np
from typing import List, Dict, Any, Optional

class CustomAssertions:
    """Custom assertion methods for testing."""
    
    @staticmethod
    def assert_embedding_quality(embedding: np.ndarray, expected_dim: int = 384):
        """Assert embedding meets quality standards."""
        assert isinstance(embedding, np.ndarray), "Embedding must be numpy array"
        assert len(embedding) == expected_dim, f"Expected {expected_dim} dimensions"
        assert not np.isnan(embedding).any(), "Embedding contains NaN values"
        assert not np.isinf(embedding).any(), "Embedding contains infinite values"
        
        # Check for reasonable value range
        assert np.abs(embedding).max() < 10, "Embedding values too large"
    
    @staticmethod
    def assert_similarity_scores(scores: List[float], expected_range: tuple = (0.0, 1.0)):
        """Assert similarity scores are in expected range."""
        assert all(isinstance(score, (int, float)) for score in scores), \
            "All scores must be numeric"
        assert all(expected_range[0] <= score <= expected_range[1] for score in scores), \
            f"Scores must be in range {expected_range}"
    
    @staticmethod
    def assert_paper_completeness(paper: Dict[str, Any]):
        """Assert paper data is complete."""
        required_fields = ["id", "title", "abstract", "authors", "published"]
        
        for field in required_fields:
            assert field in paper, f"Missing required field: {field}"
            assert paper[field] is not None, f"Field {field} cannot be None"
            assert paper[field] != "", f"Field {field} cannot be empty"
    
    @staticmethod
    def assert_search_results_relevance(
        results: List[Dict[str, Any]], 
        query: str, 
        min_relevance: float = 0.1
    ):
        """Assert search results are relevant to query."""
        query_terms = query.lower().split()
        
        for result in results:
            title = result.get("title", "").lower()
            abstract = result.get("abstract", "").lower()
            content = f"{title} {abstract}"
            
            # Check if at least one query term appears
            relevance = any(term in content for term in query_terms)
            assert relevance, f"Result not relevant to query: {query}"
    
    @staticmethod
    def assert_performance_within_bounds(
        execution_time: float, 
        max_time: float, 
        operation: str = "operation"
    ):
        """Assert operation completed within time bounds."""
        assert execution_time <= max_time, \
            f"{operation} took {execution_time:.2f}s, expected <= {max_time}s"
        assert execution_time > 0, f"{operation} execution time must be positive"

# Usage in tests
def test_with_custom_assertions():
    """Example test using custom assertions."""
    from tests.utils.assertions import CustomAssertions
    
    # Test embedding quality
    embedding = np.random.randn(384)
    CustomAssertions.assert_embedding_quality(embedding)
    
    # Test similarity scores
    scores = [0.8, 0.6, 0.9, 0.4]
    CustomAssertions.assert_similarity_scores(scores)
```

## Continuous Integration

### GitHub Actions Configuration

```yaml
# .github/workflows/test.yml
name: Test Suite

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        python-version: [3.9, 3.10, 3.11]
    
    services:
      postgres:
        image: postgres:13
        env:
          POSTGRES_PASSWORD: test_password
          POSTGRES_DB: test_db
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
      
      redis:
        image: redis:6
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Set up Python ${{ matrix.python-version }}
      uses: actions/setup-python@v4
      with:
        python-version: ${{ matrix.python-version }}
    
    - name: Cache dependencies
      uses: actions/cache@v3
      with:
        path: ~/.cache/pip
        key: ${{ runner.os }}-pip-${{ hashFiles('**/requirements*.txt') }}
        restore-keys: |
          ${{ runner.os }}-pip-
    
    - name: Install dependencies
      run: |
        python -m pip install --upgrade pip
        pip install -r requirements.txt
        pip install -r requirements-test.txt
    
    - name: Run unit tests
      run: |
        pytest tests/unit/ -v --cov=studyassistant --cov-report=xml
      env:
        DATABASE_URL: postgresql://postgres:test_password@localhost/test_db
        REDIS_URL: redis://localhost:6379
    
    - name: Run integration tests
      run: |
        pytest tests/integration/ -v -m "not slow"
      env:
        DATABASE_URL: postgresql://postgres:test_password@localhost/test_db
        REDIS_URL: redis://localhost:6379
    
    - name: Run E2E tests
      run: |
        pytest tests/e2e/ -v -m "not slow"
      env:
        DATABASE_URL: postgresql://postgres:test_password@localhost/test_db
        REDIS_URL: redis://localhost:6379
    
    - name: Upload coverage to Codecov
      uses: codecov/codecov-action@v3
      with:
        file: ./coverage.xml
        fail_ci_if_error: true

  performance-tests:
    runs-on: ubuntu-latest
    if: github.event_name == 'pull_request'
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Set up Python
      uses: actions/setup-python@v4
      with:
        python-version: 3.11
    
    - name: Install dependencies
      run: |
        python -m pip install --upgrade pip
        pip install -r requirements.txt
        pip install -r requirements-test.txt
    
    - name: Run performance tests
      run: |
        pytest tests/performance/ -v --benchmark-only
    
    - name: Upload performance results
      uses: actions/upload-artifact@v3
      with:
        name: performance-results
        path: .benchmarks/
```

## Test Configuration

### pytest Configuration

```ini
# pytest.ini
[tool:pytest]
minversion = 6.0
addopts = 
    -ra 
    -q 
    --strict-markers 
    --strict-config
    --cov=studyassistant
    --cov-branch
    --cov-report=term-missing
    --cov-report=html:htmlcov
    --cov-report=xml
testpaths = tests
python_files = test_*.py
python_classes = Test*
python_functions = test_*
markers =
    unit: Unit tests
    integration: Integration tests
    e2e: End-to-end tests
    performance: Performance tests
    benchmark: Benchmark tests
    slow: Slow running tests
    external: Tests requiring external services
    ml: Machine learning related tests
filterwarnings =
    error
    ignore::UserWarning
    ignore::DeprecationWarning
```

### Coverage Configuration

```ini
# .coveragerc
[run]
source = studyassistant
omit = 
    */tests/*
    */venv/*
    */env/*
    setup.py
    */migrations/*
    */settings/*

[report]
exclude_lines =
    pragma: no cover
    def __repr__
    if self.debug:
    if settings.DEBUG
    raise AssertionError
    raise NotImplementedError
    if 0:
    if __name__ == .__main__.:
    class .*\bProtocol\):
    @(abc\.)?abstractmethod

[html]
directory = htmlcov
```

## Best Practices Summary

1. **Follow Testing Pyramid**: More unit tests, fewer E2E tests
2. **Use Fixtures**: Leverage pytest fixtures for setup/teardown
3. **Mock External Services**: Isolate tests from external dependencies
4. **Test Error Conditions**: Include negative test cases
5. **Performance Testing**: Include load and benchmark tests
6. **ML-Specific Testing**: Validate model outputs and data quality
7. **Continuous Integration**: Automate test execution
8. **Test Coverage**: Maintain high code coverage
9. **Test Organization**: Structure tests logically
10. **Documentation**: Document complex test scenarios

## Related Documentation

- [Error Handling](./error-handling.md)
- [Performance Optimization](./performance-optimization.md)
- [Python Standards](./python-standards.md)
- [Async Programming](./async-programming.md)
