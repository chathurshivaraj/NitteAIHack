import React, { useState, useCallback } from 'react';
import { Candidate, CandidateStatus } from '../types';
import { analyzeResume, generateAnonymizedResume } from '../services/geminiService';
import CandidateDetail from './CandidateDetail';
import Spinner from './Spinner';
import Toast from './Toast';
import EmailNotificationModal from './EmailNotificationModal';
import { SparklesIcon } from './icons';
import StatisticsDashboard from './StatisticsDashboard';

interface RecruiterDashboardProps {
  candidates: Candidate[];
  setCandidates: React.Dispatch<React.SetStateAction<Candidate[]>>;
  onSendSkillCheck: (candidateId: string) => void;
}

const statusColors: { [key in CandidateStatus]: string } = {
  [CandidateStatus.New]: "bg-blue-100 text-blue-800",
  [CandidateStatus.SkillCheckPending]: "bg-orange-100 text-orange-800",
  [CandidateStatus.SkillCheckCompleted]: "bg-teal-100 text-teal-800",
  [CandidateStatus.Shortlisted]: "bg-yellow-100 text-yellow-800",
  [CandidateStatus.Interviewing]: "bg-purple-100 text-purple-800",
  [CandidateStatus.Hired]: "bg-green-100 text-green-800",
  [CandidateStatus.Rejected]: "bg-red-100 text-red-800",
};

type NotificationInfo = {
    candidate: Candidate;
    status: CandidateStatus;
};

const RecruiterDashboard: React.FC<RecruiterDashboardProps> = ({ candidates, setCandidates, onSendSkillCheck }) => {
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [notificationInfo, setNotificationInfo] = useState<NotificationInfo | null>(null);
  const [toastMessage, setToastMessage] = useState<string>('');

  const handleAnalyze = async (candidateId: string) => {
    setAnalyzingId(candidateId);
    const candidate = candidates.find(c => c.id === candidateId);
    if (!candidate || (!candidate.resumeText && !candidate.resumeImages)) {
        setToastMessage('Cannot analyze: Resume data is missing.');
        setAnalyzingId(null);
        return;
    }

    try {
        // Prefer using multimodal analysis with images if they exist, otherwise fall back to text.
        const resumeInput = candidate.resumeImages && candidate.resumeImages.length > 0
            ? { images: candidate.resumeImages }
            : { text: candidate.resumeText! }; // The check above guarantees one of them exists.

        const analysisResult = await analyzeResume(candidate.role, resumeInput);
        
        // The resumeText is required for anonymization and is guaranteed to be extracted even from images.
        const anonymizedResume = await generateAnonymizedResume(candidate.resumeText!);
        
        setCandidates(prev => prev.map(c => 
            c.id === candidateId ? {
                ...c,
                analysis: {
                    summary: analysisResult.summary,
                    skills: analysisResult.skills,
                    experienceYears: analysisResult.experienceYears,
                    education: analysisResult.education,
                    fitScore: analysisResult.fitScore,
                    workHistory: analysisResult.workHistory,
                },
                anonymizedResumeText: anonymizedResume,
                recommendedAction: analysisResult.recommendedAction,
                actionJustification: analysisResult.actionJustification,
                auditLog: [...c.auditLog, { timestamp: new Date().toISOString(), action: 'Resume Analyzed', details: `AI analysis completed by recruiter.` }]
            } : c
        ));
        setToastMessage(`Analysis complete for ${candidate.name}!`);
    } catch (err) {
        console.error("Analysis failed:", err);
        setToastMessage(`Analysis failed for ${candidate.name}.`);
    } finally {
        setAnalyzingId(null);
    }
  };

  const handleStatusChange = (candidateId: string, status: CandidateStatus) => {
      const candidate = candidates.find(c => c.id === candidateId);
      if(candidate) {
        setNotificationInfo({ candidate, status });
      }
  };

  const handleSendNotification = (subject: string, body: string) => {
    if (!notificationInfo) return;

    const { candidate, status } = notificationInfo;

    console.log(`Email sent to ${candidate.email}`, { subject, body });

    setCandidates(prev => prev.map(c => c.id === candidate.id ? { 
        ...c, 
        status,
        auditLog: [
            ...c.auditLog, 
            { timestamp: new Date().toISOString(), action: 'Status Changed', details: `Status updated to ${status}` },
            { timestamp: new Date().toISOString(), action: 'Email Sent', details: `Status update email sent to candidate.` }
        ]
      } : c));
      
    setSelectedCandidate(prev => prev && prev.id === candidate.id ? { ...prev, status } : prev);
    setToastMessage(`Email sent to ${candidate.name}!`);
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage('')} />}

      <StatisticsDashboard candidates={candidates} />
      
      {/* Candidates List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
            <h2 className="text-xl font-semibold">Candidate Pipeline</h2>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                <tr>
                    <th scope="col" className="px-6 py-3">Candidate</th>
                    <th scope="col" className="px-6 py-3">Role</th>
                    <th scope="col" className="px-6 py-3">Fit Score</th>
                    <th scope="col" className="px-6 py-3">Status</th>
                    <th scope="col" className="px-6 py-3">Action</th>
                </tr>
            </thead>
            <tbody>
                {candidates.map(candidate => (
                <tr key={candidate.id} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                    <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                        {candidate.name}
                    </th>
                    <td className="px-6 py-4">{candidate.role}</td>
                    <td className="px-6 py-4">
                        <span className="font-mono">{candidate.analysis?.fitScore || 'N/A'}/10</span>
                    </td>
                    <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[candidate.status]}`}>
                            {candidate.status}
                        </span>
                    </td>
                    <td className="px-6 py-4 space-x-2 whitespace-nowrap">
                        <button onClick={() => setSelectedCandidate(candidate)} className="font-medium text-indigo-600 dark:text-indigo-500 hover:underline">View</button>
                        
                        {(candidate.resumeText || candidate.resumeImages) && !candidate.analysis && (
                             <button 
                                onClick={() => handleAnalyze(candidate.id)} 
                                disabled={analyzingId === candidate.id} 
                                className="inline-flex items-center font-medium text-blue-600 dark:text-blue-500 hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {analyzingId === candidate.id ? <Spinner size="sm" /> : <SparklesIcon className="w-4 h-4 mr-1" />}
                                {analyzingId === candidate.id ? 'Analyzing...' : 'Analyze'}
                            </button>
                        )}

                        {candidate.analysis && (candidate.status === CandidateStatus.New || (candidate.recommendedAction === 'Request Skill Check' && candidate.status !== CandidateStatus.SkillCheckPending && candidate.status !== CandidateStatus.SkillCheckCompleted)) && (
                            <button onClick={() => onSendSkillCheck(candidate.id)} className="font-medium text-green-600 dark:text-green-500 hover:underline">Send Skill Check</button>
                        )}
                    </td>
                </tr>
                ))}
            </tbody>
            </table>
        </div>
      </div>
      {selectedCandidate && (
        <CandidateDetail 
            candidate={selectedCandidate}
            onClose={() => setSelectedCandidate(null)}
            onStatusChange={handleStatusChange}
        />
      )}
      {notificationInfo && (
        <EmailNotificationModal 
            candidate={notificationInfo.candidate}
            newStatus={notificationInfo.status}
            onSend={handleSendNotification}
            onClose={() => setNotificationInfo(null)}
        />
      )}
    </div>
  );
};

export default RecruiterDashboard;
