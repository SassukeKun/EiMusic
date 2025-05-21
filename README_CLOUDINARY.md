# Cloudinary Integration for Media Uploads

This document outlines the architecture and implementation of Cloudinary uploads in the application.

## Overview

The Cloudinary integration provides a secure and efficient way to upload and serve media files (images, audio, video) for both artists and regular users. The implementation follows a secure upload pattern using signed URLs and handles different file types with appropriate transformations.

## Directory Structure

```
src/
├── utils/
│   └── cloudinary/
│       ├── config.ts       # Configuration and folder structure
│       ├── upload.ts       # Upload utilities
│       └── transformations.ts # Image/video transformations
│
├── models/
│   └── cloudinary/
│       └── mediaTypes.ts   # TypeScript interfaces for metadata
│
├── components/
│   └── upload/
│       └── FileUploader.tsx # Reusable file upload component
│
├── hooks/
│   └── useSecureCloudinaryUpload.ts # Custom hook for secure uploads
│
└── app/
    └── api/
        └── cloudinary/
            └── upload/
                └── route.ts # Server API route for signed uploads
```

## Security Implementation

All uploads follow a secure pattern:

1. Client-side code requests a signed upload URL from the server
2. Server verifies user authentication and permissions
3. Server generates a signature with timestamp for Cloudinary
4. Client uses the signature to upload directly to Cloudinary
5. Upload progress is tracked client-side

This approach prevents unauthorized uploads and ensures proper folder structure and access control.

## Folder Structure in Cloudinary

Media files are organized in a structured way:

- **Artists**: `eimusic/artists/{artistId}/{mediaType}/{mediaId}`
  - `mediaType`: audio, video, cover-art, profile
  - For example: `eimusic/artists/123/audio/456`

- **Users**: `eimusic/users/{userId}/{mediaType}`
  - `mediaType`: profile, etc.
  - For example: `eimusic/users/123/profile/avatar`

## Components & Hooks

### FileUploader Component

A reusable component for handling file uploads with:
- Drag and drop support
- File type validation
- Size limits
- Preview generation
- Error handling

### useSecureCloudinaryUpload Hook

A custom hook that provides:
- Secure upload flow
- Progress tracking
- Different upload functions for audio, video, and images
- Error handling

## API Route

The `/api/cloudinary/upload` endpoint:
- Authenticates requests
- Validates user permissions
- Generates signed upload parameters
- Enforces proper folder structure

## How to Use

### For Artists Uploading Music

```tsx
import { useSecureCloudinaryUpload } from '@/hooks/useSecureCloudinaryUpload';
import { AudioMetadata } from '@/models/cloudinary/mediaTypes';

function UploadMusic() {
  const { uploadAudio, uploadState } = useSecureCloudinaryUpload();
  
  async function handleUpload(audioFile, coverArtFile) {
    const metadata: Omit<AudioMetadata, 'uploadDate'> = {
      title: 'My Song',
      genre: 'Pop',
      visibility: 'public',
      isOriginal: true,
      isExplicit: false,
    };
    
    const result = await uploadAudio(audioFile, metadata, coverArtFile);
    
    if (result) {
      // Save to database or show success message
    }
  }
  
  return (
    <div>
      {/* Upload form */}
      {uploadState.isUploading && <ProgressBar progress={uploadState.progress} />}
    </div>
  );
}
```

### For User Profile Images

```tsx
import { useSecureCloudinaryUpload } from '@/hooks/useSecureCloudinaryUpload';

function ProfileImageUpload() {
  const { uploadProfileImage, uploadState } = useSecureCloudinaryUpload();
  
  async function handleAvatarUpload(imageFile) {
    const result = await uploadProfileImage(imageFile, 'avatar');
    
    if (result) {
      // Update user profile with new image URL
    }
  }
  
  return (
    <div>
      <FileUploader
        type="image"
        label="Upload avatar"
        maxSize={2}
        onFileSelect={handleAvatarUpload}
      />
      {uploadState.isUploading && <ProgressBar progress={uploadState.progress} />}
    </div>
  );
}
```

## Environment Variables

The following environment variables must be set:

```
# For client-side uploads
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_API_KEY=your_api_key
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_upload_preset

# For server-side signing
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
``` 