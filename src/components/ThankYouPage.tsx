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

        <h1 className="text-2xl font-semibold text-gray-900 mb-2">诊断完成！</h1>
        <p className="text-gray-500 mb-8">
          感谢您的参与，我们将根据您的回答生成企业 AI Native 成熟度诊断报告。
        </p>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-left">
              <div className="flex-shrink-0 w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">诊断维度</p>
                <p className="text-sm text-gray-500 mt-1">
                  战略认知 · 场景试点 · 流程嵌入 · 平台与投入 · 业务重塑
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-left">
              <div className="flex-shrink-0 w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">成熟度等级</p>
                <p className="text-sm text-gray-500 mt-1">
                  L1 认知探索期 → L5 业务重塑期
                </p>
              </div>
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
