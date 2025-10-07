import React, { useState } from 'react';
import Header from './components/Header';
import RecruiterDashboard from './components/RecruiterDashboard';
import CandidatePortal from './components/CandidatePortal';
import { View, Candidate, CandidateStatus, AuditLogEntry } from './types';

const initialCandidates: Candidate[] = [
  {
    id: 'cand-1',
    name: 'John Smith',
    email: 'john.smith@example.com',
    role: 'Senior React Developer',
    status: CandidateStatus.Interviewing,
    appliedDate: '2023-10-25',
    analysis: {
      summary: 'Experienced developer with a strong background in React and TypeScript.',
      skills: ['React', 'TypeScript', 'Node.js', 'Jest'],
      experienceYears: 7,
      education: ['BSc Computer Science'],
      fitScore: 8,
    },
    recommendedAction: 'Proceed to final interview',
    actionJustification: 'Excellent technical skills and strong cultural fit demonstrated in the first round.',
    auditLog: [{ timestamp: new Date().toISOString(), action: 'Initial Entry', details: 'Candidate added manually' }]
  },
   {
    id: 'cand-2',
    name: 'Maria Garcia',
    email: 'maria.g@example.com',
    role: 'UX/UI Designer',
    status: CandidateStatus.Shortlisted,
    appliedDate: '2023-10-22',
    analysis: {
      summary: 'Creative designer with a portfolio showcasing modern, user-centric designs.',
      skills: ['Figma', 'Sketch', 'Adobe XD', 'User Research'],
      experienceYears: 5,
      education: ['MFA in Design'],
      fitScore: 9,
    },
    recommendedAction: 'Shortlist for Interview',
    actionJustification: 'Portfolio aligns perfectly with our brand aesthetics and user experience goals.',
    auditLog: [{ timestamp: new Date().toISOString(), action: 'Initial Entry', details: 'Candidate added manually' }]
  },
  {
    id: 'cand-3',
    name: 'Chen Wei',
    email: 'chen.wei@example.com',
    role: 'Senior React Developer',
    status: CandidateStatus.New,
    appliedDate: '2023-10-28',
    analysis: {
      summary: 'Promising junior developer with hands-on experience in modern frontend frameworks.',
      skills: ['React', 'JavaScript', 'CSS', 'HTML'],
      experienceYears: 2,
      education: ['Coding Bootcamp Certificate'],
      fitScore: 7,
    },
    recommendedAction: 'Request Skill Check',
    actionJustification: 'Good foundational skills but lacks senior-level experience; a skill check would clarify technical depth.',
    auditLog: [{ timestamp: new Date().toISOString(), action: 'Initial Entry', details: 'Candidate added manually' }]
  }
];

function App() {
  const [currentView, setCurrentView] = useState<View>(View.Recruiter);
  const [candidates, setCandidates] = useState<Candidate[]>(initialCandidates);

  const handleSendSkillCheck = (candidateId: string) => {
    setCandidates(prev => prev.map(c => 
      c.id === candidateId ? {
        ...c,
        status: CandidateStatus.SkillCheckPending,
        auditLog: [...c.auditLog, { timestamp: new Date().toISOString(), action: 'Skill Check Sent', details: 'Recruiter initiated skill check.' }]
      } : c
    ));
    // Switch to candidate view to simulate the next step in the workflow
    setCurrentView(View.Candidate);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans">
      <Header currentView={currentView} setCurrentView={setCurrentView} />
      <main>
        {currentView === View.Recruiter ? (
          <RecruiterDashboard 
            candidates={candidates} 
            setCandidates={setCandidates}
            onSendSkillCheck={handleSendSkillCheck}
          />
        ) : (
          <CandidatePortal 
            candidates={candidates}
            setCandidates={setCandidates}
          />
        )}
      </main>
    </div>
  );
}

export default App;