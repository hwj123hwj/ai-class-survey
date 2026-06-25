'use client';

import { useState, useEffect } from 'react';

interface Response {
  id: number;
  session_id: string;
  user_name: string;
  user_phone: string;
  user_company: string;
  completed_at: string;
  answers_summary: string;
}

interface AnswerDetail {
  question_text: string;
  answer_value: string;
}

export default function ResponsesTab() {
  const [responses, setResponses] = useState<Response[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [details, setDetails] = useState<AnswerDetail[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    fetchResponses();
  }, []);

  const fetchResponses = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch('/api/admin/responses', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();

      if (data.success) {
        setResponses(data.responses);
      }
    } catch (error) {
      console.error('Failed to fetch responses:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDetails = async (responseId: number) => {
    setSelectedId(responseId);
    setLoadingDetails(true);

    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`/api/admin/responses?action=detail&id=${responseId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();

      if (data.success) {
        setDetails(data.details);
      }
    } catch (error) {
      console.error('Failed to fetch details:', error);
    } finally {
      setLoadingDetails(false);
    }
  };

  if (loading) {
    return <div className="text-center text-gray-500 py-8">加载中...</div>;
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">回答记录</h2>
        <span className="text-sm text-gray-500">共 {responses.length} 条</span>
      </div>

      {responses.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p>暂无回答记录</p>
        </div>
      ) : (
        <div className="space-y-4">
          {responses.map((response) => (
            <div
              key={response.id}
              className="border border-gray-200 rounded-xl overflow-hidden"
            >
              <div
                className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => fetchDetails(response.id)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">
                      {response.user_name || '匿名用户'}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      {response.user_company && `${response.user_company} · `}
                      {response.user_phone || ''}
                    </p>
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(response.completed_at).toLocaleString('zh-CN')}
                  </span>
                </div>

                {response.answers_summary && (
                  <p className="text-xs text-gray-500 line-clamp-2">
                    {response.answers_summary}
                  </p>
                )}
              </div>

              {/* Details panel */}
              {selectedId === response.id && (
                <div className="border-t border-gray-100 p-4 bg-gray-50">
                  {loadingDetails ? (
                    <div className="text-center text-gray-500 py-4">加载中...</div>
                  ) : (
                    <div className="space-y-3">
                      {details.map((detail, index) => (
                        <div key={index} className="flex gap-3">
                          <span className="flex-shrink-0 w-6 h-6 bg-[#fef3c7] text-[#92400e] text-xs font-medium rounded flex items-center justify-center">
                            {index + 1}
                          </span>
                          <div>
                            <p className="text-xs text-gray-500 mb-0.5">{detail.question_text}</p>
                            <p className="text-sm text-gray-900">{detail.answer_value}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
