import React, { useState, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import * as pdfjsLib from 'pdfjs-dist/build/pdf.mjs';
import mammoth from 'mammoth';
import { Candidate, CandidateStatus, CompanyPerk } from '../types';
import ApplicationStatusTracker from './ApplicationStatusTracker';
import { generateCompanyPerks } from '../services/geminiService';
import Spinner from './Spinner';
import { TrophyIcon, GiftIcon, ClipboardDocumentCheckIcon, ChatBubbleLeftRightIcon, UploadIcon, CheckCircleIcon } from './icons';

// Configure the worker for pdfjs-dist.
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://aistudiocdn.com/pdfjs-dist@^4.5.136/build/pdf.worker.mjs';


interface CandidatePortalProps {
  candidate: Candidate;
  setCandidates: React.Dispatch<React.SetStateAction<Candidate[]>>;
  onResumeUpload: (candidateId: string, resumeData: { text?: string; images?: { mimeType: string; data: string }[] }) => void;
}

const CandidatePortal: React.FC<CandidatePortalProps> = ({ candidate, setCandidates, onResumeUpload }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('Uploading resume...');
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setIsProcessing(true);
    setError(null);

    try {
      let resumeData: { text?: string; images?: { mimeType: string; data: string }[] } = {};

      if (file.type === 'application/pdf') {
        setProcessingStatus('Processing PDF...');
        const buffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument(buffer).promise;
        const images: { mimeType: string; data: string }[] = [];
        
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');

        if (!context) {
            throw new Error("Could not create canvas context for PDF rendering.");
        }

        for (let i = 1; i <= pdf.numPages; i++) {
          setProcessingStatus(`Rendering page ${i}/${pdf.numPages}...`);
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 2.0 }); // Higher scale for better quality
          canvas.height = viewport.height;
          canvas.width = viewport.width;
          
          const renderContext = { canvasContext: context, viewport: viewport };
          await page.render(renderContext).promise;
          
          const imageDataUrl = canvas.toDataURL('image/jpeg', 0.92);
          images.push({
              mimeType: 'image/jpeg',
              data: imageDataUrl.split(',')[1] // Remove the data URL prefix
          });
        }
        
        canvas.remove();

        if (images.length === 0) {
            throw new Error("Could not render any pages from the PDF. The file might be corrupted.");
        }
        resumeData = { images };
      } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        setProcessingStatus('Processing document...');
        const buffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer: buffer });
        const resumeText = result.value;
        if (!resumeText || !resumeText.trim()) {
            throw new Error("Could not extract text from the document. The file might be empty or contain only images.");
        }
        resumeData = { text: resumeText };
      } else {
        setProcessingStatus('Reading file...');
        const resumeText = await file.text();
         if (!resumeText || !resumeText.trim()) {
            throw new Error("Could not extract text from the document. The file might be empty.");
        }
        resumeData = { text: resumeText };
      }
      
      onResumeUpload(candidate.id, resumeData);

    } catch (err) {
      console.error(err);
      const message = err instanceof Error ? err.message : "Failed to parse resume. Please try a different file.";
      setError(message);
    } finally {
      setIsProcessing(false);
      setProcessingStatus('Uploading resume...');
    }
  }, [candidate.id, onResumeUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 
        'text/plain': ['.txt'],
        'application/pdf': ['.pdf'],
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    maxFiles: 1,
    multiple: false,
  });

  const handleCompleteSkillCheck = (candidateId: string) => {
    // Simulate taking and passing a skill check after a delay
    setTimeout(() => {
        setCandidates(prev => prev.map(c => 
            c.id === candidateId ? {
                ...c,
                status: CandidateStatus.SkillCheckCompleted,
                skillCheckScore: Math.floor(Math.random() * (98 - 75 + 1) + 75), // Random score between 75-98
                skillCheckDetails: {
                  summary: "Candidate demonstrates strong proficiency in core React concepts and state management, but could improve on advanced testing methodologies.",
                  strengths: ["Component Lifecycle", "Hooks (useState, useEffect)", "Redux State Management"],
                  areasForImprovement: ["React Testing Library", "Mock Service Worker"]
                },
                auditLog: [...c.auditLog, { timestamp: new Date().toISOString(), action: 'Skill Check Completed', details: 'Candidate completed the skill check.' }]
            } : c
        ));
    }, 2000);
  };

  const [perks, setPerks] = useState<CompanyPerk[]>([]);
  const [isLoadingPerks, setIsLoadingPerks] = useState(true);

  useEffect(() => {
    if (candidate) {
        setIsLoadingPerks(true);
        generateCompanyPerks(candidate.role)
            .then(setPerks)
            .catch(err => {
                console.error("Failed to fetch company perks:", err);
                // Set some default perks on error to ensure a good user experience
                setPerks([
                    { icon: 'Trophy', title: 'Great Company Culture', description: 'Join a collaborative and innovative team.' },
                    { icon: 'Gift', title: 'Competitive Compensation', description: 'We value your skills with a great salary and benefits.' },
                    { icon: 'ClipboardDocumentCheck', title: 'Health & Wellness', description: 'Comprehensive health plans to keep you well.' },
                    { icon: 'ChatBubbleLeftRight', title: 'Career Growth', description: 'Opportunities for learning and professional development.' },
                ]);
            })
            .finally(() => setIsLoadingPerks(false));
    }
  }, [candidate]);

  const perkIcons: { [key: string]: React.FC<React.SVGProps<SVGSVGElement>> } = {
    Trophy: TrophyIcon,
    Gift: GiftIcon,
    ClipboardDocumentCheck: ClipboardDocumentCheckIcon,
    ChatBubbleLeftRight: ChatBubbleLeftRightIcon,
  };


  if (!candidate) {
      return (
          <div className="container mx-auto p-4 sm:p-6 lg:p-8 text-center">
              <h1 className="text-2xl font-bold mb-4">Candidate Portal</h1>
              <p>Could not load your application data.</p>
          </div>
      )
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8">
        <h1 className="text-2xl font-bold mb-1">Hello, {candidate.name}!</h1>
        <p className="text-gray-600 dark:text-gray-400">You have applied for the <span className="font-semibold">{candidate.role}</span> position.</p>
      </div>

      <ApplicationStatusTracker currentStatus={candidate.status} />
      
      {!candidate.resumeText && !candidate.resumeImages ? (
        <div className="mt-8 bg-yellow-50 dark:bg-gray-700/50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold text-yellow-800 dark:text-yellow-300">Action Required: Upload Your Resume</h2>
            <p className="my-2 text-gray-700 dark:text-gray-300">Please upload your resume to complete your application.</p>
            <div
              {...getRootProps()}
              className={`mt-4 border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
                isDragActive ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/50' : 'border-gray-400 dark:border-gray-500 hover:border-indigo-500'
              }`}
            >
              <input {...getInputProps()} />
              {isProcessing ? (
                <div className="flex flex-col items-center">
                  <Spinner />
                  <p className="mt-2 text-gray-600 dark:text-gray-400">{processingStatus}</p>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <UploadIcon className="w-12 h-12 text-gray-400 mb-2" />
                  <p className="text-gray-600 dark:text-gray-400">
                    {isDragActive ? 'Drop your resume here...' : 'Drag & drop a resume here, or click to select a file'}
                  </p>
                  <p className="text-xs text-gray-500">.pdf, .docx, and .txt supported</p>
                </div>
              )}
            </div>
            {error && <p className="text-red-500 mt-4">{error}</p>}
        </div>
      ) : (
        <div className="mt-8 bg-green-50 dark:bg-gray-700/50 p-6 rounded-lg flex items-center justify-center">
            <CheckCircleIcon className="w-8 h-8 text-green-600 dark:text-green-400 mr-4" />
            <div>
              <h2 className="text-xl font-semibold text-green-800 dark:text-green-300">Resume Submitted!</h2>
              <p className="my-1 text-gray-700 dark:text-gray-300">Thank you. The recruiting team will review your submission shortly.</p>
            </div>
        </div>
      )}


      {candidate.status === CandidateStatus.SkillCheckPending && (
        <div className="mt-8 bg-indigo-50 dark:bg-gray-700/50 p-6 rounded-lg text-center">
            <h2 className="text-xl font-semibold text-indigo-800 dark:text-indigo-300">Action Required: Skill Check</h2>
            <p className="my-2 text-gray-700 dark:text-gray-300">Please complete the skill check to proceed with your application.</p>
            <button
                onClick={() => handleCompleteSkillCheck(candidate.id)}
                className="mt-2 inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
                Start Skill Check
            </button>
        </div>
      )}
      
      {candidate.status === CandidateStatus.SkillCheckCompleted && (
           <div className="mt-8 bg-green-50 dark:bg-gray-700/50 p-6 rounded-lg text-center">
              <h2 className="text-xl font-semibold text-green-800 dark:text-green-300">Skill Check Completed!</h2>
              <p className="my-2 text-gray-700 dark:text-gray-300">Thank you. The recruiting team will review your results shortly.</p>
           </div>
      )}

      {/* New Perks Section */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Why You'll Love Working Here</h2>
        {isLoadingPerks ? (
          <div className="flex justify-center items-center bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
            <Spinner />
            <p className="ml-4 text-gray-600 dark:text-gray-400">Generating personalized perks for you...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {perks.map((perk, index) => {
              const Icon = perkIcons[perk.icon] || GiftIcon;
              return (
                <div key={index} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md flex items-start space-x-4">
                  <div className="flex-shrink-0 bg-indigo-100 dark:bg-indigo-900 p-3 rounded-full">
                      <Icon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{perk.title}</h3>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">{perk.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};

export default CandidatePortal;
