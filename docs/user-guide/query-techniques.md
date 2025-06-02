# Query Techniques

Master advanced query techniques to get better, more relevant results from StudyAssistant. This guide covers search strategies, query optimization, and result refinement techniques.

## Overview

Effective querying in StudyAssistant involves understanding:
- **Query syntax and operators**
- **Search strategies for different research goals**
- **Result filtering and ranking**
- **Multi-modal search techniques**
- **Query optimization for performance**

## Basic Query Principles

### 1. Keyword Selection

Choose specific, relevant keywords that match academic terminology:

```python
# Good: Specific academic terms
query = "transformer neural networks attention mechanism"

# Better: Include context and domain
query = "transformer architecture natural language processing"

# Best: Domain-specific with constraints
query = "BERT transformer model NLP fine-tuning"
```

### 2. Boolean Operators

Use boolean logic to combine search terms:

```python
# AND (implicit with spaces)
query = "machine learning healthcare"  # Same as "machine learning AND healthcare"

# OR for alternatives
query = "artificial intelligence OR machine learning"

# NOT to exclude terms
query = "neural networks NOT convolutional"

# Grouping with parentheses
query = "(deep learning OR neural networks) AND (medical OR healthcare)"
```

### 3. Phrase Matching

Use quotes for exact phrase matching:

```python
# Exact phrase
query = '"reinforcement learning"'

# Combine with other terms
query = '"deep reinforcement learning" robotics'

# Multiple phrases
query = '"natural language processing" AND "machine translation"'
```

## Advanced Query Syntax

### Field-Specific Searches

Target specific fields in academic papers:

```python
# Title search
query = "title:(quantum computing)"

# Author search
query = "author:(Geoffrey Hinton)"

# Abstract search
query = "abstract:(neural network architecture)"

# Combined field search
query = 'title:"machine learning" AND author:"Andrew Ng"'
```

### Wildcards and Fuzzy Matching

Use wildcards for flexible matching:

```python
# Wildcard matching
query = "neural network*"  # Matches "networks", "networking", etc.

# Fuzzy matching (edit distance)
query = "machien~1 learning"  # Matches "machine learning" with 1 edit

# Proximity search
query = '"neural networks"~5'  # Words within 5 positions
```

### Range Queries

Search within specific ranges:

```python
# Year range
query = "machine learning year:[2020 TO 2024]"

# Citation count range
query = "deep learning citations:[100 TO *]"

# Combined ranges
query = "AI year:[2020 TO *] AND citations:[50 TO *]"
```

## Search Strategies by Research Goal

### 1. Literature Review

For comprehensive literature reviews:

```python
from studyassistant import StudyAssistant

sa = StudyAssistant()

# Start broad, then narrow
initial_query = "machine learning healthcare"
results = sa.search(initial_query, max_results=500)

# Analyze and refine
refined_query = "machine learning medical diagnosis imaging"
refined_results = sa.search(refined_query, max_results=200)

# Focus on recent high-impact papers
final_query = 'machine learning medical diagnosis year:[2020 TO *] citations:[20 TO *]'
final_results = sa.search(final_query, max_results=100)
```

### 2. Methodology Research

Finding papers about specific methods:

```python
# Method-focused queries
methodology_queries = [
    "transformer architecture implementation",
    "BERT model fine-tuning methodology",
    "attention mechanism variants",
    "neural network optimization techniques"
]

methodology_results = []
for query in methodology_queries:
    results = sa.search(
        query,
        filters={
            "paper_type": ["methodology", "technical"],
            "min_citations": 10
        }
    )
    methodology_results.extend(results)
```

### 3. State-of-the-Art Research

Finding cutting-edge research:

```python
# Recent high-impact papers
sota_query = '''
(("state of the art" OR "SOTA" OR "state-of-the-art") 
AND "machine learning") 
year:[2023 TO *] 
citations:[50 TO *]
'''

# Trending topics
trending_query = '''
("breakthrough" OR "novel approach" OR "new method") 
AND "artificial intelligence" 
year:[2024 TO *]
'''

sota_results = sa.search(sota_query, max_results=50)
trending_results = sa.search(trending_query, max_results=30)
```

