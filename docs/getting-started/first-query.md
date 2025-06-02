# Your First Query

This guide will walk you through making your first research query with StudyAssistant, helping you understand how to get the most out of the system.

## Before You Begin

Ensure you have completed:
- ✅ [Installation](./installation)
- ✅ [Configuration](./configuration) (API keys set up)
- ✅ [Quick Start](./quick-start) (basic setup verified)

## Choosing Your First Query

For your first query, choose a research question that:
- **Is specific enough** to get focused results
- **Is broad enough** to have multiple relevant sources
- **Relates to your field** of interest or study

### Good Example Questions

**Computer Science**:
- "What are the key differences between transformer and LSTM architectures?"
- "How does federated learning preserve privacy in machine learning?"

**Natural Sciences**:
- "What are the latest findings on CRISPR gene editing accuracy?"
- "How do microplastics affect marine ecosystems?"

**Social Sciences**:
- "What factors influence student motivation in online learning environments?"
- "How does social media usage correlate with mental health outcomes?"

## Method 1: Web Interface Query

### Step 1: Launch the Application

```bash
streamlit run app.py
```

Your browser should open to `http://localhost:8501`.

### Step 2: Enter Your Query

1. **Find the Query Input**: Look for the main text area labeled "Enter your research question"
2. **Type Your Question**: Enter a clear, specific research question
3. **Adjust Settings** (optional):
   - **Number of Sources**: Choose how many papers to retrieve (default: 10)
   - **Search Mode**: Select "Hybrid" for best results
   - **LLM Provider**: Choose your preferred language model

### Step 3: Submit and Wait

1. **Click "Get Answer"**: Submit your query
2. **Watch the Progress**: You'll see status updates as the system works:
   - 🔍 "Searching for relevant papers..."
   - 📚 "Found X relevant sources"
   - 🤖 "Generating AI response..."
   - ✅ "Complete!"

### Step 4: Analyze the Results

Your results will include:

#### 🤖 AI-Generated Answer
A comprehensive response synthesized from multiple sources:
```
The transformer architecture differs from LSTM networks in several key ways:

1. **Attention Mechanism**: Transformers use self-attention to process all positions 
   in a sequence simultaneously, while LSTMs process sequentially...

2. **Parallelization**: Unlike LSTMs, transformers can be fully parallelized during 
   training, making them more efficient for large datasets...

[Detailed explanation continues...]
```

#### 📚 Source Documents
Retrieved papers with relevance scores:
```
📄 "Attention Is All You Need" (Vaswani et al., 2017)
   Relevance: 95% | arXiv:1706.03762
   
📄 "Long Short-Term Memory" (Hochreiter & Schmidhuber, 1997)
   Relevance: 87% | Neural Computation
   
📄 "BERT: Pre-training of Deep Bidirectional Transformers" (Devlin et al., 2018)
   Relevance: 82% | arXiv:1810.04805
```

#### 🔗 Citations and Links
Direct links to access the full papers.

## Method 2: Command Line Query

### Basic CLI Query

```bash
python scripts/cli.py query "What are the key differences between transformer and LSTM architectures?"
```

### Advanced CLI Options

```bash
# Specify number of results
python scripts/cli.py query "your question" --max-results 15

# Choose specific LLM provider
python scripts/cli.py query "your question" --llm-provider groq

# Enable detailed output
python scripts/cli.py query "your question" --verbose

# Save results to file
python scripts/cli.py query "your question" --output results.json
```

### Understanding CLI Output

```bash
🔍 StudyAssistant Research Query
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Query: "What are the key differences between transformer and LSTM architectures?"

📊 Search Results: Found 12 relevant sources
⏱️  Processing Time: 8.3 seconds

🤖 AI Response:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[AI-generated answer appears here]

📚 Top Sources:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. [95%] Attention Is All You Need (Vaswani et al., 2017)
   📄 arXiv:1706.03762
   🔗 https://arxiv.org/abs/1706.03762

2. [87%] Long Short-Term Memory (Hochreiter & Schmidhuber, 1997)
   📄 Neural Computation, Vol. 9, No. 8
   🔗 https://doi.org/10.1162/neco.1997.9.8.1735

[Additional sources listed...]
```

## Interpreting Your Results

### Understanding Relevance Scores

- **90-100%**: Highly relevant, directly addresses your query
- **70-89%**: Very relevant, contains important related information
- **50-69%**: Moderately relevant, provides context or background
- **Below 50%**: May contain tangentially related information

### Quality Indicators

Look for these signs of high-quality results:

