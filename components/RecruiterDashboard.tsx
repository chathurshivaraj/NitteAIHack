import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Candidate, CandidateStatus } from '../types';
import { analyzeResume, generateAnonymizedResume } from '../services/geminiService';
import CandidateDetail from './CandidateDetail';
import Spinner from './Spinner';
import { UploadIcon } from './icons';

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

const RecruiterDashboard: React.FC<RecruiterDashboardProps> = ({ candidates, setCandidates, onSendSkillCheck }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [jobRole, setJobRole] = useState('Senior React Developer');

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setIsProcessing(true);
    setError(null);

    try {
      const resumeText = await file.text();
      // Assuming PDF/DOCX parsing is handled by a library that extracts text.
      // For simplicity, this example will work best with .txt files.
      const analysisResult = await analyzeResume(resumeText, jobRole);
      const anonymizedResume = await generateAnonymizedResume(resumeText);
      
      const newCandidate: Candidate = {
        id: `cand-${Date.now()}`,
        name: `Candidate ${candidates.length + 1}`, // Anonymized until recruiter fills it in
        email: 'tbd@example.com',
        role: jobRole,
        status: CandidateStatus.New,
        appliedDate: new Date().toISOString().split('T')[0],
        analysis: {
            summary: analysisResult.summary,
            skills: analysisResult.skills,
            experienceYears: analysisResult.experienceYears,
            education: analysisResult.education,
            fitScore: analysisResult.fitScore
        },
        resumeText: resumeText,
        anonymizedResumeText: anonymizedResume,
        recommendedAction: analysisResult.recommendedAction,
        actionJustification: analysisResult.actionJustification,
        auditLog: [{ timestamp: new Date().toISOString(), action: 'Resume Uploaded', details: `AI analysis completed for ${jobRole} role.` }]
      };
      
      setCandidates(prev => [newCandidate, ...prev]);

    } catch (err) {
      console.error(err);
      setError("Failed to analyze resume. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  }, [jobRole, setCandidates, candidates.length]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 
        'text/plain': ['.txt'], 
        // Note: Parsing .pdf and .docx to text would require additional libraries.
        // This example handles .txt files correctly.
    },
    maxFiles: 1,
    multiple: false,
  });

  const handleStatusChange = (candidateId: string, status: CandidateStatus) => {
      setCandidates(prev => prev.map(c => c.id === candidateId ? { 
          ...c, 
          status,
          auditLog: [...c.auditLog, { timestamp: new Date().toISOString(), action: 'Status Changed', details: `Status updated to ${status}` }]
        } : c));
      setSelectedCandidate(prev => prev && prev.id === candidateId ? { ...prev, status } : prev);
  };


  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      {/* Upload Section */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-2">Analyze a New Candidate</h2>
        <div className="flex items-center space-x-4 mb-4">
            <label htmlFor="jobRole" className="font-medium">Applying for role:</label>
            <input 
                type="text" 
                id="jobRole"
                value={jobRole}
                onChange={(e) => setJobRole(e.target.value)}
                className="p-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500"
            />
        </div>
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
            isDragActive ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/50' : 'border-gray-300 dark:border-gray-600 hover:border-indigo-500'
          }`}
        >
          <input {...getInputProps()} />
          {isProcessing ? (
            <div className="flex flex-col items-center">
              <Spinner />
              <p className="mt-2 text-gray-600 dark:text-gray-400">Analyzing resume...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <UploadIcon className="w-12 h-12 text-gray-400 mb-2" />
              <p className="text-gray-600 dark:text-gray-400">
                {isDragActive ? 'Drop the resume here...' : 'Drag & drop a resume here, or click to select a file'}
              </p>
              <p className="text-xs text-gray-500">.txt supported</p>
            </div>
          )}
        </div>
        {error && <p className="text-red-500 mt-4">{error}</p>}
      </div>

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
                    <td className="px-6 py-4 space-x-2">
                        <button onClick={() => setSelectedCandidate(candidate)} className="font-medium text-indigo-600 dark:text-indigo-500 hover:underline">View</button>
                        {(candidate.status === CandidateStatus.New || (candidate.recommendedAction === 'Request Skill Check' && candidate.status !== CandidateStatus.SkillCheckPending && candidate.status !== CandidateStatus.SkillCheckCompleted)) && (
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
    </div>
  );
};

export default RecruiterDashboard;
