'use client';

import React from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { ReportData, DimensionScore, GapItem, InsightItem } from '@/lib/scoring';

interface ReportPageProps {
  sessionId: string;
  onReset: () => void;
}

export default function ReportPage({ sessionId, onReset }: ReportPageProps) {
  const [report, setReport] = React.useState<ReportData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [activeSection, setActiveSection] = React.useState('radar');
  const [downloading, setDownloading] = React.useState(false);
  const [pdfError, setPdfError] = React.useState('');
  const reportContentRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    fetchReport();
  }, [sessionId]);

  React.useEffect(() => {
    const handleScroll = () => {
      const sections = ['radar', 'dimensions', 'insights', 'gaps', 'path', 'services', 'action'];
      for (const id of sections.reverse()) {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 100) {
            setActiveSection(id);
            break;
          }
        }
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fetchReport = async () => {
    try {
      const res = await fetch(`/api/report/${sessionId}`);
      const data = await res.json();
      if (data.success) {
        setReport(data.report);
      } else {
        setError(data.error || '报告加载失败');
      }
    } catch {
      setError('网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F2ED] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-[#C45C3E]/30 border-t-[#C45C3E] rounded-full animate-spin mx-auto mb-6" />
          <p className="text-stone-500 text-sm tracking-wide">正在生成诊断报告…</p>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen bg-[#F5F2ED] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-6">{error || '报告数据异常'}</p>
          <button onClick={onReset} className="text-[#C45C3E] hover:text-[#A34D33] underline text-sm">返回首页</button>
        </div>
      </div>
    );
  }

  const navItems = [
    { id: 'radar', label: '能力雷达' },
    { id: 'dimensions', label: '逐维拆解' },
    { id: 'insights', label: '核心发现' },
    { id: 'gaps', label: '断层矩阵' },
    { id: 'path', label: '重构路径' },
    { id: 'services', label: '落地方案' },
    { id: 'action', label: '下一步' },
  ];

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const downloadPDF = async () => {
    if (!reportContentRef.current || !report) return;
    setDownloading(true);
    setPdfError('');
    try {
      const element = reportContentRef.current;
      const canvas = await html2canvas(element, {
        scale: 1.5,
        useCORS: true,
        allowTaint: true,
        logging: true,
        backgroundColor: '#F5F2ED',
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 10;
      const imgWidth = pageWidth - margin * 2;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', margin, position + margin, imgWidth, imgHeight);
      heightLeft -= pageHeight - margin * 2;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight + margin;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight);
        heightLeft -= pageHeight - margin * 2;
      }

      const company = (report.userCompany || report.userName || '企业').replace(/\s+/g, '_');
      pdf.save(`AI成熟度诊断报告_${company}_${formatDate(report.evaluatedAt)}.pdf`);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error('PDF download failed:', err);
      setPdfError(`PDF 生成失败：${message}`);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F2ED] text-stone-800" style={{ fontFamily: "'Plus Jakarta Sans', 'PingFang SC', 'Microsoft YaHei', sans-serif" }}>
      {/* Top Nav */}
      <nav className="sticky top-0 z-30 bg-[#F5F2ED]/95 backdrop-blur-md border-b border-stone-200/60">
        <div className="max-w-6xl mx-auto px-4 lg:px-6">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-stone-900 tracking-tight">EasyMeter</span>
              <span className="text-xs text-stone-400">|</span>
              <span className="text-xs text-stone-500">AI 成熟度诊断</span>
            </div>
            <div className="hidden md:flex items-center gap-1">
              {navItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => scrollTo(item.id)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all ${
                    activeSection === item.id
                      ? 'bg-stone-800 text-white'
                      : 'text-stone-500 hover:text-stone-800 hover:bg-stone-200/50'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <button
              onClick={downloadPDF}
              disabled={downloading}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full bg-[#C45C3E] text-white hover:bg-[#A34D33] transition-colors disabled:opacity-50"
            >
              {downloading ? (
                <>
                  <span className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />
                  生成中…
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  下载 PDF
                </>
              )}
            </button>
          </div>
        </div>
      </nav>

      {pdfError && (
        <div className="bg-red-50 border-b border-red-100 px-4 py-3">
          <div className="max-w-6xl mx-auto flex items-start gap-3">
            <svg className="w-5 h-5 text-red-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="flex-1">
              <p className="text-sm text-red-700">{pdfError}</p>
              <p className="text-xs text-red-500 mt-1">如果持续失败，请打开浏览器控制台(F12→Console)把报错截图发给技术支持。</p>
            </div>
            <button
              onClick={() => setPdfError('')}
              className="text-xs text-red-600 hover:text-red-800 underline shrink-0"
            >
              关闭
            </button>
          </div>
        </div>
      )}

      {/* Report content for PDF capture */}
      <div ref={reportContentRef}>
        {/* Hero */}
        <header className="bg-[#1A1A1A] text-white relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 lg:px-6 py-12 lg:py-16">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 items-start">
            {/* Level Badge */}
            <div className="shrink-0">
              <div className="inline-flex flex-col items-start bg-[#C45C3E] px-6 py-5 rounded-lg shadow-xl shadow-black/20">
                <span className="text-[5rem] lg:text-[7rem] font-black leading-none tracking-tighter"
                  style={{ fontFamily: "'Noto Serif SC', 'Songti SC', Georgia, serif" }}>
                  L{report.level}
                </span>
                <span className="text-sm font-bold tracking-widest uppercase mt-1">{report.levelName}</span>
                <span className="text-xs text-white/70 mt-0.5">{report.subStage}</span>
              </div>
            </div>

            <div className="flex-1 space-y-5 pt-2">
              <div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-white/50 uppercase tracking-widest mb-3">
                  <span>EasyMeter 出品</span>
                  <span className="w-8 h-px bg-white/20" />
                  <span>AI MATURITY DIAGNOSTIC</span>
                </div>
                <h1 className="text-3xl lg:text-4xl font-bold tracking-tight leading-tight">
                  企业 AI 转型<br />成熟度诊断报告
                </h1>
              </div>

              <p className="text-white/60 text-sm leading-relaxed max-w-xl">
                15 题自检 · 5 维度雷达 · 5 级成熟度模型。这套模型量的不是“你用了多少 AI”，而是你的组织被 AI 重构了多深——从 L1 认知探索，到 L5 长成一个 AI Native 组织。
              </p>

              <div className="flex flex-wrap gap-x-8 gap-y-3 text-sm pt-1">
                <div>
                  <span className="text-white/40">受测企业</span>
                  <span className="ml-2 text-white font-semibold">{report.userCompany || report.userName || '未填写'}</span>
                </div>
                <div>
                  <span className="text-white/40">综合得分</span>
                  <span className="ml-2 text-[#C45C3E] font-bold text-lg">{report.totalScore}</span>
                  <span className="text-white/40 text-xs">/100</span>
                </div>
                <div>
                  <span className="text-white/40">诊断引擎</span>
                  <span className="ml-2 text-white font-semibold">EasyMeter</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 border border-white/10 rounded-lg px-3 py-1.5 -my-1">
                  <svg className="w-4 h-4 text-[#C45C3E]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-white/60 text-xs">评测日期</span>
                  <span className="text-white font-semibold">{formatDate(report.evaluatedAt)}</span>
                </div>
              </div>

              <button
                onClick={downloadPDF}
                disabled={downloading}
                className="md:hidden inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors disabled:opacity-50 mt-2"
              >
                {downloading ? (
                  <>
                    <span className="w-3.5 h-3.5 border border-white/30 border-t-white rounded-full animate-spin" />
                    生成 PDF 中…
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    下载 PDF 报告
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-4 lg:px-6 py-12 lg:py-16 space-y-20 lg:space-y-28">
        {/* Section 01: Radar */}
        <section id="radar">
          <SectionHeader number="01" title="能力雷达" english="CAPABILITY RADAR" />
          <div className="mt-8 grid lg:grid-cols-12 gap-6">
            {/* Level Ladder */}
            <div className="lg:col-span-4 bg-white rounded-2xl border border-stone-200 p-5">
              <h3 className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-4">成熟度阶梯 · 诊断只落在其中一级</h3>
              <div className="space-y-2">
                {[
                  { l: 5, label: '业务重塑', desc: 'AI 成护城河' },
                  { l: 4, label: '规模扩展', desc: '样板复制成平台' },
                  { l: 3, label: '流程嵌入', desc: 'AI 进入业务流程' },
                  { l: 2, label: '试点验证', desc: '单点突破' },
                  { l: 1, label: '认知探索', desc: 'AI 进入视野' },
                ].map(({ l, label, desc }) => {
                  const isCurrent = l === report.level;
                  const isPassed = l < report.level;
                  return (
                    <div key={l} className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${isCurrent ? 'bg-[#C45C3E]/10 border border-[#C45C3E]/20' : 'bg-stone-50'}`}>
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 ${
                        isCurrent ? 'bg-[#C45C3E] text-white' : isPassed ? 'bg-stone-700 text-white' : 'bg-stone-200 text-stone-400'
                      }`}>
                        {isPassed && !isCurrent ? '✓' : `L${l}`}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className={`text-sm font-semibold ${isCurrent ? 'text-[#C45C3E]' : isPassed ? 'text-stone-700' : 'text-stone-400'}`}>
                          {label}
                        </div>
                        <div className="text-xs text-stone-400">{desc}</div>
                      </div>
                      {isCurrent && <span className="text-xs font-medium text-[#C45C3E] bg-white px-2 py-1 rounded-full">当前</span>}
                    </div>
                  );
                })}
              </div>
              <p className="text-xs text-stone-400 mt-4 leading-relaxed">
                L1–L5 是一条阶梯，诊断只落在其中一级。你当前在 L{report.level} {report.levelName}。
              </p>
            </div>

            {/* Radar Chart */}
            <div className="lg:col-span-8 bg-white rounded-2xl border border-stone-200 p-6 flex flex-col items-center justify-center">
              <RadarChart dimensions={report.dimensions} size={340} />
              <div className="flex flex-wrap justify-center gap-4 mt-4">
                {report.dimensions.map(d => (
                  <div key={d.key} className="flex items-center gap-1.5 text-xs">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                    <span className="text-stone-600">{d.label}</span>
                    <span className="font-semibold text-stone-900">{d.score}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Score Cards */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-5 gap-3">
            {report.dimensions.map(d => (
              <div key={d.key} className="bg-white rounded-xl border border-stone-200 p-4">
                <div className="text-xs text-stone-400 mb-1">{d.fullLabel}</div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black" style={{ color: d.color }}>{d.score}</span>
                  <span className="text-xs text-stone-400">/15</span>
                </div>
                <div className="w-full bg-stone-100 rounded-full h-1.5 mt-3">
                  <div className="h-1.5 rounded-full" style={{ width: `${(d.score / 15) * 100}%`, backgroundColor: d.color }} />
                </div>
              </div>
            ))}
          </div>

          {/* Total Score & Progress */}
          <div className="mt-6 bg-white rounded-2xl border border-stone-200 p-6">
            <div className="flex flex-col md:flex-row md:items-end gap-4 md:gap-8">
              <div className="shrink-0">
                <div className="text-xs text-stone-400 mb-1">综合得分</div>
                <div className="text-5xl font-black text-stone-900 tracking-tight">
                  {report.totalScore}<span className="text-xl text-stone-400 font-medium">/100</span>
                </div>
              </div>
              <div className="flex-1 pb-1">
                <div className="relative h-2 bg-stone-100 rounded-full overflow-hidden">
                  <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-stone-400 via-[#C45C3E] to-[#C45C3E] rounded-full transition-all duration-700"
                    style={{ width: `${report.totalScore}%` }} />
                </div>
                <div className="flex justify-between text-xs text-stone-400 mt-2">
                  <span>L1 认知</span>
                  <span>L2 单点</span>
                  <span>L3 流程</span>
                  <span>L4 平台</span>
                  <span>L5 重塑</span>
                </div>
              </div>
            </div>
            <p className="text-sm text-stone-600 mt-4 leading-relaxed">
              阶梯量的不是“你用了多少 AI 工具”，而是你的组织被 AI 重构了多深。综合 {report.totalScore} 分，诊断落在 L{report.level} {report.levelName}（{report.subStage}）。
            </p>
          </div>
        </section>

        {/* Section 02: Dimensions */}
        <section id="dimensions">
          <SectionHeader number="02" title="逐维拆解" english="BY CAPABILITY" />
          <div className="mt-8 space-y-6">
            {report.dimensions.map(dim => (
              <DimensionCard
                key={dim.key}
                dim={dim}
                isWeakest={dim.key === report.dimensions.reduce((a, b) => a.score <= b.score ? a : b).key}
                isStrongest={dim.key === report.dimensions.reduce((a, b) => a.score >= b.score ? a : b).key}
              />
            ))}
          </div>
        </section>

        {/* Section 03: Insights */}
        <section id="insights">
          <SectionHeader number="03" title="核心发现" english="KEY INSIGHTS" />
          <div className="mt-8 space-y-5">
            {report.insights.map((insight, i) => (
              <div key={i} className="bg-white rounded-2xl border border-stone-200 p-6 flex gap-5">
                <div className="shrink-0 w-10 h-10 rounded-full bg-[#1A1A1A] text-white flex items-center justify-center text-lg font-bold"
                  style={{ fontFamily: "'Noto Serif SC', Georgia, serif" }}>
                  {i + 1}
                </div>
                <div>
                  <h3 className="font-bold text-stone-900 mb-2 text-lg">{insight.title}</h3>
                  <p className="text-sm text-stone-600 leading-relaxed">{insight.content}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 04: Gaps */}
        <section id="gaps">
          <SectionHeader number="04" title="断层矩阵" english="WHERE IT BREAKS" />
          <GapsTable gaps={report.gaps} />
        </section>

        {/* Section 05: Path */}
        <section id="path">
          <SectionHeader number="05" title="重构路径" english={`FROM L${report.level} TO AI NATIVE`} />
          <PathSection report={report} />
        </section>

        {/* Section 06: Services */}
        <section id="services">
          <SectionHeader number="06" title="落地方案" english="HOW WE HELP YOU CLIMB" />
          <ServicesSection />
        </section>

        {/* Section 07: Action */}
        <section id="action">
          <SectionHeader number="07" title="下一步" english="TONIGHT · THIS WEEK · THIS MONTH" />
          <ActionSection plan={report.actionPlan} />
        </section>
      </main>
      </div>

      {/* Footer */}
      <footer className="bg-[#1A1A1A] text-white/50 py-10 mt-20">
        <div className="max-w-6xl mx-auto px-4 lg:px-6 text-center">
          <p className="text-sm">本报告由 EasyMeter 自动生成 · 基于 15 题作答，5 大能力维度雷达 + L1–L5 成熟度定级</p>
          <button onClick={onReset} className="mt-4 text-sm text-white/70 hover:text-white underline underline-offset-4 transition-colors">
            重新诊断
          </button>
        </div>
      </footer>
    </div>
  );
}

/* ==================== Shared Components ==================== */

function SectionHeader({ number, title, english }: { number: string; title: string; english: string }) {
  return (
    <div className="flex items-end gap-4 border-b border-stone-300/70 pb-4">
      <span className="text-4xl lg:text-5xl font-black text-stone-200 leading-none select-none"
        style={{ fontFamily: "'Noto Serif SC', Georgia, serif" }}>
        {number}
      </span>
      <div className="pb-1">
        <h2 className="text-xl lg:text-2xl font-bold text-stone-900 tracking-tight">{title}</h2>
        <p className="text-xs text-stone-400 tracking-[0.15em] uppercase mt-0.5">{english}</p>
      </div>
    </div>
  );
}

/* ==================== Radar Chart ==================== */

function RadarChart({ dimensions, size = 300 }: { dimensions: DimensionScore[]; size?: number }) {
  const center = size / 2;
  const radius = size * 0.32;
  const levels = 5;
  const angleStep = (2 * Math.PI) / dimensions.length;
  const startAngle = -Math.PI / 2;

  const getPoint = (i: number, value: number, maxValue: number) => {
    const angle = startAngle + i * angleStep;
    const r = (value / maxValue) * radius;
    return { x: center + r * Math.cos(angle), y: center + r * Math.sin(angle) };
  };

  const getLabelPoint = (i: number) => {
    const angle = startAngle + i * angleStep;
    const r = radius + size * 0.12;
    return { x: center + r * Math.cos(angle), y: center + r * Math.sin(angle) };
  };

  const dataPoints = dimensions.map((d, i) => getPoint(i, d.score, 15));
  const pathData = dataPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0">
      {Array.from({ length: levels }, (_, level) => {
        const r = ((level + 1) / levels) * radius;
        const pts = dimensions.map((_, i) => {
          const a = startAngle + i * angleStep;
          return `${center + r * Math.cos(a)},${center + r * Math.sin(a)}`;
        }).join(' ');
        return (
          <polygon key={level} points={pts} fill="none" stroke={level === levels - 1 ? '#D6D3CD' : '#E7E5E0'} strokeWidth="1" />
        );
      })}

      {dimensions.map((_, i) => {
        const p = getPoint(i, 15, 15);
        return <line key={i} x1={center} y1={center} x2={p.x} y2={p.y} stroke="#E7E5E0" strokeWidth="1" />;
      })}

      <polygon points={pathData} fill="#C45C3E" fillOpacity="0.15" stroke="#C45C3E" strokeWidth="2" />

      {dataPoints.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="4" fill={dimensions[i].color} stroke="white" strokeWidth="2" />
      ))}

      {dimensions.map((d, i) => {
        const p = getLabelPoint(i);
        return (
          <text key={i} x={p.x} y={p.y} textAnchor="middle" dominantBaseline="middle"
            className="fill-stone-600" style={{ fontSize: '12px', fontWeight: 600 }}>
            {d.label}
          </text>
        );
      })}
    </svg>
  );
}

/* ==================== Dimension Card ==================== */

function DimensionCard({ dim, isWeakest, isStrongest }: { dim: DimensionScore; isWeakest: boolean; isStrongest: boolean }) {
  const statusConfig = {
    established: { text: 'text-emerald-700', label: '已建立' },
    in_progress: { text: 'text-[#C45C3E]', label: '进行中' },
    not_started: { text: 'text-amber-600', label: '未启动' },
  };
  const status = statusConfig[dim.status];

  const scoreNote = isStrongest
    ? '最长的一根轴——这关你过了'
    : isWeakest
    ? '凹陷最深——卡你的就是这里'
    : dim.status === 'established'
    ? '这根轴已经站住'
    : dim.status === 'in_progress'
    ? '这根轴正在推进'
    : '这根轴尚未发育';

  return (
    <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden flex">
      {/* Left accent bar + big label */}
      <div className="w-14 lg:w-16 shrink-0 flex flex-col items-center py-6 border-r border-stone-100"
        style={{ borderLeftWidth: '4px', borderLeftColor: dim.color }}>
        <span className="text-2xl lg:text-3xl font-black text-stone-300"
          style={{ writingMode: 'vertical-rl', fontFamily: "'Noto Serif SC', Georgia, serif" }}>
          {dim.label}
        </span>
      </div>

      <div className="flex-1 p-5 lg:p-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <h3 className="text-lg font-bold text-stone-900">{dim.fullLabel}</h3>
              <span className="text-xs text-stone-400">·</span>
              <div className="flex items-center gap-2 text-xs text-stone-400">
                {dim.questions.map((q, i) => (
                  <React.Fragment key={q.id}>
                    <span>{q.theme}</span>
                    {i < dim.questions.length - 1 && <span className="text-stone-300">·</span>}
                  </React.Fragment>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm flex-wrap">
              <span className="font-black" style={{ color: dim.color }}>{dim.score}</span>
              <span className="text-stone-400">/15 ·</span>
              <span className="font-semibold" style={{ color: dim.color }}>{scoreNote}</span>
              <span className="text-stone-400">·</span>
              <span className="text-stone-600">对应 L{dim.levelMatch} {dim.levelMatchName}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium bg-stone-100 ${status.text}`}>
                （{status.label}）
              </span>
            </div>
          </div>
        </div>

        {/* Analysis */}
        <p className="text-sm text-stone-600 leading-relaxed mb-5">
          {dim.analysis}
        </p>

        {/* Question chips */}
        <div className="flex flex-wrap gap-2">
          {dim.questions.map(q => (
            <span key={q.id} className="inline-flex items-center gap-1.5 text-xs bg-stone-50 text-stone-600 px-3 py-2 rounded-lg border border-stone-100">
              <span className="font-medium text-stone-900">Q{q.sortOrder}</span>
              <span className="text-stone-500">{q.theme}</span>
              <span className="font-semibold" style={{ color: dim.color }}>{q.interpretation}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ==================== Gaps Table ==================== */

function GapsTable({ gaps }: { gaps: GapItem[] }) {
  const severityLabels: Record<string, string> = { high: '高', medium: '中', low: '低' };
  const severityColors: Record<string, string> = {
    high: 'bg-red-100 text-red-700',
    medium: 'bg-amber-100 text-amber-700',
    low: 'bg-stone-100 text-stone-500',
  };

  return (
    <div className="mt-8 overflow-hidden border border-stone-200 rounded-2xl">
      <table className="w-full border-collapse bg-white">
        <thead>
          <tr className="bg-[#1A1A1A]">
            {['断层点', '现状', '为什么是问题', '严重度'].map(h => (
              <th key={h} className="text-left py-3.5 px-5 text-xs font-semibold text-white/80 uppercase tracking-wider">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {gaps.map((gap, i) => (
            <tr key={i} className="border-b border-stone-100 last:border-0 hover:bg-stone-50/50 transition-colors">
              <td className="py-4 px-5 font-semibold text-sm text-stone-900">{gap.point}</td>
              <td className="py-4 px-5 text-sm text-stone-600">{gap.current}</td>
              <td className="py-4 px-5 text-sm text-stone-600">{gap.problem}</td>
              <td className="py-4 px-5">
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${severityColors[gap.severity]}`}>
                  {severityLabels[gap.severity]}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ==================== Path Section ==================== */

function PathSection({ report }: { report: ReportData }) {
  const pathSteps = [
    { level: 3, from: 'L2', to: 'L3', subtitle: '跑通单点 + 全员会用', desc: '从六大场景选一个 ROI 最容易讲清的，跑成可量化样板；再用入企培训把从高管到一线全员带上手。' },
    { level: 4, from: 'L3', to: 'L4', subtitle: '样板复制成平台', desc: '统一工具与模型入口，把使用规范沉淀进知识库，把“1”复制成“10”。' },
    { level: 5, from: 'L4', to: 'L5', subtitle: '平台长成护城河', desc: '组织从金字塔推向网状，AI 从内部提效变成对外能力与差异化。' },
  ];

  const futureSteps = pathSteps.filter(s => s.level > report.level);

  return (
    <div className="mt-8 space-y-5">
      <p className="text-sm text-stone-600 leading-relaxed">
        你不需要一张宏大蓝图，需要的是一条按阶段走的路。从你现在的 L{report.level} 出发，每跨一级都有明确动作。
      </p>
      {futureSteps.length > 0 ? futureSteps.map((step, i) => (
        <div key={i} className="bg-white rounded-2xl border border-stone-200 p-6 flex gap-5">
          <div className="shrink-0 w-14 h-14 rounded-xl bg-[#1A1A1A] text-white flex flex-col items-center justify-center">
            <span className="text-xs text-white/50">STEP</span>
            <span className="text-xl font-black leading-none">{i + 1}</span>
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-stone-900 text-lg">{step.from} → {step.to}</h3>
            <p className="text-[#C45C3E] font-semibold text-sm mb-2">{step.subtitle}</p>
            <p className="text-sm text-stone-600 leading-relaxed">{step.desc}</p>
          </div>
        </div>
      )) : (
        <div className="text-center py-16 text-stone-400 bg-white rounded-2xl border border-stone-200">
          你已经到达 L5，AI 已成为你的护城河。
        </div>
      )}

      {/* Organization Diagram */}
      <div className="mt-8 bg-white rounded-2xl border border-stone-200 p-8">
        <h3 className="text-sm font-semibold text-stone-500 uppercase tracking-wider mb-6 text-center">组织形态的重构</h3>
        <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16">
          <div className="text-center">
            <svg width="120" height="120" viewBox="0 0 120 120" className="mx-auto mb-3">
              <polygon points="60,10 110,100 10,100" fill="none" stroke="#C45C3E" strokeWidth="2" />
              <circle cx="60" cy="30" r="5" fill="#C45C3E" />
              <circle cx="40" cy="70" r="5" fill="#C45C3E" />
              <circle cx="80" cy="70" r="5" fill="#C45C3E" />
              <line x1="60" y1="30" x2="40" y2="70" stroke="#C45C3E" strokeWidth="1.5" />
              <line x1="60" y1="30" x2="80" y2="70" stroke="#C45C3E" strokeWidth="1.5" />
            </svg>
            <div className="text-sm font-semibold text-stone-700">金字塔</div>
            <div className="text-xs text-stone-400">层层传递 · 信息损耗</div>
          </div>

          <div className="text-2xl text-stone-300">→</div>

          <div className="text-center">
            <svg width="120" height="120" viewBox="0 0 120 120" className="mx-auto mb-3">
              <circle cx="60" cy="60" r="45" fill="none" stroke="#C45C3E" strokeWidth="2" />
              <circle cx="60" cy="60" r="8" fill="#C45C3E" />
              {[0, 60, 120, 180, 240, 300].map((deg, i) => {
                const rad = (deg * Math.PI) / 180;
                const x = 60 + 30 * Math.cos(rad);
                const y = 60 + 30 * Math.sin(rad);
                return (
                  <g key={i}>
                    <circle cx={x} cy={y} r="5" fill="#C45C3E" />
                    <line x1="60" y1="60" x2={x} y2={y} stroke="#C45C3E" strokeWidth="1.5" />
                  </g>
                );
              })}
            </svg>
            <div className="text-sm font-semibold text-stone-700">网状</div>
            <div className="text-xs text-stone-400">信息直达 · 人只做判断</div>
          </div>
        </div>
        <p className="text-center text-sm text-stone-600 mt-6 max-w-xl mx-auto">
          AI 接住了“翻译型工作”和“上传下达”的中间层，信息不再层层损耗——一把手拿回信息权，每个人成为可直接连接的节点。
        </p>
      </div>
    </div>
  );
}

/* ==================== Services Section ==================== */

function ServicesSection() {
  const services = [
    {
      tag: '培训 · 点火',
      title: '思维变革 + 全员 Vibe Coding',
      subtitle: '入企培训',
      desc: '从一把手到一线的思维变革，再带着团队亲手做工具——从“个人效率工具”真正走进业务流程。',
      price: '¥3,300 / 人 / 天',
      highlights: ['零基础可学', '业务场景实战', '带作品结业'],
      color: '#C45C3E',
    },
    {
      tag: 'Token · 能源',
      title: '海外模型按场景调用',
      subtitle: '统一 Token 入口',
      desc: '转写路上不同任务用不同模型——复杂推理、写代码、批量处理各取所长。统一的 Token 入口让企业不必各自接 API。',
      price: '按量计费',
      highlights: ['多模型路由', '成本可控', '安全审计'],
      color: '#2563EB',
    },
    {
      tag: '工具 · 承接',
      title: 'EC 全家桶 · 让样板长成系统',
      subtitle: 'EasyClaw + EasyVoice + EasyMeter',
      desc: '跑通的单点要沉淀成组织资产，靠一套打通的工具——从写代码到诊断人才到沉淀知识，各司其职。',
      price: '按需订阅',
      highlights: ['工具闭环', '知识沉淀', '可扩展'],
      color: '#059669',
    },
    {
      tag: '加速 · 可选',
      title: 'FDE 工程师驻场 (Premium)',
      subtitle: '系统开发关键阶段',
      desc: '系统开发的关键阶段，前沿部署工程师可进驻现场，与团队并肩攻克技术难点、推动项目真正落地。',
      price: '定制报价',
      highlights: ['驻场交付', '技术攻坚', '落地保障'],
      color: '#7C3AED',
    },
  ];

  return (
    <div className="mt-8 grid md:grid-cols-2 gap-5">
      {services.map((s, i) => (
        <div key={i} className="bg-white rounded-2xl border border-stone-200 p-6 hover:border-stone-300 transition-colors">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full text-white" style={{ backgroundColor: s.color }}>
              {s.tag}
            </span>
          </div>
          <h3 className="font-bold text-stone-900 text-lg mb-1">{s.title}</h3>
          <p className="text-xs text-stone-500 mb-3">{s.subtitle}</p>
          <p className="text-sm text-stone-600 leading-relaxed mb-4">{s.desc}</p>
          <div className="flex flex-wrap gap-2 mb-4">
            {s.highlights.map((h, j) => (
              <span key={j} className="text-xs bg-stone-50 text-stone-600 px-2 py-1 rounded border border-stone-100">{h}</span>
            ))}
          </div>
          <div className="text-sm font-bold" style={{ color: s.color }}>{s.price}</div>
        </div>
      ))}
    </div>
  );
}

/* ==================== Action Section ==================== */

function ActionSection({ plan }: { plan: ReportData['actionPlan'] }) {
  const cards = [
    { title: '今晚', subtitle: '老板亲自上手', items: plan.tonight, color: '#1A1A1A' },
    { title: '本周', subtitle: '锁人 + 锁场景', items: plan.thisWeek, color: '#C45C3E' },
    { title: '本月', subtitle: '跑出样板 + 点火全员', items: plan.thisMonth, color: '#2563EB' },
  ];

  return (
    <div className="mt-8 grid md:grid-cols-3 gap-5">
      {cards.map(card => (
        <div key={card.title} className="bg-white rounded-2xl border border-stone-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold" style={{ backgroundColor: card.color }}>
              {card.title[0]}
            </div>
            <div>
              <h3 className="font-bold text-stone-900">{card.title}</h3>
              <p className="text-xs text-stone-400">{card.subtitle}</p>
            </div>
          </div>
          <ul className="space-y-3">
            {card.items.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-stone-600 leading-relaxed">
                <span className="text-stone-300 mt-1.5 shrink-0">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
