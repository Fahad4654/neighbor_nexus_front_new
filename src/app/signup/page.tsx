'use client';

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AppLogo from "@/components/app-logo";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Eye, EyeOff } from "lucide-react";

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
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [errors, setErrors] = useState<{ email?: string; phoneNumber?: string; }>({});
  const [isFormValid, setIsFormValid] = useState(false);

  useEffect(() => {
    validateForm();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firstname, lastname, username, email, password, confirmPassword, phoneNumber, location, errors]);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrors(prev => ({ ...prev, email: 'Please enter a valid email address.' }));
    } else {
      setErrors(prev => ({ ...prev, email: undefined }));
    }
  };

  const validatePhoneNumber = (phone: string) => {
    const phoneRegex = /^\d{10,15}$/; // Simple regex for 10-15 digits
    if (!phoneRegex.test(phone.replace(/[-()\s]/g, ''))) {
      setErrors(prev => ({ ...prev, phoneNumber: 'Please enter a valid phone number (10-15 digits).' }));
    } else {
      setErrors(prev => ({ ...prev, phoneNumber: undefined }));
    }
  };

  const validateForm = () => {
    const isEmailValid = errors.email === undefined && email.length > 0;
    const isPhoneValid = errors.phoneNumber === undefined && phoneNumber.length > 0;
    const allFieldsFilled =
      firstname &&
      lastname &&
      username &&
      password &&
      confirmPassword &&
      location;

    setIsFormValid(isEmailValid && isPhoneValid && !!allFieldsFilled);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    validateEmail(newEmail);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPhone = e.target.value;
    setPhoneNumber(newPhone);
    validatePhoneNumber(newPhone);
  };


  const handleSignUp = async () => {
    if (!isFormValid) {
        toast({
            variant: "destructive",
            title: "Registration Failed",
            description: "Please fill out all fields correctly.",
        });
        return;
    }

    if (password !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Registration Failed",
        description: "Passwords do not match.",
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
      const response = await fetch(`${backendUrl}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
        throw new Error(data.message || data.error || 'An unknown error occurred during registration.');
      }

      toast({
        title: "Registration Successful",
        description: "Please check your email to verify your account.",
      });

      router.push(`/verify-otp?identifier=${email}`);
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
    <div className="flex items-center justify-center min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <AppLogo />
          </div>
          <CardTitle className="text-2xl font-headline">Join the Nexus</CardTitle>
          <CardDescription>Create an account to start sharing with your neighbors.</CardDescription>
          <p className="text-sm text-muted-foreground pt-2">All fields are required.</p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              <Input id="email" type="email" required value={email} onChange={handleEmailChange} />
              {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="phone-number">Phone Number (Do not include country code)</Label>
              <Input id="phone-number" type="tel" required value={phoneNumber} onChange={handlePhoneChange} />
              {errors.phoneNumber && <p className="text-sm text-destructive">{errors.phoneNumber}</p>}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input 
                    id="password" 
                    type={showPassword ? "text" : "password"} 
                    required 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)}
                    className="pr-10"
                />
                 <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon" 
                    className="absolute inset-y-0 right-0 h-full px-3"
                    onClick={() => setShowPassword(prev => !prev)}
                >
                    {showPassword ? <EyeOff /> : <Eye />}
                    <span className="sr-only">{showPassword ? 'Hide password' : 'Show password'}</span>
                </Button>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <div className="relative">
                <Input 
                    id="confirm-password" 
                    type={showConfirmPassword ? "text" : "password"} 
                    required 
                    value={confirmPassword} 
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pr-10"
                />
                 <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon" 
                    className="absolute inset-y-0 right-0 h-full px-3"
                    onClick={() => setShowConfirmPassword(prev => !prev)}
                >
                    {showConfirmPassword ? <EyeOff /> : <Eye />}
                    <span className="sr-only">{showConfirmPassword ? 'Hide password' : 'Show password'}</span>
                </Button>
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Location</Label>
              <CardDescription>Search for or click on the map to set your location.</CardDescription>
              <div className="h-[300px] sm:h-[400px] rounded-md overflow-hidden border relative">
                <LocationPicker onLocationChange={setLocation} />
              </div>

              {location && (
                <p className="text-xs text-muted-foreground">
                  Selected: Lat {location.lat.toFixed(4)}, Lng {location.lng.toFixed(4)}
                </p>
              )}
            </div>

            <Button onClick={handleSignUp} className="w-full" disabled={!isFormValid}>
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
