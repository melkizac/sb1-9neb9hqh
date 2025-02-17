import { supabase } from './supabase';

const BUCKET_NAME = 'website-images';

export async function uploadImage(file: File) {
  try {
    // Create a unique file name
    const fileExt = file.name.split('.').pop();
    const fileName = `kate-yap.${fileExt}`;  // Fixed name for Kate's photo
    const filePath = fileName;

    // Upload the file to Supabase storage with specific settings
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true, // Overwrite if exists
        contentType: 'image/jpeg' // Explicitly set content type
      });

    if (error) throw error;

    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);

    // Verify the URL is accessible
    const checkResponse = await fetch(publicUrl, { method: 'HEAD' });
    if (!checkResponse.ok) {
      throw new Error('Image URL is not accessible');
    }

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