import React, { useState } from 'react';
import Header from './components/Header';
import RecruiterDashboard from './components/RecruiterDashboard';
import CandidatePortal from './components/CandidatePortal';
import LoginPage from './components/LoginPage';
import { View, Candidate, CandidateStatus, AuditLogEntry } from './types';
import { extractTextFromImages } from './services/geminiService';

const initialCandidates: Candidate[] = [
  {
    id: 'cand-1',
    name: 'Candidate 1',
    email: 'candidate.1@example.com',
    role: 'Senior React Developer',
    status: CandidateStatus.Interviewing,
    appliedDate: '2023-10-25',
    resumeText: 'Full resume text for Candidate 1...',
    anonymizedResumeText: 'Anonymized resume text for Candidate 1...',
    analysis: {
      summary: 'Experienced developer with a strong background in React and TypeScript.',
      skills: ['React', 'TypeScript', 'Node.js', 'Jest'],
      experienceYears: 7,
      education: ['BSc Computer Science'],
      fitScore: 8,
      workHistory: [
        {
          company: 'Tech Solutions Inc.',
          title: 'Senior Frontend Developer',
          startDate: '2020-01',
          endDate: 'Present',
          description: 'Led the development of a new client-facing dashboard using React, Redux, and TypeScript, improving user engagement by 25%.',
          industry: 'Tech'
        },
        {
          company: 'Web Innovators',
          title: 'Frontend Developer',
          startDate: '2017-06',
          endDate: '2019-12',
          description: 'Developed and maintained reusable UI components for a large-scale e-commerce platform.',
          industry: 'Tech'
        }
      ],
    },
    recommendedAction: 'Proceed to final interview',
    actionJustification: 'Excellent technical skills and strong cultural fit demonstrated in the first round.',
    auditLog: [{ timestamp: new Date().toISOString(), action: 'Initial Entry', details: 'Candidate added' }]
  },
   {
    id: 'cand-2',
    name: 'Candidate 2',
    email: 'candidate.2@example.com',
    role: 'UX/UI Designer',
    status: CandidateStatus.Shortlisted,
    appliedDate: '2023-10-22',
    resumeText: 'Full resume text for Candidate 2...',
    anonymizedResumeText: 'Anonymized resume text for Candidate 2...',
    analysis: {
      summary: 'Creative designer with a portfolio showcasing modern, user-centric designs.',
      skills: ['Figma', 'Sketch', 'Adobe XD', 'User Research'],
      experienceYears: 5,
      education: ['MFA in Design'],
      fitScore: 9,
      workHistory: [
        {
            company: 'Digital Canvas',
            title: 'Lead UX/UI Designer',
            startDate: '2019-03',
            endDate: 'Present',
            description: 'Oversaw the design lifecycle for multiple mobile and web applications, from user research and wireframing to high-fidelity prototypes and user testing.',
            industry: 'Design'
        },
        {
            company: 'Creative Agency',
            title: 'UI Designer',
            startDate: '2017-01',
            endDate: '2019-02',
            description: 'Created visually appealing interfaces for various client websites and marketing materials.',
            industry: 'Creative Agency'
        }
      ],
    },
    recommendedAction: 'Shortlist for Interview',
    actionJustification: 'Portfolio aligns perfectly with our brand aesthetics and user experience goals.',
    auditLog: [{ timestamp: new Date().toISOString(), action: 'Initial Entry', details: 'Candidate added' }]
  },
  {
    id: 'cand-3',
    name: 'Candidate 3',
    email: 'candidate.3@example.com',
    role: 'Senior React Developer',
    status: CandidateStatus.New,
    appliedDate: '2023-10-28',
    analysis: null, // Starts with no analysis
    resumeText: undefined, // Starts with no resume
    recommendedAction: null,
    actionJustification: null,
    auditLog: [{ timestamp: new Date().toISOString(), action: 'Initial Entry', details: 'Candidate added, awaiting resume.' }]
  },
  {
    id: 'cand-4',
    name: 'Candidate 4',
    email: 'candidate.4@example.com',
    role: 'Data Scientist',
    status: CandidateStatus.SkillCheckCompleted,
    appliedDate: '2023-10-26',
    resumeText: 'Data Scientist with 4 years of experience specializing in predictive modeling and machine learning. Proficient in Python, R, and SQL.',
    anonymizedResumeText: 'Anonymized resume for Data Scientist.',
    analysis: {
      summary: 'Data scientist with expertise in machine learning and Python.',
      skills: ['Python', 'TensorFlow', 'scikit-learn', 'SQL'],
      experienceYears: 4,
      education: ['PhD in Machine Learning'],
      fitScore: 9,
      workHistory: [
        {
          company: 'Data Insights Corp',
          title: 'Data Scientist',
          startDate: '2020-07',
          endDate: 'Present',
          description: 'Developed predictive models for customer churn.',
          industry: 'Tech'
        }
      ],
    },
    skillCheckScore: 92,
    skillCheckDetails: {
        summary: "Excellent grasp of statistical modeling and data visualization.",
        strengths: ["Python (Pandas, NumPy)", "SQL", "Predictive Modeling"],
        areasForImprovement: ["Cloud Deployment (AWS SageMaker)"]
    },
    recommendedAction: 'Shortlist for Interview',
    actionJustification: 'High skill check score and relevant project experience.',
    auditLog: [{ timestamp: new Date().toISOString(), action: 'Initial Entry', details: 'Candidate added' }]
  },
  {
    id: 'cand-5',
    name: 'Candidate 5',
    email: 'candidate.5@example.com',
    role: 'Product Manager',
    status: CandidateStatus.Rejected,
    appliedDate: '2023-10-21',
    resumeText: 'Product Manager with a background in B2B SaaS products. Experienced in agile methodologies and market analysis.',
    anonymizedResumeText: 'Anonymized resume for Product Manager.',
    analysis: {
      summary: 'Product manager with a background in marketing.',
      skills: ['Agile', 'Roadmapping', 'Market Research'],
      experienceYears: 6,
      education: ['MBA'],
      fitScore: 4,
      workHistory: [
        {
          company: 'MarketPro',
          title: 'Product Manager',
          startDate: '2018-02',
          endDate: 'Present',
          description: 'Managed a suite of marketing analytics products.',
          industry: 'Finance'
        }
      ],
    },
    recommendedAction: 'Reject',
    actionJustification: 'Experience is not aligned with our technical product needs.',
    auditLog: [{ timestamp: new Date().toISOString(), action: 'Initial Entry', details: 'Candidate added' }]
  },
  {
    id: 'cand-6',
    name: 'Candidate 6',
    email: 'candidate.6@example.com',
    role: 'Full Stack Developer',
    status: CandidateStatus.SkillCheckPending,
    appliedDate: '2023-10-29',
    resumeText: 'Versatile Full Stack Developer with 5 years of experience in building and maintaining web applications using Node.js and Vue.js.',
    anonymizedResumeText: 'Anonymized resume for Full Stack Developer.',
    analysis: {
      summary: 'Versatile full stack developer with experience in Node.js and Vue.js.',
      skills: ['Node.js', 'Vue.js', 'MongoDB', 'Docker'],
      experienceYears: 5,
      education: ['BSc in Software Engineering'],
      fitScore: 7,
      workHistory: [
        {
          company: 'AppCrafters',
          title: 'Full Stack Developer',
          startDate: '2019-01',
          endDate: 'Present',
          description: 'Built and maintained microservices for a SaaS application.',
          industry: 'Tech'
        }
      ],
    },
    recommendedAction: 'Request Skill Check',
    actionJustification: 'Solid background, skill check needed to verify proficiency.',
    auditLog: [{ timestamp: new Date().toISOString(), action: 'Initial Entry', details: 'Candidate added' }]
  },
  {
    id: 'cand-7',
    name: 'Candidate 7',
    email: 'candidate.7@example.com',
    role: 'DevOps Engineer',
    status: CandidateStatus.New,
    appliedDate: '2023-10-30',
    resumeText: 'Experienced DevOps engineer with a focus on CI/CD pipelines and cloud infrastructure management. Proficient in AWS, Kubernetes, and Terraform.',
    analysis: null,
    recommendedAction: null,
    actionJustification: null,
    auditLog: [{ timestamp: new Date().toISOString(), action: 'Initial Entry', details: 'Candidate added' }]
  },
  {
    id: 'cand-8',
    name: 'Candidate 8',
    email: 'candidate.8@example.com',
    role: 'Junior Frontend Developer',
    status: CandidateStatus.Hired,
    appliedDate: '2023-10-15',
    resumeText: 'Enthusiastic junior developer with a passion for creating beautiful and responsive user interfaces. Skilled in React and modern CSS.',
    anonymizedResumeText: 'Anonymized resume for Junior Frontend Developer.',
    analysis: {
      summary: 'Enthusiastic junior developer with a great portfolio of personal projects.',
      skills: ['HTML', 'CSS', 'JavaScript', 'React'],
      experienceYears: 1,
      education: ['Coding Bootcamp Certificate'],
      fitScore: 8,
      workHistory: [
        {
          company: 'Internship at Web Widgets',
          title: 'Frontend Intern',
          startDate: '2023-06',
          endDate: '2023-09',
          description: 'Assisted in building UI components and fixing bugs.',
          industry: 'Tech'
        }
      ],
    },
    recommendedAction: 'Hire',
    actionJustification: 'Strong potential, positive interviews, and a great cultural fit.',
    auditLog: [{ timestamp: new Date().toISOString(), action: 'Initial Entry', details: 'Candidate added' }]
  }
];

