import { supabase } from './supabase';
import type { Event } from '../types/database';

export async function createEvent(data: Omit<Event, 'id' | 'slug' | 'created_at' | 'updated_at'>) {
  try {
    const { data: event, error } = await supabase
      .from('events')
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return event;
  } catch (error) {
    console.error('Error creating event:', error);
    throw error;
  }
}

export async function getEvents(options?: {
  status?: 'draft' | 'published' | 'archived';
  organizerId?: string;
  upcoming?: boolean;
  limit?: number;
  offset?: number;
}) {
  try {
    let query = supabase
      .from('events')
      .select('*')
      .order('start_date', { ascending: true });

    if (options?.status) {
      query = query.eq('status', options.status);
    }

    if (options?.organizerId) {
      query = query.eq('organizer_id', options.organizerId);
    }

    if (options?.upcoming) {
      query = query.gte('start_date', new Date().toISOString());
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    if (options?.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching events:', error);
    throw error;
  }
}

export async function getEventBySlug(slug: string) {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching event:', error);
    throw error;
  }
}

export async function updateEvent(id: string, updates: Partial<Event>) {
  try {
    const { data, error } = await supabase
      .from('events')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating event:', error);
    throw error;
  }
}

export async function deleteEvent(id: string) {
  try {
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting event:', error);
    throw error;
  }
}

export async function publishEvent(id: string) {
  try {
    const { data, error } = await supabase
      .from('events')
      .update({
        status: 'published',
        published_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error publishing event:', error);
    throw error;
  }
}

export async function unpublishEvent(id: string) {
  try {
    const { data, error } = await supabase
      .from('events')
      .update({
        status: 'draft',
        published_at: null,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error unpublishing event:', error);
    throw error;
  }
}