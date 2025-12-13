'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AppLogo from "@/components/app-logo";
import { useToast } from "@/hooks/use-toast";

function VerifyOtpComponent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [otp, setOtp] = useState('');
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds

  const identifier = searchParams.get('identifier');

  useEffect(() => {
    if (timeLeft === 0) {
      toast({
        variant: "destructive",
        title: "Time's Up!",
        description: "The OTP has expired. Please try again.",
      });
      router.push('/');
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prevTime) => prevTime - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, router, toast]);

  const handleVerifyOtp = async () => {
    if (!otp || !identifier) {
      toast({
        variant: "destructive",
        title: "Verification Failed",
        description: "OTP and identifier are required.",
      });
      return;
    }

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    if (!backendUrl) {
      toast({
        variant: "destructive",
        title: "Configuration Error",
        description: "The backend URL is not configured. Please contact support.",
      });
      return;
    }

    try {
      const response = await fetch(`${backendUrl}/auth/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ identifier, otp }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || result.error || 'An unknown error occurred.');
      }

      toast({
        title: "Verification Successful",
        description: result.data.message || "Your account has been verified. You can now log in.",
      });

      router.push('/');
    } catch (error: any) {
      console.error("OTP verification error:", error);
      toast({
        variant: "destructive",
        title: "Verification Failed",
        description: error.message || "An unexpected error occurred.",
      });
    }
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <Card className="w-full max-w-sm mx-auto">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <AppLogo />
          </div>
          <CardTitle className="text-2xl font-headline">Verify Your Account</CardTitle>
          <CardDescription>
            Enter the OTP sent to {identifier ? <strong>{identifier}</strong> : "your email"}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="otp">One-Time Password (OTP)</Label>
              <Input
                id="otp"
                type="text"
                placeholder="123456"
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleVerifyOtp()}
              />
            </div>
             <div className="text-center text-sm text-muted-foreground">
              Time remaining: {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </div>
            <Button onClick={handleVerifyOtp} type="submit" className="w-full">
              Verify Account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


export default function VerifyOtpPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <VerifyOtpComponent />
        </Suspense>
    )
}
