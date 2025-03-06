import React, { useState } from 'react';
import { uploadImage } from '../lib/storage';
import { createImageRecord } from '../lib/images';
import { supabase } from '../lib/supabase';
import { X } from 'lucide-react';

interface ImageUploadProps {
  onUploadComplete: (imageUrl: string) => void;
  editMode?: boolean;
  initialData?: {
    title: string;
    description: string;
  };
  onSave?: (data: { title: string; description: string }) => void;
  onCancel?: () => void;
}

export function ImageUpload({ onUploadComplete, editMode, initialData, onSave, onCancel }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');

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
      const title = window.location.pathname.includes('melverick') 
        ? "Melverick's Profile Photo" 
        : "Darryl's Profile Photo";

      await createImageRecord({
        title,
        description: 'Co-founder profile photo',
        url: publicUrl,
        storage_path: filePath,
        user_id: user.id,
        metadata: {
          type: 'profile',
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

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSave) {
      onSave?.({
        title: title.trim(),
        description: description.trim()
      });
    }
  };


  if (editMode) {
    return (
      <form onSubmit={handleSave} className="space-y-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Edit Image Details</h3>
          <button
            type="button"
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Title
          </label>
          <input
            type="text"
            id="title"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-nexius-teal focus:border-nexius-teal"
          />
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-nexius-teal focus:border-nexius-teal sm:text-sm"
          />
        </div>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-nexius-teal text-white rounded-lg hover:bg-nexius-teal/90"
          >
            Save Changes
          </button>
        </div>
      </form>
    );
  }

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