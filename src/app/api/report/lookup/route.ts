import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { userName, userPhone } = await request.json();

    if (!userName || !userPhone) {
      return NextResponse.json({ success: false, error: '请填写姓名和手机号' }, { status: 400 });
    }

    const response = db.prepare(
      'SELECT session_id FROM responses WHERE user_name = ? AND user_phone = ? AND is_completed = 1 ORDER BY completed_at DESC LIMIT 1'
    ).get(userName, userPhone) as { session_id: string } | undefined;

    if (!response) {
      return NextResponse.json({ success: false, error: '未找到匹配的答卷记录' }, { status: 404 });
    }

    return NextResponse.json({ success: true, sessionId: response.session_id });
  } catch (error) {
    console.error('Lookup error:', error);
    return NextResponse.json({ success: false, error: '查询失败' }, { status: 500 });
  }
}
