import { NextResponse } from 'next/server';
import MongoConnect from '@/lib/MongoConnect';
import Patient from '@/models/Patient';

export async function GET(req) {
  try {
    const token = req.headers.get('Authorization')?.split(' ')[1];
    
    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    
    const payload = JSON.parse(atob(token.split('.')[1]));
    
    if (payload.userType !== 'patient') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = payload.userId;

    await MongoConnect();
    
    const patient = await Patient.findById(userId);

    if (!patient) {
      return NextResponse.json({ message: 'Patient not found' }, { status: 404 });
    }
    
    return NextResponse.json({ 
      patient: {
        username: patient.username,
        email: patient.email,
        fullName: patient.fullName,
        medicalHistory: patient.medicalHistory,
        dateOfBirth: patient.dateOfBirth,
        gender: patient.gender,
        allergies: patient.allergies || [],
        currentMedications: patient.currentMedications || [],
        chronicConditions: patient.chronicConditions || []
      }
    });
    
  } catch (error) {
    console.error('Error fetching patient profile:', error);
    return NextResponse.json(
      { message: 'An error occurred while fetching profile' },
      { status: 500 }
    );
  }
}
