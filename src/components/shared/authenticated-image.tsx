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
  const { accessToken } = useAuth();

  useEffect(() => {
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

      // Determine if the src is a full URL or a relative path
      let fullSrc = src;
      if (!src.startsWith('http://') && !src.startsWith('https://')) {
        fullSrc = `${backendUrl}${src}`;
      }

      try {
        const response = await fetch(fullSrc, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch image. Status: ${response.status}`);
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

    return () => {
      isMounted = false;
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src, accessToken]);

  if (isLoading) {
    return <Skeleton className="h-full w-full" />;
  }

  if (!imageUrl) {
    return null;
  }
  
  if (width && height) {
    return <Image src={imageUrl} alt={alt} width={width} height={height} {...props} />;
  }

  return <Image src={imageUrl} alt={alt} fill {...props} />;
};

export default AuthenticatedImage;
