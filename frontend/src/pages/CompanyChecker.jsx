import React, { useEffect, useState } from 'react';
import { GlassCard } from '../components/GlassCard';
import api from '../utils/api';
import { Building2, CheckCircle, XCircle, Search, HelpCircle, ArrowRight } from 'lucide-react';

export const CompanyChecker = () => {
  const [companies, setCompanies] = useState([]);
  const [tracker, setTracker] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterEligible, setFilterEligible] = useState('all'); // 'all', 'eligible', 'ineligible'
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    const fetchCompaniesData = async () => {
      try {
        const cData = await api.get('/companies');
        setCompanies(cData);

        const tData = await api.get('/tracker/applications');
        setTracker(tData);
      } catch (err) {
        console.error("Failed to load companies:", err);
        setError('Failed to load companies data.');
      } finally {
        setLoading(false);
      }
    };

    fetchCompaniesData();
  }, []);

  const handleApply = async (company) => {
    try {
      const payload = {
        company_name: company.name,
        role: company.role,
        package_lpa: company.package_lpa,
        status: 'Applied'
      };
      
      const newApp = await api.post('/tracker/applications', payload);
      setTracker(prev => [...prev, newApp.application]);
      
      setToastMessage(`Successfully added ${company.name} to your Placement Tracker!`);
      setTimeout(() => setToastMessage(''), 3000);
    } catch (err) {
      console.error("Failed to apply:", err);
      alert('Failed to add job application to tracker.');
    }
  };

  const isApplied = (companyName) => {
    return tracker.some(appObj => appObj.company_name.toLowerCase() === companyName.toLowerCase());
  };

  const filteredCompanies = companies.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          c.role.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filterEligible === 'eligible') {
      return matchesSearch && c.eligible;
    } else if (filterEligible === 'ineligible') {
      return matchesSearch && !c.eligible;
    }
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Checking Policy Criteria...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-xl bg-emerald-500 text-white font-medium text-xs shadow-2xl flex items-center gap-2 animate-bounce">
          <CheckCircle className="w-5 h-5" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100 flex items-center gap-2">
          Company Eligibility Checker <Building2 className="w-6 h-6 text-sky-500" />
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          Compare your CGPA and Placement Readiness Score against minimum qualifications for top companies.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-sm">
          {error}
        </div>
      )}

      {/* Search and Filters */}
      <GlassCard className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4">
        {/* Search bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-5 h-5 absolute left-3 top-2.5 text-slate-450" />
          <input
            type="text"
            placeholder="Search by company or role..."
            className="w-full glass-input pl-icon text-sm bg-white/50 dark:bg-slate-900/30 text-slate-800 dark:text-slate-100"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Tab Filters */}
        <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200/20">
          {['all', 'eligible', 'ineligible'].map((mode) => (
            <button
              key={mode}
              onClick={() => setFilterEligible(mode)}
              className={`px-4 py-2 text-xs font-semibold rounded-lg capitalize transition-all ${
                filterEligible === mode
                  ? 'bg-sky-500 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-350'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </GlassCard>

      {/* Companies grid list */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCompanies.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400 text-sm font-medium">
            No companies matching the criteria were found.
          </div>
        ) : (
          filteredCompanies.map((c) => {
            const alreadyApplied = isApplied(c.name);
            return (
              <GlassCard 
                key={c.id} 
                className={`flex flex-col justify-between border-t-4 transition-all hover:scale-[1.01] ${
                  c.eligible 
                    ? 'border-t-emerald-500 hover:shadow-emerald-500/5' 
                    : 'border-t-rose-500 hover:shadow-rose-500/5'
                }`}
              >
                <div>
                  {/* Header info */}
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-slate-850 dark:text-slate-100 text-base">{c.name}</h3>
                      <p className="text-xs text-slate-400 font-medium">{c.role}</p>
                    </div>
                    <span className="text-sm font-extrabold text-indigo-500 dark:text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded-lg">
                      {c.package_lpa.toFixed(1)} LPA
                    </span>
                  </div>

                  {/* Details description */}
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
                    {c.details}
                  </p>

                  {/* Requirements details */}
                  <div className="space-y-2 p-3 rounded-xl bg-slate-100/50 dark:bg-slate-900/30 border border-slate-200/20 dark:border-slate-800/10 text-[11px] mb-4">
                    <div className="flex justify-between">
                      <span className="text-slate-450">Min CGPA</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">{c.min_cgpa.toFixed(1)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-450">Min Readiness Score</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">{c.min_readiness_score}%</span>
                    </div>
                  </div>
                </div>

                {/* Eligibility and Actions */}
                <div className="pt-4 border-t border-slate-200/40 dark:border-slate-800/40 space-y-4">
                  {/* Status badge */}
                  <div className="flex items-center gap-1.5 text-xs font-semibold">
                    {c.eligible ? (
                      <>
                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                        <span className="text-emerald-550 dark:text-emerald-400">Eligible to Apply</span>
                      </>
                    ) : (
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-rose-500">
                          <XCircle className="w-4 h-4" />
                          <span>Not Eligible</span>
                        </div>
                        <p className="text-[10px] text-rose-500/80 font-medium pl-5 leading-normal">{c.reason}</p>
                      </div>
                    )}
                  </div>

                  {/* Button apply action */}
                  {c.eligible ? (
                    alreadyApplied ? (
                      <button
                        disabled
                        className="w-full py-2.5 px-4 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-450 dark:text-slate-500 text-xs font-bold border border-slate-300/10 flex items-center justify-center gap-1.5"
                      >
                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                        <span>Already Tracked (Applied)</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleApply(c)}
                        className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-650 hover:from-sky-650 hover:to-indigo-720 text-white text-xs font-bold shadow-md shadow-sky-500/10 flex items-center justify-center gap-1.5 transition-all group"
                      >
                        <span>Apply & Track Application</span>
                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                      </button>
                    )
                  ) : (
                    <button
                      disabled
                      className="w-full py-2.5 px-4 rounded-xl bg-slate-200/40 dark:bg-slate-900/10 text-slate-400/50 text-xs font-bold border border-slate-200/10"
                    >
                      Requirements Not Met
                    </button>
                  )}
                </div>
              </GlassCard>
            );
          })
        )}
      </div>

      {/* Info notice */}
      <div className="flex gap-2 p-4 rounded-xl bg-indigo-500/5 dark:bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-600 dark:text-indigo-400 leading-relaxed">
        <HelpCircle className="w-5 h-5 flex-shrink-0" />
        <div>
          <span className="font-semibold block mb-0.5">Eligibility Policies Note:</span>
          <span>
            These parameters represent standard entry requirements for recruitment. Students can boost their eligibility status by updating score parameters inside the **Profile & Skills** page or scanning an updated resume file.
          </span>
        </div>
      </div>
    </div>
  );
};

export default CompanyChecker;
