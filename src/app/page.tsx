'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import SurveyForm from '@/components/SurveyForm';
import WelcomePage from '@/components/WelcomePage';
import ReportPage from '@/components/ReportPage';

function HomeContent() {
  const searchParams = useSearchParams();
  const reportParam = searchParams.get('report');

  const [step, setStep] = useState<'welcome' | 'survey' | 'report'>('welcome');
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sessionId, setSessionId] = useState<string>('');

  useEffect(() => {
    fetchQuestions();
  }, []);

  // 如果URL带 ?report=xxx，直接加载报告
  useEffect(() => {
    if (reportParam && questions.length > 0) {
      // 验证sessionId是否存在
      fetch(`/api/report/${reportParam}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setSessionId(reportParam);
            setStep('report');
          }
          // 如果报告不存在，忽略（留在welcome页）
        })
        .catch(() => {});
    }
  }, [reportParam, questions]);

  const fetchQuestions = async () => {
    try {
      const response = await fetch('/api/questions');
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

  const handleStart = () => {
    setStep('survey');
  };

  const handleSubmit = async (answers: Record<number, string>, userInfo: any) => {
    try {
      const response = await fetch('/api/survey/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...userInfo,
          answers
        })
      });

      const data = await response.json();
      if (data.success) {
        setSessionId(data.sessionId);
        // 写入URL，刷新不丢失
        window.history.replaceState(null, '', `/?report=${data.sessionId}`);
        setStep('report');
      } else {
        alert(data.error || '提交失败，请稍后重试');
      }
    } catch (error) {
      console.error('Submit error:', error);
      alert('提交失败，请稍后重试');
    }
  };

  const handleLookup = async (userName: string, userPhone: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/report/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userName, userPhone })
      });
      const data = await res.json();
      if (data.success) {
        setSessionId(data.sessionId);
        window.history.replaceState(null, '', `/?report=${data.sessionId}`);
        setStep('report');
        return true;
      } else {
        return false;
      }
    } catch {
      return false;
    }
  };

  const handleReset = () => {
    setStep('welcome');
    setSessionId('');
    window.history.replaceState(null, '', '/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf9f7] flex items-center justify-center">
        <div className="animate-pulse text-gray-500">加载中...</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#faf9f7]">
      {step === 'welcome' && (
        <WelcomePage onStart={handleStart} onLookup={handleLookup} questionCount={questions.length} />
      )}
      {step === 'survey' && (
        <SurveyForm questions={questions} onSubmit={handleSubmit} />
      )}
      {step === 'report' && sessionId && (
        <ReportPage sessionId={sessionId} onReset={handleReset} />
      )}
    </main>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#faf9f7] flex items-center justify-center">
        <div className="animate-pulse text-gray-500">加载中...</div>
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}
