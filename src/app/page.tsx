'use client';

import { useState, useEffect } from 'react';
import SurveyForm from '@/components/SurveyForm';
import WelcomePage from '@/components/WelcomePage';
import ThankYouPage from '@/components/ThankYouPage';

export default function Home() {
  const [step, setStep] = useState<'welcome' | 'survey' | 'thankyou'>('welcome');
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuestions();
  }, []);

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
        setStep('thankyou');
      } else {
        alert(data.error || '提交失败，请稍后重试');
      }
    } catch (error) {
      console.error('Submit error:', error);
      alert('提交失败，请稍后重试');
    }
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
        <WelcomePage onStart={handleStart} questionCount={questions.length} />
      )}
      {step === 'survey' && (
        <SurveyForm questions={questions} onSubmit={handleSubmit} />
      )}
      {step === 'thankyou' && (
        <ThankYouPage />
      )}
    </main>
  );
}
