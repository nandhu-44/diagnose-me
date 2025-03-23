"use client";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import Link from "next/link";

export default function Header({ userType, handleLogout }) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 px-12 py-2 bg-slate-300 items-center">
        <div className="flex flex-1 items-center justify-between">
          <div className="flex items-center space-x-2">
            <Link
              className="text-xl font-bold gradient-text hover:cursor-pointer"
              href={`${localStorage.getItem('token') ? "/chat" : "/"}`}
            >
              Diagnose Me
            </Link>
            <Badge variant="secondary" className="ml-2 hover:cursor-pointer">
              {userType === "patient" ? "Patient Portal" : "Doctor Dashboard"}
            </Badge>
          </div>

          <div className="flex items-center space-x-4">
            <Avatar>
              <AvatarFallback className="bg-primary/10 text-primary">
                <Image
                  src={userType === "patient" ? "/patient.png" : "/doctor.png"}
                  alt="User"
                  height={100}
                  width={100}
                  className="rounded-full border-[3px] border-yellow-400"
                />
              </AvatarFallback>
            </Avatar>
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="text-muted-foreground hover:text-white hover:bg-red-600"
            >
              Log out
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
