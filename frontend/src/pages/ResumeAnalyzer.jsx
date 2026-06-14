import React, { useEffect, useState } from 'react';
import { GlassCard } from '../components/GlassCard';
import api from '../utils/api';
import { FileText, Upload, Sparkles, CheckCircle, AlertCircle, History, RefreshCw } from 'lucide-react';

export const ResumeAnalyzer = () => {
  const [file, setFile] = useState(null);
  const [pastedText, setPastedText] = useState('');
  const [inputMode, setInputMode] = useState('upload'); // 'upload' or 'text'
  const [loading, setLoading] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [scanHistory, setScanHistory] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchHistory = async () => {
    try {
      const history = await api.get('/resume/history');
      setScanHistory(history);
    } catch (err) {
      console.error("Failed to load resume history:", err);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleFileChange = (e) => {
    setError('');
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.size > 4 * 1024 * 1024) {
        setError('File size exceeds 4MB limit.');
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      let res;
      if (inputMode === 'upload') {
        if (!file) {
          setError('Please select a PDF file first.');
          setLoading(false);
          return;
        }
        const formData = new FormData();
        formData.append('file', file);
        res = await api.post('/resume/analyze', formData);
      } else {
        if (!pastedText.trim()) {
          setError('Please paste your resume text first.');
          setLoading(false);
          return;
        }
        res = await api.post('/resume/analyze', { text: pastedText });
      }

      setScanResult(res);
      setSuccess('Resume analyzed successfully!');
      fetchHistory();
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to analyze resume.');
    } finally {
      setLoading(false);
    }
  };

  const loadPastScan = (pastScan) => {
    setScanResult(pastScan);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100 flex items-center gap-2">
          Resume Analyzer & Score Evaluator <FileText className="w-6 h-6 text-sky-500" />
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          Upload your PDF resume or copy-paste the text to evaluate alignment, detect skill gaps, and review feedback.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-sm font-medium">
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-sm font-medium">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left/Middle Column: Inputs & Results */}
        <div className="lg:col-span-2 space-y-6">
          {/* Input Panel */}
          <GlassCard className="space-y-4">
            <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200/20">
              <button
                type="button"
                onClick={() => setInputMode('upload')}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                  inputMode === 'upload'
                    ? 'bg-sky-500 text-white'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                Upload PDF Resume
              </button>
              <button
                type="button"
                onClick={() => setInputMode('text')}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                  inputMode === 'text'
                    ? 'bg-sky-500 text-white'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                Paste Resume Text
              </button>
            </div>

            <form onSubmit={handleAnalyze} className="space-y-4">
              {inputMode === 'upload' ? (
                /* PDF Upload UI */
                <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200/50 dark:border-slate-800/50 rounded-xl p-8 bg-slate-50/20 dark:bg-slate-950/10 hover:bg-slate-100/10 dark:hover:bg-slate-900/10 transition-all relative">
                  <Upload className="w-10 h-10 text-slate-400 mb-2 animate-bounce" />
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-350">
                    {file ? file.name : 'Select PDF Resume'}
                  </span>
                  <span className="text-[10px] text-slate-450 mt-1">PDF file up to 4MB</span>
                  <input
                    type="file"
                    accept=".pdf"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={handleFileChange}
                  />
                </div>
              ) : (
                /* Paste text UI */
                <div>
                  <textarea
                    rows="6"
                    placeholder="Paste the full text copy of your resume here (Contact info, Skills section, Projects descriptions...)"
                    className="w-full glass-input text-xs font-mono bg-white/50 dark:bg-slate-900/30 text-slate-800 dark:text-slate-100"
                    value={pastedText}
                    onChange={(e) => setPastedText(e.target.value)}
                  ></textarea>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-650 hover:to-indigo-700 text-white font-semibold text-sm shadow-md shadow-sky-500/20 disabled:opacity-50 transition-all"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>Extracting & Evaluating Skills Gap...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 text-amber-300" />
                    <span>Analyze Resume Alignment</span>
                  </>
                )}
              </button>
            </form>
          </GlassCard>

          {/* Evaluation Results display */}
          {scanResult && (
            <GlassCard className="space-y-6" glow>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/40 dark:border-slate-800/40">
                <div>
                  <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base flex items-center gap-1.5">
                    Evaluation Report
                  </h3>
                  <span className="text-xs text-slate-450">{scanResult.file_name} &bull; Scanned on {scanResult.scanned_at}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="block text-[10px] text-slate-450 uppercase font-semibold">Resume Match Score</span>
                    <span className="text-2xl font-black text-sky-500">{scanResult.score} / 100</span>
                  </div>
                  <div className="w-12 h-12 bg-sky-500/10 text-sky-500 border border-sky-500/20 rounded-xl flex items-center justify-center font-extrabold text-lg">
                    {scanResult.score}%
                  </div>
                </div>
              </div>

              {/* Skills and Gaps breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Extracted Skills */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    Extracted Skills ({scanResult.extracted_skills.length})
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {scanResult.extracted_skills.length === 0 ? (
                      <span className="text-xs text-slate-450">No technical skills detected. Check formatting.</span>
                    ) : (
                      scanResult.extracted_skills.map((skill, idx) => (
                        <span 
                          key={idx} 
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                        >
                          {skill}
                        </span>
                      ))
                    )}
                  </div>
                </div>

                {/* Skill Gaps */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4 text-rose-500" />
                    Core Skill Gaps ({scanResult.skill_gap.length})
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {scanResult.skill_gap.length === 0 ? (
                      <span className="text-xs text-emerald-500 font-semibold bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/20">
                        No Core Gaps Found! Excellent!
                      </span>
                    ) : (
                      scanResult.skill_gap.map((gap, idx) => (
                        <span 
                          key={idx} 
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-500/10 text-rose-500 border border-rose-500/20"
                        >
                          {gap}
                        </span>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Feedback list */}
              <div className="space-y-3 pt-4 border-t border-slate-200/40 dark:border-slate-800/40">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Actionable Suggestions</h4>
                <div className="space-y-2">
                  {scanResult.feedback.map((point, idx) => (
                    <div 
                      key={idx}
                      className="p-3 rounded-xl bg-slate-100/50 dark:bg-slate-900/30 border border-slate-200/20 dark:border-slate-800/15 text-xs text-slate-650 dark:text-slate-350 leading-relaxed flex items-start gap-2.5"
                    >
                      <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${
                        point.includes('Missing') || point.includes('passive') ? 'bg-amber-500' : 'bg-sky-500'
                      }`}></div>
                      <span>{point}</span>
                    </div>
                  ))}
                </div>
              </div>
            </GlassCard>
          )}
        </div>

        {/* Right Column: Scan History */}
        <div className="space-y-6">
          <GlassCard className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <History className="w-4 h-4 text-sky-500" />
              Scan History & Progress
            </h3>

            {scanHistory.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No previous scans found. Run your first analysis above!</p>
            ) : (
              <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
                {scanHistory.map((scan) => (
                  <div
                    key={scan.id}
                    onClick={() => loadPastScan(scan)}
                    className="p-3 rounded-xl bg-slate-100/30 hover:bg-slate-100/70 dark:bg-slate-900/20 dark:hover:bg-slate-900/40 border border-slate-200/20 dark:border-slate-800/20 cursor-pointer transition-all flex items-center justify-between text-xs"
                  >
                    <div className="space-y-0.5 truncate pr-2">
                      <p className="font-semibold text-slate-750 dark:text-slate-200 truncate">{scan.file_name}</p>
                      <p className="text-[10px] text-slate-450">{scan.scanned_at.split(' ')[0]}</p>
                    </div>
                    <span className={`font-bold px-2 py-1 rounded-lg ${
                      scan.score >= 80 
                        ? 'bg-emerald-500/10 text-emerald-500' 
                        : scan.score >= 60 
                          ? 'bg-sky-500/10 text-sky-500' 
                          : 'bg-amber-500/10 text-amber-500'
                    }`}>
                      {scan.score}%
                    </span>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default ResumeAnalyzer;
