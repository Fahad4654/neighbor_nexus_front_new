'use client';

import React, { useState, useEffect } from 'react';
import Image, { type ImageProps } from 'next/image';
import { useAuth } from '@/hooks/use-auth';
import { Skeleton } from '@/components/ui/skeleton';

interface AuthenticatedImageProps extends Omit<ImageProps, 'src'> {
  src: string | null | undefined;
}

const AuthenticatedImage: React.FC<AuthenticatedImageProps> = ({ src, alt, ...props }) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { accessToken } = useAuth();

  useEffect(() => {
    // Keep track of whether the component is still mounted
    let isMounted = true; 

    const fetchImage = async () => {
      if (!src || !accessToken) {
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
      if (!backendUrl) {
          setIsLoading(false);
          console.error("Backend URL is not configured.");
          return;
      }

      try {
        const response = await fetch(`${backendUrl}${src}`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch image');
        }

        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);
        
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

    // Cleanup function
    return () => {
      isMounted = false; // Mark as unmounted
      if (imageUrl) {
        // Revoke the object URL to free up memory
        URL.revokeObjectURL(imageUrl);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src, accessToken]);

  if (isLoading) {
    return <Skeleton className="h-full w-full" />;
  }

  if (!imageUrl) {
    // Fallback to just the alt text or a placeholder icon if you have one
    // For now, AvatarFallback will handle this in parent components
    return null;
  }

  return <Image src={imageUrl} alt={alt} {...props} />;
};

export default AuthenticatedImage;
