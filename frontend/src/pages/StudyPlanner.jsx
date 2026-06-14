import React, { useState } from 'react';
import { GlassCard } from '../components/GlassCard';
import api from '../utils/api';
import { CalendarRange, Sparkles, CheckSquare, Square, BookOpen, CheckCircle, RefreshCw } from 'lucide-react';

export const StudyPlanner = () => {
  const [duration, setDuration] = useState('7-day');
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState([]);
  const [selectedDayIdx, setSelectedDayIdx] = useState(0);

  // Completed tasks tracking: map of "dayIndex-taskIndex" -> boolean
  const [completedTasks, setCompletedTasks] = useState({});

  const handleGenerate = async () => {
    setLoading(true);
    setPlan([]);
    setSelectedDayIdx(0);
    setCompletedTasks({});

    try {
      const res = await api.post('/ai/study-plan', { duration });
      setPlan(res.plan);
    } catch (err) {
      console.error(err);
      alert('Failed to generate study plan. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleTask = (dayIdx, taskIdx) => {
    const key = `${dayIdx}-${taskIdx}`;
    setCompletedTasks(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Compute overall completion stats
  const getOverallStats = () => {
    if (plan.length === 0) return { total: 0, completed: 0, percent: 0 };
    
    let totalTasks = 0;
    let completedCount = 0;

    plan.forEach((dayObj, dayIdx) => {
      dayObj.tasks.forEach((_, taskIdx) => {
        totalTasks++;
        if (completedTasks[`${dayIdx}-${taskIdx}`]) {
          completedCount++;
        }
      });
    });

    const percent = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;
    return { total: totalTasks, completed: completedCount, percent };
  };

  const stats = getOverallStats();

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100 flex items-center gap-2">
          AI Study Planner & Preparation Scheduler <CalendarRange className="w-6 h-6 text-sky-500" />
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          Generate an optimized day-by-day learning calendar focusing on your detected weak areas with custom checklists.
        </p>
      </div>

      {plan.length === 0 ? (
        /* Plan Setup panel */
        <GlassCard className="max-w-md mx-auto space-y-6 p-8">
          <h3 className="text-center font-bold text-slate-850 dark:text-slate-150 text-sm">Configure Planner Period</h3>
          
          <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200/20">
            <button
              onClick={() => setDuration('7-day')}
              className={`flex-1 py-2.5 text-xs font-semibold rounded-lg transition-all ${
                duration === '7-day'
                  ? 'bg-sky-500 text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              7-Day Sprint Plan
            </button>
            <button
              onClick={() => setDuration('30-day')}
              className={`flex-1 py-2.5 text-xs font-semibold rounded-lg transition-all ${
                duration === '30-day'
                  ? 'bg-sky-500 text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              30-Day Master Plan
            </button>
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-650 hover:from-sky-600 hover:to-indigo-720 text-white font-semibold text-sm shadow-md transition-all disabled:opacity-50"
          >
            {loading ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>Scanning Profile & Generating...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 text-amber-300" />
                <span>Create Study Calendar</span>
              </>
            )}
          </button>
        </GlassCard>
      ) : (
        /* Plan Display panel */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar List grid (Left side) */}
          <div className="space-y-4 lg:col-span-1">
            <GlassCard className="space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-slate-200/40 dark:border-slate-800/40">
                <span className="text-xs font-bold text-slate-450 uppercase">Calendar Progress</span>
                <span className="text-xs font-bold text-sky-500">{stats.percent}% Done</span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-sky-500 h-full rounded-full transition-all duration-350"
                  style={{ width: `${stats.percent}%` }}
                ></div>
              </div>
              <p className="text-[10px] text-slate-400 font-semibold">{stats.completed} of {stats.total} checklist items achieved.</p>
            </GlassCard>

            {/* Daily grid cells */}
            <GlassCard className="p-4 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Preparation Days</h4>
              <div className="grid grid-cols-4 gap-2 max-h-[360px] overflow-y-auto pr-1">
                {plan.map((dayObj, idx) => {
                  const isSelected = selectedDayIdx === idx;
                  
                  // Check if all tasks for this day are completed
                  const dayTasks = dayObj.tasks;
                  const allDone = dayTasks.every((_, tIdx) => completedTasks[`${idx}-${tIdx}`]);
                  
                  return (
                    <button
                      key={idx}
                      onClick={() => setSelectedDayIdx(idx)}
                      className={`h-11 rounded-lg text-xs font-bold transition-all border flex flex-col items-center justify-center ${
                        isSelected
                          ? 'bg-sky-500 border-transparent text-white shadow-md'
                          : allDone
                            ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'
                            : 'bg-slate-100/40 hover:bg-slate-100/70 dark:bg-slate-900/30 dark:hover:bg-slate-900/50 text-slate-700 dark:text-slate-350 border-slate-200/10 dark:border-slate-800/20'
                      }`}
                    >
                      <span>Day</span>
                      <span>{dayObj.day}</span>
                    </button>
                  );
                })}
              </div>
              
              <button 
                onClick={() => setPlan([])}
                className="w-full py-2 border border-dashed border-slate-300 dark:border-slate-800 text-[10px] uppercase font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-lg transition-all"
              >
                Reset Planner Configuration
              </button>
            </GlassCard>
          </div>

          {/* Daily Checklist Viewer (Right side) */}
          <div className="lg:col-span-2 space-y-6">
            <GlassCard className="space-y-6" glow>
              {/* Day header */}
              <div className="pb-4 border-b border-slate-200/40 dark:border-slate-800/40 flex justify-between items-center">
                <div>
                  <h3 className="font-extrabold text-lg text-slate-800 dark:text-slate-100">
                    Day {plan[selectedDayIdx].day}: Focus Review
                  </h3>
                  <span className="inline-block mt-1.5 px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-650 dark:text-indigo-400 border border-indigo-500/20">
                    Topic: {plan[selectedDayIdx].topic}
                  </span>
                </div>
                <div className="w-10 h-10 bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 rounded-xl flex items-center justify-center">
                  <BookOpen className="w-5 h-5" />
                </div>
              </div>

              {/* Tasks Checklist */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Daily Agenda Checklist</h4>
                <div className="space-y-2">
                  {plan[selectedDayIdx].tasks.map((task, idx) => {
                    const isChecked = !!completedTasks[`${selectedDayIdx}-${idx}`];
                    return (
                      <div
                        key={idx}
                        onClick={() => toggleTask(selectedDayIdx, idx)}
                        className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-3 text-xs leading-relaxed ${
                          isChecked
                            ? 'bg-emerald-500/5 text-slate-500 dark:text-slate-450 border-emerald-500/20 line-through decoration-slate-400/40'
                            : 'bg-slate-100/50 dark:bg-slate-900/30 text-slate-700 dark:text-slate-250 border-slate-200/20 dark:border-slate-800/20'
                        }`}
                      >
                        <span className="flex-shrink-0 mt-0.5 text-sky-500">
                          {isChecked ? (
                            <CheckSquare className="w-4 h-4 text-emerald-500" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </span>
                        <span>{task}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Resources recommendations */}
              <div className="p-4 rounded-xl bg-slate-150/40 dark:bg-slate-900/40 border border-slate-200/10 dark:border-slate-800/20 space-y-2 text-xs leading-relaxed">
                <h4 className="font-bold text-slate-700 dark:text-slate-350 flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-500 animate-pulse" />
                  Recommended Reference Materials:
                </h4>
                <p className="text-slate-500 dark:text-slate-400 font-medium font-mono pl-5">
                  {plan[selectedDayIdx].resources}
                </p>
              </div>
            </GlassCard>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudyPlanner;
