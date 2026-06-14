import React, { useState } from 'react';
import { GlassCard } from '../components/GlassCard';
import api from '../utils/api';
import { MessageSquareCode, ShieldAlert, CheckCircle, RefreshCw, Key, HelpCircle, ArrowRight, ArrowLeft } from 'lucide-react';

export const InterviewPrep = () => {
  const [topic, setTopic] = useState('Python');
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);
  
  // Controls
  const [userAnswer, setUserAnswer] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [showModelAnswer, setShowModelAnswer] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const topicsList = ['Python', 'Java', 'SQL', 'DSA', 'Aptitude', 'HR'];

  const handleStart = async () => {
    setLoading(true);
    setStarted(false);
    setCurrentIndex(0);
    setUserAnswer('');
    setShowHint(false);
    setShowModelAnswer(false);
    setSubmitted(false);
    setFeedback(null);

    try {
      const res = await api.post('/ai/interview-questions', { topic });
      setQuestions(res.questions);
      setStarted(true);
    } catch (err) {
      console.error(err);
      alert('Failed to generate interview questions. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRevealHint = () => setShowHint(!showHint);
  const handleRevealModel = () => setShowModelAnswer(!showModelAnswer);

  const handleSubmitAnswer = () => {
    if (!userAnswer.trim()) {
      alert('Please type in your answer first.');
      return;
    }
    
    setSubmitted(true);
    
    // Perform simulated evaluation: match keywords of user answer against model answer
    const currentQ = questions[currentIndex];
    const userWords = userAnswer.toLowerCase();
    
    // Clean model words and find keywords
    const keywords = currentQ.hint.toLowerCase().split(/\s+/).filter(w => w.length > 3 && !['about', 'think', 'explain', 'with', 'using', 'would', 'when', 'which', 'your'].includes(w));
    
    const matches = keywords.filter(word => userWords.includes(word.replace(/[^a-zA-Z]/g, '')));
    const scorePercentage = Math.round(
      Math.min(
        100,
        Math.max(
          20, 
          (matches.length / Math.max(1, keywords.length)) * 100 + (userWords.length > 50 ? 40 : 10)
        )
      )
    );

    let evaluation = '';
    if (scorePercentage >= 75) {
      evaluation = 'Excellent response! You touched on critical concepts and expressed technical details clearly.';
    } else if (scorePercentage >= 50) {
      evaluation = 'Good effort. Your answer outlines basic elements but missing some core terminology. Review the model answer to fill gaps.';
    } else {
      evaluation = 'Needs improvement. Focus on key technical components. Read the model answer and retry the question.';
    }

    setFeedback({
      score: scorePercentage,
      matches: matches.map(m => m.charAt(0).toUpperCase() + m.slice(1)),
      evaluation
    });
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setUserAnswer('');
      setShowHint(false);
      setShowModelAnswer(false);
      setSubmitted(false);
      setFeedback(null);
    } else {
      // Completed drill
      alert('Drill completed! Select another topic to practice.');
      setStarted(false);
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setUserAnswer('');
      setShowHint(false);
      setShowModelAnswer(false);
      setSubmitted(false);
      setFeedback(null);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100 flex items-center gap-2">
          AI Interview Preparation Assistant <MessageSquareCode className="w-6 h-6 text-sky-500" />
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          Simulate standard corporate interview questions based on coding frameworks, core database querying, algorithms, or behavioral fit.
        </p>
      </div>

      {!started ? (
        /* Setup page */
        <GlassCard className="space-y-6 max-w-lg mx-auto p-8">
          <h3 className="text-center font-bold text-slate-800 dark:text-slate-200 text-base">Select Interview Topic</h3>
          
          <div className="grid grid-cols-3 gap-3">
            {topicsList.map(t => (
              <button
                key={t}
                onClick={() => setTopic(t)}
                className={`py-3 px-2 rounded-xl text-xs font-bold transition-all border ${
                  topic === t
                    ? 'bg-gradient-to-tr from-sky-500 to-indigo-650 text-white border-transparent shadow-md'
                    : 'bg-slate-100/50 hover:bg-slate-100/80 dark:bg-slate-800/40 dark:hover:bg-slate-800/60 text-slate-650 dark:text-slate-300 border-slate-200/30 dark:border-slate-700/30'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <button
            onClick={handleStart}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-650 hover:to-indigo-720 text-white font-semibold text-sm shadow-md transition-all disabled:opacity-50"
          >
            {loading ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>Simulating Questions Set...</span>
              </>
            ) : (
              <span>Start Practice Drill (5 Questions)</span>
            )}
          </button>
        </GlassCard>
      ) : (
        /* Active interview simulator */
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-slate-100 dark:bg-slate-900/40 p-3 rounded-xl border border-slate-200/20">
            <span className="text-xs font-bold text-slate-450 uppercase">Topic: {topic}</span>
            <span className="text-xs font-bold text-sky-500">Question {currentIndex + 1} of {questions.length}</span>
          </div>

          {/* Question card */}
          <GlassCard className="space-y-4">
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base leading-relaxed">
              {questions[currentIndex].question}
            </h3>
            
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-550 dark:text-slate-400 uppercase tracking-wider">
                Your Answer
              </label>
              <textarea
                rows="5"
                placeholder="Type your explanation or pseudocode response here..."
                disabled={submitted}
                className="w-full glass-input text-xs leading-relaxed bg-white/50 dark:bg-slate-900/30 text-slate-800 dark:text-slate-100 disabled:opacity-75"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
              ></textarea>
            </div>

            {/* Actions toolbar */}
            <div className="flex flex-wrap gap-2 justify-between pt-2">
              <div className="flex gap-2">
                <button
                  onClick={handleRevealHint}
                  className="py-1.5 px-3 rounded-lg text-[10px] font-bold border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 transition-all flex items-center gap-1"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>{showHint ? 'Hide Hint' : 'Reveal Hint'}</span>
                </button>
                
                <button
                  onClick={handleRevealModel}
                  className="py-1.5 px-3 rounded-lg text-[10px] font-bold border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 transition-all flex items-center gap-1"
                >
                  <Key className="w-3.5 h-3.5" />
                  <span>{showModelAnswer ? 'Hide Model Answer' : 'Reveal Model Answer'}</span>
                </button>
              </div>

              {!submitted && (
                <button
                  onClick={handleSubmitAnswer}
                  className="py-1.5 px-4 rounded-lg text-xs font-bold bg-sky-500 hover:bg-sky-650 text-white shadow-md shadow-sky-500/10 transition-all"
                >
                  Submit Answer for Analysis
                </button>
              )}
            </div>

            {/* Hint Display */}
            {showHint && (
              <div className="p-3 rounded-lg bg-amber-500/5 text-amber-600 dark:text-amber-400 text-xs border border-amber-500/20 leading-relaxed font-medium animate-fade-in">
                <strong>Hint focus:</strong> {questions[currentIndex].hint}
              </div>
            )}

            {/* Model Answer Display */}
            {showModelAnswer && (
              <div className="p-4 rounded-xl bg-slate-100/70 dark:bg-slate-900/50 text-xs border border-slate-200/40 dark:border-slate-800/40 leading-relaxed space-y-2 animate-fade-in">
                <strong className="text-slate-700 dark:text-slate-300">Model Answer Reference:</strong>
                <p className="text-slate-600 dark:text-slate-400 whitespace-pre-line font-mono">{questions[currentIndex].answer}</p>
              </div>
            )}
          </GlassCard>

          {/* Feedback Display */}
          {submitted && feedback && (
            <GlassCard className="space-y-4 border border-sky-500/20" glow>
              <div className="flex justify-between items-center pb-2 border-b border-slate-200/40 dark:border-slate-800/40">
                <h4 className="font-bold text-sm text-slate-800 dark:text-slate-150 flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  Answer Score Analysis
                </h4>
                <span className="text-lg font-black text-sky-500">{feedback.score}% Alignment</span>
              </div>
              
              <div className="space-y-3">
                <p className="text-xs text-slate-650 dark:text-slate-350 leading-relaxed font-medium">
                  {feedback.evaluation}
                </p>
                {feedback.matches.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Identified Keywords Matches:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {feedback.matches.map((match, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded bg-sky-500/10 text-sky-500 text-[10px] font-bold">
                          {match}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </GlassCard>
          )}

          {/* Bottom navigation */}
          <div className="flex justify-between pt-4">
            <button
              onClick={handleBack}
              disabled={currentIndex === 0}
              className="py-2.5 px-4 rounded-xl border border-slate-250 dark:border-slate-800 text-slate-600 dark:text-slate-400 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-900 transition-all flex items-center gap-1.5 disabled:opacity-40"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Previous Question</span>
            </button>

            <button
              onClick={handleNext}
              className="py-2.5 px-6 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-650 hover:from-sky-600 hover:to-indigo-720 text-white text-xs font-bold shadow-md flex items-center gap-1.5 transition-all group"
            >
              <span>{currentIndex === questions.length - 1 ? 'Finish Drill' : 'Next Question'}</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default InterviewPrep;
