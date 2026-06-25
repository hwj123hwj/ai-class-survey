'use client';

import { useState } from 'react';

interface Question {
  id: number;
  question_text: string;
  question_type: string;
  options: string;
  sort_order: number;
}

interface SurveyFormProps {
  questions: Question[];
  onSubmit: (answers: Record<number, string>, userInfo: any) => void;
}

export default function SurveyForm({ questions, onSubmit }: SurveyFormProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [userInfo, setUserInfo] = useState({
    userName: '',
    userPhone: '',
    userCompany: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Parse options for each question
  const parsedQuestions = questions.map(q => ({
    ...q,
    parsedOptions: JSON.parse(q.options)
  }));

  // Add user info step at the beginning
  const totalSteps = parsedQuestions.length + 1;
  const isUserInfoStep = currentStep === 0;
  const currentQuestion = !isUserInfoStep ? parsedQuestions[currentStep - 1] : null;

  const handleAnswer = (questionId: number, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const canProceed = () => {
    if (isUserInfoStep) {
      return userInfo.userName.trim() !== '';
    }
    if (currentQuestion) {
      return answers[currentQuestion.id] !== undefined;
    }
    return false;
  };

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    await onSubmit(answers, userInfo);
    setIsSubmitting(false);
  };

  const progress = ((currentStep + 1) / totalSteps) * 100;

  return (
    <div className="min-h-screen bg-[#faf9f7] flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-sm font-medium text-gray-900">员工满意度调研</h1>
            <span className="text-xs text-gray-500">
              {currentStep + 1} / {totalSteps}
            </span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-1.5">
            <div
              className="bg-[#d97706] h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          {/* User Info Step */}
          {isUserInfoStep && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-1">基本信息</h2>
              <p className="text-sm text-gray-500 mb-6">请填写以下信息（选填）</p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    您的姓名 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={userInfo.userName}
                    onChange={(e) => setUserInfo(prev => ({ ...prev, userName: e.target.value }))}
                    placeholder="请输入您的姓名"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#d97706] focus:border-transparent text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    手机号码
                  </label>
                  <input
                    type="tel"
                    value={userInfo.userPhone}
                    onChange={(e) => setUserInfo(prev => ({ ...prev, userPhone: e.target.value }))}
                    placeholder="请输入您的手机号码"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#d97706] focus:border-transparent text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    所在公司
                  </label>
                  <input
                    type="text"
                    value={userInfo.userCompany}
                    onChange={(e) => setUserInfo(prev => ({ ...prev, userCompany: e.target.value }))}
                    placeholder="请输入您所在的公司"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#d97706] focus:border-transparent text-sm"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Question Step */}
          {currentQuestion && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="mb-6">
                <span className="inline-block px-2 py-0.5 bg-[#fef3c7] text-[#92400e] text-xs font-medium rounded mb-2">
                  第 {currentStep} 题
                </span>
                <h2 className="text-lg font-semibold text-gray-900">
                  {currentQuestion.question_text}
                </h2>
              </div>

              <div className="space-y-3">
                {currentQuestion.parsedOptions.map((option: string, index: number) => (
                  <button
                    key={index}
                    onClick={() => handleAnswer(currentQuestion.id, option)}
                    className={`w-full text-left px-4 py-3 rounded-xl border transition-all duration-200 ${
                      answers[currentQuestion.id] === option
                        ? 'border-[#d97706] bg-[#fff7ed] text-[#92400e]'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        answers[currentQuestion.id] === option
                          ? 'border-[#d97706]'
                          : 'border-gray-300'
                      }`}>
                        {answers[currentQuestion.id] === option && (
                          <div className="w-2.5 h-2.5 rounded-full bg-[#d97706]" />
                        )}
                      </div>
                      <span className="text-sm">{option}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-3 mt-6">
            {currentStep > 0 && (
              <button
                onClick={handlePrev}
                className="flex-1 bg-white hover:bg-gray-50 text-gray-700 font-medium py-3 px-4 rounded-xl border border-gray-200 transition-colors duration-200"
              >
                上一题
              </button>
            )}

            {currentStep < totalSteps - 1 ? (
              <button
                onClick={handleNext}
                disabled={!canProceed()}
                className={`flex-1 font-medium py-3 px-4 rounded-xl transition-colors duration-200 ${
                  canProceed()
                    ? 'bg-[#d97706] hover:bg-[#b45309] text-white shadow-sm'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                下一题
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!canProceed() || isSubmitting}
                className={`flex-1 font-medium py-3 px-4 rounded-xl transition-colors duration-200 ${
                  canProceed() && !isSubmitting
                    ? 'bg-[#059669] hover:bg-[#047857] text-white shadow-sm'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                {isSubmitting ? '提交中...' : '提交问卷'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
