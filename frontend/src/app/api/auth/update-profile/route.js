import { NextResponse } from 'next/server';
import MongoConnect from '@/lib/MongoConnect';
import Patient from '@/models/Patient';

export async function PUT(req) {
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
    const { medicalHistory, gender } = await req.json();

    await MongoConnect();
    
    // Find patient first
    const existingPatient = await Patient.findById(userId);
    if (!existingPatient) {
      return NextResponse.json({ message: 'Patient not found' }, { status: 404 });
    }

    // Update patient record with existing data
    const patient = await Patient.findByIdAndUpdate(
      userId,
      { 
        medicalHistory,
        gender: gender || existingPatient.gender,
        updatedAt: new Date()
      },
      { new: true }
    );
    
    return NextResponse.json({ 
      message: 'Medical history updated successfully',
      patient: {
        username: patient.username,
        email: patient.email,
        medicalHistory: patient.medicalHistory,
        fullName: patient.fullName,
        gender: patient.gender
      }
    });
    
  } catch (error) {
    console.error('Error updating medical history:', error);
    return NextResponse.json(
      { message: 'An error occurred while updating medical history' },
      { status: 500 }
    );
  }
}