### 4. Problem-Specific Research

Researching specific problems or applications:

```python
# Problem definition
problem_queries = [
    "few-shot learning challenges limitations",
    "domain adaptation problems solutions",
    "catastrophic forgetting neural networks"
]

# Solution-oriented search
solution_queries = [
    '"few-shot learning" AND ("meta-learning" OR "transfer learning")',
    '"domain adaptation" AND ("adversarial training" OR "domain-invariant")',
    '"catastrophic forgetting" AND ("continual learning" OR "incremental learning")'
]
```

## Multi-Modal Search Techniques

### 1. Semantic Search

Leverage semantic understanding for better matches:

```python
# Semantic query using natural language
semantic_query = "How does attention mechanism improve transformer performance?"

# The system understands intent and finds relevant papers
results = sa.semantic_search(
    semantic_query,
    search_type="semantic",
    similarity_threshold=0.7
)
```

### 2. Concept-Based Search

Search based on research concepts:

```python
# Define research concepts
concepts = {
    "primary_concept": "attention mechanisms",
    "related_concepts": ["transformer", "neural networks", "NLP"],
    "application_domain": "natural language processing",
    "methodology": "deep learning"
}

# Concept-driven search
concept_results = sa.concept_search(concepts, max_results=100)
```

### 3. Citation-Based Search

Use citation networks for discovery:

```python
# Find papers that cite a seminal work
seed_paper = "Attention Is All You Need"
citing_papers = sa.find_citing_papers(seed_paper, max_results=200)

# Find papers referenced by highly cited work
referenced_papers = sa.find_referenced_papers(seed_paper, max_results=100)

# Citation network expansion
network = sa.build_citation_network(
    seed_papers=[seed_paper],
    depth=2,
    min_citations=20
)
```

## Query Optimization

### 1. Performance Optimization

Optimize queries for speed and relevance:

```python
# Use specific terms to reduce search space
optimized_query = "BERT fine-tuning sentiment analysis"

# Add constraints early
constrained_query = '''
"BERT fine-tuning" 
AND "sentiment analysis" 
year:[2020 TO *] 
abstract:("downstream task" OR "transfer learning")
'''

# Parallel search across sources
results = sa.parallel_search(
    optimized_query,
    sources=["arxiv", "semantic_scholar", "pubmed"],
    max_results_per_source=50
)
```

### 2. Result Quality Optimization

Improve result quality through filtering:

```python
# Quality filters
quality_filters = {
    "min_citations": 10,
    "min_abstract_length": 100,
    "publication_types": ["journal", "conference"],
    "languages": ["en"],
    "peer_reviewed": True
}

# Apply filters during search
high_quality_results = sa.search(
    query="machine learning interpretability",
    filters=quality_filters,
    max_results=100
)
```

### 3. Relevance Scoring

Customize relevance scoring:

```python
# Custom relevance weights
relevance_config = {
    "title_weight": 0.3,
    "abstract_weight": 0.4,
    "keywords_weight": 0.2,
    "citation_weight": 0.1
}

# Search with custom scoring
results = sa.search(
    query="explainable AI",
    relevance_config=relevance_config,
    sort_by="relevance_score"
)
```

## Advanced Filtering and Ranking

### 1. Temporal Filtering

Filter by publication dates and trends:

```python
# Recent papers only
recent_query = "federated learning year:[2022 TO *]"

# Historical analysis
historical_query = "neural networks year:[1980 TO 2000]"

# Trending analysis
def find_trending_topics(base_query, years=5):
    results_by_year = {}
    current_year = datetime.now().year
    
    for year in range(current_year - years, current_year + 1):
        year_query = f"{base_query} year:[{year} TO {year}]"
        results = sa.search(year_query, max_results=100)
        results_by_year[year] = len(results)
    
    return results_by_year

trending = find_trending_topics("graph neural networks")
```

### 2. Authority-Based Filtering

Filter by author authority and venue prestige:

