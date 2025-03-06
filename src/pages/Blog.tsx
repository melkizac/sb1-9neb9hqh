import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Clock, ArrowRight, Calendar, User } from 'lucide-react';
import type { Article } from '../types/database';

export function Blog() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadArticles();
  }, []);

  const loadArticles = async () => {
    try {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('status', 'published')
        .order('published_at', { ascending: false });

      if (error) throw error;
      setArticles(data || []);
    } catch (error) {
      console.error('Error loading articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative pt-32 pb-24 bg-gradient-to-b from-nexius-navy to-nexius-navy/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-6 tracking-tight">
              NEXIUS Labs Blog
            </h1>
            <p className="text-xl text-white/80 max-w-3xl mx-auto leading-relaxed">
              Insights, tutorials, and updates from our team of AI experts
            </p>
          </div>
        </div>
      </section>

      {/* Articles Grid */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-nexius-teal"></div>
            </div>
          ) : articles.length === 0 ? (
            <div className="text-center py-16">
              <h2 className="text-2xl font-display font-bold text-nexius-navy mb-4">
                No Articles Yet
              </h2>
              <p className="text-nexius-charcoal">
                Check back soon for our latest insights and updates.
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {articles.map((article) => (
                <Link
                  key={article.id}
                  to={`/blog/${article.slug}`}
                  className="group block"
                >
                  <div className="bg-white rounded-xl overflow-hidden border border-nexius-gray hover:border-nexius-teal/30 hover:shadow-lg transition-all">
                    {article.featured_image && (
                      <div className="aspect-video relative overflow-hidden">
                        <img
                          src={article.featured_image}
                          alt={article.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      </div>
                    )}
                    <div className="p-6">
                      <div className="flex items-center gap-4 text-sm text-nexius-charcoal/80 mb-3">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {formatDate(article.published_at || article.created_at)}
                        </div>
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-1" />
                          Author
                        </div>
                      </div>
                      <h3 className="text-xl font-display font-bold text-nexius-navy mb-3 group-hover:text-nexius-teal transition-colors">
                        {article.title}
                      </h3>
                      {article.description && (
                        <p className="text-nexius-charcoal mb-4 line-clamp-3">
                          {article.description}
                        </p>
                      )}
                      <div className="flex items-center text-nexius-teal font-medium">
                        Read Article{' '}
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-nexius-navy">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-display font-bold text-white mb-4">
            Want to Learn More?
          </h2>
          <p className="text-white/80 mb-8 max-w-2xl mx-auto">
            Schedule a discovery call to discuss how our AI solutions can help transform your business.
          </p>
          <a 
            href="https://tidycal.com/melverick/discovery-call-via-zoom-30min"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-nexius-teal text-white px-8 py-4 rounded-lg hover:bg-nexius-teal/90 transition-colors inline-flex items-center font-display font-semibold tracking-wide uppercase text-sm"
          >
            Schedule A Call <Clock className="ml-2 h-5 w-5" />
          </a>
        </div>
      </section>
    </div>
  );
}