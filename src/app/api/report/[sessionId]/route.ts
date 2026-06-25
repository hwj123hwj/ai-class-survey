import { NextRequest, NextResponse } from 'next/server';
import db, { getResponseBySessionId } from '@/lib/db';
import { generateReport } from '@/lib/scoring';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;

    // 获取答卷数据
    const response = getResponseBySessionId(sessionId) as { id: number; user_name: string; user_company: string; completed_at: string } | undefined;
    if (!response) {
      return NextResponse.json(
        { success: false, error: '未找到该答卷' },
        { status: 404 }
      );
    }

    // 获取答案详情
    const answers = db.prepare(`
      SELECT
        a.question_id as questionId,
        q.question_text as questionText,
        q.sort_order as sortOrder,
        a.answer_value as answerValue
      FROM answers a
      JOIN questions q ON a.question_id = q.id
      WHERE a.response_id = ?
      ORDER BY q.sort_order
    `).all(response.id) as Array<{
      questionId: number;
      questionText: string;
      sortOrder: number;
      answerValue: string;
    }>;

    if (answers.length === 0) {
      return NextResponse.json(
        { success: false, error: '该答卷无答案数据' },
        { status: 404 }
      );
    }

    // 生成报告
    const report = generateReport(
      sessionId,
      response.user_name || '',
      response.user_company || '',
      response.completed_at || new Date().toISOString(),
      answers
    );

    return NextResponse.json({
      success: true,
      report,
    });
  } catch (error) {
    console.error('Error generating report:', error);
    return NextResponse.json(
      { success: false, error: '报告生成失败，请稍后重试' },
      { status: 500 }
    );
  }
}
