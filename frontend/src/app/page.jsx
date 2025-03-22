'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function Home() {
  const [userType, setUserType] = useState('patient');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const validCredentials = {
    patient: { username: 'patient', password: 'password123' },
    doctor: { username: 'doctor', password: 'password123' }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');
    
    const credentials = validCredentials[userType];
    if (username === credentials.username && password === credentials.password) {
      localStorage.setItem('userType', userType);
      localStorage.setItem('isLoggedIn', 'true');
      router.push('/chat');
    } else {
      setError('Invalid credentials. Please try again.');
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-background">
      <Card className="w-full max-w-md py-10 flex-col px-4">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-bold text-primary">Diagnose Me</CardTitle>
          <CardDescription>Medical Records RAG System</CardDescription>
        </CardHeader>

        <Tabs defaultValue="patient" className="w-full" onValueChange={setUserType}>
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="patient">Patient Login</TabsTrigger>
            <TabsTrigger value="doctor">Doctor Login</TabsTrigger>
          </TabsList>
          
          <CardContent className="pt-6">
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={userType === 'patient' ? "Enter patient username" : "Enter doctor username"}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  required
                />
              </div>
              
              <Button type="submit" className="w-full">
                Login
              </Button>
            </form>
          </CardContent>
        </Tabs>
        
        <CardFooter className="flex flex-col">
          {userType === 'patient' && (
            <p className="text-center mt-2 text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Button variant="link" className="p-0">
                Sign up
              </Button>
            </p>
          )}
          
          <div className="mt-4 text-center">
            <p className="text-xs text-muted-foreground">
              Demo credentials: <br/>
              Patient - username: <span className="font-mono">patient</span>, password: <span className="font-mono">password123</span><br/>
              Doctor - username: <span className="font-mono">doctor</span>, password: <span className="font-mono">password123</span>
            </p>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
