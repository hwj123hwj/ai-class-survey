import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const admin = await verifyAuth(request);
  if (!admin) {
    return NextResponse.json({ success: false, error: '未授权' }, { status: 401 });
  }

  try {
    const questions = db.prepare('SELECT * FROM questions ORDER BY sort_order').all();
    return NextResponse.json({ success: true, questions });
  } catch (error) {
    return NextResponse.json({ success: false, error: '获取题目失败' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const admin = await verifyAuth(request);
  if (!admin) {
    return NextResponse.json({ success: false, error: '未授权' }, { status: 401 });
  }

  try {
    const { question_text, question_type, options, sort_order } = await request.json();

    const result = db.prepare(
      'INSERT INTO questions (question_text, question_type, options, sort_order) VALUES (?, ?, ?, ?)'
    ).run(question_text, question_type || 'radio', JSON.stringify(options || []), sort_order || 0);

    return NextResponse.json({
      success: true,
      questionId: result.lastInsertRowid,
      message: '题目添加成功'
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: '添加题目失败' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const admin = await verifyAuth(request);
  if (!admin) {
    return NextResponse.json({ success: false, error: '未授权' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id } = body;

    // 构建动态 UPDATE，只更新传入的字段
    const fields: string[] = [];
    const values: any[] = [];

    if (body.question_text !== undefined) {
      fields.push('question_text = ?');
      values.push(body.question_text);
    }
    if (body.question_type !== undefined) {
      fields.push('question_type = ?');
      values.push(body.question_type);
    }
    if (body.options !== undefined) {
      fields.push('options = ?');
      values.push(JSON.stringify(body.options));
    }
    if (body.sort_order !== undefined) {
      fields.push('sort_order = ?');
      values.push(body.sort_order);
    }
    if (body.is_active !== undefined) {
      fields.push('is_active = ?');
      values.push(body.is_active ? 1 : 0);
    }

    if (fields.length === 0) {
      return NextResponse.json({ success: false, error: '没有需要更新的字段' }, { status: 400 });
    }

    fields.push('updated_at = datetime(\'now\')');
    values.push(id);

    db.prepare(
      `UPDATE questions SET ${fields.join(', ')} WHERE id = ?`
    ).run(...values);

    return NextResponse.json({ success: true, message: '题目更新成功' });
  } catch (error) {
    return NextResponse.json({ success: false, error: '更新题目失败' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const admin = await verifyAuth(request);
  if (!admin) {
    return NextResponse.json({ success: false, error: '未授权' }, { status: 401 });
  }

  try {
    const { id } = await request.json();

    // Soft delete - set is_active to 0
    db.prepare('UPDATE questions SET is_active = 0, updated_at = datetime(\'now\') WHERE id = ?').run(id);

    return NextResponse.json({ success: true, message: '题目已禁用' });
  } catch (error) {
    return NextResponse.json({ success: false, error: '删除题目失败' }, { status: 500 });
  }
}
