import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GlassCard } from '../components/GlassCard';
import { ThemeToggle } from '../components/ThemeToggle';
import { GraduationCap, Mail, Lock, User, Star, ArrowRight } from 'lucide-react';

export const Register = () => {
  const { register } = useAuth();
  
  // Credentials
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  
  // Student Profile Fields
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('');
  const [year, setYear] = useState('4th Year');
  const [cgpa, setCgpa] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const payload = {
      email,
      password,
      role,
      ...(role === 'student' && {
        name,
        department,
        year,
        cgpa: parseFloat(cgpa)
      })
    };

    if (role === 'student') {
      if (parseFloat(cgpa) < 0 || parseFloat(cgpa) > 10) {
        setError('CGPA must be between 0.0 and 10.0');
        setLoading(false);
        return;
      }
    }

    try {
      await register(payload);
      setSuccess('Account created successfully! Redirecting to sign in...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.message || 'Registration failed. Try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-mesh px-4 py-8 relative">
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-lg my-6">
        {/* App Logo */}
        <div className="flex flex-col items-center mb-6 text-center">
          <div className="p-3 bg-gradient-to-tr from-sky-500 to-indigo-600 rounded-2xl text-white shadow-xl shadow-sky-500/20 mb-2 animate-float">
            <GraduationCap className="w-10 h-10" />
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-sky-600 to-indigo-600 dark:from-sky-400 dark:to-indigo-400 bg-clip-text text-transparent">
            Create Account
          </h1>
          <p className="text-slate-400 text-xs mt-1">Get started with Career Analytics</p>
        </div>

        {/* Register Card */}
        <GlassCard className="border border-white/20 dark:border-slate-800/30" glow>
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-rose-500/10 text-rose-500 text-xs border border-rose-500/20 font-medium">
              {error}
            </div>
          )}
          
          {success && (
            <div className="mb-4 p-3 rounded-lg bg-emerald-500/10 text-emerald-500 text-xs border border-emerald-500/20 font-medium animate-pulse">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Role Switcher */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                I am registering as:
              </label>
              <div className="flex bg-slate-100 dark:bg-slate-900/50 p-1 rounded-xl border border-slate-200/20">
                <button
                  type="button"
                  onClick={() => setRole('student')}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                    role === 'student'
                      ? 'bg-sky-500 text-white shadow-md'
                      : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-350'
                  }`}
                >
                  Student
                </button>
                <button
                  type="button"
                  onClick={() => setRole('admin')}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                    role === 'admin'
                      ? 'bg-sky-500 text-white shadow-md'
                      : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-350'
                  }`}
                >
                  Administrator
                </button>
              </div>
            </div>

            {/* Email and Password */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                    <Mail className="w-5 h-5" />
                  </span>
                  <input
                    type="email"
                    required
                    placeholder="student@college.edu"
                    className="w-full glass-input pl-icon text-sm bg-white/50 dark:bg-slate-900/30 text-slate-800 dark:text-slate-100"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                  Password
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                    <Lock className="w-5 h-5" />
                  </span>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    className="w-full glass-input pl-icon text-sm bg-white/50 dark:bg-slate-900/30 text-slate-800 dark:text-slate-100"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Profile fields (Only for Student) */}
            {role === 'student' && (
              <div className="space-y-4 pt-4 border-t border-slate-200/40 dark:border-slate-800/40 animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                      Full Name
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                        <User className="w-5 h-5" />
                      </span>
                      <input
                        type="text"
                        required={role === 'student'}
                        placeholder="John Doe"
                        className="w-full glass-input pl-icon text-sm bg-white/50 dark:bg-slate-900/30 text-slate-800 dark:text-slate-100"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                      Academic CGPA
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                        <Star className="w-5 h-5" />
                      </span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="10"
                        required={role === 'student'}
                        placeholder="8.50"
                        className="w-full glass-input pl-icon text-sm bg-white/50 dark:bg-slate-900/30 text-slate-800 dark:text-slate-100"
                        value={cgpa}
                        onChange={(e) => setCgpa(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                      Department
                    </label>
                    <input
                      type="text"
                      required={role === 'student'}
                      placeholder="e.g. Computer Science & Engineering"
                      className="w-full glass-input text-sm bg-white/50 dark:bg-slate-900/30 text-slate-800 dark:text-slate-100"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
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
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 mt-6 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-755 text-white font-semibold text-sm shadow-lg shadow-sky-500/25 hover:shadow-indigo-500/30 transition-all duration-300 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="text-sky-500 hover:underline font-semibold">
              Sign in here
            </Link>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default Register;
