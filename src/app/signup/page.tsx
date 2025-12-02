'use client';

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AppLogo from "@/components/app-logo";
import { useToast } from "@/hooks/use-toast";

export default function SignupPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  const handleSignUp = async () => {
    if (!username || !firstname || !email || !password || !phoneNumber) {
      toast({
        variant: "destructive",
        title: "Registration Failed",
        description: "Please fill out all required fields.",
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

    const getLocation = (): Promise<{ lat: number; lng: number }> => {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error("Geolocation is not supported by your browser."));
            } else {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        resolve({
                            lat: position.coords.latitude,
                            lng: position.coords.longitude,
                        });
                    },
                    () => {
                        // Default to a location if user denies permission, or handle as an error
                        // For this example, we'll reject, but you could resolve a default.
                        reject(new Error("Unable to retrieve your location. Please enable location services."));
                    }
                );
            }
        });
    };

    try {
        const location = await getLocation();

        const response = await fetch(`${backendUrl}/auth/register`, {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                username,
                firstname,
                lastname,
                email,
                password,
                phoneNumber,
                location
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'An unknown error occurred during registration.');
        }

        toast({
            title: "Registration Successful",
            description: "You can now sign in with your new account.",
        });

        router.push('/');

    } catch (error: any) {
        console.error("Sign up error:", error);
        toast({
            variant: "destructive",
            title: "Registration Failed",
            description: error.message || "An unexpected error occurred.",
        });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <AppLogo />
          </div>
          <CardTitle className="text-2xl font-headline">Join the Nexus</CardTitle>
          <CardDescription>Create an account to start sharing with your neighbors.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="first-name">First Name</Label>
                    <Input id="first-name" placeholder="John" required value={firstname} onChange={(e) => setFirstname(e.target.value)} />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="last-name">Last Name</Label>
                    <Input id="last-name" placeholder="Doe" required value={lastname} onChange={(e) => setLastname(e.target.value)} />
                </div>
            </div>
             <div className="grid gap-2">
              <Label htmlFor="username">Username</Label>
              <Input id="username" placeholder="johndoe" required value={username} onChange={(e) => setUsername(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="m@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone-number">Phone Number</Label>
              <Input id="phone-number" type="tel" placeholder="01234567890" required value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <Button onClick={handleSignUp} type="submit" className="w-full">
              Create Account
            </Button>
          </div>
          <div className="mt-4 text-center text-sm">
            Already have an account?{" "}
            <Link href="/" className="underline">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
