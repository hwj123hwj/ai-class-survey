'use client';

import { useState, useEffect } from 'react';

interface Question {
  id: number;
  question_text: string;
  question_type: string;
  options: string;
  sort_order: number;
  is_active: number;
}

export default function QuestionsTab() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({
    question_text: '',
    options: '',
    sort_order: 0
  });

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch('/api/admin/questions', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();

      if (data.success) {
        setQuestions(data.questions);
      }
    } catch (error) {
      console.error('Failed to fetch questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (question: Question) => {
    setEditingId(question.id);
    setEditForm({
      question_text: question.question_text,
      options: JSON.parse(question.options).join('\n'),
      sort_order: question.sort_order
    });
  };

  const handleSave = async () => {
    if (!editingId) return;

    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch('/api/admin/questions', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          id: editingId,
          question_text: editForm.question_text,
          question_type: 'radio',
          options: editForm.options.split('\n').filter(o => o.trim()),
          sort_order: editForm.sort_order,
          is_active: 1
        })
      });

      const data = await response.json();
      if (data.success) {
        setEditingId(null);
        fetchQuestions();
      } else {
        alert(data.error || '保存失败');
      }
    } catch (error) {
      alert('保存失败');
    }
  };

  const handleToggleActive = async (id: number, currentActive: number) => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch('/api/admin/questions', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          id,
          is_active: currentActive ? 0 : 1
        })
      });

      const data = await response.json();
      if (data.success) {
        fetchQuestions();
      }
    } catch (error) {
      alert('操作失败');
    }
  };

  if (loading) {
    return <div className="text-center text-gray-500 py-8">加载中...</div>;
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">题目列表</h2>
        <span className="text-sm text-gray-500">共 {questions.length} 题</span>
      </div>

      <div className="space-y-4">
        {questions.map((question, index) => (
          <div
            key={question.id}
            className={`border rounded-xl p-4 transition-colors ${
              question.is_active ? 'border-gray-200' : 'border-gray-100 bg-gray-50'
            }`}
          >
            {editingId === question.id ? (
              // Edit mode
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">题目内容</label>
                  <input
                    type="text"
                    value={editForm.question_text}
                    onChange={(e) => setEditForm(prev => ({ ...prev, question_text: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d97706] text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    选项（每行一个）
                  </label>
                  <textarea
                    value={editForm.options}
                    onChange={(e) => setEditForm(prev => ({ ...prev, options: e.target.value }))}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d97706] text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">排序</label>
                  <input
                    type="number"
                    value={editForm.sort_order}
                    onChange={(e) => setEditForm(prev => ({ ...prev, sort_order: parseInt(e.target.value) }))}
                    className="w-24 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d97706] text-sm"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 bg-[#d97706] hover:bg-[#b45309] text-white text-sm font-medium rounded-lg"
                  >
                    保存
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg"
                  >
                    取消
                  </button>
                </div>
              </div>
            ) : (
              // View mode
              <div>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                      第 {question.sort_order} 题
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleEdit(question)}
                      className="text-sm text-blue-600 hover:text-blue-700 cursor-pointer"
                    >
                      编辑
                    </button>
                    <button
                      onClick={() => handleToggleActive(question.id, question.is_active)}
                      className={`relative inline-flex items-center h-6 w-11 rounded-full transition-colors cursor-pointer focus:outline-none ${
                        question.is_active
                          ? 'bg-green-500'
                          : 'bg-gray-300'
                      }`}
                      title={question.is_active ? '点击禁用' : '点击启用'}
                    >
                      <span
                        className={`inline-block w-4 h-4 transform bg-white rounded-full shadow transition-transform ${
                          question.is_active ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                <p className="text-sm text-gray-900 mb-2">{question.question_text}</p>

                <div className="flex flex-wrap gap-2">
                  {JSON.parse(question.options).map((option: string, optIndex: number) => (
                    <span key={optIndex} className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded">
                      {option}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
