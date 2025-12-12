import React from 'react';
import Layout from '@/components/layout/Layout';
import ImageUploadTest from '@/components/ImageUploadTest';

const ImageTestPage = () => {
  return (
    <Layout>
      <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div>
            <h1 className="font-display text-3xl font-bold mb-4">EA FC 25 Image Upload Test</h1>
            <p className="text-muted-foreground font-gaming text-lg">
              Use this page to upload and test how EA FC 25 images look on the ArenaJo platform.
            </p>
          </div>
          
          <ImageUploadTest />
          
          {/* Instructions */}
          <div className="rounded-xl bg-card border border-border p-6">
            <h2 className="font-display text-xl font-semibold mb-4">How It Works</h2>
            <div className="space-y-3 text-muted-foreground font-gaming">
              <p>• Click "Choose Files" or drag and drop your EA FC 25 images</p>
              <p>• Images will be uploaded to the content filesystem at /content/games/</p>
              <p>• You'll get CDN URLs that you can use throughout the platform</p>
              <p>• Images are automatically optimized and served via the platform CDN</p>
              <p>• Test the uploaded images to see how they appear on tournament pages and game cards</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ImageTestPage;