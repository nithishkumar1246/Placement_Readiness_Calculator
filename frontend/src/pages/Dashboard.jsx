import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { GlassCard } from '../components/GlassCard';
import api from '../utils/api';
import { 
  Chart as ChartJS, 
  RadialLinearScale, 
  PointElement, 
  LineElement, 
  Filler, 
  Tooltip, 
  Legend, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  ArcElement 
} from 'chart.js';
import { Radar, Bar, Pie } from 'react-chartjs-2';
import { 
  TrendingUp, 
  AlertTriangle, 
  Award, 
  CheckCircle2, 
  Sparkles,
  BookOpen,
  Briefcase
} from 'lucide-react';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement
);

export const Dashboard = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);
  const [trackerData, setTrackerData] = useState([]);
  const [error, setError] = useState('');

  const isDark = theme === 'dark';

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const pData = await api.get('/profile');
        setProfileData(pData);

        const tData = await api.get('/tracker/applications');
        setTrackerData(tData);
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
        setError('Failed to fetch dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Computing Career Analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-xl">
        <p className="font-semibold">{error}</p>
      </div>
    );
  }

  const { profile, scores, readiness } = profileData;

  // Chart 1: Radar Chart (Aggregate categories)
  // Categories: Aptitude, Coding, Communication
  const aptitudeAvg = Math.round((scores.quantitative + scores.logical + scores.verbal) / 3);
  const codingAvg = Math.round((scores.python + scores.java + scores.sql + scores.dsa) / 4);
  const commAvg = Math.round((scores.speaking + scores.presentation + scores.gd) / 3);

  const radarData = {
    labels: ['Aptitude Skills', 'Coding Skills', 'Communication', 'Academic GPA', 'Project Strength'],
    datasets: [
      {
        label: 'Your Metrics (%)',
        data: [
          aptitudeAvg, 
          codingAvg, 
          commAvg, 
          profile.cgpa * 10, 
          Math.min(scores.projects_count * 20, 100)
        ],
        backgroundColor: 'rgba(56, 189, 248, 0.2)',
        borderColor: '#0284c7',
        borderWidth: 2,
        pointBackgroundColor: '#0369a1',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#0284c7',
      },
    ],
  };

  const radarOptions = {
    scales: {
      r: {
        angleLines: { color: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' },
        grid: { color: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' },
        pointLabels: {
          color: isDark ? '#94a3b8' : '#64748b',
          font: { size: 11, family: 'Outfit' }
        },
        ticks: {
          display: false,
          max: 100,
          min: 0,
          stepSize: 20
        }
      }
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        bodyFont: { family: 'Outfit' },
        titleFont: { family: 'Outfit' }
      }
    }
  };

  // Chart 2: Bar Chart (Individual subskills breakdown)
  const barData = {
    labels: ['Quant', 'Logical', 'Verbal', 'Python', 'Java', 'SQL', 'DSA', 'Speaking', 'Presentation', 'GD'],
    datasets: [
      {
        label: 'Skill Proficiency',
        data: [
          scores.quantitative,
          scores.logical,
          scores.verbal,
          scores.python,
          scores.java,
          scores.sql,
          scores.dsa,
          scores.speaking,
          scores.presentation,
          scores.gd
        ],
        backgroundColor: [
          'rgba(56, 189, 248, 0.7)',  // quant
          'rgba(56, 189, 248, 0.7)',  // logical
          'rgba(56, 189, 248, 0.7)',  // verbal
          'rgba(99, 102, 241, 0.7)',  // python
          'rgba(99, 102, 241, 0.7)',  // java
          'rgba(99, 102, 241, 0.7)',  // sql
          'rgba(99, 102, 241, 0.7)',  // dsa
          'rgba(236, 72, 153, 0.7)',  // speak
          'rgba(236, 72, 153, 0.7)',  // pres
          'rgba(236, 72, 153, 0.7)',  // gd
        ],
        borderRadius: 6,
      }
    ]
  };

  const barOptions = {
    responsive: true,
    scales: {
      y: {
        grid: { color: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' },
        ticks: { color: isDark ? '#94a3b8' : '#64748b', font: { family: 'Outfit' } },
        max: 100,
        min: 0
      },
      x: {
        grid: { display: false },
        ticks: { color: isDark ? '#94a3b8' : '#64748b', font: { family: 'Outfit', size: 10 } }
      }
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        bodyFont: { family: 'Outfit' },
        titleFont: { family: 'Outfit' }
      }
    }
  };

  // Chart 3: Pie Chart (Application tracker distribution)
  const appStatusCounts = {
    'Applied': 0,
    'Shortlisted': 0,
    'Interview Scheduled': 0,
    'Rejected': 0,
    'Selected': 0
  };

  trackerData.forEach(appObj => {
    if (appStatusCounts[appObj.status] !== undefined) {
      appStatusCounts[appObj.status]++;
    }
  });

  const pieData = {
    labels: Object.keys(appStatusCounts),
    datasets: [
      {
        data: Object.values(appStatusCounts),
        backgroundColor: [
          'rgba(148, 163, 184, 0.7)', // Applied (slate)
          'rgba(59, 130, 246, 0.7)',  // Shortlisted (blue)
          'rgba(245, 158, 11, 0.7)',  // Interview (orange)
          'rgba(239, 68, 68, 0.7)',   // Rejected (red)
          'rgba(16, 185, 129, 0.7)'   // Selected (emerald)
        ],
        borderWidth: 1,
        borderColor: isDark ? '#1e293b' : '#fff'
      }
    ]
  };

  const pieOptions = {
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: isDark ? '#94a3b8' : '#64748b',
          font: { family: 'Outfit', size: 10 },
          boxWidth: 12
        }
      },
      tooltip: {
        bodyFont: { family: 'Outfit' },
        titleFont: { family: 'Outfit' }
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100 flex items-center gap-2">
            Welcome back, {profile.name} <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
          </h2>
          <p className="text-slate-500 dark:text-slate-450 text-sm">
            {profile.department} &bull; {profile.year}
          </p>
        </div>
        <div className="flex gap-2">
          <div className="px-4 py-2 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-600 dark:text-sky-400 text-xs font-semibold">
            CGPA: {profile.cgpa.toFixed(2)}
          </div>
          <div className="px-4 py-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-semibold">
            Projects: {scores.projects_count}
          </div>
        </div>
      </div>

      {/* Grid: Gauge score & Main metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Readiness Meter Gauge */}
        <GlassCard className="flex flex-col items-center justify-center text-center relative overflow-hidden" glow>
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <TrendingUp className="w-48 h-48" />
          </div>
          
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Placement Readiness Score</h3>
          
          {/* Radial score circular gauge */}
          <div className="relative w-40 h-40 flex items-center justify-center">
            {/* Background Circle */}
            <svg className="absolute w-full h-full transform -rotate-90">
              <circle
                cx="80"
                cy="80"
                r="70"
                className="stroke-slate-200 dark:stroke-slate-800"
                strokeWidth="10"
                fill="transparent"
              />
              {/* Highlight Circle */}
              <circle
                cx="80"
                cy="80"
                r="70"
                stroke={readiness.color}
                strokeWidth="10"
                fill="transparent"
                strokeDasharray="440"
                strokeDashoffset={440 - (440 * readiness.readiness_score) / 100}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="text-center">
              <span className="text-4xl font-extrabold text-slate-800 dark:text-slate-100">{readiness.readiness_score}%</span>
              <span className="block text-[10px] text-slate-400 font-semibold uppercase tracking-wide mt-0.5">Overall</span>
            </div>
          </div>

          <div className="mt-5 text-center">
            <span 
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border"
              style={{ 
                color: readiness.color, 
                backgroundColor: `${readiness.color}15`, 
                borderColor: `${readiness.color}30` 
              }}
            >
              <Award className="w-4 h-4" />
              {readiness.classification}
            </span>
          </div>
        </GlassCard>

        {/* Categories Progress meters */}
        <GlassCard className="lg:col-span-2 space-y-5 flex flex-col justify-center">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Readiness Category Breakdowns</h3>
          
          <div className="space-y-4">
            {/* Aptitude (Max 25 points) */}
            <div>
              <div className="flex justify-between text-sm mb-1.5 font-medium">
                <span className="text-slate-650 dark:text-slate-350">Aptitude Quotient</span>
                <span className="text-slate-700 dark:text-slate-200 font-bold">{readiness.breakdown.aptitude} / 25 pts</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div 
                  className="bg-sky-500 h-full rounded-full transition-all duration-1000"
                  style={{ width: `${(readiness.breakdown.aptitude / 25) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Coding (Max 35 points) */}
            <div>
              <div className="flex justify-between text-sm mb-1.5 font-medium">
                <span className="text-slate-650 dark:text-slate-350">Technical Coding Skills</span>
                <span className="text-slate-700 dark:text-slate-200 font-bold">{readiness.breakdown.coding} / 35 pts</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div 
                  className="bg-indigo-500 h-full rounded-full transition-all duration-1000"
                  style={{ width: `${(readiness.breakdown.coding / 35) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Communication (Max 20 points) */}
            <div>
              <div className="flex justify-between text-sm mb-1.5 font-medium">
                <span className="text-slate-650 dark:text-slate-350">Soft Skills & Presentation</span>
                <span className="text-slate-700 dark:text-slate-200 font-bold">{readiness.breakdown.communication} / 20 pts</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div 
                  className="bg-pink-500 h-full rounded-full transition-all duration-1000"
                  style={{ width: `${(readiness.breakdown.communication / 20) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Academic profile (Max 20 points) */}
            <div>
              <div className="flex justify-between text-sm mb-1.5 font-medium">
                <span className="text-slate-650 dark:text-slate-350">Academic & Project Strength</span>
                <span className="text-slate-700 dark:text-slate-200 font-bold">{readiness.breakdown.profile} / 20 pts</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div 
                  className="bg-emerald-500 h-full rounded-full transition-all duration-1000"
                  style={{ width: `${(readiness.breakdown.profile / 20) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Grid: Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Skill Category Comparison (Radar) */}
        <GlassCard className="flex flex-col items-center justify-center min-h-[300px]">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 self-start">Skill Index Profile</h4>
          <div className="w-full max-w-[240px] md:max-w-[280px]">
            <Radar data={radarData} options={radarOptions} />
          </div>
        </GlassCard>

        {/* Detailed sub-skills analysis (Bar) */}
        <GlassCard className="lg:col-span-2 flex flex-col justify-center">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Detailed Skill Proficiency Breakdown</h4>
          <div className="h-64">
            <Bar data={barData} options={barOptions} />
          </div>
        </GlassCard>
      </div>

      {/* Grid: Bottom section (Weak areas, Tracker, Recommendations) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weak Areas Alerts */}
        <GlassCard className="lg:col-span-1 space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            Detected Weak Areas ({readiness.weak_areas.length})
          </h4>
          
          {readiness.weak_areas.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-6 text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-500" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">No major weak areas!</p>
              <p className="text-xs text-slate-400">All your tested skills are above 60%.</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {readiness.weak_areas.map((area, idx) => (
                <div 
                  key={idx} 
                  className="flex items-center gap-2 p-2.5 rounded-lg text-xs font-medium bg-rose-500/10 text-rose-500 border border-rose-500/20"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-rose-500"></div>
                  <span>{area}</span>
                </div>
              ))}
            </div>
          )}
        </GlassCard>

        {/* Actionable recommendations */}
        <GlassCard className="lg:col-span-2 space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-sky-500" />
            AI-Generated Recommendations
          </h4>
          
          <div className="space-y-3">
            {readiness.recommendations.map((rec, idx) => (
              <div 
                key={idx}
                className="flex items-start gap-3 p-3 rounded-xl bg-slate-100/50 dark:bg-slate-900/30 border border-slate-200/20 dark:border-slate-800/20 text-xs text-slate-650 dark:text-slate-350 leading-relaxed"
              >
                <span className="flex items-center justify-center w-5 h-5 rounded-md bg-indigo-500/10 text-indigo-500 font-bold border border-indigo-500/20 mt-0.5">
                  {idx + 1}
                </span>
                <span>{rec}</span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Grid: Tracker & Seeding Status summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <GlassCard className="lg:col-span-1 flex flex-col justify-between min-h-[200px]">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Briefcase className="w-4 h-4 text-emerald-500" />
            Job Applications
          </h4>
          <div className="flex items-center justify-center p-4">
            {trackerData.length === 0 ? (
              <p className="text-xs text-slate-400">No applications tracked yet. Go to Company Checker to apply!</p>
            ) : (
              <div className="w-full max-w-[150px]">
                <Pie data={pieData} options={pieOptions} />
              </div>
            )}
          </div>
        </GlassCard>

        <GlassCard className="lg:col-span-2 space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Quick Guide: Boost Your Score</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 rounded-xl bg-white/20 dark:bg-slate-900/20 border border-slate-200/10">
              <h5 className="font-semibold text-xs text-slate-700 dark:text-slate-200 mb-1">Resume Scan</h5>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Scan your PDF resume inside the Resume Analyzer to detect missing keywords, evaluate formatting quality, and bridge skill gaps.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-white/20 dark:bg-slate-900/20 border border-slate-200/10">
              <h5 className="font-semibold text-xs text-slate-700 dark:text-slate-200 mb-1">AI Mock Prep</h5>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Conduct mock technical rounds or HR drills to review questions, reveal developer insights, and prepare answers.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-white/20 dark:bg-slate-900/20 border border-slate-200/10">
              <h5 className="font-semibold text-xs text-slate-700 dark:text-slate-200 mb-1">AI study planner</h5>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Generate a custom 7-day or 30-day preparation calendar tailored to your weak areas with checkable items and references.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-white/20 dark:bg-slate-900/20 border border-slate-200/10">
              <h5 className="font-semibold text-xs text-slate-700 dark:text-slate-200 mb-1">Company Checker</h5>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Compare your metrics against minimum CGPA/score policies at top firms like TCS, Zoho, and Amazon.
              </p>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default Dashboard;
