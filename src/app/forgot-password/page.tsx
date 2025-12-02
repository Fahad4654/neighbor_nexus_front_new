'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AppLogo from "@/components/app-logo";
import { useToast } from "@/hooks/use-toast";
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [identifier, setIdentifier] = useState('');

  const handleRequestReset = async () => {
    if (!identifier) {
      toast({
        variant: "destructive",
        title: "Request Failed",
        description: "Please enter your email, username, or phone number.",
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
      const response = await fetch(`${backendUrl}/auth/request-reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'An unknown error occurred.');
      }

      toast({
        title: "OTP Sent",
        description: "An OTP has been sent to your registered contact method.",
      });

      router.push(`/reset-password-otp?identifier=${identifier}`);
    } catch (error: any) {
      console.error("Password reset request error:", error);
      toast({
        variant: "destructive",
        title: "Request Failed",
        description: error.message || "An unexpected error occurred.",
      });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-sm mx-auto">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <AppLogo />
          </div>
          <CardTitle className="text-2xl font-headline">Forgot Password</CardTitle>
          <CardDescription>
            Enter your identifier and we'll send you an OTP to reset your password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="identifier">Email, Username, or Phone</Label>
              <Input
                id="identifier"
                type="text"
                placeholder="user@example.com"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleRequestReset()}
              />
            </div>
            <Button onClick={handleRequestReset} type="submit" className="w-full">
              Send Reset Code
            </Button>
            <div className="mt-4 text-center text-sm">
              Remember your password?{" "}
              <Link href="/" className="underline">
                Sign in
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
