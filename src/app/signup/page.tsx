'use client';

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AppLogo from "@/components/app-logo";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

const LocationPicker = dynamic(
  () => import('@/components/shared/location-picker'),
  { ssr: false, loading: () => <Skeleton className="h-full w-full" /> }
);

export default function SignupPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);

  const handleSignUp = async () => {
    // --- All fields must be filled ---
    if (!firstname || !lastname || !username || !email || !password || !confirmPassword || !phoneNumber || !location) {
      toast({
        variant: "destructive",
        title: "Registration Failed",
        description: "Please fill out all required fields and select a location on the map.",
      });
      return;
    }

    // --- Email Validation ---
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        variant: "destructive",
        title: "Invalid Email",
        description: "Please enter a valid email address.",
      });
      return;
    }

    // --- Phone Number Validation (basic) ---
    const phoneRegex = /^\d{10,15}$/; // Simple check for 10-15 digits
    if (!phoneRegex.test(phoneNumber.replace(/\D/g, ''))) {
       toast({
        variant: "destructive",
        title: "Invalid Phone Number",
        description: "Please enter a valid phone number.",
      });
      return;
    }
    
    // --- Password Match Validation ---
    if (password !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Registration Failed",
        description: "Passwords do not match.",
      });
      return;
    }
    
    // --- Password Length Validation ---
    if (password.length < 8) {
      toast({
        variant: "destructive",
        title: "Password Too Short",
        description: "Password must be at least 8 characters long.",
      });
      return;
    }

    // If all validations pass, show success and redirect
    toast({
        title: "Registration Successful",
        description: "You can now sign in with your new account.",
    });

    router.push('/');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full mx-auto">
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
                <Input id="first-name" required value={firstname} onChange={(e) => setFirstname(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="last-name">Last Name</Label>
                <Input id="last-name" required value={lastname} onChange={(e) => setLastname(e.target.value)} />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="username">Username</Label>
              <Input id="username" required value={username} onChange={(e) => setUsername(e.target.value)} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="phone-number">Phone Number</Label>
              <Input id="phone-number" type="tel" required value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input id="confirm-password" type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
            </div>

            <div className="grid gap-2">
              <Label>Location</Label>
              <CardDescription>Search for or click on the map to set your location.</CardDescription>
              <div className="h-[400px] rounded-md overflow-hidden border relative">
                <LocationPicker onLocationChange={setLocation} />
              </div>

              {location && (
                <p className="text-xs text-muted-foreground">
                  Selected: Lat {location.lat.toFixed(4)}, Lng {location.lng.toFixed(4)}
                </p>
              )}
            </div>

            <Button onClick={handleSignUp} className="w-full">
              Create Account
            </Button>
          </div>

          <div className="mt-4 text-center text-sm">
            Already have an account?{" "}
            <Link href="/" className="underline">Sign in</Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