function App() {
  const [loggedInUser, setLoggedInUser] = useState<{ type: 'recruiter' | 'candidate'; identifier: string } | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>(initialCandidates);

  const handleSendSkillCheck = (candidateId: string) => {
    setCandidates(prev => prev.map(c => 
      c.id === candidateId ? {
        ...c,
        status: CandidateStatus.SkillCheckPending,
        auditLog: [...c.auditLog, { timestamp: new Date().toISOString(), action: 'Skill Check Sent', details: 'Recruiter initiated skill check.' }]
      } : c
    ));
  };

  const handleResumeUpload = async (candidateId: string, resumeData: { text?: string; images?: { mimeType: string; data: string }[] }) => {
    let resumeText = resumeData.text;

    // If we received images, use Gemini to extract text from them.
    if (resumeData.images && resumeData.images.length > 0) {
        try {
            resumeText = await extractTextFromImages(resumeData.images);
        } catch (error) {
            console.error("Failed to extract text from resume images:", error);
            resumeText = "Error: Could not extract text from the provided document. The file might be image-based or corrupted.";
        }
    }

    setCandidates(prev => prev.map(c =>
        c.id === candidateId ? {
            ...c,
            resumeText: resumeText,
            resumeImages: resumeData.images, // Store the images for multimodal analysis
            auditLog: [...c.auditLog, { timestamp: new Date().toISOString(), action: 'Resume Uploaded', details: 'Candidate uploaded their resume.' }]
        } : c
    ));
  };

  const handleLogin = (userType: 'recruiter' | 'candidate', identifier: string) => {
    setLoggedInUser({ type: userType, identifier });
  };

  const handleLogout = () => {
    setLoggedInUser(null);
  };

  if (!loggedInUser) {
    return <LoginPage onLogin={handleLogin} candidates={candidates} />;
  }
  
  const currentCandidate = loggedInUser.type === 'candidate' 
    ? candidates.find(c => c.email === loggedInUser.identifier) 
    : null;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans">
      <Header onLogout={handleLogout} />
      <main>
        {loggedInUser.type === 'recruiter' ? (
          <RecruiterDashboard 
            candidates={candidates} 
            setCandidates={setCandidates}
            onSendSkillCheck={handleSendSkillCheck}
          />
        ) : (
          currentCandidate ? (
            <CandidatePortal 
              candidate={currentCandidate}
              setCandidates={setCandidates}
              onResumeUpload={handleResumeUpload}
            />
          ) : (
            <div className="container mx-auto p-8 text-center">
              <p className="text-red-500">Error: Could not find candidate data.</p>
            </div>
          )
        )}
      </main>
    </div>
  );
}

export default App;
