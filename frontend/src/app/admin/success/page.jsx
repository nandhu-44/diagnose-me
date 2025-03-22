'use client';

import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";

export default function SuccessPage() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-gradient-to-b from-background to-primary/5">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center pb-2">
          <div className="flex justify-center mb-4">
            <CheckCircle2 className="h-12 w-12 text-success" />
          </div>
          <CardTitle className="text-2xl text-success">Success!</CardTitle>
          <CardDescription>Doctor account has been created successfully</CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            The doctor can now log in using their credentials
          </p>
          <Button 
            onClick={() => router.push('/')}
            className="w-full"
          >
            Return to Login
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}