import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { EventsList } from '../components/EventsList';
import { Clock, Calendar, ArrowRight } from 'lucide-react';
import type { Event } from '../types/database';

export function Events() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('events')
        .select('*')
        .gte('end_date', new Date().toISOString())
        .order('start_date', { ascending: true });

      if (error) {
        setError('Failed to load events. Please try again later.');
        console.error('Error loading events:', error);
        throw error;
      }
      
      console.log('Loaded events:', data); // Add logging to debug
      setEvents(data || []);
    } catch (error) {
      console.error('Error loading events:', error);
      setError('Failed to load events. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative pt-32 pb-24 bg-gradient-to-b from-nexius-navy to-nexius-navy/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-6 tracking-tight">
              Upcoming Events
            </h1>
            <p className="text-xl text-white/80 max-w-3xl mx-auto leading-relaxed">
              Join us for workshops, webinars, and conferences focused on AI innovation and business transformation.
            </p>
          </div>
        </div>
      </section>

      {/* Events List Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {error ? (
            <div className="text-center py-16">
              <div className="text-red-500 mb-4">{error}</div>
              <button onClick={loadEvents} className="inline-flex items-center px-4 py-2 bg-nexius-teal text-white rounded-lg hover:bg-nexius-teal/90">Try Again</button>
            </div>
          ) : loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-nexius-teal"></div>
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-16">
              <Calendar className="h-16 w-16 text-nexius-teal mx-auto mb-6" />
              <h2 className="text-2xl font-display font-bold text-nexius-navy mb-4">
                No Upcoming Events
              </h2>
              <p className="text-nexius-charcoal max-w-md mx-auto mb-6">
                Check back soon for our upcoming events and workshops.
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="grid gap-6">
                <EventsList events={events} />
              </div>
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