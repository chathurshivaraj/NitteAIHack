
import React from 'react';
import { CandidateStatus } from '../types';
import { CheckCircleIcon } from './icons';

interface ApplicationStatusTrackerProps {
  currentStatus: CandidateStatus;
}

const statusOrder = [
  CandidateStatus.New,
  CandidateStatus.SkillCheckPending,
  CandidateStatus.SkillCheckCompleted,
  CandidateStatus.Shortlisted,
  CandidateStatus.Interviewing,
  CandidateStatus.Hired,
];

const ApplicationStatusTracker: React.FC<ApplicationStatusTrackerProps> = ({ currentStatus }) => {
  const currentIndex = statusOrder.indexOf(currentStatus);

  const isCompleted = (index: number) => {
    if (currentStatus === CandidateStatus.Rejected) return false;
    return index < currentIndex;
  };

  const isActive = (index: number) => {
    if (currentStatus === CandidateStatus.Rejected) return false;
    return index === currentIndex;
  };

  const getStatusNode = (status: CandidateStatus, index: number) => {
    const completed = isCompleted(index);
    const active = isActive(index);
    // Special case for Rejected: show a single, colored node
    const isRejected = currentStatus === CandidateStatus.Rejected && index === 0;

    return (
      <li key={status} className="relative mb-10 sm:mb-0 w-full">
        <div className="flex items-center">
          <div className={`z-10 flex items-center justify-center w-8 h-8 rounded-full ring-8 ring-white dark:ring-gray-800 ${
            completed || active || isRejected ? (isRejected ? 'bg-red-200 dark:bg-red-900' : 'bg-indigo-200 dark:bg-indigo-900') : 'bg-gray-200 dark:bg-gray-700'
          }`}>
            {(completed || (status === CandidateStatus.Hired && active)) && <CheckCircleIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-300" />}
          </div>
          {index < statusOrder.length -1 && (
             <div className={`flex-auto border-t-2 ${completed ? 'border-indigo-200 dark:border-indigo-700' : 'border-gray-200 dark:border-gray-700'}`}></div>
          )}
        </div>
        <div className="mt-3">
          <h3 className={`text-md font-semibold ${active || completed || isRejected ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>{status}</h3>
           {isRejected && <p className="text-sm font-normal text-red-500 dark:text-red-400">Unfortunately, we are not moving forward at this time.</p>}
        </div>
      </li>
    );
  };
  
  return (
    <div className="p-4 sm:p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-8 text-gray-900 dark:text-white">Your Application Status</h2>
      <ol className="flex items-start justify-between">
        {currentStatus === CandidateStatus.Rejected 
          ? getStatusNode(CandidateStatus.Rejected, 0)
          : statusOrder.map(getStatusNode)}
      </ol>
    </div>
  );
};

export default ApplicationStatusTracker;
