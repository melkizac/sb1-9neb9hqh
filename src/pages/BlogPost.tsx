import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ArrowLeft, Calendar, User, Clock } from 'lucide-react';
import type { Article } from '../types/database';

export function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadArticle();
  }, [slug]);

  const loadArticle = async () => {
    try {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'published')
        .single();

      if (error) throw error;
      if (!data) {
        navigate('/blog');
        return;
      }

      setArticle(data);
    } catch (error) {
      console.error('Error loading article:', error);
      navigate('/blog');
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

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-nexius-teal"></div>
      </div>
    );
  }

  if (!article) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative h-[60vh] min-h-[400px] bg-nexius-navy">
        {article.featured_image && (
          <div className="absolute inset-0">
            <img
              src={article.featured_image}
              alt={article.title}
              className="w-full h-full object-cover opacity-20"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-nexius-navy/50 to-nexius-navy"></div>
          </div>
        )}
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
          <Link 
            to="/blog" 
            className="inline-flex items-center text-white/80 hover:text-white pt-8 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Blog
          </Link>
          
          <div className="flex flex-col justify-center h-full pb-16">
            <div className="flex items-center gap-4 text-white/80 mb-4">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                {formatDate(article.published_at || article.created_at)}
              </div>
              <div className="flex items-center">
                <User className="h-4 w-4 mr-1" />
                Author
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-white max-w-4xl">
              {article.title}
            </h1>
            {article.description && (
              <p className="text-xl text-white/80 mt-6 max-w-3xl">
                {article.description}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <article className="prose prose-lg max-w-none">
          <div dangerouslySetInnerHTML={{ __html: article.content }} />
        </article>
      </div>

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