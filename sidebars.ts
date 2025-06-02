import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */
const sidebars: SidebarsConfig = {
  // Getting Started Sidebar
  gettingStartedSidebar: [
    {
      type: 'category',
      label: 'Getting Started',
      items: [
        'getting-started/introduction',
        'getting-started/installation',
        'getting-started/quick-start',
        'getting-started/configuration',
        'getting-started/first-query',
      ],
    },
    {
      type: 'category',
      label: 'User Guide',
      items: [
        'user-guide/using-cli',
        'user-guide/cli-usage',
        'user-guide/web-interface',
        'user-guide/data-sources',
        'user-guide/query-techniques',
        'user-guide/troubleshooting',
      ],
    },
  ],

  // Architecture Sidebar
  architectureSidebar: [
    {
      type: 'category',
      label: 'System Architecture',
      items: [
        'architecture/overview',
        'architecture/rag-pipeline',
        'architecture/data-flow',
        'architecture/component-overview',
      ],
    },
    {
      type: 'category',
      label: 'Core Components',
      items: [
        'architecture/components/resource-fetcher',
        'architecture/components/data-manager',
        'architecture/components/data-management',
        'architecture/components/hybrid-recommender',
        'architecture/components/llm-interface',
        'architecture/components/text-processing',
        'architecture/components/search-engine',
        'architecture/components/rag-pipeline',
      ],
    },
    {
      type: 'category',
      label: 'NLP & Machine Learning',
      items: [
        'architecture/nlp/text-processing',
        'architecture/nlp/embeddings',
      ],
    },
  ],

  // API Reference Sidebar
  apiSidebar: [
    {
      type: 'category',
      label: 'API Reference',
      items: [
        'api/overview',
        'api/configuration',
        'api/authentication',
      ],
    },
    {
      type: 'category',
      label: 'Core APIs',
      items: [
        'api/resource-fetcher',
        'api/data-manager',
        'api/hybrid-recommender',
        'api/llm-interface',
        'api/embeddings',
      ],
    },
    {
      type: 'category',
      label: 'External APIs',
      items: [
        'api/external/arxiv',
        'api/external/llm-providers',
        'api/external/web-crawling',
        'api/external/integrations',
      ],
    },
    {
      type: 'category',
      label: 'CLI Reference',
      items: [
        'cli/options',
        'cli/examples',
      ],
    },
  ],

  // Development Sidebar
  developmentSidebar: [
    {
      type: 'category',
      label: 'Development Guide',
      items: [
        'development/contributing',
        'development/project-structure',
        'development/development-setup',
        'development/coding-standards',
      ],
    },
    {
      type: 'category',
      label: 'Code Quality',
      items: [
        'development/python-standards',
        'development/async-programming',
        'development/error-handling',
        'development/logging',
        'development/testing',
      ],
    },
    {
      type: 'category',
      label: 'Advanced Topics',
      items: [
        'development/performance-optimization',
        'development/scalability',
        'development/security',
        'development/deployment',
      ],
    },
    {
      type: 'category',
      label: 'Evaluation & Metrics',
      items: [
        'development/evaluation/framework',
        'development/evaluation/metrics',
        'development/evaluation/benchmarking',
      ],
    },
  ],
};

export default sidebars;
