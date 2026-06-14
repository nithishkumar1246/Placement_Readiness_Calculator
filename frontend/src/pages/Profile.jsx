import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { GlassCard } from '../components/GlassCard';
import api from '../utils/api';
import { User, Shield, GraduationCap, CheckCircle, Save, HelpCircle } from 'lucide-react';

const EditableScoreLabel = ({ field, value, colorClass, borderClass, handleScoreChange }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [localVal, setLocalVal] = useState(value);

  useEffect(() => {
    setLocalVal(value);
  }, [value]);

  const commit = () => {
    setIsEditing(false);
    let num = parseInt(localVal);
    if (isNaN(num)) {
      setLocalVal(value);
      return;
    }
    num = Math.max(0, Math.min(100, num));
    handleScoreChange(field, num);
  };

  if (isEditing) {
    return (
      <div className="flex items-center">
        <input
          type="number"
          min="0"
          max="100"
          className={`w-12 text-right bg-transparent border-b ${borderClass} ${colorClass} font-bold focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
          value={localVal}
          onChange={(e) => setLocalVal(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              commit();
            } else if (e.key === 'Escape') {
              setLocalVal(value);
              setIsEditing(false);
            }
          }}
          autoFocus
        />
        <span className={`${colorClass} font-bold ml-0.5`}>%</span>
      </div>
    );
  }

  return (
    <span
      className={`${colorClass} font-bold cursor-pointer hover:underline decoration-2`}
      onClick={() => setIsEditing(true)}
      title="Click to edit value manually"
    >
      {value}%
    </span>
  );
};

export const Profile = () => {
  const { user, updateLocalUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Form Fields
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('');
  const [year, setYear] = useState('');
  const [cgpa, setCgpa] = useState('');
  
  const [scores, setScores] = useState({
    quantitative: 0,
    logical: 0,
    verbal: 0,
    python: 0,
    java: 0,
    sql: 0,
    dsa: 0,
    speaking: 0,
    presentation: 0,
    gd: 0,
    projects_count: 0,
    certifications_count: 0
  });

  const departmentsList = [
    'Computer Science & Engineering',
    'Information Technology',
    'Electronics & Communication Engineering',
    'Electrical & Electronics Engineering',
    'Mechanical Engineering',
    'Civil Engineering',
    'Data Science & AI'
  ];

  const yearsList = [
    '1st Year',
    '2nd Year',
    '3rd Year',
    '4th Year'
  ];

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await api.get('/profile');
        setName(data.profile.name);
        setDepartment(data.profile.department);
        setYear(data.profile.year);
        setCgpa(data.profile.cgpa);
        setScores(data.scores);
      } catch (err) {
        console.error("Failed to load profile:", err);
        setError('Failed to fetch profile details.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleScoreChange = (field, val) => {
    // Clamp values between 0 and 100
    let numericVal = parseInt(val) || 0;
    if (field === 'projects_count' || field === 'certifications_count') {
      numericVal = Math.max(0, numericVal);
    } else {
      numericVal = Math.min(100, Math.max(0, numericVal));
    }
    setScores(prev => ({ ...prev, [field]: numericVal }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccess('');
    setError('');

    if (parseFloat(cgpa) < 0 || parseFloat(cgpa) > 10) {
      setError('CGPA must be between 0.0 and 10.0');
      setSaving(false);
      return;
    }

    try {
      const payload = {
        name,
        department,
        year,
        cgpa: parseFloat(cgpa),
        scores
      };

      const res = await api.post('/profile', payload);
      
      // Update local profile contexts
      updateLocalUser({
        name: res.profile.name,
        department: res.profile.department,
        year: res.profile.year,
        cgpa: res.profile.cgpa
      });

      setSuccess('Profile details and scores updated successfully!');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to save profile. Try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Loading Profile Data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100 flex items-center gap-2">
            Profile & Skill Scores Setup <User className="w-6 h-6 text-sky-500" />
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Set up your academic details, core programming and communication scores for weighted analyzer calculations.
          </p>
        </div>
      </div>

      {success && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-sm flex items-center gap-2 font-medium">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-sm flex items-center gap-2 font-medium">
          <Shield className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleProfileSubmit} className="space-y-6">
        {/* Section 1: Academic Profile */}
        <GlassCard className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2 pb-2 border-b border-slate-200/40 dark:border-slate-800/40">
            <GraduationCap className="w-5 h-5 text-sky-500" />
            1. Academic Profile Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-550 dark:text-slate-400 uppercase tracking-wider mb-2">
                Full Name
              </label>
              <input
                type="text"
                required
                className="w-full glass-input text-sm bg-white/50 dark:bg-slate-900/30 text-slate-800 dark:text-slate-100"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-550 dark:text-slate-400 uppercase tracking-wider mb-2">
                CGPA (0.0 - 10.0 scale)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="10"
                required
                className="w-full glass-input text-sm bg-white/50 dark:bg-slate-900/30 text-slate-800 dark:text-slate-100"
                value={cgpa}
                onChange={(e) => setCgpa(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-550 dark:text-slate-400 uppercase tracking-wider mb-2">
                Department
              </label>
              <select
                className="w-full glass-input text-sm bg-white/50 dark:bg-slate-900/30 text-slate-800 dark:text-slate-100"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
              >
                {departmentsList.map((dept) => (
                  <option key={dept} value={dept} className="bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100">
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-550 dark:text-slate-400 uppercase tracking-wider mb-2">
                Academic Year
              </label>
              <select
                className="w-full glass-input text-sm bg-white/50 dark:bg-slate-900/30 text-slate-800 dark:text-slate-100"
                value={year}
                onChange={(e) => setYear(e.target.value)}
              >
                {yearsList.map((y) => (
                  <option key={y} value={y} className="bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100">
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </GlassCard>

        {/* Section 2: Aptitude and Coding Scores */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Aptitude Scores */}
          <GlassCard className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 pb-2 border-b border-slate-200/40 dark:border-slate-800/40">
              Aptitude Score Metrics (%)
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="flex justify-between text-xs font-semibold text-slate-550 dark:text-slate-400 uppercase tracking-wider mb-2">
                  <span>Quantitative Aptitude</span>
                  <EditableScoreLabel
                    field="quantitative"
                    value={scores.quantitative}
                    colorClass="text-sky-500"
                    borderClass="border-sky-500"
                    handleScoreChange={handleScoreChange}
                  />
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
                  value={scores.quantitative}
                  onChange={(e) => handleScoreChange('quantitative', e.target.value)}
                />
              </div>

              <div>
                <label className="flex justify-between text-xs font-semibold text-slate-550 dark:text-slate-400 uppercase tracking-wider mb-2">
                  <span>Logical Reasoning</span>
                  <EditableScoreLabel
                    field="logical"
                    value={scores.logical}
                    colorClass="text-sky-500"
                    borderClass="border-sky-500"
                    handleScoreChange={handleScoreChange}
                  />
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
                  value={scores.logical}
                  onChange={(e) => handleScoreChange('logical', e.target.value)}
                />
              </div>

              <div>
                <label className="flex justify-between text-xs font-semibold text-slate-550 dark:text-slate-400 uppercase tracking-wider mb-2">
                  <span>Verbal Ability</span>
                  <EditableScoreLabel
                    field="verbal"
                    value={scores.verbal}
                    colorClass="text-sky-500"
                    borderClass="border-sky-500"
                    handleScoreChange={handleScoreChange}
                  />
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
                  value={scores.verbal}
                  onChange={(e) => handleScoreChange('verbal', e.target.value)}
                />
              </div>
            </div>
          </GlassCard>

          {/* Technical Coding Skills */}
          <GlassCard className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 pb-2 border-b border-slate-200/40 dark:border-slate-800/40">
              Coding Skill Proficiency (%)
            </h3>

            <div className="space-y-4">
              <div>
                <label className="flex justify-between text-xs font-semibold text-slate-550 dark:text-slate-400 uppercase tracking-wider mb-2">
                  <span>Python Programming</span>
                  <EditableScoreLabel
                    field="python"
                    value={scores.python}
                    colorClass="text-indigo-500"
                    borderClass="border-indigo-500"
                    handleScoreChange={handleScoreChange}
                  />
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  value={scores.python}
                  onChange={(e) => handleScoreChange('python', e.target.value)}
                />
              </div>

              <div>
                <label className="flex justify-between text-xs font-semibold text-slate-550 dark:text-slate-400 uppercase tracking-wider mb-2">
                  <span>Java Programming</span>
                  <EditableScoreLabel
                    field="java"
                    value={scores.java}
                    colorClass="text-indigo-500"
                    borderClass="border-indigo-500"
                    handleScoreChange={handleScoreChange}
                  />
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  value={scores.java}
                  onChange={(e) => handleScoreChange('java', e.target.value)}
                />
              </div>

              <div>
                <label className="flex justify-between text-xs font-semibold text-slate-550 dark:text-slate-400 uppercase tracking-wider mb-2">
                  <span>SQL Databases</span>
                  <EditableScoreLabel
                    field="sql"
                    value={scores.sql}
                    colorClass="text-indigo-500"
                    borderClass="border-indigo-500"
                    handleScoreChange={handleScoreChange}
                  />
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  value={scores.sql}
                  onChange={(e) => handleScoreChange('sql', e.target.value)}
                />
              </div>

              <div>
                <label className="flex justify-between text-xs font-semibold text-slate-550 dark:text-slate-400 uppercase tracking-wider mb-2">
                  <span>Algorithms & DSA</span>
                  <EditableScoreLabel
                    field="dsa"
                    value={scores.dsa}
                    colorClass="text-indigo-500"
                    borderClass="border-indigo-500"
                    handleScoreChange={handleScoreChange}
                  />
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  value={scores.dsa}
                  onChange={(e) => handleScoreChange('dsa', e.target.value)}
                />
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Section 3: Communication & Extra Profile Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Communication / Soft Skills */}
          <GlassCard className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 pb-2 border-b border-slate-200/40 dark:border-slate-800/40">
              Soft Skills & Communication (%)
            </h3>

            <div className="space-y-4">
              <div>
                <label className="flex justify-between text-xs font-semibold text-slate-550 dark:text-slate-400 uppercase tracking-wider mb-2">
                  <span>Spoken English / Speaking</span>
                  <EditableScoreLabel
                    field="speaking"
                    value={scores.speaking}
                    colorClass="text-pink-500"
                    borderClass="border-pink-500"
                    handleScoreChange={handleScoreChange}
                  />
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-pink-500"
                  value={scores.speaking}
                  onChange={(e) => handleScoreChange('speaking', e.target.value)}
                />
              </div>

              <div>
                <label className="flex justify-between text-xs font-semibold text-slate-550 dark:text-slate-400 uppercase tracking-wider mb-2">
                  <span>Presentation Skills</span>
                  <EditableScoreLabel
                    field="presentation"
                    value={scores.presentation}
                    colorClass="text-pink-500"
                    borderClass="border-pink-500"
                    handleScoreChange={handleScoreChange}
                  />
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-pink-500"
                  value={scores.presentation}
                  onChange={(e) => handleScoreChange('presentation', e.target.value)}
                />
              </div>

              <div>
                <label className="flex justify-between text-xs font-semibold text-slate-550 dark:text-slate-400 uppercase tracking-wider mb-2">
                  <span>Group Discussion (GD)</span>
                  <EditableScoreLabel
                    field="gd"
                    value={scores.gd}
                    colorClass="text-pink-500"
                    borderClass="border-pink-500"
                    handleScoreChange={handleScoreChange}
                  />
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-pink-500"
                  value={scores.gd}
                  onChange={(e) => handleScoreChange('gd', e.target.value)}
                />
              </div>
            </div>
          </GlassCard>

          {/* Profile Extra Counts */}
          <GlassCard className="space-y-4 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 pb-2 border-b border-slate-200/40 dark:border-slate-800/40 mb-4">
                Projects & Certifications
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-550 dark:text-slate-400 uppercase tracking-wider mb-2">
                    Number of Completed Projects
                  </label>
                  <input
                    type="number"
                    min="0"
                    className="w-full glass-input text-sm bg-white/50 dark:bg-slate-900/30 text-slate-800 dark:text-slate-100"
                    value={scores.projects_count}
                    onChange={(e) => handleScoreChange('projects_count', e.target.value)}
                  />
                  <span className="text-[10px] text-slate-450 block mt-1">Capped at 5 projects for maximum weight points in classification.</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-550 dark:text-slate-400 uppercase tracking-wider mb-2">
                    Number of Professional Certifications
                  </label>
                  <input
                    type="number"
                    min="0"
                    className="w-full glass-input text-sm bg-white/50 dark:bg-slate-900/30 text-slate-800 dark:text-slate-100"
                    value={scores.certifications_count}
                    onChange={(e) => handleScoreChange('certifications_count', e.target.value)}
                  />
                  <span className="text-[10px] text-slate-450 block mt-1">Capped at 5 certifications for maximum weight points.</span>
                </div>
              </div>
            </div>

            <div className="flex gap-1.5 bg-sky-500/5 dark:bg-sky-500/10 p-3 rounded-xl border border-sky-500/20 text-xs text-sky-600 dark:text-sky-400 mt-4">
              <HelpCircle className="w-5 h-5 flex-shrink-0" />
              <span>We recommend uploading your resume in the **Resume Analyzer** page to verify your credentials.</span>
            </div>
          </GlassCard>
        </div>

        {/* Form Action Button */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 py-3 px-6 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-720 text-white font-semibold text-sm shadow-lg shadow-sky-500/25 hover:shadow-indigo-500/30 transition-all duration-300 disabled:opacity-50"
          >
            {saving ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Changes & Compute Readiness</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Profile;
