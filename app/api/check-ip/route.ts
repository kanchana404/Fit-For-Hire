// app/api/check-ip/route.ts

import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectToDatabase } from '@/lib/database';

// Specify Node.js runtime since Mongoose is not compatible with Edge runtime
export const runtime = 'nodejs';

// Define Mongoose schema and model
const scanSchema = new mongoose.Schema({
  ip: { type: String, unique: true, required: true },
  createdAt: { type: Date, default: Date.now },
});

// Prevent model recompilation in development
const Scan = mongoose.models.Scan || mongoose.model('Scan', scanSchema);

export async function POST(request: Request) {
  try {
    await connectToDatabase();

    const body = await request.json();
    const { ip } = body;

    if (!ip) {
      return NextResponse.json({ message: 'IP address is required.' }, { status: 400 });
    }

    // Check if IP exists
    const existingScan = await Scan.findOne({ ip });

    if (existingScan) {
      // IP exists, deny the scan
      return NextResponse.json({ allowed: false });
    }

    // IP does not exist, insert it
    await Scan.create({ ip });

    // Allow the scan
    return NextResponse.json({ allowed: true });
  } catch (error) {
    console.error('Error checking IP:', error);
    return NextResponse.json({ message: 'Internal server error.' }, { status: 500 });
  }
}

export function GET() {
  return NextResponse.json(
    { message: 'Method Not Allowed' },
    { status: 405, headers: { Allow: 'POST' } }
  );
}
