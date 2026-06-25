'use client';

import { useState } from 'react';

interface WelcomePageProps {
  onStart: () => void;
  onLookup: (userName: string, userPhone: string) => Promise<boolean>;
  questionCount: number;
}

export default function WelcomePage({ onStart, onLookup, questionCount }: WelcomePageProps) {
  const [showLookup, setShowLookup] = useState(false);
  const [lookupName, setLookupName] = useState('');
  const [lookupPhone, setLookupPhone] = useState('');
  const [lookupError, setLookupError] = useState('');
  const [lookupLoading, setLookupLoading] = useState(false);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lookupName.trim() || !lookupPhone.trim()) {
      setLookupError('请填写姓名和手机号');
      return;
    }
    setLookupLoading(true);
    setLookupError('');
    const ok = await onLookup(lookupName.trim(), lookupPhone.trim());
    setLookupLoading(false);
    if (!ok) {
      setLookupError('未找到匹配的答卷记录，请检查姓名和手机号');
    }
  };

  return (
    <div className="min-h-screen bg-[#faf9f7] flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo area */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#d97706] rounded-2xl mb-4">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">企业 AI Native 成熟度诊断</h1>
          <p className="text-gray-500 text-sm">AI-Class 企业管理研究中心</p>
        </div>

        {/* Info card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">诊断说明</p>
                <p className="text-sm text-gray-500 mt-1">
                  每题选择最符合贵组织当前实际情况的选项，无对错之分。诊断涵盖5个维度、15道题目。
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">预计时间</p>
                <p className="text-sm text-gray-500 mt-1">约 3-5 分钟</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">隐私保护</p>
                <p className="text-sm text-gray-500 mt-1">
                  您的回答将严格保密，仅用于统计分析。
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Start button */}
        <button
          onClick={onStart}
          className="w-full bg-[#d97706] hover:bg-[#b45309] text-white font-medium py-3 px-4 rounded-xl transition-colors duration-200 shadow-sm"
        >
          开始填写 ({questionCount} 题)
        </button>

        {/* Lookup toggle */}
        <div className="text-center mt-6">
          {!showLookup ? (
            <button
              onClick={() => setShowLookup(true)}
              className="text-sm text-gray-400 hover:text-gray-600 underline underline-offset-4 transition-colors"
            >
              已有报告？点击查看
            </button>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">查看已有报告</h3>
              <form onSubmit={handleLookup} className="space-y-3">
                <input
                  type="text"
                  placeholder="您的姓名"
                  value={lookupName}
                  onChange={e => { setLookupName(e.target.value); setLookupError(''); }}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
                <input
                  type="text"
                  placeholder="您的手机号"
                  value={lookupPhone}
                  onChange={e => { setLookupPhone(e.target.value); setLookupError(''); }}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
                {lookupError && (
                  <p className="text-xs text-red-500">{lookupError}</p>
                )}
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={lookupLoading}
                    className="flex-1 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {lookupLoading ? '查询中…' : '查看报告'}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowLookup(false); setLookupError(''); }}
                    className="px-4 py-2.5 text-sm text-gray-500 hover:text-gray-700 rounded-lg transition-colors"
                  >
                    取消
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 mt-6">
          © 2026 AI-Class. All rights reserved.
        </p>
      </div>
    </div>
  );
}
