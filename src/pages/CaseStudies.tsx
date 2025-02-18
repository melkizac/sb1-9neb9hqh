import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, TrendingUp, Users, Target, Clock } from 'lucide-react';

const caseStudies = [
  {
    id: 'sme-automation',
    title: 'How an SME Reduced Manual Work by 60% with AI Automation',
    description: 'A manufacturing company implemented our AI workflow automation solution, resulting in dramatic reduction in manual data entry and processing time.',
    impact: '60% reduction in manual work',
    industry: 'Manufacturing',
    image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=1600&h=900',
  },
  {
    id: 'ai-accounting',
    title: 'AI-Powered Accounting: Saving 20 Hours Per Week for Finance Teams',
    description: 'Our AI solution automated invoice processing, reconciliation, and reporting for a mid-sized accounting firm, freeing up valuable time for strategic tasks.',
    impact: '20 hours saved weekly',
    industry: 'Finance',
    image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=1600&h=900',
  },
  {
    id: 'ecommerce-growth',
    title: 'Scaling E-commerce: How AI Helped a Brand Increase Conversions by 35%',
    description: 'An online retailer leveraged our AI-powered customer insights and automation platform to optimize their sales funnel and personalize customer experiences.',
    impact: '35% increase in conversions',
    industry: 'E-commerce',
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=1600&h=900',
  },
];

export function CaseStudies() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative pt-32 pb-24 bg-gradient-to-b from-nexius-navy to-nexius-navy/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-6 tracking-tight">
              Success Stories:<br />AI Transformation in Action
            </h1>
            <p className="text-xl text-white/80 max-w-3xl mx-auto leading-relaxed">
              Discover how forward-thinking businesses are leveraging our AI solutions to transform their operations and achieve remarkable results.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-nexius-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl border border-nexius-gray">
              <TrendingUp className="h-12 w-12 text-nexius-teal mb-4" />
              <div className="text-3xl font-display font-bold text-nexius-navy mb-2">45%</div>
              <div className="text-nexius-charcoal">Average Efficiency Gain</div>
            </div>
            <div className="bg-white p-8 rounded-xl border border-nexius-gray">
              <Users className="h-12 w-12 text-nexius-teal mb-4" />
              <div className="text-3xl font-display font-bold text-nexius-navy mb-2">100+</div>
              <div className="text-nexius-charcoal">Businesses Transformed</div>
            </div>
            <div className="bg-white p-8 rounded-xl border border-nexius-gray">
              <Target className="h-12 w-12 text-nexius-teal mb-4" />
              <div className="text-3xl font-display font-bold text-nexius-navy mb-2">3x</div>
              <div className="text-nexius-charcoal">Average ROI</div>
            </div>
          </div>
        </div>
      </section>

      {/* Case Studies Grid */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {caseStudies.map((study) => (
              <Link
                key={study.id}
                to={`/case-study/${study.id}`}
                className="group block"
              >
                <div className="bg-white rounded-xl overflow-hidden border border-nexius-gray hover:border-nexius-teal/30 hover:shadow-lg transition-all">
                  <div className="aspect-video relative overflow-hidden">
                    <img
                      src={study.image}
                      alt={study.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-nexius-teal/20 text-white border border-white/20">
                          {study.industry}
                        </span>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white/20 text-white border border-white/20">
                          {study.impact}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-display font-bold text-nexius-navy mb-3 group-hover:text-nexius-teal transition-colors">
                      {study.title}
                    </h3>
                    <p className="text-nexius-charcoal mb-4">
                      {study.description}
                    </p>
                    <div className="flex items-center text-nexius-teal font-medium">
                      Read Case Study <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-nexius-navy">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-display font-bold text-white mb-4">
            Ready to Write Your Success Story?
          </h2>
          <p className="text-white/80 mb-8 max-w-2xl mx-auto">
            Join these forward-thinking businesses in transforming your operations with AI. Let's discuss how we can help you achieve similar results.
          </p>
          <a 
            href="https://tidycal.com/melverick/discovery-call-via-zoom-30min"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-nexius-teal text-white px-8 py-4 rounded-lg hover:bg-nexius-teal/90 transition-colors inline-flex items-center font-display font-semibold tracking-wide uppercase text-sm"
          >
            Schedule a Call <Clock className="ml-2 h-5 w-5" />
          </a>
        </div>
      </section>
    </div>
  );
}