
'use client';

import React, { useState, useEffect } from 'react';
import Image, { type ImageProps } from 'next/image';
import { useAuth } from '@/hooks/use-auth';
import { Skeleton } from '@/components/ui/skeleton';

interface AuthenticatedImageProps extends Omit<ImageProps, 'src' | 'width' | 'height' | 'alt'> {
  src: string | null | undefined;
  alt?: string;
  width?: number;
  height?: number;
}

const AuthenticatedImage: React.FC<AuthenticatedImageProps> = ({ src, alt = '', width, height, ...props }) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { api, accessToken } = useAuth(); // Use the custom api from useAuth

  useEffect(() => {
    let isMounted = true; 
    let objectUrl: string | null = null;

    const fetchImage = async () => {
      if (!src || !accessToken) {
        if (isMounted) setIsLoading(false);
        return;
      }
      
      if (isMounted) setIsLoading(true);
      
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
      if (!backendUrl) {
          if (isMounted) setIsLoading(false);
          console.error("Backend URL is not configured.");
          return;
      }

      // Determine if the src is a full URL or a relative path
      let fullSrc = src;
      if (!src.startsWith('http://') && !src.startsWith('https://')) {
        fullSrc = `${backendUrl}${src}`;
      }

      try {
        // Use the custom api.get which handles authentication
        const response = await api.get(fullSrc);

        if (!response.ok) {
          throw new Error(`Failed to fetch image. Status: ${response.status}`);
        }

        const blob = await response.blob();
        objectUrl = URL.createObjectURL(blob);
        
        if (isMounted) {
            setImageUrl(objectUrl);
        }

      } catch (error) {
        console.error('Error fetching authenticated image:', error);
        if (isMounted) {
            setImageUrl(null);
        }
      } finally {
        if (isMounted) {
            setIsLoading(false);
        }
      }
    };

    fetchImage();

    return () => {
      isMounted = false;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src, accessToken, api]); // Add api as a dependency

  if (isLoading) {
    return <Skeleton className="h-full w-full" />;
  }

  if (!imageUrl) {
    // Render a placeholder or nothing if the image fails to load
    return <div className="h-full w-full bg-muted flex items-center justify-center"><span className="text-xs text-muted-foreground">No Image</span></div>;
  }
  
  if (width && height) {
    return <Image src={imageUrl} alt={alt} width={width} height={height} {...props} />;
  }

  return <Image src={imageUrl} alt={alt} fill {...props} />;
};

export default AuthenticatedImage;
