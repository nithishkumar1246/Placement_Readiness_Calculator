import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GlassCard } from '../components/GlassCard';
import { ThemeToggle } from '../components/ThemeToggle';
import { GraduationCap, Mail, Lock, ArrowRight } from 'lucide-react';

export const Login = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(email, password);
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Failed to authenticate. Check credentials.');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-mesh px-4 py-8 relative">
      {/* Theme Toggle Top Right */}
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md">
        {/* App Logo */}
        <div className="flex flex-col items-center mb-6 text-center">
          <div className="p-3 bg-gradient-to-tr from-sky-500 to-indigo-600 rounded-2xl text-white shadow-xl shadow-sky-500/20 mb-2 animate-float">
            <GraduationCap className="w-10 h-10" />
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-sky-600 to-indigo-600 dark:from-sky-400 dark:to-indigo-400 bg-clip-text text-transparent">
            Placement Readiness Calculator
          </h1>
          <p className="text-slate-400 text-xs mt-1">Career Analysis & Analytics Engine</p>
        </div>

        {/* Login Card */}
        <GlassCard className="border border-white/20 dark:border-slate-800/30" glow>
          <h2 className="text-xl font-semibold mb-6 text-slate-800 dark:text-slate-100">Sign In</h2>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-rose-500/10 text-rose-500 text-xs border border-rose-500/20 font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
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
                  placeholder="student@placement.com"
                  className="w-full glass-input pl-icon text-sm bg-white/50 dark:bg-slate-900/30 text-slate-800 dark:text-slate-100"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-550 dark:text-slate-400 uppercase tracking-wider mb-2">
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

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 mt-6 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-750 text-white font-semibold text-sm shadow-lg shadow-sky-500/25 hover:shadow-indigo-500/30 transition-all duration-300 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>


          <div className="mt-6 text-center text-xs text-slate-500">
            Don't have an account?{' '}
            <Link to="/register" className="text-sky-500 hover:underline font-semibold">
              Register here
            </Link>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default Login;
