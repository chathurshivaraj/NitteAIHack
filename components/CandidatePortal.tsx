import React, { useState, useEffect } from 'react';
import type { SkillQuestion, LearningPath, Candidate } from '../types';
import { generateSkillCheck, suggestLearningPath } from '../services/geminiService';
import Spinner from './Spinner';
import { SparklesIcon } from './icons';
import { CandidateStatus } from '../types';

enum PortalState {
  SelectCandidate,
  Intro,
  TakingTest,
  Results,
  LearningPath,
}

interface CandidatePortalProps {
    candidates: Candidate[];
    setCandidates: React.Dispatch<React.SetStateAction<Candidate[]>>;
}

const CandidatePortal: React.FC<CandidatePortalProps> = ({ candidates, setCandidates }) => {
  const [portalState, setPortalState] = useState<PortalState>(PortalState.SelectCandidate);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [questions, setQuestions] = useState<SkillQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [learningPath, setLearningPath] = useState<LearningPath[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const candidatesPendingCheck = candidates.filter(c => c.status === CandidateStatus.SkillCheckPending);

  const selectCandidate = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setPortalState(PortalState.Intro);
  };

  const startTest = async () => {
    if (!selectedCandidate) return;
    setIsLoading(true);
    setPortalState(PortalState.TakingTest);
    const skills = selectedCandidate.analysis?.skills || ['React', 'TypeScript'];
    const generatedQuestions = await generateSkillCheck(selectedCandidate.role, skills);
    setQuestions(generatedQuestions);
    setAnswers(new Array(generatedQuestions.length).fill(-1));
    setCurrentQuestionIndex(0);
    setIsLoading(false);
  };

  const handleAnswer = (optionIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = optionIndex;
    setAnswers(newAnswers);
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      submitTest();
    }
  };
  
  const submitTest = async () => {
      if (!selectedCandidate) return;

      let correctAnswers = 0;
      const incorrectSkills = new Set<string>();
      const jobSkills = selectedCandidate.analysis?.skills || [];

      questions.forEach((q, index) => {
          if (answers[index] === q.correctAnswerIndex) {
              correctAnswers++;
          } else {
            jobSkills.forEach(skill => {
                if (q.question.toLowerCase().includes(skill.toLowerCase().split(' ')[0])) {
                    incorrectSkills.add(skill);
                }
            })
          }
      });
      const finalScore = questions.length > 0 ? Math.round((correctAnswers / questions.length) * 100) : 0;
      setScore(finalScore);
      
      setCandidates(prev => prev.map(c => 
          c.id === selectedCandidate.id ? {
              ...c,
              status: CandidateStatus.SkillCheckCompleted,
              skillCheckScore: finalScore,
              auditLog: [...c.auditLog, { timestamp: new Date().toISOString(), action: 'Skill Check Completed', details: `Candidate scored ${finalScore}%` }]
          } : c
      ));

      setPortalState(PortalState.Results);
      
      if(incorrectSkills.size > 0){
          setIsLoading(true);
          const path = await suggestLearningPath(selectedCandidate.role, Array.from(incorrectSkills));
          setLearningPath(path);
          setIsLoading(false);
      }
  }

  const resetPortal = () => {
    setSelectedCandidate(null);
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setScore(0);
    setLearningPath([]);
    setPortalState(PortalState.SelectCandidate);
  }

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-64">
          <Spinner size="lg" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Preparing your experience...</p>
        </div>
      );
    }

    switch (portalState) {
      case PortalState.SelectCandidate:
        return (
             <div className="text-center">
                <h2 className="text-2xl font-bold mb-2">Welcome to the Candidate Portal</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">If you have been invited to a skill check, please select your name below to begin.</p>
                {candidatesPendingCheck.length > 0 ? (
                    <div className="space-y-3">
                        {candidatesPendingCheck.map(c => (
                            <button key={c.id} onClick={() => selectCandidate(c)} className="w-full bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-transform transform hover:scale-105">
                                Start skill check for {c.name} ({c.role})
                            </button>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">There are no pending skill checks at this time.</p>
                )}
            </div>
        )

      case PortalState.Intro:
        return (
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Welcome, {selectedCandidate?.name}!</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">You're applying for the {selectedCandidate?.role} position. Please complete this short skill check to proceed.</p>
            <button onClick={startTest} className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-transform transform hover:scale-105">
              Start Skill Check
            </button>
          </div>
        );
      
      case PortalState.TakingTest:
          const currentQuestion = questions[currentQuestionIndex];
          if(!currentQuestion) return null;
          return (
              <div>
                  <div className="text-center mb-4">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Question {currentQuestionIndex + 1} of {questions.length}</p>
                      <h3 className="text-xl font-semibold my-2">{currentQuestion.question}</h3>
                  </div>
                  <div className="space-y-3">
                      {currentQuestion.options.map((option, index) => (
                          <button key={index} onClick={() => handleAnswer(index)} className={`block w-full text-left p-4 rounded-lg border-2 transition-colors ${answers[currentQuestionIndex] === index ? 'bg-indigo-100 border-indigo-500 dark:bg-indigo-900' : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'}`}>
                              {option}
                          </button>
                      ))}
                  </div>
                  <div className="mt-6 text-right">
                       <button onClick={nextQuestion} disabled={answers[currentQuestionIndex] === -1} className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed">
                          {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Submit Test'}
                      </button>
                  </div>
              </div>
          );

      case PortalState.Results:
          return (
              <div className="text-center">
                  <h2 className="text-3xl font-bold mb-2">Test Complete!</h2>
                  <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">Your score:</p>
                  <p className={`text-6xl font-bold mb-6 ${score >= 70 ? 'text-green-500' : 'text-red-500'}`}>{score}%</p>
                  {isLoading && <div className="flex justify-center my-4"><Spinner /> <p className="ml-2">Generating feedback...</p></div>}
                  {learningPath.length > 0 && !isLoading && (
                      <button onClick={() => setPortalState(PortalState.LearningPath)} className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 mb-2">
                          View Personalized Learning Path
                      </button>
                  )}
                  <button onClick={resetPortal} className="text-sm text-gray-500 hover:underline">Return to Portal Home</button>
              </div>
          );

        case PortalState.LearningPath:
            return (
                <div>
                    <div className="text-center mb-6">
                        <SparklesIcon className="w-8 h-8 text-indigo-500 mx-auto mb-2" />
                        <h2 className="text-2xl font-bold">Your AI-Generated Learning Path</h2>
                        <p className="text-gray-600 dark:text-gray-400">Here are some resources to sharpen your skills.</p>
                    </div>
                    <div className="space-y-6">
                        {learningPath.map(path => (
                            <div key={path.skill} className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
                                <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">{path.skill}</h3>
                                <ul className="space-y-2">
                                    {path.resources.map(res => (
                                        <li key={res.title} className="flex items-center justify-between bg-white dark:bg-gray-800 p-3 rounded-md shadow-sm">
                                            <div>
                                                <p className="font-medium text-gray-800 dark:text-gray-200">{res.title}</p>
                                                <span className="text-xs bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full">{res.type}</span>
                                            </div>
                                            <a href={res.url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline dark:text-indigo-400 font-medium">View</a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                    <div className="text-center mt-6">
                        <button onClick={resetPortal} className="text-sm text-gray-500 hover:underline">Return to Portal Home</button>
                    </div>
                </div>
            )
    }
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 flex items-center justify-center" style={{minHeight: 'calc(100vh - 64px)'}}>
      <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg w-full max-w-2xl">
        {renderContent()}
      </div>
    </div>
  );
};

export default CandidatePortal;