import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ThemeToggle } from './ThemeToggle';
import { 
  LayoutDashboard, 
  UserCheck, 
  Building2, 
  FileSpreadsheet, 
  MessageSquareCode, 
  CalendarRange, 
  Briefcase, 
  ShieldCheck, 
  LogOut, 
  Menu, 
  X,
  GraduationCap
} from 'lucide-react';

export const Sidebar = () => {
  const { user, logout, isAdmin } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const toggleSidebar = () => setIsOpen(!isOpen);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, role: 'student' },
    { name: 'Profile & Scores', path: '/profile', icon: UserCheck, role: 'student' },
    { name: 'Company Checker', path: '/companies', icon: Building2, role: 'student' },
    { name: 'Resume Analyzer', path: '/resume', icon: FileSpreadsheet, role: 'student' },
    { name: 'Interview Prep', path: '/interview', icon: MessageSquareCode, role: 'student' },
    { name: 'AI Study Planner', path: '/planner', icon: CalendarRange, role: 'student' },
    { name: 'Placement Tracker', path: '/tracker', icon: Briefcase, role: 'student' },
    { name: 'Admin Dashboard', path: '/admin', icon: ShieldCheck, role: 'admin' },
  ];

  // Filter based on roles
  const filteredItems = navItems.filter(item => {
    if (item.role === 'admin') return isAdmin;
    return !isAdmin; 
  });

  const sidebarContent = (
    <div className="flex flex-col h-full p-4 justify-between">
      <div>
        {/* App Title & Logo */}
        <div className="flex items-center gap-3 px-2 py-4 border-b border-slate-200/40 dark:border-slate-800/40 mb-6">
          <div className="p-2.5 bg-gradient-to-tr from-sky-500 to-indigo-600 rounded-xl text-white shadow-lg shadow-sky-500/20">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-base bg-gradient-to-r from-sky-600 to-indigo-600 dark:from-sky-400 dark:to-indigo-400 bg-clip-text text-transparent leading-none">
              Placement Readiness
            </h1>
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
              & Career Analyzer
            </span>
          </div>
        </div>

        {/* User Card */}
        {user && (
          <div className="mb-6 p-3 rounded-xl bg-slate-100/50 dark:bg-slate-900/30 border border-slate-200/20 dark:border-slate-800/20">
            <p className="font-semibold text-sm truncate text-slate-700 dark:text-slate-200">{user.name || 'Administrator'}</p>
            <p className="text-xs text-slate-400 truncate">{user.email}</p>
            <span className={`inline-block mt-2 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-md ${
              user.role === 'admin' 
                ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' 
                : 'bg-sky-500/10 text-sky-500 border border-sky-500/20'
            }`}>
              {user.role}
            </span>
          </div>
        )}

        {/* Navigation Items */}
        <nav className="space-y-1">
          {filteredItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) => `
                  flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-350
                  ${isActive 
                    ? 'bg-gradient-to-r from-sky-500/15 to-indigo-500/5 text-sky-600 dark:text-sky-400 border-l-4 border-sky-500 shadow-sm' 
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200/30 dark:hover:bg-slate-800/20 hover:text-slate-700 dark:hover:text-slate-200'
                  }
                `}
              >
                <Icon className="w-5 h-5" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer controls */}
      <div className="pt-4 border-t border-slate-200/40 dark:border-slate-800/40 space-y-4">
        <div className="flex items-center justify-between px-2">
          <span className="text-xs text-slate-400 font-medium">Appearance</span>
          <ThemeToggle />
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-rose-500 hover:bg-rose-500/10 transition-all duration-300 font-medium text-sm"
        >
          <LogOut className="w-5 h-5" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 h-screen fixed top-0 left-0 glass-nav z-30 transition-all duration-300">
        {sidebarContent}
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between px-6 py-4 glass-panel border-b border-slate-200/40 dark:border-slate-800/40 fixed top-0 w-full z-40 bg-white/70 dark:bg-slate-950/70">
        <div className="flex items-center gap-2">
          <GraduationCap className="w-6 h-6 text-sky-500" />
          <span className="font-bold text-sm bg-gradient-to-r from-sky-600 to-indigo-600 dark:from-sky-400 dark:to-indigo-400 bg-clip-text text-transparent">
            Readiness Checker
          </span>
        </div>
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg bg-slate-200/50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-200 outline-none"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Mobile Drawer */}
      <div 
        className={`md:hidden fixed inset-0 z-30 transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Overlay background */}
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={toggleSidebar}></div>
        {/* Drawer slide-out */}
        <aside 
          className={`absolute top-0 left-0 w-64 h-full bg-white dark:bg-slate-950 shadow-2xl transition-transform duration-300 ${
            isOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {sidebarContent}
        </aside>
      </div>
    </>
  );
};

export default Sidebar;
