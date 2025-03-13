import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Calendar, Clock, MapPin, Users, ArrowLeft } from 'lucide-react';
import { EventRegistrationForm } from '../components/EventRegistrationForm';
import type { Event } from '../types/database';

export function EventDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showRegistration, setShowRegistration] = useState(false);

  useEffect(() => {
    loadEvent();
  }, [slug]);

  const loadEvent = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error) throw error;
      setEvent(data);
    } catch (error) {
      console.error('Error loading event:', error);
      setError('Failed to load event details.');
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (date: string) => {
    return new Date(date).toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-nexius-teal"></div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-white py-32 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-2xl font-display font-bold text-nexius-navy mb-4">
            Event Not Found
          </h1>
          <Link
            to="/events"
            className="inline-flex items-center text-nexius-teal hover:text-nexius-teal/90"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Events
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative bg-nexius-navy py-16 mb-8">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
          <Link 
            to="/events" 
            className="inline-flex items-center text-white/80 hover:text-white pt-8 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Events
          </Link>
          
          <div className="flex flex-col justify-center mt-8">
            <div className="flex items-center gap-2 mb-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                event.status === 'published'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {event.event_type.charAt(0).toUpperCase() + event.event_type.slice(1)}
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-white max-w-4xl">
              {event.title}
            </h1>
          </div>
        </div>
      </div>

      {/* Event Details */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid lg:grid-cols-3 gap-8 lg:gap-16 max-w-3xl mx-auto lg:max-w-none">
          {/* Main Content */}
          <div className="lg:col-span-2 order-1 lg:order-none">
            {/* Featured Image */}
            {event.featured_image && (
              <div className="relative aspect-[16/9] rounded-xl overflow-hidden mb-8 bg-gray-100">
                <img
                  src={event.featured_image}
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {event.description && (
              <div className="prose max-w-none mb-12" dangerouslySetInnerHTML={{ __html: event.description }} />
            )}
            
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 order-2">
            <div className="sticky top-24">
              <div className="bg-nexius-gray rounded-xl p-4 md:p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-display font-bold text-nexius-navy mb-4">
                    Event Details
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Calendar className="h-5 w-5 text-nexius-teal shrink-0 mt-1" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-nexius-navy">Date & Time</div>
                        <div className="text-nexius-charcoal break-words">
                          <div>{(() => {
                            const date = new Date(event.start_date);
                            const day = date.getDate();
                            const suffix = ['th', 'st', 'nd', 'rd'][(day % 10 > 3 ? 0 : day % 10)] || 'th';
                            return `${day}${suffix} ${date.toLocaleDateString('en-US', {
                              month: 'long',
                              year: 'numeric'
                            })} (${date.toLocaleDateString('en-US', { weekday: 'long' })})`;
                          })()}</div>
                          <div>{`${new Date(event.start_date).toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: 'numeric',
                            hour12: true
                          })} - ${new Date(event.end_date).toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: 'numeric',
                            hour12: true
                          })}`}</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-nexius-teal shrink-0 mt-1" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-nexius-navy">Location</div>
                        <div className="text-nexius-charcoal break-words">{event.location}</div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Users className="h-5 w-5 text-nexius-teal shrink-0 mt-1" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-nexius-navy">Capacity</div>
                        <div className="text-nexius-charcoal">
                          {event.capacity ? `${event.capacity} seats` : 'Unlimited'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-200">
                  <button
                    onClick={() => setShowRegistration(true)}
                    className="block w-full bg-nexius-teal text-white text-center px-6 py-3 rounded-lg hover:bg-nexius-teal/90 transition-colors font-display font-semibold tracking-wide uppercase text-sm"
                  >
                    Register Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <EventRegistrationForm
        event={event}
        isOpen={showRegistration}
        onClose={() => setShowRegistration(false)}
      />
    </div>
  );
}