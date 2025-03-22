'use client';

import { Button } from '@/components/ui/button';

export default function Header({ userType, handleLogout }) {
  return (
    <header className="bg-card shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-primary">Diagnose Me</h1>
        <div className="flex items-center gap-4">
          {userType && (
            <>
              <span className="text-sm text-muted-foreground">
                Logged in as {userType === 'patient' ? 'Patient' : 'Doctor'}
              </span>
              <Button
                onClick={handleLogout}
                variant="ghost"
                className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                size="sm"
              >
                Logout
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}