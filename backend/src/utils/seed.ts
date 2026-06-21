import 'dotenv/config';
import mongoose from 'mongoose';
import argon2 from 'argon2';
import User from '../models/User';
import connectDB from '../config/db';

const ARGON2_OPTIONS: argon2.Options & { raw: false } = {
  type:        argon2.argon2id,
  memoryCost:  65536,
  timeCost:    3,
  parallelism: 4,
  raw:         false,
};

const SEED_USERS = [
  {
    name: 'NRSC System Admin',
    email: 'admin@isro.gov.in',
    password: 'Password@123',
    role: 'admin' as const,
    employeeCode: 'ADMIN-001',
    department: 'Directorate',
    designation: 'Senior System Administrator'
  },
  {
    name: 'NRSC HR Executive',
    email: 'hr@isro.gov.in',
    password: 'Password@123',
    role: 'hr' as const,
    employeeCode: 'HR-002',
    department: 'Personnel & General Administration',
    designation: 'Senior Administrative Officer'
  },
  {
    name: 'NRSC Supervisor',
    email: 'supervisor@isro.gov.in',
    password: 'Password@123',
    role: 'supervisor' as const,
    employeeCode: 'SUP-003',
    department: 'Remote Sensing Applications',
    designation: 'Group Director'
  },
  {
    name: 'NRSC Employee',
    email: 'employee@isro.gov.in',
    password: 'Password@123',
    role: 'employee' as const,
    employeeCode: 'EMP-004',
    department: 'Geoinformatics Department',
    designation: 'Scientist/Engineer-SD'
  }
];

async function seed() {
  try {
    console.log('Connecting to database...');
    await connectDB();

    console.log('Seeding default roles...');
    for (const u of SEED_USERS) {
      const existing = await User.findOne({ email: u.email });
      if (existing) {
        console.log(`ℹ️ User ${u.email} already exists.`);
        continue;
      }
      
      const passwordHash = await argon2.hash(u.password, ARGON2_OPTIONS);
      await User.create({
        name: u.name,
        email: u.email,
        passwordHash,
        role: u.role,
        employeeCode: u.employeeCode,
        department: u.department,
        designation: u.designation,
        authProvider: 'local'
      });
      console.log(`✅ Seeded ${u.role} account: ${u.email}`);
    }

    console.log('🎉 Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seed();