```python
# High-impact authors
author_filter = {
    "min_author_h_index": 20,
    "min_author_citations": 1000
}

# Prestigious venues
venue_filter = {
    "conferences": ["ICML", "NeurIPS", "ICLR", "AAAI"],
    "journals": ["Nature", "Science", "JMLR", "PAMI"]
}

# Combined authority filtering
authority_results = sa.search(
    query="deep learning theory",
    author_filter=author_filter,
    venue_filter=venue_filter
)
```

### 3. Content-Based Filtering

Filter based on content characteristics:

```python
# Abstract quality
content_filters = {
    "min_abstract_length": 200,
    "max_abstract_length": 2000,
    "required_keywords": ["methodology", "experiment", "result"],
    "exclude_keywords": ["survey", "review", "overview"]
}

# Mathematical content
math_filters = {
    "has_equations": True,
    "has_proofs": True,
    "mathematical_notation": True
}

# Experimental papers
experimental_filters = {
    "has_experiments": True,
    "has_baselines": True,
    "has_evaluation": True,
    "dataset_mentioned": True
}
```

## Query Templates

### Research Paper Discovery

```python
# Template for finding seminal papers
SEMINAL_PAPER_TEMPLATE = '''
{topic} 
AND ("seminal" OR "foundational" OR "breakthrough" OR "first") 
citations:[100 TO *] 
year:[{start_year} TO {end_year}]
'''

# Template for recent advances
RECENT_ADVANCES_TEMPLATE = '''
{topic} 
AND ("recent" OR "latest" OR "new" OR "novel") 
year:[{current_year-2} TO *] 
citations:[10 TO *]
'''

# Template for survey papers
SURVEY_TEMPLATE = '''
{topic} 
AND ("survey" OR "review" OR "systematic review") 
citations:[20 TO *] 
year:[{current_year-5} TO *]
'''
```

### Methodology Discovery

```python
# Template for implementation papers
IMPLEMENTATION_TEMPLATE = '''
{method_name} 
AND ("implementation" OR "code" OR "reproducible" OR "github") 
year:[2020 TO *]
'''

# Template for comparison studies
COMPARISON_TEMPLATE = '''
{domain} 
AND ("comparison" OR "comparative" OR "benchmark" OR "evaluation") 
AND {methods}
'''

# Template for tutorial papers
TUTORIAL_TEMPLATE = '''
{topic} 
AND ("tutorial" OR "introduction" OR "primer" OR "guide") 
citations:[30 TO *]
'''
```

## Interactive Query Refinement

### 1. Query Expansion

Automatically expand queries based on results:

```python
def expand_query(initial_query, initial_results, expansion_terms=5):
    # Extract common terms from top results
    common_terms = extract_common_terms(initial_results[:20])
    
    # Add most relevant terms to query
    expanded_terms = common_terms[:expansion_terms]
    expanded_query = f"{initial_query} AND ({' OR '.join(expanded_terms)})"
    
    return expanded_query

# Usage
initial_results = sa.search("graph neural networks", max_results=50)
expanded_query = expand_query("graph neural networks", initial_results)
refined_results = sa.search(expanded_query, max_results=100)
```

### 2. Relevance Feedback

Use user feedback to improve queries:

```python
def relevance_feedback(query, relevant_docs, irrelevant_docs):
    # Extract terms from relevant documents
    relevant_terms = extract_terms(relevant_docs)
    
    # Extract terms from irrelevant documents
    irrelevant_terms = extract_terms(irrelevant_docs)
    
    # Boost relevant terms, penalize irrelevant ones
    boosted_terms = [f"{term}^2" for term in relevant_terms[:5]]
    penalized_terms = [f"NOT {term}" for term in irrelevant_terms[:3]]
    
    refined_query = f"{query} {' '.join(boosted_terms)} {' '.join(penalized_terms)}"
    return refined_query
```

### 3. A/B Query Testing

Test different query formulations:

