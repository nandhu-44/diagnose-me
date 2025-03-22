'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function DoctorSignupPage() {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { register, handleSubmit, control, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      setError('');

      // Verify admin access token
      const adminToken = localStorage.getItem('adminToken');
      if (!adminToken) {
        setError('Unauthorized access');
        router.push('/');
        return;
      }

      const response = await fetch('/api/auth/doctor-signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({
          ...data,
          userType: 'doctor'
        }),
      });

      const result = await response.json();

      if (response.ok) {
        router.push('/admin/success');
      } else {
        setError(result.message || 'Error creating doctor account. Please try again.');
      }
    } catch (err) {
      console.error('Doctor signup error:', err);
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-gradient-to-b from-background to-primary/5">
      <Card className="w-full max-w-2xl">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-bold gradient-text">Create Doctor Account</CardTitle>
          <CardDescription>Add a new doctor to the platform</CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="grid gap-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  {...register("username", { required: "Username is required" })}
                  placeholder="Choose a username"
                />
                {errors.username && (
                  <p className="text-sm text-destructive">{errors.username.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="licenseNumber">Medical License Number</Label>
                <Input
                  id="licenseNumber"
                  {...register("licenseNumber", { required: "License number is required" })}
                  placeholder="Enter medical license number"
                />
                {errors.licenseNumber && (
                  <p className="text-sm text-destructive">{errors.licenseNumber.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Invalid email address"
                    }
                  })}
                  placeholder="Enter work email"
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  {...register("password", {
                    required: "Password is required",
                    minLength: {
                      value: 8,
                      message: "Password must be at least 8 characters"
                    }
                  })}
                  placeholder="Create a password"
                />
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                {...register("fullName", { required: "Full name is required" })}
                placeholder="Enter doctor's full name"
              />
              {errors.fullName && (
                <p className="text-sm text-destructive">{errors.fullName.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="specialization">Specialization</Label>
                <Input
                  id="specialization"
                  {...register("specialization", { required: "Specialization is required" })}
                  placeholder="e.g., Cardiologist, General Physician"
                />
                {errors.specialization && (
                  <p className="text-sm text-destructive">{errors.specialization.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="yearsOfExperience">Years of Experience</Label>
                <Input
                  id="yearsOfExperience"
                  type="number"
                  {...register("yearsOfExperience", { 
                    required: "Years of experience is required",
                    min: {
                      value: 0,
                      message: "Years of experience must be positive"
                    }
                  })}
                  placeholder="Enter years of experience"
                />
                {errors.yearsOfExperience && (
                  <p className="text-sm text-destructive">{errors.yearsOfExperience.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="hospitalAffiliation">Hospital Affiliation</Label>
              <Input
                id="hospitalAffiliation"
                {...register("hospitalAffiliation", { required: "Hospital affiliation is required" })}
                placeholder="Enter current hospital or clinic"
              />
              {errors.hospitalAffiliation && (
                <p className="text-sm text-destructive">{errors.hospitalAffiliation.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Creating Account...' : 'Create Doctor Account'}
            </Button>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}