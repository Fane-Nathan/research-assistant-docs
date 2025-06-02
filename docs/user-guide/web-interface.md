# Web Interface Guide

The StudyAssistant web interface provides an intuitive, user-friendly way to interact with the AI research assistant. Built with Streamlit, it offers a clean, modern interface that makes complex research tasks accessible to users of all technical levels.

## Getting Started with the Web Interface

### Launching the Application

```bash
# Navigate to your StudyAssistant directory
cd Research-Assistant

# Launch the web interface
streamlit run app.py
```

The application will open in your default browser at `http://localhost:8501`.

### Interface Overview

The StudyAssistant web interface consists of several main sections:

```
┌─────────────────────────────────────────────────┐
│                 StudyAssistant                  │
│          AI-Powered Research Assistant          │
├─────────────────────────────────────────────────┤
│  [Settings Sidebar]  │  [Main Content Area]     │
│                      │                          │
│  • Query Parameters  │  • Query Input Box       │
│  • Data Sources      │  • Results Display       │
│  • Export Options    │  • Source Documents      │
│  • System Status     │  • Download Options      │
└─────────────────────────────────────────────────┘
```

## Main Interface Components

### 1. Query Input Area

The central component where you enter your research questions:

#### Query Text Box
- **Location**: Center of the main content area
- **Placeholder**: "Enter your research question here..."
- **Features**: 
  - Multi-line support for complex queries
  - Auto-save as you type
  - Keyboard shortcuts (Ctrl+Enter to submit)

#### Query Examples
The interface provides helpful examples:
- *"What are the latest developments in transformer architecture?"*
- *"How does federated learning preserve privacy?"*
- *"What are the environmental impacts of large language models?"*

### 2. Settings Sidebar

Configure your search parameters and preferences:

#### Search Configuration
```
🔍 Search Settings
├─ Number of Sources: [1-50]
├─ Search Mode: [Hybrid | Semantic | Keyword]
├─ Language Model: [Gemini | Groq | DeepSeek]
└─ Response Length: [Concise | Detailed | Comprehensive]
```

#### Data Source Selection
```
📚 Data Sources
├─ ☑️ arXiv Papers
├─ ☑️ Web Content
├─ ☑️ Uploaded PDFs
└─ ☑️ Personal Library
```

#### Advanced Options
```
⚙️ Advanced Settings
├─ Relevance Threshold: [0.1-1.0]
├─ Hybrid Search Weights: [Semantic:Keyword]
├─ Enable Re-ranking: [Yes/No]
└─ Include Abstracts Only: [Yes/No]
```

### 3. Results Display Area

After submitting a query, results appear in a structured format:

#### AI-Generated Response
```
🤖 AI Research Assistant Response
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[Comprehensive AI-generated answer with proper citations 
and structured formatting]

Key Points:
• Point 1 with supporting evidence
• Point 2 with relevant citations
• Point 3 with methodological details

Conclusion: [Summary and implications]
```

#### Source Documents Panel
```
📚 Retrieved Sources (10 found)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📄 1. "Paper Title" (Authors, Year) [Relevance: 95%]
   📑 Abstract: [First 200 characters...]
   🔗 Links: [arXiv] [PDF] [DOI]
   📊 Citations: 234 | Published in: Venue Name

📄 2. "Another Paper" (Authors, Year) [Relevance: 89%]
   📑 Abstract: [First 200 characters...]
   🔗 Links: [arXiv] [Website] [PDF]
   📊 Citations: 156 | Published in: Journal Name

[Additional sources...]
```

## Key Features and Functions

### 1. Smart Query Processing

#### Auto-Completion
- Suggests relevant terms as you type
- Shows previously successful queries
- Recommends query refinements

#### Query Analysis
- Real-time validation of query structure
- Suggestions for improving query specificity
- Warning for overly broad or narrow queries

### 2. Interactive Results

#### Expandable Source Details
Click on any source to see:
- **Full Abstract**: Complete paper abstract
- **Key Excerpts**: Relevant passages highlighted
- **Methodology**: Research methods used
- **Results Summary**: Main findings
- **Citation Information**: Complete bibliographic details

#### Relevance Scoring
Each source shows:
- **Relevance Percentage**: How well it matches your query
- **Confidence Score**: System confidence in the match
- **Ranking Explanation**: Why this source was selected

### 3. Export and Save Options

#### Export Formats
```
📥 Export Options
├─ 📄 PDF Report (formatted document)
├─ 📊 CSV Data (structured data)
├─ 📋 Plain Text (copy-paste friendly)
├─ 🔗 BibTeX Citations (reference manager)
└─ 📱 JSON Data (programmatic access)
```

#### Save Session
- **Bookmark Queries**: Save successful searches
- **Query History**: Access previous research sessions
- **Personal Library**: Build custom document collections

### 4. Batch Processing

#### Multiple Queries
Process several related questions at once:
```
Batch Query Example:
1. "What is transformer architecture?"
2. "How do transformers handle long sequences?"
3. "What are the limitations of transformer models?"
```

#### Document Upload
- **Drag-and-Drop**: Easy file upload interface
- **Supported Formats**: PDF, DOC, TXT, MD
- **Batch Processing**: Upload multiple files simultaneously
- **Automatic Processing**: Text extraction and indexing

## Advanced Interface Features

### 1. Real-Time Status Updates

