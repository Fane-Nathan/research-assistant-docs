import type {ReactNode} from 'react';
import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  Svg: React.ComponentType<React.ComponentProps<'svg'>>;
  description: ReactNode;
  badge: string;
};

const FeatureList: FeatureItem[] = [
  {
    title: 'Advanced RAG System',
    Svg: require('@site/static/img/undraw_docusaurus_mountain.svg').default,
    badge: 'AI-Powered',
    description: (
      <>
        StudyAssistant combines state-of-the-art retrieval and generation using advanced 
        NLP techniques. Get precise, contextual answers from academic papers using hybrid 
        search algorithms and LLM-powered generation with support for multiple providers 
        including Google Gemini, Groq, and DeepSeek.
      </>
    ),
  },
  {
    title: 'Hybrid Search Technology',
    Svg: require('@site/static/img/undraw_docusaurus_tree.svg').default,
    badge: 'Smart Search',
    description: (
      <>
        Leverages both semantic (vector embeddings) and keyword (BM25) search for optimal 
        relevance scoring. Our sophisticated hybrid approach ensures you find the most 
        pertinent information from your research corpus, combining the best of dense and 
        sparse retrieval methods.
      </>
    ),
  },
  {
    title: 'Production-Ready Architecture',
    Svg: require('@site/static/img/undraw_docusaurus_react.svg').default,
    badge: 'Enterprise',
    description: (
      <>
        Built with PhD-level software engineering standards, featuring robust asynchronous 
        processing, comprehensive error handling, scalable design patterns, and extensive 
        logging. Ready for research-grade applications with CLI, web interface, and 
        cloud deployment capabilities.
      </>
    ),
  },
];

function Feature({title, Svg, description, badge}: FeatureItem) {
  return (
    <div className={clsx('col col--4', styles.featureCard)}>
      <div className={styles.featureHeader}>
        <div className="text--center">
          <Svg className={styles.featureSvg} role="img" />
        </div>
        <span className={clsx('badge', styles.featureBadge)}>{badge}</span>
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3" className={styles.featureTitle}>{title}</Heading>
        <p className={styles.featureDescription}>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): ReactNode {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="text--center margin-bottom--xl">
          <Heading as="h2" className={styles.sectionTitle}>
            Why Choose StudyAssistant?
          </Heading>
          <p className={styles.sectionSubtitle}>
            Powerful features designed for researchers, by researchers
          </p>
        </div>
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
