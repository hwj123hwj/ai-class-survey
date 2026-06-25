'use client';

export default function ThankYouPage() {
  return (
    <div className="min-h-screen bg-[#faf9f7] flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        {/* Success icon */}
        <div className="inline-flex items-center justify-center w-20 h-20 bg-[#ecfdf5] rounded-full mb-6">
          <svg className="w-10 h-10 text-[#059669]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-2xl font-semibold text-gray-900 mb-2">感谢您的参与！</h1>
        <p className="text-gray-500 mb-8">
          您的回答已成功提交，我们将认真分析每一份问卷，持续改进和提升。
        </p>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex items-center gap-3 text-left">
            <div className="flex-shrink-0 w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">后续反馈</p>
              <p className="text-sm text-gray-500 mt-1">
                调研结果将在整理完成后通过公司内部渠道公布。
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => window.location.reload()}
          className="bg-[#d97706] hover:bg-[#b45309] text-white font-medium py-3 px-6 rounded-xl transition-colors duration-200 shadow-sm"
        >
          返回首页
        </button>

        <p className="text-center text-xs text-gray-400 mt-8">
          © 2026 AI-Class. All rights reserved.
        </p>
      </div>
    </div>
  );
}
