import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, TrendingUp, Users, Target, ArrowRight } from 'lucide-react';

interface CaseStudyData {
  title: string;
  description: string;
  impact: string;
  industry: string;
  image: string;
  fullContent: {
    challenge: string;
    solution: string;
    implementation: string[];
    results: {
      metric: string;
      value: string;
      description: string;
    }[];
    testimonial: {
      quote: string;
      author: string;
      title: string;
    };
    nextSteps: string[];
  };
}

const caseStudiesData: Record<string, CaseStudyData> = {
  'sme-automation': {
    title: 'How an SME Reduced Manual Work by 60% with AI Automation',
    description: 'A manufacturing company implemented our AI workflow automation solution, resulting in dramatic reduction in manual data entry and processing time.',
    impact: '60% reduction in manual work',
    industry: 'Manufacturing',
    image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=1600&h=900',
    fullContent: {
      challenge: 'Serial Company was struggling with time-consuming manual data entry processes across their operations. Their team spent countless hours on repetitive tasks, leading to delays, errors, and reduced productivity. They needed a solution that could automate these processes while maintaining accuracy and compliance.',
      solution: 'We implemented our AI-powered workflow automation platform, which included custom OCR for document processing, intelligent data extraction, and automated validation workflows. The solution seamlessly integrated with their existing ERP system.',
      implementation: [
        'Conducted thorough process analysis and identified automation opportunities',
        'Developed custom AI models for document recognition and data extraction',
        'Implemented automated validation workflows with human oversight',
        'Integrated with existing systems and databases',
        'Provided comprehensive training and support'
      ],
      results: [
        {
          metric: '60%',
          value: 'Reduction in Manual Work',
          description: 'Automated data entry and validation processes'
        },
        {
          metric: '85%',
          value: 'Faster Processing Time',
          description: 'Reduced document processing from hours to minutes'
        },
        {
          metric: '99.9%',
          value: 'Accuracy Rate',
          description: 'Improved data accuracy with AI validation'
        },
        {
          metric: '$200K',
          value: 'Annual Savings',
          description: 'Reduced operational costs and improved efficiency'
        }
      ],
      testimonial: {
        quote: "NEXIUS Labs' AI automation solution has transformed our operations. What used to take our team hours now happens in minutes, and with better accuracy. This has allowed us to focus on strategic initiatives and growth.",
        author: "Vincent Sim",
        title: "Operations Director, Serial Company"
      },
      nextSteps: [
        'Expanding automation to additional departments',
        'Implementing predictive maintenance capabilities',
        'Developing real-time performance dashboards',
        'Training more team members on AI-powered tools'
      ]
    }
  },
  'ai-accounting': {
    title: 'AI-Powered Accounting: Saving 20 Hours Per Week for Finance Teams',
    description: 'Our AI solution automated invoice processing, reconciliation, and reporting for a mid-sized accounting firm, freeing up valuable time for strategic tasks.',
    impact: '20 hours saved weekly',
    industry: 'Finance',
    image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=1600&h=900',
    fullContent: {
      challenge: 'Daisy Accounting struggled with manual invoice processing and reconciliation, leading to long working hours and delayed reporting. They needed to modernize their operations while maintaining accuracy and compliance.',
      solution: 'We implemented an AI-powered accounting automation system that handles invoice processing, reconciliation, and generates automated reports. The solution includes machine learning for pattern recognition and anomaly detection.',
      implementation: [
        'Analyzed existing accounting workflows and compliance requirements',
        'Developed custom AI models for invoice processing and categorization',
        'Implemented automated reconciliation with bank feeds',
        'Created automated reporting templates',
        'Provided staff training and transition support'
      ],
      results: [
        {
          metric: '20hrs',
          value: 'Weekly Time Saved',
          description: 'Reduced manual processing time'
        },
        {
          metric: '95%',
          value: 'Automation Rate',
          description: 'For standard invoice processing'
        },
        {
          metric: '40%',
          value: 'Cost Reduction',
          description: 'In processing costs per invoice'
        },
        {
          metric: '100%',
          value: 'Compliance Rate',
          description: 'Maintained full regulatory compliance'
        }
      ],
      testimonial: {
        quote: "The AI solution from NEXIUS Labs has revolutionized our accounting processes. Our team now focuses on analysis and strategy instead of manual data entry.",
        author: "Sarah Johnson",
        title: "CFO, Daisy Accounting"
      },
      nextSteps: [
        'Implementing predictive cash flow analysis',
        'Expanding automation to tax preparation',
        'Developing custom financial dashboards',
        'Adding machine learning for fraud detection'
      ]
    }
  },
  'ecommerce-growth': {
    title: 'Scaling E-commerce: How AI Helped a Brand Increase Conversions by 35%',
    description: 'An online retailer leveraged our AI-powered customer insights and automation platform to optimize their sales funnel and personalize customer experiences.',
    impact: '35% increase in conversions',
    industry: 'E-commerce',
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=1600&h=900',
    fullContent: {
      challenge: 'GreenCart, a growing e-commerce brand, faced challenges with cart abandonment, customer engagement, and personalization at scale. They needed a solution to understand customer behavior and automate personalized experiences.',
      solution: 'We implemented our AI-powered e-commerce optimization platform, which includes customer behavior analysis, personalized recommendations, and automated marketing campaigns.',
      implementation: [
        'Integrated AI-powered analytics for customer behavior tracking',
        'Implemented personalized product recommendations',
        'Developed automated email marketing campaigns',
        'Created dynamic pricing strategies',
        'Set up A/B testing frameworks'
      ],
      results: [
        {
          metric: '35%',
          value: 'Conversion Increase',
          description: 'Higher conversion rate across all products'
        },
        {
          metric: '45%',
          value: 'Cart Recovery',
          description: 'Improved abandoned cart recovery'
        },
        {
          metric: '28%',
          value: 'AOV Increase',
          description: 'Higher average order value'
        },
        {
          metric: '3x',
          value: 'ROI',
          description: 'Return on AI implementation'
        }
      ],
      testimonial: {
        quote: "NEXIUS Labs' AI solution has transformed how we understand and serve our customers. The results have exceeded our expectations.",
        author: "Michael Zhang",
        title: "CEO, GreenCart"
      },
      nextSteps: [
        'Expanding personalization capabilities',
        'Implementing AI-powered inventory management',
        'Developing predictive analytics for trends',
        'Creating automated customer service solutions'
      ]
    }
  }
};

