import React, { useState } from 'react';
import { uploadImage } from '../lib/storage';
import { createImageRecord } from '../lib/images';
import { supabase } from '../lib/supabase';

interface ImageUploadProps {
  onUploadComplete: (imageUrl: string) => void;
}

export function ImageUpload({ onUploadComplete }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!event.target.files || event.target.files.length === 0) {
        return;
      }

      setUploading(true);
      const file = event.target.files[0];

      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Upload to storage
      const { publicUrl, filePath } = await uploadImage(file);

      // Create database record
      await createImageRecord({
        title: 'NEXIUS Logo',
        description: 'Official NEXIUS brand logo',
        url: publicUrl,
        storage_path: filePath,
        user_id: user.id,
        metadata: {
          type: 'logo',
          originalName: file.name
        }
      });

      onUploadComplete(publicUrl);
    } catch (error) {
      console.error('Error uploading:', error);
      alert('Error uploading image');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <input
        type="file"
        accept="image/*"
        onChange={handleUpload}
        disabled={uploading}
        className="hidden"
        id="logo-upload"
      />
      <label
        htmlFor="logo-upload"
        className={`inline-flex items-center px-4 py-2 rounded-lg ${
          uploading
            ? 'bg-gray-300 cursor-not-allowed'
            : 'bg-nexius-teal hover:bg-nexius-teal/90 cursor-pointer'
        } text-white font-display font-semibold tracking-wide uppercase text-sm transition-colors`}
      >
        {uploading ? 'Uploading...' : 'Upload Logo'}
      </label>
    </div>
  );
}