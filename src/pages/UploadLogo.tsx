import React, { useState } from 'react';
import { ImageUpload } from '../components/ImageUpload';

export function UploadLogo() {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  const handleUploadComplete = (imageUrl: string) => {
    setLogoUrl(imageUrl);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h1 className="text-2xl font-display font-bold text-nexius-navy mb-6">
              Upload Kate's Photo
            </h1>
            
            <div className="space-y-6">
              <ImageUpload onUploadComplete={handleUploadComplete} />
              
              {logoUrl && (
                <div className="mt-6">
                  <h2 className="text-lg font-semibold mb-2">Preview:</h2>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <img
                      src={logoUrl}
                      alt="Kate Yap"
                      className="h-32 w-32 object-cover rounded-full"
                      crossOrigin="anonymous"
                    />
                  </div>
                  <p className="mt-2 text-sm text-gray-600">
                    Photo uploaded successfully! You can now use this URL in your application:
                  </p>
                  <code className="mt-2 block p-2 bg-gray-50 rounded text-sm font-mono break-all">
                    {logoUrl}
                  </code>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}