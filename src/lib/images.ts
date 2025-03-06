import { supabase } from './supabase';
import type { Image } from '../types/database';

export async function createImageRecord(imageData: Omit<Image, 'id' | 'created_at' | 'updated_at'>) {
  try {
    // Create new record
    const { data: newData, error: insertError } = await supabase
      .from('images')
      .insert(imageData)
      .select()
      .single();

    if (insertError) throw insertError;
    return newData;
  } catch (error) {
    console.error('Error creating image record:', error);
    throw error;
  }
}

export async function getImages() {
  try {
    const { data, error } = await supabase
      .from('images')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching images:', error);
    throw error;
  }
}

export async function updateImage(id: string, updates: Partial<Image>) {
  try {
    const { data, error } = await supabase
      .from('images')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating image:', error);
    throw error;
  }
}

export async function deleteImageRecord(id: string) {
  try {
    const { error } = await supabase
      .from('images')
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting image record:', error);
    throw error;
  }
}