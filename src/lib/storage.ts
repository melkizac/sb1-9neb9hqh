import { supabase } from './supabase';

const BUCKET_NAME = 'website-images';

export async function uploadImage(file: File) {
  try {
    // Get the file extension
    const fileExt = file.name.split('.').pop() || 'jpg';
    const timestamp = Date.now();
    const fileName = `${window.location.pathname.includes('melverick') ? 'melverick' : 'darryl'}-${timestamp}.${fileExt}`;
    const filePath = fileName;

    // Upload the file to Supabase storage with specific settings
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true, // Overwrite if exists
        contentType: file.type // Use the actual file type
      });

    if (error) throw error;

    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);

    return { publicUrl, filePath };
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
}

export async function deleteImage(filePath: string) {
  try {
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([filePath]);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting image:', error);
    throw error;
  }
}

export async function listImages() {
  try {
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .list();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error listing images:', error);
    throw error;
  }
}