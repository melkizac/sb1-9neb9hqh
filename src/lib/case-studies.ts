import { supabase } from './supabase';
import type { CaseStudy } from '../types/database';

export async function createCaseStudy(data: Omit<CaseStudy, 'id' | 'slug' | 'created_at' | 'updated_at'>) {
  try {
    const { data: caseStudy, error } = await supabase
      .from('case_studies')
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return caseStudy;
  } catch (error) {
    console.error('Error creating case study:', error);
    throw error;
  }
}

export async function getCaseStudies(options?: {
  status?: 'draft' | 'published' | 'archived';
  authorId?: string;
  limit?: number;
  offset?: number;
}) {
  try {
    let query = supabase
      .from('case_studies')
      .select('*')
      .order('created_at', { ascending: false });

    if (options?.status) {
      query = query.eq('status', options.status);
    }

    if (options?.authorId) {
      query = query.eq('author_id', options.authorId);
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
    console.error('Error fetching case studies:', error);
    throw error;
  }
}

export async function getCaseStudyBySlug(slug: string) {
  try {
    const { data, error } = await supabase
      .from('case_studies')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching case study:', error);
    throw error;
  }
}

export async function updateCaseStudy(id: string, updates: Partial<CaseStudy>) {
  try {
    const { data, error } = await supabase
      .from('case_studies')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating case study:', error);
    throw error;
  }
}

export async function deleteCaseStudy(id: string) {
  try {
    const { error } = await supabase
      .from('case_studies')
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting case study:', error);
    throw error;
  }
}

export async function publishCaseStudy(id: string) {
  try {
    const { data, error } = await supabase
      .from('case_studies')
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
    console.error('Error publishing case study:', error);
    throw error;
  }
}

export async function unpublishCaseStudy(id: string) {
  try {
    const { data, error } = await supabase
      .from('case_studies')
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
    console.error('Error unpublishing case study:', error);
    throw error;
  }
}