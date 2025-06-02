import type {ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';
import Heading from '@theme/Heading';

import styles from './index.module.css';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <Heading as="h1" className="hero__title">
          {siteConfig.title}
        </Heading>
        <p className="hero__subtitle">
          Advanced Retrieval Augmented Generation for Academic Research
          <br />
          <strong>Transform how you discover, understand, and synthesize scientific literature</strong>
        </p>
        <div className={styles.buttons}>
          <Link
            className="button button--secondary button--lg"
            to="/docs/getting-started/introduction">
            Get Started 🚀
          </Link>
          <Link
            className="button button--primary button--lg"
            to="/docs/architecture/overview">
            Explore Architecture 🏗️
          </Link>
          <Link
            className="button button--secondary button--lg"
            href="https://research-assistant-flx.streamlit.app/"
            target="_blank">
            Try Live Demo 🔬
          </Link>
        </div>
        <div className={styles.badges}>
          <span className="badge badge--research">RAG System</span>
          <span className="badge badge--ai">AI-Powered</span>
          <span className="badge badge--secondary">Open Source</span>
          <span className="badge badge--success">Production Ready</span>
        </div>
      </div>
    </header>
  );
}

function QuickStartSection() {
  return (
    <section className={styles.quickStart}>
      <div className="container">
        <div className="row">
          <div className="col col--6">
            <Heading as="h2">Quick Start</Heading>
            <p>Get StudyAssistant running in minutes with our streamlined setup:</p>
            <div className={styles.codeBlock}>
              <pre>
                <code>{`# Install StudyAssistant
pip install studyassistant

# Configure API keys
export GEMINI_API_KEY="your_key_here"

# Start researching!
studyassistant query "machine learning in NLP"`}</code>
              </pre>
            </div>
            <Link
              className="button button--primary"
              to="/docs/getting-started/installation">
              Full Installation Guide →
            </Link>
          </div>
          <div className="col col--6">
            <Heading as="h2">Key Features</Heading>
            <ul className={styles.featureList}>
              <li>🔍 <strong>Hybrid Search:</strong> Combines semantic and keyword search</li>
              <li>🧠 <strong>Multiple LLMs:</strong> Google Gemini, Groq, DeepSeek support</li>
              <li>📚 <strong>arXiv Integration:</strong> Direct access to academic papers</li>
              <li>🌐 <strong>Web Crawling:</strong> Extract insights from any webpage</li>
              <li>⚡ <strong>Async Processing:</strong> Lightning-fast concurrent operations</li>
              <li>🛡️ <strong>Production Ready:</strong> Robust error handling and logging</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Home(): ReactNode {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title="AI-Powered Research Assistant"
      description="StudyAssistant: Advanced RAG system for academic research. Hybrid search, LLM integration, and production-ready architecture for researchers and developers.">
      <HomepageHeader />
      <main>
        <HomepageFeatures />
        <QuickStartSection />
      </main>
    </Layout>
  );
}
