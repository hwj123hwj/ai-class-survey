import { NextRequest, NextResponse } from 'next/server';
import db, { getAllResponses, getResponseDetails, getStatistics, getQuestionStats, getQuestions } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const admin = await verifyAuth(request);
  if (!admin) {
    return NextResponse.json({ success: false, error: '未授权' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'stats') {
      // Get overall statistics
      const stats = getStatistics();
      const questions = getQuestions() as any[];

      // Get stats for each question
      const questionStats = questions.map(q => ({
        ...q,
        stats: getQuestionStats(q.id)
      }));

      return NextResponse.json({
        success: true,
        stats,
        questionStats
      });
    }

    if (action === 'detail') {
      const responseId = searchParams.get('id');
      if (!responseId) {
        return NextResponse.json({ success: false, error: '缺少响应ID' }, { status: 400 });
      }

      const details = getResponseDetails(parseInt(responseId));
      return NextResponse.json({ success: true, details });
    }

    // Default: get all responses
    const responses = getAllResponses();
    return NextResponse.json({ success: true, responses });
  } catch (error) {
    console.error('Error fetching responses:', error);
    return NextResponse.json({ success: false, error: '获取数据失败' }, { status: 500 });
  }
}
