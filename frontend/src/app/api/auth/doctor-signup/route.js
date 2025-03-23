import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import Doctor from '@/models/Doctor';
import MongoConnect from '@/lib/MongoConnect';

export async function POST(req) {
  try {
    const token = req.headers.get('Authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ message: 'Unauthorized access' }, { status: 401 });
    }

    const payload = JSON.parse(atob(token.split('.')[1]));
    if (payload.userType !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized access' }, { status: 401 });
    }

    const {
      username,
      password,
      email,
      fullName,
      licenseNumber,
      specialization,
      yearsOfExperience,
      hospitalAffiliation,
    } = await req.json();

    await MongoConnect();

    const existingDoctor = await Doctor.findOne({
      $or: [{ username }, { email }, { licenseNumber }]
    });

    if (existingDoctor) {
      return NextResponse.json(
        { message: 'Username, email, or license number already exists' },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const doctor = await Doctor.create({
      username,
      password: hashedPassword,
      email,
      fullName,
      licenseNumber,
      specialization,
      yearsOfExperience,
      hospitalAffiliation,
      approvalStatus: 'approved',
      createdAt: new Date(),
    });

    return NextResponse.json(
      { message: 'Doctor account created successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Doctor signup error:', error);
    return NextResponse.json(
      { message: 'Error creating doctor account' },
      { status: 500 }
    );
  }
}