Monitor system progress with live updates:
```
🔄 Processing Status
├─ 🔍 Searching arXiv database... (2.3s)
├─ 🌐 Crawling web sources... (4.1s)
├─ 🧠 Generating embeddings... (1.8s)
├─ 🔗 Ranking results... (0.9s)
└─ ✅ Complete! (9.1s total)
```

### 2. Interactive Visualizations

#### Source Distribution
```
📊 Source Analysis
├─ arXiv Papers: ████████░░ (45%)
├─ Journal Articles: ██████░░░░ (30%)
├─ Conference Proceedings: ████░░░░░░ (20%)
└─ Web Content: ██░░░░░░░░ (5%)
```

#### Timeline View
Visualize research trends over time with an interactive timeline of retrieved papers.

#### Citation Network
Explore relationships between papers through citation mapping.

### 3. Collaborative Features

#### Shared Sessions
- **Session URLs**: Share research sessions with colleagues
- **Collaborative Notes**: Add comments and annotations
- **Team Workspaces**: Organize research by project or team

#### Export for Collaboration
- **Shared Reports**: Generate reports for team review
- **Citation Sharing**: Export references for group projects
- **Research Summaries**: Create executive summaries

## Keyboard Shortcuts

Increase efficiency with keyboard shortcuts:

```
⌨️ Keyboard Shortcuts
├─ Ctrl+Enter: Submit query
├─ Ctrl+K: Focus search box
├─ Ctrl+R: Refresh results
├─ Ctrl+S: Save current session
├─ Ctrl+E: Export results
├─ Ctrl+H: Show/hide sidebar
├─ Ctrl+F: Find in results
└─ Esc: Clear current query
```

## Customization Options

### 1. Interface Themes

Choose from multiple visual themes:
- **Light Mode**: Clean, bright interface
- **Dark Mode**: Easy on the eyes for extended use
- **High Contrast**: Accessibility-optimized colors
- **Academic**: Professional, paper-like appearance

### 2. Layout Preferences

Customize the interface layout:
- **Sidebar Position**: Left or right
- **Results Display**: Grid or list view
- **Font Size**: Adjustable for accessibility
- **Panel Sizes**: Resizable interface components

### 3. Default Settings

Set your preferred defaults:
- **Default LLM Provider**: Your preferred AI model
- **Search Parameters**: Standard search configuration
- **Export Format**: Preferred output format
- **Auto-Save**: Automatic session saving

## Mobile and Tablet Support

StudyAssistant's web interface is fully responsive:

### Mobile Features
- **Touch-Optimized**: Easy navigation on touchscreens
- **Simplified Layout**: Key features accessible on small screens
- **Offline Mode**: Limited functionality when offline
- **Quick Actions**: Swipe gestures for common tasks

### Tablet Optimization
- **Split-Screen**: View results and sources simultaneously  
- **Touch Scrolling**: Smooth scrolling through long results
- **Pinch-to-Zoom**: Easy text scaling
- **Landscape Mode**: Optimized for horizontal viewing

## Troubleshooting Common Issues

### Interface Not Loading
1. **Check Browser Compatibility**: Chrome, Firefox, Safari, Edge supported
2. **Clear Cache**: Refresh with Ctrl+F5
3. **Check Network**: Ensure internet connectivity
4. **Port Conflicts**: Try different port with `streamlit run app.py --server.port 8502`

### Slow Performance
1. **Reduce Result Count**: Lower the number of sources requested
2. **Close Other Applications**: Free up system resources
3. **Check Network Speed**: Ensure stable internet connection
4. **Browser Extensions**: Disable ad blockers or privacy extensions

### Export Issues
1. **Browser Permissions**: Allow downloads in browser settings
2. **Pop-up Blockers**: Disable for StudyAssistant domain
3. **File Permissions**: Check write permissions in download folder
4. **Large Files**: Try smaller result sets for large exports

## Best Practices

### Effective Query Formulation
1. **Be Specific**: Use precise terminology from your field
2. **Provide Context**: Include relevant background information
3. **Use Questions**: Frame as clear research questions
4. **Iterate**: Refine based on initial results

### Result Analysis
1. **Check Relevance Scores**: Focus on high-scoring sources
2. **Read Abstracts**: Understand context before diving deep
3. **Cross-Reference**: Verify information across multiple sources
4. **Note Publication Dates**: Consider recency of findings

### Session Management
1. **Save Important Queries**: Bookmark successful searches
2. **Organize Results**: Use folders or tags for different projects
3. **Regular Exports**: Back up important findings
4. **Clean Up**: Remove outdated or irrelevant saved sessions

## Integration with Research Workflow

### Academic Writing
- **Citation Management**: Direct export to reference managers
- **Quote Integration**: Copy properly formatted citations
- **Fact Checking**: Verify claims against retrieved sources
- **Literature Reviews**: Systematic exploration of research areas

### Research Planning
- **Gap Analysis**: Identify under-researched areas
- **Methodology Review**: Explore different research approaches
- **Trend Analysis**: Understand field evolution over time
- **Collaboration Discovery**: Find relevant researchers and institutions

---

**Next Steps**: Now that you've mastered the web interface, explore:
- **[CLI Usage](./cli-usage)**: Command-line power user features
- **[Query Techniques](./query-techniques)**: Advanced search strategies
- **[Data Sources](./data-sources)**: Understanding and managing your research corpus