#### Good AI Response
- ✅ **Comprehensive**: Covers multiple aspects of your question
- ✅ **Well-structured**: Clear organization with headers or bullet points
- ✅ **Cited**: References specific papers or findings
- ✅ **Balanced**: Presents different perspectives when appropriate

#### Quality Sources
- ✅ **Recent publications**: Check publication dates
- ✅ **Reputable venues**: Known conferences, journals, or institutions
- ✅ **High citation counts**: Influential papers in the field
- ✅ **Diverse perspectives**: Multiple authors and institutions

### Red Flags to Watch For

- ❌ **Overly generic responses**: May indicate insufficient relevant sources
- ❌ **Contradictory information**: Check source quality and recency
- ❌ **No citations**: AI response should reference retrieved sources
- ❌ **Low relevance scores**: All sources below 70% may indicate query issues

## Refining Your Query

If your first results aren't optimal, try these strategies:

### Query Refinement Techniques

#### 1. **Be More Specific**
- Instead of: "machine learning"
- Try: "supervised learning algorithms for image classification"

#### 2. **Add Context**
- Instead of: "neural networks"
- Try: "neural networks for natural language processing"

#### 3. **Use Technical Terms**
- Instead of: "AI writing"
- Try: "natural language generation using transformer models"

#### 4. **Specify Time Frame**
- Add: "recent advances in..." or "2020-2024 developments in..."

### Example Query Evolution

**Original**: "How does AI work?"
**Refined**: "How do transformer architectures enable large language models to generate coherent text?"

**Why it's better**:
- Specific technology (transformers)
- Specific application (text generation)
- Specific quality (coherence)

## Common First-Time Issues

### Issue: No Results Found
**Possible Causes**:
- Query too specific or uses non-standard terminology
- Network connectivity issues
- API key problems

**Solutions**:
- Try broader terms
- Check internet connection
- Verify API keys in `.env` file

### Issue: Poor Quality Results
**Possible Causes**:
- Query too broad or vague
- Limited sources in the database
- Incorrect search parameters

**Solutions**:
- Refine your query to be more specific
- Try different search terms
- Adjust the number of results requested

### Issue: Slow Response Times
**Possible Causes**:
- Network latency
- High API usage
- Large number of sources requested

**Solutions**:
- Reduce the number of sources
- Try during off-peak hours
- Check system resources

## Next Steps

After your successful first query:

### Explore Advanced Features
- **[Web Interface Guide](../user-guide/web-interface)**: Master all interface features
- **[CLI Usage](../user-guide/cli-usage)**: Advanced command-line operations
- **[Data Sources](../user-guide/data-sources)**: Understanding and managing sources

### Improve Your Research Skills
- **[Query Techniques](../user-guide/query-techniques)**: Best practices for optimal results
- **[Result Analysis](../user-guide/result-analysis)**: How to evaluate and use results
- **[Research Workflows](../user-guide/research-workflows)**: Integrating StudyAssistant into your process

### Customize Your Experience
- **[Advanced Configuration](./configuration)**: Fine-tune system behavior
- **[Personal Preferences](../user-guide/personalization)**: Customize the interface
- **[Integration Options](../user-guide/integrations)**: Connect with other tools

## Example: Complete First Query Walkthrough

Let's walk through a complete example:

### Query: "How does attention mechanism improve neural machine translation?"

**Step 1**: Launch StudyAssistant
```bash
streamlit run app.py
```

**Step 2**: Enter the query in the web interface

**Step 3**: Expected results structure:
- **AI Answer**: Explains attention mechanism, its role in NMT, improvements over previous methods
- **Key Sources**: Bahdanau et al. (2014), Luong et al. (2015), Vaswani et al. (2017)
- **Follow-up Questions**: System might suggest related queries

**Step 4**: Analyze and learn from the comprehensive response

## Troubleshooting Your First Query

### Quick Diagnostics

```bash
# Test system status
python scripts/cli.py status

# Verify configuration
python scripts/cli.py config --validate

# Test API connections
python scripts/cli.py config --test-apis
```

### Getting Help

If you encounter issues:
1. **Check the logs**: Look for error messages in the console
2. **Review configuration**: Ensure API keys are correctly set
3. **Try a simpler query**: Test with a basic question first
4. **Consult documentation**: Check the troubleshooting guide

---

**🎉 Congratulations!** You've successfully made your first research query with StudyAssistant. You're now ready to explore the full potential of AI-powered research assistance.

**Next recommended steps**: 
- **[Web Interface Guide](../user-guide/web-interface)** to master the application
- **[Query Techniques](../user-guide/query-techniques)** to optimize your research skills
