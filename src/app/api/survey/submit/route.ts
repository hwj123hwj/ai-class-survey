import { NextRequest, NextResponse } from 'next/server';
import db, { createResponse, saveAnswer, completeResponse, getResponseBySessionId } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userName, userPhone, userCompany, answers } = body;

    // Generate session ID
    const sessionId = crypto.randomUUID();

    // Create response record
    const result = createResponse(sessionId, userName, userPhone, userCompany);
    const responseId = result.lastInsertRowid;

    // Save all answers
    for (const [questionId, answerValue] of Object.entries(answers)) {
      saveAnswer(responseId as number, parseInt(questionId), answerValue as string);
    }

    // Mark as completed
    completeResponse(sessionId);

    return NextResponse.json({
      success: true,
      sessionId,
      message: '问卷提交成功！感谢您的参与。'
    });
  } catch (error) {
    console.error('Error submitting survey:', error);
    return NextResponse.json(
      { success: false, error: '提交失败，请稍后重试' },
      { status: 500 }
    );
  }
}
