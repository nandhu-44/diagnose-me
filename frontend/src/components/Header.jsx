"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function Header({ userType, handleLogout }) {
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [medicalHistory, setMedicalHistory] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("");
  const [open, setOpen] = useState(false);
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const [allergies, setAllergies] = useState([]);
  const [medications, setMedications] = useState([]);
  const [conditions, setConditions] = useState([]);
  const router = useRouter();

  useEffect(() => {
    // Parse the medical history data properly
    const storedUserName = localStorage.getItem('userName') || "";
    const storedUserEmail = localStorage.getItem('email') || "";
    const storedFullName = localStorage.getItem('fullName') || "";
    const storedMedicalHistory = localStorage.getItem('medicalHistory');
    const storedDateOfBirth = localStorage.getItem('dateOfBirth') || "";
    const storedGender = localStorage.getItem('gender') || "";

    // Parse medical history if it's an object
    try {
      const parsedMedicalHistory = storedMedicalHistory ? 
        (typeof storedMedicalHistory === 'object' ? 
          storedMedicalHistory.history : 
          storedMedicalHistory) : 
        "";

      setUserName(storedUserName);
      setUserEmail(storedUserEmail);
      setFullName(storedFullName);
      setMedicalHistory(parsedMedicalHistory);
      setDateOfBirth(storedDateOfBirth);
      setGender(storedGender);
      setAllergies(JSON.parse(localStorage.getItem('allergies') || '[]'));
      setMedications(JSON.parse(localStorage.getItem('currentMedications') || '[]'));
      setConditions(JSON.parse(localStorage.getItem('chronicConditions') || '[]'));
    } catch (error) {
      console.error('Error parsing medical history:', error);
    }
  }, []);

  const handleSaveMedicalHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('/api/auth/update-profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          medicalHistory,
          gender: localStorage.getItem('gender') // Include gender in update
        })
      });

      if (response.ok) {
        const data = await response.json();
        // Update localStorage with the correct format
        localStorage.setItem('medicalHistory', data.patient.medicalHistory);
        localStorage.setItem('gender', data.patient.gender);
        toast.success("Medical history updated successfully");
        setOpen(false);
      } else {
        toast.error("Failed to update medical history");
      }
    } catch (error) {
      console.error("Error updating medical history:", error);
      toast.error("An error occurred while updating");
    }
  };

  const handleTooltipOpenChange = (newOpen) => {
    if (!open) {
      setTooltipOpen(newOpen);
    }
  };

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
            <TooltipProvider delayDuration={0}>
              <Tooltip open={tooltipOpen} onOpenChange={handleTooltipOpenChange}>
                <TooltipTrigger asChild onClick={() => setTooltipOpen(!tooltipOpen)}>
                  <div className="relative cursor-pointer">
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
                  </div>
                </TooltipTrigger>
                <TooltipContent 
                  side="left"
                  align="end"
                  sideOffset={15}
                  alignOffset={5}
                  className="bg-gray-900 border-gray-800 w-64 p-3 !z-50"
                  onPointerDownOutside={() => setTooltipOpen(false)}
                >
                  <div className="flex flex-col gap-3 overflow-hidden">
                    <div className="border-b border-gray-800 pb-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium text-gray-100 text-base mb-1">{fullName || userName}</h4>
                          <p className="text-xs text-gray-400">{userEmail}</p>
                          {userType === 'patient' && (
                            <div className="mt-2 text-xs text-gray-300 space-y-1">
                              <p>Gender: {gender || 'Not specified'}</p>
                              <p>Date of Birth: {dateOfBirth ? new Date(dateOfBirth).toLocaleDateString() : 'Not specified'}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {userType === 'patient' && (
                      <Dialog 
                        open={open} 
                        onOpenChange={(isOpen) => {
                          setOpen(isOpen);
                          if (!isOpen) setTooltipOpen(false);
                        }}
                      >
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-xs bg-gray-800 text-gray-100 hover:bg-gray-700 border-gray-700"
                          >
                            Edit Medical History
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px] bg-gray-900 border-gray-800">
                          <DialogHeader>
                            <DialogTitle className="text-gray-100">Edit Medical History</DialogTitle>
                            <DialogDescription className="text-gray-400">
                              Update your medical history information to help our AI provide better recommendations.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                              <Label htmlFor="medicalHistory" className="text-gray-100">Medical History</Label>
                              <Textarea
                                id="medicalHistory"
                                value={medicalHistory}
                                onChange={(e) => setMedicalHistory(e.target.value)}
                                placeholder="Describe any significant medical conditions, surgeries, or ongoing health issues..."
                                className="min-h-[150px] max-h-[150px] bg-gray-800 border-gray-700 text-gray-100 placeholder:text-gray-500 resize-none"
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <DialogClose asChild>
                              <Button variant="outline" className="text-gray-100 bg-gray-800 hover:bg-gray-700 border-gray-700">Cancel</Button>
                            </DialogClose>
                            <Button 
                              onClick={handleSaveMedicalHistory}
                              className="bg-blue-600 text-white hover:bg-blue-700"
                            >
                              Save Changes
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
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
