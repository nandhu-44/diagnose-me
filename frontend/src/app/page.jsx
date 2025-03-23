'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import Image from 'next/image';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function LoginPage() {
  const [error, setError] = useState('');
  const [userType, setUserType] = useState('patient');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      setError('');

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          userType
        }),
      });

      const result = await response.json();
      
      if (response.ok && result.success && result.token) {
        // Store auth data in localStorage
        localStorage.setItem('token', result.token);
        localStorage.setItem('userType', result.user.userType);
        localStorage.setItem('userId', result.user.id);
        localStorage.setItem('username', result.user.username);
        localStorage.setItem('fullName', result.user.fullName);
        
        // Use router.replace to prevent going back to login
        router.replace('/chat');
      } else {
        setError(result.message || 'Invalid credentials. Please try again.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-gradient-to-b from-background to-primary/5">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
          <div className="relative left-[calc(50%-20rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-primary to-secondary opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" />
        </div>
      </div>

      <div className="mb-8 text-center space-y-2">
        <Image 
          src="/diagnose-me-logo.svg" 
          alt="Diagnose Me Logo" 
          width={64} 
          height={64} 
          className="mx-auto"
        />
        <h1 className="text-4xl font-bold tracking-tight gradient-text">
          Diagnose Me
        </h1>
        <p className="text-muted-foreground">
          AI-powered medical symptom analysis and doctor consultation platform
        </p>
      </div>

      <Card className="w-full max-w-xl px-3 h-full shadow-lg border-primary/10">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Welcome back</CardTitle>
          <CardDescription className="text-center">
            {userType === 'patient' 
              ? 'Login to manage your health journey'
              : 'Access your doctor dashboard'}
          </CardDescription>
        </CardHeader>

        <Tabs value={userType} onValueChange={setUserType} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4 gap-x-2">
            <TabsTrigger value="patient" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Patient Login
            </TabsTrigger>
            <TabsTrigger value="doctor" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Doctor Login
            </TabsTrigger>
          </TabsList>

          <CardContent className="p-6">
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  {...register("username", { required: "Username is required" })}
                  placeholder={`Enter your username`}
                  className="bg-background"
                  disabled={isLoading}
                />
                {errors.username && (
                  <p className="text-sm text-destructive">{errors.username.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  {...register("password", { required: "Password is required" })}
                  placeholder="Enter your password"
                  className="bg-background"
                  disabled={isLoading}
                />
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password.message}</p>
                )}
              </div>
              
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Signing in...' : 'Sign in'}
              </Button>
            </form>
          </CardContent>
          
          <CardFooter className="flex flex-col pb-6">
            {userType === 'patient' ? (
              <p className="text-center text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Button variant="link" className="p-0 h-0" onClick={() => router.push('/signup')} disabled={isLoading}>
                  Sign up
                </Button>
              </p>
            ) : (
              <p className="text-center text-sm text-muted-foreground">
                Contact administrator for doctor registration
              </p>
            )}
          </CardFooter>
        </Tabs>
      </Card>
    </div>
  );
}