```python
def ab_test_queries(query_variants, test_topic):
    results = {}
    
    for variant_name, query in query_variants.items():
        search_results = sa.search(query, max_results=50)
        
        # Evaluate results quality
        quality_score = evaluate_result_quality(search_results, test_topic)
        
        results[variant_name] = {
            "query": query,
            "num_results": len(search_results),
            "quality_score": quality_score,
            "top_papers": search_results[:5]
        }
    
    return results

# Usage
query_variants = {
    "basic": "neural machine translation",
    "specific": "transformer neural machine translation attention",
    "constrained": "neural machine translation year:[2020 TO *] citations:[20 TO *]",
    "expanded": "neural machine translation AND (BERT OR transformer OR attention mechanism)"
}

test_results = ab_test_queries(query_variants, "neural machine translation")
```

## Performance Monitoring

### Query Performance Metrics

```python
# Track query performance
def monitor_query_performance(query, results):
    metrics = {
        "query": query,
        "response_time": results.response_time,
        "total_results": len(results),
        "relevant_results": count_relevant_results(results),
        "precision": calculate_precision(results),
        "recall": estimate_recall(query, results),
        "f1_score": calculate_f1(results)
    }
    
    return metrics

# Log performance data
performance_log = []
for query in test_queries:
    results = sa.search(query)
    metrics = monitor_query_performance(query, results)
    performance_log.append(metrics)
```

### Query Optimization Recommendations

```python
def suggest_query_improvements(query, results, performance_metrics):
    suggestions = []
    
    if performance_metrics["precision"] < 0.5:
        suggestions.append("Consider adding more specific terms to increase precision")
    
    if performance_metrics["recall"] < 0.3:
        suggestions.append("Consider using broader terms or synonyms to increase recall")
    
    if performance_metrics["response_time"] > 5.0:
        suggestions.append("Consider adding constraints to reduce search space")
    
    if len(results) < 10:
        suggestions.append("Query may be too specific, consider removing constraints")
    
    return suggestions
```

## Best Practices

### 1. Query Construction

- **Start broad, then narrow**: Begin with general terms and add specificity
- **Use domain terminology**: Employ field-specific vocabulary
- **Balance precision and recall**: Avoid overly restrictive or overly broad queries
- **Consider user intent**: Align query strategy with research goals

### 2. Result Evaluation

- **Check result relevance**: Manually evaluate top results
- **Monitor result diversity**: Ensure variety in returned papers
- **Track performance metrics**: Use precision, recall, and F1 scores
- **Validate with domain experts**: Get feedback from subject matter experts

### 3. Iterative Refinement

- **Analyze failed queries**: Learn from queries that don't produce good results
- **Document successful patterns**: Keep track of effective query formulations
- **A/B test variations**: Compare different approaches systematically
- **Continuous improvement**: Regularly refine and update query strategies

## Troubleshooting Common Issues

### No Results or Too Few Results

```python
# Debug query issues
def debug_query(query):
    # Check query syntax
    syntax_valid = validate_query_syntax(query)
    
    # Try simplified version
    simplified_query = simplify_query(query)
    simplified_results = sa.search(simplified_query)
    
    # Check individual terms
    term_results = {}
    for term in extract_terms(query):
        term_results[term] = sa.search(term, max_results=10)
    
    return {
        "original_query": query,
        "syntax_valid": syntax_valid,
        "simplified_results": len(simplified_results),
        "term_analysis": term_results
    }
```

### Poor Result Quality

```python
# Improve result quality
def improve_result_quality(query, poor_results):
    improvements = []
    
    # Add quality constraints
    quality_query = f"{query} citations:[10 TO *] year:[2015 TO *]"
    improvements.append(("quality_constraints", quality_query))
    
    # Add field specificity
    field_query = f'title:("{query}") OR abstract:("{query}")'
    improvements.append(("field_specific", field_query))
    
    # Add related terms
    related_terms = find_related_terms(query)
    expanded_query = f"{query} AND ({' OR '.join(related_terms)})"
    improvements.append(("expanded", expanded_query))
    
    return improvements
```

## Next Steps

- Practice with the [CLI Usage](cli-usage.md) guide for hands-on experience
- Explore [Data Sources](data-sources.md) to understand available search targets
- Learn about [Web Interface](web-interface.md) query builders
- Review [Troubleshooting](troubleshooting.md) for query-specific issues
