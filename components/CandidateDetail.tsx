import React, { useState } from 'react';
import { Candidate, CandidateStatus } from '../types';
import { EyeIcon, EyeSlashIcon, SparklesIcon, UserIcon } from './icons';

interface CandidateDetailProps {
  candidate: Candidate;
  onClose: () => void;
  onStatusChange: (candidateId: string, status: CandidateStatus) => void;
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

const CandidateDetail: React.FC<CandidateDetailProps> = ({ candidate, onClose, onStatusChange }) => {
  const [activeTab, setActiveTab] = useState('analysis');

  const TabButton: React.FC<{ tabName: string; label: string }> = ({ tabName, label }) => (
    <button
      onClick={() => setActiveTab(tabName)}
      className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${activeTab === tabName ? 'bg-white dark:bg-gray-700 border-indigo-500 border-b-2 text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
    >
      {label}
    </button>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-20 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-start">
          <div className="flex items-center space-x-4">
            <div className="bg-indigo-100 dark:bg-indigo-900 p-3 rounded-full">
              <UserIcon className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{candidate.name}</h2>
              <p className="text-gray-500 dark:text-gray-400">{candidate.role}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">&times;</button>
        </div>

        {/* Body */}
        <div className="flex-grow p-6 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left Panel */}
            <div className="md:col-span-1 space-y-6">
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Status</h3>
                 <select
                  value={candidate.status}
                  onChange={(e) => onStatusChange(candidate.id, e.target.value as CandidateStatus)}
                  className={`w-full p-2 rounded-md text-sm font-medium border-0 focus:ring-2 focus:ring-indigo-500 ${statusColors[candidate.status]}`}
                >
                  {Object.values(CandidateStatus).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              {candidate.recommendedAction && (
                <div className="bg-indigo-50 dark:bg-gray-700 p-4 rounded-lg border-l-4 border-indigo-500">
                    <div className="flex items-center space-x-2 mb-2">
                        <SparklesIcon className="w-5 h-5 text-indigo-500" />
                        <h3 className="font-semibold text-indigo-800 dark:text-indigo-300">Recommended Action</h3>
                    </div>
                    <p className="font-bold text-gray-800 dark:text-gray-200">{candidate.recommendedAction}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 italic">"{candidate.actionJustification}"</p>
                </div>
              )}
            </div>

            {/* Right Panel */}
            <div className="md:col-span-2">
              <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="-mb-px flex space-x-4" aria-label="Tabs">
                  <TabButton tabName="analysis" label="AI Analysis" />
                  <TabButton tabName="anonymized" label="Anonymized Resume" />
                  <TabButton tabName="original" label="Original Resume" />
                   <TabButton tabName="audit" label="Audit Log" />
                </nav>
              </div>
              <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg min-h-[300px]">
                {activeTab === 'analysis' && (
                   candidate.analysis ? (
                    <div className="space-y-4 text-gray-700 dark:text-gray-300">
                      <div>
                        <h4 className="font-bold text-gray-800 dark:text-gray-100">Summary</h4>
                        <p>{candidate.analysis.summary}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                            <h4 className="font-bold text-gray-800 dark:text-gray-100">AI Fit Score</h4>
                            <p className="text-2xl font-mono">{candidate.analysis.fitScore}/10</p>
                        </div>
                         {candidate.skillCheckScore !== undefined && (
                            <div>
                                <h4 className="font-bold text-gray-800 dark:text-gray-100">Skill Check Score</h4>
                                <p className={`text-2xl font-mono ${candidate.skillCheckScore >= 70 ? 'text-green-500' : 'text-red-500'}`}>{candidate.skillCheckScore}%</p>
                            </div>
                         )}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-800 dark:text-gray-100">Skills</h4>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {candidate.analysis.skills.map(skill => <span key={skill} className="bg-indigo-100 text-indigo-800 text-xs font-medium px-2.5 py-0.5 rounded-full dark:bg-indigo-900 dark:text-indigo-300">{skill}</span>)}
                        </div>
                      </div>
                    </div>
                  ) : <p>No AI analysis available.</p>
                )}
                {activeTab === 'anonymized' && (
                  <pre className="whitespace-pre-wrap font-mono text-sm text-gray-600 dark:text-gray-400">{candidate.anonymizedResumeText || "Not available."}</pre>
                )}
                {activeTab === 'original' && (
                   <pre className="whitespace-pre-wrap font-mono text-sm text-gray-600 dark:text-gray-400">{candidate.resumeText || "Not available."}</pre>
                )}
                 {activeTab === 'audit' && (
                    <ul className="space-y-2">
                        {candidate.auditLog.map((log, index) => (
                            <li key={index} className="text-sm text-gray-600 dark:text-gray-400">
                                <span className="font-mono text-gray-500">{new Date(log.timestamp).toLocaleString()}:</span> <span className="font-semibold text-gray-800 dark:text-gray-200">{log.action}</span> - {log.details}
                            </li>
                        ))}
                    </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


export default CandidateDetail;