/**
 * API Route for generating signed URLs for Cloudinary uploads
 * This provides a secure way to upload files directly to Cloudinary
 * from the client while enforcing access control.
 */

import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getArtistMediaPath, getUserMediaPath } from '@/utils/cloudinary/config';

// Configure Cloudinary with environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export async function POST(request: NextRequest) {
  try {
    // Create Supabase server client
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: any) {
            cookieStore.set({ name, value, ...options });
          },
          remove(name: string, options: any) {
            cookieStore.set({ name, value: '', ...options });
          },
        },
      }
    );

    // Get the current user session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { 
      mediaType,       // 'audio', 'video', 'image', etc.
      resourceType,    // 'image', 'video', 'raw', etc.
      folder,          // Custom folder (optional)
      isArtistUpload,  // Whether this is an artist media upload
      filename,        // Original filename 
      profileType      // For profile images: 'avatar' or 'banner'
    } = body;

    if (!mediaType || !resourceType) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Get current timestamp and generate signature
    const timestamp = Math.round(new Date().getTime() / 1000);
    const userId = session.user.id;

    // Determine folder path based on upload type
    let uploadFolder = folder;
    
    if (!uploadFolder) {
      if (isArtistUpload) {
        // Check if user is an artist
        const isArtist = session.user.user_metadata?.is_artist === true;
        if (!isArtist) {
          return NextResponse.json(
            { error: 'Only artists can upload to artist folders' },
            { status: 403 }
          );
        }
        
        // Generate artist media path
        uploadFolder = getArtistMediaPath(userId, mediaType);
      } else if (mediaType === 'profile' && profileType) {
        // Generate user profile path
        uploadFolder = getUserMediaPath(
          userId, 
          profileType as 'avatar' | 'banner'
        );
      } else {
        // Default user uploads folder
        uploadFolder = `eimusic/users/${userId}/${mediaType}`;
      }
    }

    // Generate a unique public_id
    const publicId = `${uploadFolder}/${Date.now()}-${filename.split('.')[0]}`;

    // Prepare signature parameters
    const paramsToSign = {
      timestamp,
      folder: uploadFolder,
      public_id: publicId,
      resource_type: resourceType,
    };

    // Generate the signature
    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      process.env.CLOUDINARY_API_SECRET!
    );

    return NextResponse.json({
      timestamp,
      signature,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
      folder: uploadFolder,
      publicId,
      resourceType,
    });
  } catch (error) {
    console.error('Error in Cloudinary upload API:', error);
    return NextResponse.json(
      { error: 'Failed to process upload request' },
      { status: 500 }
    );
  }
}

// This route only accepts POST requests
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
} 