export function CaseStudy() {
  const { id } = useParams<{ id: string }>();
  const study = id ? caseStudiesData[id] : null;

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (!study) {
    return (
      <div className="min-h-screen bg-gray-50 py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Case Study Not Found</h1>
          <Link to="/" className="text-nexius-teal hover:text-nexius-teal/90 mt-4 inline-block">
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative h-[60vh] min-h-[400px] bg-nexius-navy">
        <div className="absolute inset-0">
          <img
            src={study.image}
            alt={study.title}
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-nexius-navy/50 to-nexius-navy"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
          <Link to="/" className="inline-flex items-center text-white/80 hover:text-white pt-8 transition-colors">
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Home
          </Link>
          
          <div className="flex flex-col justify-center h-full pb-16">
            <div className="flex items-center gap-2 mb-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-nexius-teal/20 text-nexius-teal border border-nexius-teal/20">
                {study.industry}
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white/20 text-white border border-white/20">
                {study.impact}
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-white max-w-4xl">
              {study.title}
            </h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-3 gap-16">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Challenge */}
            <section className="mb-16">
              <h2 className="text-2xl font-display font-bold text-nexius-navy mb-4">
                The Challenge
              </h2>
              <p className="text-nexius-charcoal leading-relaxed">
                {study.fullContent.challenge}
              </p>
            </section>

            {/* Solution */}
            <section className="mb-16">
              <h2 className="text-2xl font-display font-bold text-nexius-navy mb-4">
                Our Solution
              </h2>
              <p className="text-nexius-charcoal leading-relaxed mb-8">
                {study.fullContent.solution}
              </p>
              
              <h3 className="text-xl font-display font-bold text-nexius-navy mb-4">
                Implementation Process
              </h3>
              <ul className="space-y-4">
                {study.fullContent.implementation.map((step, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle2 className="h-6 w-6 text-nexius-teal shrink-0 mt-0.5 mr-3" />
                    <span className="text-nexius-charcoal">{step}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Results */}
            <section className="mb-16">
              <h2 className="text-2xl font-display font-bold text-nexius-navy mb-8">
                The Results
              </h2>
              <div className="grid sm:grid-cols-2 gap-6">
                {study.fullContent.results.map((result, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-xl p-6 border border-nexius-gray hover:border-nexius-teal/30 transition-colors"
                  >
                    <div className="text-3xl font-display font-bold text-nexius-teal mb-2">
                      {result.metric}
                    </div>
                    <div className="font-semibold text-nexius-navy mb-2">
                      {result.value}
                    </div>
                    <p className="text-sm text-nexius-charcoal">
                      {result.description}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* Testimonial */}
            <section className="mb-16">
              <blockquote className="bg-nexius-navy rounded-xl p-8">
                <p className="text-xl text-white/90 italic mb-6">
                  "{study.fullContent.testimonial.quote}"
                </p>
                <footer>
                  <div className="text-white font-semibold">
                    {study.fullContent.testimonial.author}
                  </div>
                  <div className="text-white/80">
                    {study.fullContent.testimonial.title}
                  </div>
                </footer>
              </blockquote>
            </section>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <div className="bg-nexius-gray rounded-xl p-6 mb-8">
                <h3 className="text-lg font-display font-bold text-nexius-navy mb-4">
                  Key Metrics
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-5 w-5 text-nexius-teal" />
                    <span className="text-nexius-charcoal">
                      {study.impact}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-nexius-teal" />
                    <span className="text-nexius-charcoal">
                      {study.industry} Industry
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Target className="h-5 w-5 text-nexius-teal" />
                    <span className="text-nexius-charcoal">
                      3-Month Implementation
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-nexius-gray rounded-xl p-6">
                <h3 className="text-lg font-display font-bold text-nexius-navy mb-4">
                  Next Steps
                </h3>
                <ul className="space-y-3">
                  {study.fullContent.nextSteps.map((step, index) => (
                    <li key={index} className="flex items-start">
                      <ArrowRight className="h-5 w-5 text-nexius-teal shrink-0 mt-0.5 mr-2" />
                      <span className="text-sm text-nexius-charcoal">{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}