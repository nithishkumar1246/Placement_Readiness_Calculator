import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { GlassCard } from '../components/GlassCard';
import api from '../utils/api';
import { 
  ShieldCheck, 
  Users, 
  TrendingUp, 
  Settings, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  Search, 
  X,
  Plus,
  BookOpen,
  Eye
} from 'lucide-react';

export const AdminDashboard = () => {
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [error, setError] = useState('');
  
  // Search student
  const [studentSearch, setStudentSearch] = useState('');
  
  // Edit scores modal state
  const [editingStudent, setEditingStudent] = useState(null);
  const [editFormScores, setEditFormScores] = useState({});
  const [editCgpa, setEditCgpa] = useState('');

  // View student details modal state
  const [viewingStudent, setViewingStudent] = useState(null);
  const [viewingDetails, setViewingDetails] = useState(null);
  const [fetchingDetails, setFetchingDetails] = useState(false);
  
  // Manage companies state
  const [companyName, setCompanyName] = useState('');
  const [companyRole, setCompanyRole] = useState('');
  const [companyLpa, setCompanyLpa] = useState('');
  const [companyMinCgpa, setCompanyMinCgpa] = useState('');
  const [companyMinReadiness, setCompanyMinReadiness] = useState('');
  const [companyDetails, setCompanyDetails] = useState('');
  const [showCompanyForm, setShowCompanyForm] = useState(false);

  const fetchAdminData = async () => {
    try {
      const data = await api.get('/admin/dashboard');
      setStats(data);
      
      const cData = await api.get('/companies');
      setCompanies(cData);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch administrative statistics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleDeleteStudent = async (sid) => {
    if (!window.confirm('Are you sure you want to permanently delete this student account? All scores, applications, and resume scans will be lost.')) return;
    try {
      await api.delete(`/admin/users/${sid}`);
      fetchAdminData();
    } catch (err) {
      console.error(err);
      alert('Failed to delete student.');
    }
  };

  const openEditModal = (student) => {
    setEditingStudent(student);
    setEditCgpa(student.cgpa);
    setEditFormScores({
      quantitative: student.scores?.quantitative || 0,
      logical: student.scores?.logical || 0,
      verbal: student.scores?.verbal || 0,
      python: student.scores?.python || 0,
      java: student.scores?.java || 0,
      sql: student.scores?.sql || 0,
      dsa: student.scores?.dsa || 0,
      speaking: student.scores?.speaking || 0,
      presentation: student.scores?.presentation || 0,
      gd: student.scores?.gd || 0,
      projects_count: student.scores?.projects_count || 0,
      certifications_count: student.scores?.certifications_count || 0
    });
  };

  const handleEditScoreChange = (field, val) => {
    let numeric = parseInt(val) || 0;
    if (field !== 'projects_count' && field !== 'certifications_count') {
      numeric = Math.min(100, Math.max(0, numeric));
    } else {
      numeric = Math.max(0, numeric);
    }
    setEditFormScores(prev => ({ ...prev, [field]: numeric }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        cgpa: parseFloat(editCgpa),
        ...editFormScores
      };
      
      await api.put(`/admin/users/${editingStudent.user_id}/scores`, payload);
      setEditingStudent(null);
      fetchAdminData();
      alert('Student metrics updated successfully.');
    } catch (err) {
      console.error(err);
      alert('Failed to update student scores.');
    }
  };
  const handleViewDetails = async (sid) => {
    setFetchingDetails(true);
    setViewingStudent(sid);
    try {
      const data = await api.get(`/admin/users/${sid}/details`);
      setViewingDetails(data);
    } catch (err) {
      console.error(err);
      alert('Failed to fetch student details.');
      setViewingStudent(null);
    } finally {
      setFetchingDetails(false);
    }
  };

  const handleSaveCompany = async (e) => {
    e.preventDefault();
    if (!companyName || !companyRole || !companyLpa) {
      alert('Please fill out name, designation, and packages.');
      return;
    }

    try {
      const payload = {
        name: companyName,
        role: companyRole,
        package_lpa: parseFloat(companyLpa),
        min_cgpa: parseFloat(companyMinCgpa) || 6.0,
        min_readiness_score: parseFloat(companyMinReadiness) || 55.0,
        details: companyDetails
      };
      
      await api.post('/companies', payload);
      
      // Reset
      setCompanyName('');
      setCompanyRole('');
      setCompanyLpa('');
      setCompanyMinCgpa('');
      setCompanyMinReadiness('');
      setCompanyDetails('');
      setShowCompanyForm(false);
      
      fetchAdminData();
      alert('Company requirements saved successfully.');
    } catch (err) {
      console.error(err);
      alert('Failed to save company settings.');
    }
  };

  const handleDeleteCompany = async (cid) => {
    if (!window.confirm('Delete this company requirement schema?')) return;
    try {
      await api.delete(`/companies/${cid}`);
      fetchAdminData();
    } catch (err) {
      console.error(err);
      alert('Failed to delete company.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Securing Admin Console Data...</p>
        </div>
      </div>
    );
  }

  const filteredStudents = stats.students_list.filter(s => {
    const term = studentSearch.toLowerCase();
    return s.name.toLowerCase().includes(term) || 
           s.email.toLowerCase().includes(term) || 
           s.department.toLowerCase().includes(term) || 
           s.classification.toLowerCase().includes(term);
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100 flex items-center gap-2">
          Placement Coordinator Console <ShieldCheck className="w-6 h-6 text-sky-500" />
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          Monitor aggregated statistics, update individual student metrics, and manage minimum company policy eligibility rules.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-sm">
          {error}
        </div>
      )}

      {/* Aggregate Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard className="flex items-center gap-4 p-4">
          <div className="p-3 rounded-xl bg-sky-500/10 text-sky-500 border border-sky-500/20">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="block text-[10px] text-slate-455 uppercase font-semibold">Registered Students</span>
            <span className="text-xl font-extrabold text-slate-850 dark:text-slate-100">{stats.student_count} Students</span>
          </div>
        </GlassCard>

        <GlassCard className="flex items-center gap-4 p-4">
          <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="block text-[10px] text-slate-455 uppercase font-semibold">Global Readiness Average</span>
            <span className="text-xl font-extrabold text-slate-850 dark:text-slate-100">{stats.avg_readiness}% Rating</span>
          </div>
        </GlassCard>

        <GlassCard className="flex items-center gap-4 p-4">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="block text-[10px] text-slate-455 uppercase font-semibold">Average Student GPA</span>
            <span className="text-xl font-extrabold text-slate-850 dark:text-slate-100">{stats.avg_cgpa.toFixed(2)} CGPA</span>
          </div>
        </GlassCard>
      </div>

      {/* Student Management Panel */}
      <GlassCard className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2 border-b border-slate-200/40 dark:border-slate-800/40">
          <h3 className="font-bold text-slate-800 dark:text-slate-150 text-sm">Enrolled Students Database</h3>
          <div className="relative w-full sm:max-w-xs">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-450" />
            <input
              type="text"
              placeholder="Search by name, email, department..."
              className="w-full glass-input pl-icon py-1.5 text-xs"
              value={studentSearch}
              onChange={(e) => setStudentSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Students Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200/40 dark:border-slate-800/40 text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-3 px-2">Name</th>
                <th className="py-3 px-2">Department</th>
                <th className="py-3 px-2">CGPA</th>
                <th className="py-3 px-2">Readiness Score</th>
                <th className="py-3 px-2">Classification</th>
                <th className="py-3 px-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/20 dark:divide-slate-800/10">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-6 text-center text-slate-400 font-medium">No students registered or found.</td>
                </tr>
              ) : (
                filteredStudents.map((student) => (
                  <tr key={student.user_id} className="hover:bg-slate-100/10 dark:hover:bg-slate-900/10 transition-all">
                    <td className="py-3.5 px-2">
                      <div className="font-bold text-slate-750 dark:text-slate-200">{student.name}</div>
                      <div className="text-[10px] text-slate-400">{student.email}</div>
                    </td>
                    <td className="py-3.5 px-2">
                      <div className="font-medium text-slate-700 dark:text-slate-300">{student.department}</div>
                      <div className="text-[10px] text-slate-450">{student.year}</div>
                    </td>
                    <td className="py-3.5 px-2 font-semibold text-slate-800 dark:text-slate-200">{student.cgpa.toFixed(2)}</td>
                    <td className="py-3.5 px-2 font-extrabold text-sky-500">{student.readiness_score}%</td>
                    <td className="py-3.5 px-2">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        student.classification === 'Highly Placement Ready' ? 'bg-emerald-500/10 text-emerald-550 border-emerald-500/20' :
                        student.classification === 'Placement Ready' ? 'bg-blue-500/10 text-blue-550 border-blue-500/20' :
                        student.classification === 'Need Improvement' ? 'bg-amber-500/10 text-amber-550 border-amber-500/20' :
                        'bg-rose-500/10 text-rose-550 border-rose-500/20'
                      }`}>
                        {student.classification}
                      </span>
                    </td>
                    <td className="py-3.5 px-2 text-right space-x-1.5">
                      <button
                        onClick={() => handleViewDetails(student.user_id)}
                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 text-indigo-500 hover:text-indigo-650 transition-all inline-flex items-center"
                        title="View Full Details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => openEditModal(student)}
                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 text-sky-500 hover:text-sky-650 transition-all inline-flex items-center"
                        title="Edit Scores"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteStudent(student.user_id)}
                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-rose-500/10 text-rose-500 hover:text-rose-650 transition-all inline-flex items-center"
                        title="Delete Student"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* Edit Student Metrics Modal */}
      {editingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <GlassCard className="w-full max-w-2xl max-h-[85vh] overflow-y-auto space-y-6" glow heavy>
            <div className="flex justify-between items-center pb-4 border-b border-slate-200/40 dark:border-slate-800/40">
              <div>
                <h3 className="font-extrabold text-base text-slate-800 dark:text-slate-100">
                  Update Scores: {editingStudent.name}
                </h3>
                <p className="text-[10px] text-slate-450">{editingStudent.department} &bull; {editingStudent.email}</p>
              </div>
              <button onClick={() => setEditingStudent(null)} className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-900 text-slate-500 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Student CGPA</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    required
                    className="w-full glass-input text-xs"
                    value={editCgpa}
                    onChange={(e) => setEditCgpa(e.target.value)}
                  />
                </div>
              </div>

              {/* Skill fields inputs */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 pb-1 border-b border-slate-200/10">Skill Proficiency Ratings (0-100)</h4>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-1">Quant Aptitude</label>
                    <input
                      type="number"
                      className="w-full glass-input text-xs"
                      value={editFormScores.quantitative}
                      onChange={(e) => handleEditScoreChange('quantitative', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-1">Logical Reasoning</label>
                    <input
                      type="number"
                      className="w-full glass-input text-xs"
                      value={editFormScores.logical}
                      onChange={(e) => handleEditScoreChange('logical', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-1">Verbal Ability</label>
                    <input
                      type="number"
                      className="w-full glass-input text-xs"
                      value={editFormScores.verbal}
                      onChange={(e) => handleEditScoreChange('verbal', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-1">Python Code</label>
                    <input
                      type="number"
                      className="w-full glass-input text-xs"
                      value={editFormScores.python}
                      onChange={(e) => handleEditScoreChange('python', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-1">Java Code</label>
                    <input
                      type="number"
                      className="w-full glass-input text-xs"
                      value={editFormScores.java}
                      onChange={(e) => handleEditScoreChange('java', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-1">SQL DBs</label>
                    <input
                      type="number"
                      className="w-full glass-input text-xs"
                      value={editFormScores.sql}
                      onChange={(e) => handleEditScoreChange('sql', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-1">DSA Algorithms</label>
                    <input
                      type="number"
                      className="w-full glass-input text-xs"
                      value={editFormScores.dsa}
                      onChange={(e) => handleEditScoreChange('dsa', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-1">Speaking English</label>
                    <input
                      type="number"
                      className="w-full glass-input text-xs"
                      value={editFormScores.speaking}
                      onChange={(e) => handleEditScoreChange('speaking', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-1">Presentations</label>
                    <input
                      type="number"
                      className="w-full glass-input text-xs"
                      value={editFormScores.presentation}
                      onChange={(e) => handleEditScoreChange('presentation', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-1">Group Discussion</label>
                    <input
                      type="number"
                      className="w-full glass-input text-xs"
                      value={editFormScores.gd}
                      onChange={(e) => handleEditScoreChange('gd', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-1">Projects Count</label>
                    <input
                      type="number"
                      className="w-full glass-input text-xs"
                      value={editFormScores.projects_count}
                      onChange={(e) => handleEditScoreChange('projects_count', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-1">Certifications</label>
                    <input
                      type="number"
                      className="w-full glass-input text-xs"
                      value={editFormScores.certifications_count}
                      onChange={(e) => handleEditScoreChange('certifications_count', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-200/40 dark:border-slate-800/40">
                <button
                  type="button"
                  onClick={() => setEditingStudent(null)}
                  className="py-2 px-4 rounded-xl border border-slate-250 dark:border-slate-800 text-slate-500 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2 px-6 rounded-xl bg-sky-500 hover:bg-sky-655 text-white text-xs font-bold shadow-md shadow-sky-500/10"
                >
                  Save Metrics Override
                </button>
              </div>
            </form>
          </GlassCard>
        </div>
      )}

      {viewingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <GlassCard className="w-full max-w-4xl max-h-[85vh] overflow-y-auto space-y-6" glow heavy>
            <div className="flex justify-between items-center pb-4 border-b border-slate-200/40 dark:border-slate-800/40">
              <div>
                <h3 className="font-extrabold text-base text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  Student Detailed Record <BookOpen className="w-5 h-5 text-indigo-500" />
                </h3>
                {viewingDetails && (
                  <p className="text-[10px] text-slate-450 mt-1">
                    {viewingDetails.profile?.name} &bull; {viewingDetails.email} &bull; {viewingDetails.profile?.department} &bull; {viewingDetails.profile?.year}
                  </p>
                )}
              </div>
              <button 
                onClick={() => {
                  setViewingStudent(null);
                  setViewingDetails(null);
                }} 
                className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-900 text-slate-500 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {fetchingDetails ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-3">
                <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-slate-500 text-xs font-medium">Fetching comprehensive student log...</p>
              </div>
            ) : viewingDetails ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs text-slate-800 dark:text-slate-200">
                {/* Left Column: Academic & Skill Score details */}
                <div className="space-y-4">
                  {/* Readiness Banner */}
                  <div className="flex items-center justify-between p-4 rounded-xl bg-slate-100/30 dark:bg-slate-900/30 border border-slate-200/20">
                    <div>
                      <span className="block text-[10px] uppercase font-bold text-slate-455">Placement Readiness Score</span>
                      <span className="text-2xl font-extrabold text-indigo-500 dark:text-indigo-400">{viewingDetails.readiness_score.toFixed(1)}%</span>
                    </div>
                    <div>
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-extrabold border ${
                        viewingDetails.classification === 'Highly Placement Ready' ? 'bg-emerald-500/10 text-emerald-550 border-emerald-500/20' :
                        viewingDetails.classification === 'Placement Ready' ? 'bg-blue-500/10 text-blue-550 border-blue-500/20' :
                        viewingDetails.classification === 'Need Improvement' ? 'bg-amber-500/10 text-amber-550 border-amber-500/20' :
                        'bg-rose-500/10 text-rose-550 border-rose-500/20'
                      }`}>
                        {viewingDetails.classification}
                      </span>
                    </div>
                  </div>

                  {/* Skills Grid */}
                  <div className="space-y-3">
                    <h4 className="font-bold text-slate-500 uppercase tracking-wider text-[10px] pb-1 border-b border-slate-200/20">Skill Breakdowns</h4>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Aptitude section */}
                      <div className="space-y-2.5 p-3 rounded-xl bg-sky-500/5 border border-sky-500/10">
                        <span className="font-bold text-sky-500 block text-[10px] uppercase">Aptitude Skills</span>
                        <div className="space-y-1.5">
                          <div className="flex justify-between">
                            <span>Quantitative</span>
                            <span className="font-bold text-sky-500">{viewingDetails.scores?.quantitative}%</span>
                          </div>
                          <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                            <div className="bg-sky-500 h-full" style={{ width: `${viewingDetails.scores?.quantitative}%` }}></div>
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <div className="flex justify-between">
                            <span>Logical Reasoning</span>
                            <span className="font-bold text-sky-500">{viewingDetails.scores?.logical}%</span>
                          </div>
                          <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                            <div className="bg-sky-500 h-full" style={{ width: `${viewingDetails.scores?.logical}%` }}></div>
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <div className="flex justify-between">
                            <span>Verbal Ability</span>
                            <span className="font-bold text-sky-500">{viewingDetails.scores?.verbal}%</span>
                          </div>
                          <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                            <div className="bg-sky-500 h-full" style={{ width: `${viewingDetails.scores?.verbal}%` }}></div>
                          </div>
                        </div>
                      </div>

                      {/* Coding section */}
                      <div className="space-y-2.5 p-3 rounded-xl bg-indigo-500/5 border border-indigo-500/10">
                        <span className="font-bold text-indigo-500 block text-[10px] uppercase">Coding Skills</span>
                        <div className="space-y-1.5">
                          <div className="flex justify-between">
                            <span>Python</span>
                            <span className="font-bold text-indigo-500">{viewingDetails.scores?.python}%</span>
                          </div>
                          <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                            <div className="bg-indigo-500 h-full" style={{ width: `${viewingDetails.scores?.python}%` }}></div>
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <div className="flex justify-between">
                            <span>Java</span>
                            <span className="font-bold text-indigo-500">{viewingDetails.scores?.java}%</span>
                          </div>
                          <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                            <div className="bg-indigo-500 h-full" style={{ width: `${viewingDetails.scores?.java}%` }}></div>
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <div className="flex justify-between">
                            <span>SQL Databases</span>
                            <span className="font-bold text-indigo-500">{viewingDetails.scores?.sql}%</span>
                          </div>
                          <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                            <div className="bg-indigo-500 h-full" style={{ width: `${viewingDetails.scores?.sql}%` }}></div>
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <div className="flex justify-between">
                            <span>DSA Algorithms</span>
                            <span className="font-bold text-indigo-500">{viewingDetails.scores?.dsa}%</span>
                          </div>
                          <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                            <div className="bg-indigo-500 h-full" style={{ width: `${viewingDetails.scores?.dsa}%` }}></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Communication section */}
                      <div className="space-y-2.5 p-3 rounded-xl bg-pink-500/5 border border-pink-500/10">
                        <span className="font-bold text-pink-500 block text-[10px] uppercase">Soft Skills</span>
                        <div className="space-y-1.5">
                          <div className="flex justify-between">
                            <span>Speaking English</span>
                            <span className="font-bold text-pink-500">{viewingDetails.scores?.speaking}%</span>
                          </div>
                          <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                            <div className="bg-pink-500 h-full" style={{ width: `${viewingDetails.scores?.speaking}%` }}></div>
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <div className="flex justify-between">
                            <span>Presentations</span>
                            <span className="font-bold text-pink-500">{viewingDetails.scores?.presentation}%</span>
                          </div>
                          <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                            <div className="bg-pink-500 h-full" style={{ width: `${viewingDetails.scores?.presentation}%` }}></div>
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <div className="flex justify-between">
                            <span>Group Discussion</span>
                            <span className="font-bold text-pink-500">{viewingDetails.scores?.gd}%</span>
                          </div>
                          <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                            <div className="bg-pink-500 h-full" style={{ width: `${viewingDetails.scores?.gd}%` }}></div>
                          </div>
                        </div>
                      </div>

                      {/* Achievements section */}
                      <div className="space-y-4 p-3 rounded-xl bg-slate-100/30 dark:bg-slate-900/30 border border-slate-200/20">
                        <span className="font-bold text-slate-455 block text-[10px] uppercase">Achievements & Projects</span>
                        <div className="flex justify-between items-center p-2 rounded-lg bg-white/20 dark:bg-slate-950/20">
                          <span className="font-medium">Completed Projects:</span>
                          <span className="font-extrabold text-sm">{viewingDetails.scores?.projects_count}</span>
                        </div>
                        <div className="flex justify-between items-center p-2 rounded-lg bg-white/20 dark:bg-slate-950/20">
                          <span className="font-medium">Certifications Count:</span>
                          <span className="font-extrabold text-sm">{viewingDetails.scores?.certifications_count}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column: Applications tracker & Resume scans */}
                <div className="space-y-6">
                  {/* Job applications list */}
                  <div className="space-y-3">
                    <h4 className="font-bold text-slate-550 uppercase tracking-wider text-[10px] pb-1 border-b border-slate-200/20">
                      Placement Applications Tracker ({viewingDetails.applications.length})
                    </h4>
                    
                    {viewingDetails.applications.length === 0 ? (
                      <p className="text-slate-450 italic text-[10px] py-2">No companies applied to yet.</p>
                    ) : (
                      <div className="space-y-2 max-h-[18vh] overflow-y-auto pr-1">
                        {viewingDetails.applications.map((app) => (
                          <div key={app.id} className="flex justify-between items-center p-2.5 rounded-xl bg-slate-100/20 dark:bg-slate-900/20 border border-slate-200/10">
                            <div>
                              <span className="font-bold text-slate-800 dark:text-slate-250 block">{app.company_name}</span>
                              <span className="text-[10px] text-slate-400">{app.role} &bull; {app.package_lpa} LPA</span>
                            </div>
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                              app.status === 'Selected' ? 'bg-emerald-500/10 text-emerald-550 border-emerald-500/20' :
                              app.status === 'Rejected' ? 'bg-rose-500/10 text-rose-550 border-rose-500/20' :
                              'bg-indigo-500/10 text-indigo-550 border-indigo-500/20'
                            }`}>
                              {app.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Resume scan history */}
                  <div className="space-y-3">
                    <h4 className="font-bold text-slate-550 uppercase tracking-wider text-[10px] pb-1 border-b border-slate-200/20">
                      Resume Scan Reports ({viewingDetails.resumes.length})
                    </h4>
                    
                    {viewingDetails.resumes.length === 0 ? (
                      <p className="text-slate-450 italic text-[10px] py-2">No resumes scanned yet.</p>
                    ) : (
                      <div className="space-y-3 max-h-[30vh] overflow-y-auto pr-1">
                        {viewingDetails.resumes.map((res) => (
                          <div key={res.id} className="p-3 rounded-xl bg-slate-100/20 dark:bg-slate-900/20 border border-slate-200/10 space-y-2">
                            <div className="flex justify-between items-center">
                              <div>
                                <span className="font-bold block text-slate-850 dark:text-slate-100">{res.file_name}</span>
                                <span className="text-[9px] text-slate-400">Scanned on {res.scanned_at}</span>
                              </div>
                              <span className="font-bold text-sm text-indigo-550">{res.score}/100</span>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-2 text-[10px]">
                              <div className="p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                                <span className="font-bold text-emerald-600 block mb-1">Skills Found</span>
                                <p className="text-slate-500 leading-relaxed">{res.extracted_skills}</p>
                              </div>
                              <div className="p-2 rounded-lg bg-rose-500/5 border border-rose-500/10">
                                <span className="font-bold text-rose-550 block mb-1">Gaps / Missing</span>
                                <p className="text-slate-500 leading-relaxed">{res.skill_gap}</p>
                              </div>
                            </div>
                            
                            <div className="p-2 rounded-lg bg-slate-100/50 dark:bg-slate-900/40 text-[9px] leading-relaxed text-slate-500">
                              <span className="font-bold text-slate-450 block mb-0.5">Recommendations / Feedback:</span>
                              {res.feedback}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-center text-slate-400 text-xs py-6">Could not load details.</p>
            )}

            <div className="flex justify-end pt-4 border-t border-slate-200/40 dark:border-slate-800/40">
              <button 
                onClick={() => {
                  setViewingStudent(null);
                  setViewingDetails(null);
                }} 
                className="py-2 px-5 bg-slate-150 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200/30 dark:border-slate-800 rounded-xl font-bold transition-all text-xs"
              >
                Close Record
              </button>
            </div>
          </GlassCard>
        </div>
      )}

      {/* Company Criteria Configuration Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Register Company Requirements */}
        <div className="lg:col-span-1">
          <GlassCard className="space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-200/40 dark:border-slate-800/40">
              <h3 className="font-bold text-slate-800 dark:text-slate-150 text-sm">Configure Company Rules</h3>
              <button 
                onClick={() => setShowCompanyForm(!showCompanyForm)}
                className="p-1 rounded bg-sky-500/10 text-sky-500 hover:bg-sky-500/25 border border-sky-500/20"
              >
                {showCompanyForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              </button>
            </div>

            {showCompanyForm && (
              <form onSubmit={handleSaveCompany} className="space-y-4 text-xs animate-fade-in">
                <div>
                  <label className="block text-[10px] text-slate-450 font-bold mb-1.5">Company Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Wipro"
                    className="w-full glass-input py-1.5"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-slate-450 font-bold mb-1.5">Package Designation (LPA)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    placeholder="4.0"
                    className="w-full glass-input py-1.5"
                    value={companyLpa}
                    onChange={(e) => setCompanyLpa(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-slate-450 font-bold mb-1.5">Role Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Project Engineer"
                    className="w-full glass-input py-1.5"
                    value={companyRole}
                    onChange={(e) => setCompanyRole(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] text-slate-450 font-bold mb-1.5">Min CGPA</label>
                    <input
                      type="number"
                      step="0.1"
                      placeholder="6.0"
                      className="w-full glass-input py-1.5"
                      value={companyMinCgpa}
                      onChange={(e) => setCompanyMinCgpa(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-455 font-bold mb-1.5">Min Readiness %</label>
                    <input
                      type="number"
                      placeholder="55"
                      className="w-full glass-input py-1.5"
                      value={companyMinReadiness}
                      onChange={(e) => setCompanyMinReadiness(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] text-slate-455 font-bold mb-1.5">Description details</label>
                  <textarea
                    rows="2"
                    placeholder="Logical and debugging rounds..."
                    className="w-full glass-input py-1.5"
                    value={companyDetails}
                    onChange={(e) => setCompanyDetails(e.target.value)}
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-sky-500 hover:bg-sky-650 text-white font-bold rounded-lg shadow"
                >
                  Save Company Rule
                </button>
              </form>
            )}

            {!showCompanyForm && (
              <div className="flex gap-1.5 p-3.5 bg-slate-100/30 dark:bg-slate-900/30 border border-slate-200/25 dark:border-slate-800/20 rounded-xl text-slate-450 leading-relaxed text-[11px]">
                <BookOpen className="w-5 h-5 text-sky-500 flex-shrink-0" />
                <span>
                  Rules configured here directly regulate student eligibility outcomes inside the student dashboard checkers.
                </span>
              </div>
            )}
          </GlassCard>
        </div>

        {/* Right Side: Companies List with Delete Actions */}
        <div className="lg:col-span-2">
          <GlassCard className="space-y-4">
            <h3 className="font-bold text-slate-850 dark:text-slate-150 text-sm pb-2 border-b border-slate-200/40 dark:border-slate-800/40">Active Recruiter Rules ({companies.length})</h3>
            
            <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
              {companies.map(c => (
                <div
                  key={c.id}
                  className="p-3 rounded-xl bg-slate-100/30 dark:bg-slate-900/20 border border-slate-200/10 dark:border-slate-800/30 flex justify-between items-center text-xs"
                >
                  <div className="space-y-0.5">
                    <p className="font-bold text-slate-750 dark:text-slate-200">{c.name} &bull; <span className="text-indigo-500">{c.package_lpa} LPA</span></p>
                    <p className="text-[10px] text-slate-455">Designation: {c.role}</p>
                    <p className="text-[9px] text-slate-450">CGPA: {c.min_cgpa.toFixed(1)} | Score: {c.min_readiness_score}%</p>
                  </div>

                  <button
                    onClick={() => handleDeleteCompany(c.id)}
                    className="p-1 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors"
                    title="Delete Company Rule"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
