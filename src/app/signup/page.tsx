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

const LocationPicker = dynamic(
  () => import('@/components/shared/location-picker'),
  { ssr: false, loading: () => <Skeleton className="h-full w-full" /> }
);

type FormState = {
  firstname: string;
  lastname: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  phoneNumber: string;
  location: { lat: number; lng: number } | null;
};

type FormErrors = {
  [K in keyof FormState]?: string | null;
};


export default function SignupPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [formState, setFormState] = useState<FormState>({
    firstname: '',
    lastname: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    location: null,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isFormValid, setIsFormValid] = useState(false);

  const validateAllFields = (currentFormState: FormState) => {
    const newErrors: FormErrors = {};
    let allValid = true;

    // Required field check for all fields
    (Object.keys(currentFormState) as Array<keyof FormState>).forEach((key) => {
        if (!currentFormState[key]) {
            newErrors[key] = 'This field is required.';
            allValid = false;
        }
    });

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (currentFormState.email && !emailRegex.test(currentFormState.email)) {
        newErrors.email = "Please enter a valid email address.";
        allValid = false;
    }

    // Phone number validation
    const phoneRegex = /^\d{10,15}$/;
    if (currentFormState.phoneNumber && !phoneRegex.test(String(currentFormState.phoneNumber).replace(/\D/g, ''))) {
        newErrors.phoneNumber = "Please enter a valid phone number (10-15 digits).";
        allValid = false;
    }

    // Password length
    if (currentFormState.password && currentFormState.password.length < 8) {
        newErrors.password = "Password must be at least 8 characters long.";
        allValid = false;
    }

    // Password confirmation
    if (currentFormState.password && currentFormState.confirmPassword && currentFormState.password !== currentFormState.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match.";
        allValid = false;
    }
    
    setErrors(newErrors);
    
    const allFieldsFilled = Object.values(currentFormState).every(value => value !== '' && value !== null);
    const finalValidity = allValid && allFieldsFilled;
    setIsFormValid(finalValidity);
    return finalValidity;
  };

  const validateField = (name: keyof FormState, value: any, currentState: FormState) => {
    let error: string | null = null;
    if (!value) {
      error = "This field is required.";
    } else {
        switch (name) {
            case 'email':
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(value)) {
                    error = "Please enter a valid email address.";
                }
                break;
            case 'phoneNumber':
                const phoneRegex = /^\d{10,15}$/;
                if (!phoneRegex.test(String(value).replace(/\D/g, ''))) {
                    error = "Please enter a valid phone number (10-15 digits).";
                }
                break;
            case 'password':
                if (value.length < 8) {
                    error = "Password must be at least 8 characters long.";
                }
                break;
            case 'confirmPassword':
                if (value !== currentState.password) {
                    error = "Passwords do not match.";
                }
                break;
            default:
                break;
        }
    }
    
    const newErrors = { ...errors, [name]: error };

    if (name === 'password' && currentState.confirmPassword) {
        if (value !== currentState.confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match.";
        } else {
            newErrors.confirmPassword = null;
        }
    }
    setErrors(newErrors);
    
    // Check overall form validity after any field changes
    const checkFormValidity = (state: FormState, currentErrors: FormErrors) => {
        const hasErrors = Object.values(currentErrors).some(e => e !== null);
        const allFieldsFilled = Object.values(state).every(v => v !== '' && v !== null);
        setIsFormValid(!hasErrors && allFieldsFilled);
    }
    checkFormValidity(currentState, newErrors);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target as { id: keyof FormState; value: string };
    const newFormState = { ...formState, [id]: value };
    setFormState(newFormState);
    validateField(id, value, newFormState);
  };
  
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { id, value } = e.target as { id: keyof FormState; value: string };
    validateField(id, value, formState);
  };

  const handleLocationChange = (location: { lat: number; lng: number } | null) => {
    const newFormState = { ...formState, location };
    setFormState(newFormState);
    validateField('location', location, newFormState);
  }

  const handleSignUp = async () => {
    const isValid = validateAllFields(formState);

    if (!isValid) {
      toast({
        variant: "destructive",
        title: "Registration Failed",
        description: "Please correct the errors before submitting.",
      });
      return;
    }

    // Replace this with your actual sign-up logic
    console.log("Form submitted:", formState);

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
                <Label htmlFor="firstname">First Name</Label>
                <Input id="firstname" required value={formState.firstname} onChange={handleChange} onBlur={handleBlur} />
                {errors.firstname && <p className="text-xs text-destructive">{errors.firstname}</p>}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="lastname">Last Name</Label>
                <Input id="lastname" required value={formState.lastname} onChange={handleChange} onBlur={handleBlur} />
                {errors.lastname && <p className="text-xs text-destructive">{errors.lastname}</p>}
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="username">Username</Label>
              <Input id="username" required value={formState.username} onChange={handleChange} onBlur={handleBlur} />
              {errors.username && <p className="text-xs text-destructive">{errors.username}</p>}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" required value={formState.email} onChange={handleChange} onBlur={handleBlur} />
              {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input id="phoneNumber" type="tel" required value={formState.phoneNumber} onChange={handleChange} onBlur={handleBlur} />
              {errors.phoneNumber && <p className="text-xs text-destructive">{errors.phoneNumber}</p>}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" required value={formState.password} onChange={handleChange} onBlur={handleBlur} />
              {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input id="confirmPassword" type="password" required value={formState.confirmPassword} onChange={handleChange} onBlur={handleBlur} />
              {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword}</p>}
            </div>

            <div className="grid gap-2">
              <Label>Location</Label>
              <CardDescription>Search for or click on the map to set your location.</CardDescription>
              <div className="h-[400px] rounded-md overflow-hidden border relative">
                <LocationPicker onLocationChange={handleLocationChange} />
              </div>
              {errors.location && <p className="text-xs text-destructive">{errors.location}</p>}
              {formState.location && (
                <p className="text-xs text-muted-foreground">
                  Selected: Lat {formState.location.lat.toFixed(4)}, Lng {formState.location.lng.toFixed(4)}
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
