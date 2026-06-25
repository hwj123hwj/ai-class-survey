import { NextResponse } from 'next/server';
import db, { getQuestions } from '@/lib/db';

export async function GET() {
  try {
    const questions = getQuestions();
    return NextResponse.json({ success: true, questions });
  } catch (error) {
    console.error('Error fetching questions:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch questions' },
      { status: 500 }
    );
  }
}
