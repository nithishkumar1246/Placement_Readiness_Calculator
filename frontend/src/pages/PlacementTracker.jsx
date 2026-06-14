import React, { useEffect, useState } from 'react';
import { GlassCard } from '../components/GlassCard';
import api from '../utils/api';
import { 
  Briefcase, 
  Plus, 
  Trash2, 
  DollarSign, 
  Percent, 
  BarChart, 
  CheckCircle,
  X,
  XSquare,
  HelpCircle,
  Clock
} from 'lucide-react';

export const PlacementTracker = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Create New Application Form
  const [showAddForm, setShowAddForm] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [role, setRole] = useState('');
  const [packageLpa, setPackageLpa] = useState('');
  const [status, setStatus] = useState('Applied');

  const statuses = ['Applied', 'Shortlisted', 'Interview Scheduled', 'Rejected', 'Selected'];

  const fetchApplications = async () => {
    try {
      const data = await api.get('/tracker/applications');
      setApplications(data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch job applications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!companyName || !role || !packageLpa) {
      alert('Please fill out all fields.');
      return;
    }

    try {
      const payload = {
        company_name: companyName,
        role,
        package_lpa: parseFloat(packageLpa),
        status
      };
      
      const res = await api.post('/tracker/applications', payload);
      setApplications(prev => [...prev, res.application]);
      
      // Reset
      setCompanyName('');
      setRole('');
      setPackageLpa('');
      setStatus('Applied');
      setShowAddForm(false);
    } catch (err) {
      console.error(err);
      alert('Failed to add application.');
    }
  };

  const handleStatusChange = async (appId, newStatus) => {
    try {
      const targetApp = applications.find(a => a.id === appId);
      const payload = {
        id: appId,
        company_name: targetApp.company_name,
        role: targetApp.role,
        package_lpa: targetApp.package_lpa,
        status: newStatus
      };
      
      const res = await api.post('/tracker/applications', payload);
      setApplications(prev => prev.map(a => a.id === appId ? res.application : a));
    } catch (err) {
      console.error(err);
      alert('Failed to update status.');
    }
  };

  const handleDelete = async (appId) => {
    if (!window.confirm('Are you sure you want to delete this job application?')) return;
    try {
      await api.delete(`/tracker/applications/${appId}`);
      setApplications(prev => prev.filter(a => a.id !== appId));
    } catch (err) {
      console.error(err);
      alert('Failed to delete application.');
    }
  };

  // Stats
  const totalApplied = applications.length;
  const shortlistedCount = applications.filter(a => a.status === 'Shortlisted').length;
  const interviewCount = applications.filter(a => a.status === 'Interview Scheduled').length;
  const selectedCount = applications.filter(a => a.status === 'Selected').length;
  const maxOffer = applications.length > 0 
    ? Math.max(...applications.map(a => a.package_lpa)) 
    : 0.0;
  
  const conversionRate = totalApplied > 0 
    ? Math.round(((selectedCount + shortlistedCount) / totalApplied) * 100) 
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Loading Job Applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100 flex items-center gap-2">
            Placement Tracker Board <Briefcase className="w-6 h-6 text-sky-500" />
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Monitor and update statuses of your active campus drives and off-campus opportunities.
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-1.5 py-2.5 px-4 rounded-xl bg-sky-500 hover:bg-sky-650 text-white font-bold text-xs shadow-md shadow-sky-500/10 transition-all"
        >
          {showAddForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          <span>{showAddForm ? 'Cancel Form' : 'Log New Application'}</span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-sm font-medium">
          {error}
        </div>
      )}

      {/* Aggregate Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <GlassCard className="flex items-center gap-4 p-4">
          <div className="p-3 rounded-xl bg-sky-500/10 text-sky-500 border border-sky-500/20">
            <BarChart className="w-6 h-6" />
          </div>
          <div>
            <span className="block text-[10px] text-slate-450 uppercase font-semibold">Total Applied</span>
            <span className="text-xl font-extrabold text-slate-850 dark:text-slate-100">{totalApplied} Drives</span>
          </div>
        </GlassCard>

        <GlassCard className="flex items-center gap-4 p-4">
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="block text-[10px] text-slate-450 uppercase font-semibold">Interviews Scheduled</span>
            <span className="text-xl font-extrabold text-slate-850 dark:text-slate-100">{interviewCount} rounds</span>
          </div>
        </GlassCard>

        <GlassCard className="flex items-center gap-4 p-4">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <span className="block text-[10px] text-slate-450 uppercase font-semibold">Selected Status</span>
            <span className="text-xl font-extrabold text-slate-850 dark:text-slate-100">{selectedCount} Offers</span>
          </div>
        </GlassCard>

        <GlassCard className="flex items-center gap-4 p-4">
          <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <span className="block text-[10px] text-slate-450 uppercase font-semibold">Max Package Offered</span>
            <span className="text-xl font-extrabold text-slate-850 dark:text-slate-100">{maxOffer.toFixed(1)} LPA</span>
          </div>
        </GlassCard>
      </div>

      {/* Add New application Form overlay */}
      {showAddForm && (
        <GlassCard className="max-w-xl mx-auto space-y-4 border border-sky-500/20" glow>
          <h3 className="font-bold text-slate-850 dark:text-slate-150 text-sm">Add Application Details</h3>
          
          <form onSubmit={handleAddSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-550 dark:text-slate-450 uppercase mb-2">Company Name</label>
              <input
                type="text"
                required
                placeholder="Google"
                className="w-full glass-input text-xs"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-550 dark:text-slate-455 uppercase mb-2">Job Designation / Role</label>
              <input
                type="text"
                required
                placeholder="Software Engineer"
                className="w-full glass-input text-xs"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-550 dark:text-slate-450 uppercase mb-2">Package (LPA)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                required
                placeholder="12.5"
                className="w-full glass-input text-xs"
                value={packageLpa}
                onChange={(e) => setPackageLpa(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-550 dark:text-slate-450 uppercase mb-2">Application Status</label>
              <select
                className="w-full glass-input text-xs bg-white dark:bg-slate-900"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                {statuses.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="col-span-full flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="py-2 px-4 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-900 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="py-2 px-6 rounded-xl bg-sky-500 hover:bg-sky-650 text-white text-xs font-bold shadow-md transition-all"
              >
                Log Entry
              </button>
            </div>
          </form>
        </GlassCard>
      )}

      {/* Grid: Columns Board (Kanban feel) */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {statuses.map(colStatus => {
          const colApps = applications.filter(a => a.status === colStatus);
          
          let colColorClass = 'border-t-slate-400 bg-slate-100/30';
          if (colStatus === 'Shortlisted') colColorClass = 'border-t-blue-500 bg-blue-500/5';
          if (colStatus === 'Interview Scheduled') colColorClass = 'border-t-orange-500 bg-orange-500/5';
          if (colStatus === 'Rejected') colColorClass = 'border-t-red-500 bg-red-500/5';
          if (colStatus === 'Selected') colColorClass = 'border-t-emerald-500 bg-emerald-500/5';

          return (
            <div 
              key={colStatus} 
              className={`rounded-2xl border border-slate-200/40 dark:border-slate-800/40 p-4 border-t-4 ${colColorClass} flex flex-col min-h-[320px]`}
            >
              {/* Column Header */}
              <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-200/30 dark:border-slate-850/30">
                <span className="font-bold text-xs text-slate-700 dark:text-slate-250 truncate pr-1">{colStatus}</span>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-slate-200/50 dark:bg-slate-800 text-slate-500">
                  {colApps.length}
                </span>
              </div>

              {/* Column applications list */}
              <div className="space-y-3 flex-1 overflow-y-auto max-h-[380px] pr-0.5">
                {colApps.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-center py-10 text-[10px] text-slate-400 font-medium">
                    Empty
                  </div>
                ) : (
                  colApps.map(app => (
                    <GlassCard 
                      key={app.id} 
                      className="p-3.5 space-y-3 relative hover:scale-[1.01] hover:shadow-md transition-all duration-200"
                      heavy
                    >
                      {/* Delete check */}
                      <button
                        onClick={() => handleDelete(app.id)}
                        className="absolute top-2.5 right-2.5 text-slate-400 hover:text-rose-500 transition-colors"
                        aria-label="Delete Application"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      <div className="space-y-0.5 pr-4">
                        <h4 className="font-bold text-xs text-slate-800 dark:text-slate-150 truncate">{app.company_name}</h4>
                        <p className="text-[10px] text-slate-450 truncate">{app.role}</p>
                      </div>

                      <div className="flex justify-between items-center pt-2 border-t border-slate-200/30 dark:border-slate-800/30">
                        <span className="text-[10px] font-black text-indigo-500 dark:text-indigo-400">{app.package_lpa.toFixed(1)} LPA</span>
                        
                        {/* Inline status switcher */}
                        <select
                          className="text-[9px] font-bold bg-transparent border-0 text-sky-500 outline-none cursor-pointer"
                          value={app.status}
                          onChange={(e) => handleStatusChange(app.id, e.target.value)}
                        >
                          {statuses.map(s => (
                            <option key={s} value={s} className="bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-350">
                              Move &rarr; {s}
                            </option>
                          ))}
                        </select>
                      </div>
                    </GlassCard>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PlacementTracker;
