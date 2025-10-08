import React, { useState, useEffect } from 'react';
import { Candidate, CandidateStatus } from '../types';
import { generateStatusChangeEmail } from '../services/geminiService';
import Spinner from './Spinner';
import { PaperAirplaneIcon, CheckCircleIcon } from './icons';

interface EmailNotificationModalProps {
  candidate: Candidate;
  newStatus: CandidateStatus;
  onSend: (subject: string, body: string) => void;
  onClose: () => void;
}

const EmailNotificationModal: React.FC<EmailNotificationModalProps> = ({ candidate, newStatus, onSend, onClose }) => {
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);

  useEffect(() => {
    const fetchEmailTemplate = async () => {
      try {
        setIsLoading(true);
        const { subject: genSubject, body: genBody } = await generateStatusChangeEmail(candidate.name, candidate.role, newStatus);
        setSubject(genSubject);
        setBody(genBody);
      } catch (error) {
        console.error("Failed to generate email content:", error);
        setSubject(`Update on your application for ${candidate.role}`);
        setBody(`Hi ${candidate.name},\n\nThis is an update regarding your application. Your new status is: ${newStatus}.\n\nBest,\nThe Resmo Team`);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEmailTemplate();
  }, [candidate, newStatus]);

  const handleSend = () => {
    setIsSending(true);
    // Simulate network delay
    setTimeout(() => {
        onSend(subject, body);
        setIsSending(false);
        setIsSent(true);
    }, 500);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-30 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl flex flex-col">
        <div className="p-4 border-b dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Send Status Update to Candidate</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">An email will be sent to {candidate.email}</p>
        </div>
        
        {isLoading ? (
            <div className="flex items-center justify-center h-80">
                <Spinner />
                <p className="ml-3 text-gray-600 dark:text-gray-400">Generating AI email draft...</p>
            </div>
        ) : (
            <div className="p-4 space-y-4 flex-grow overflow-y-auto">
                <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Subject</label>
                    <input
                        type="text"
                        id="subject"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        readOnly={isLoading || isSending || isSent}
                    />
                </div>
                 <div>
                    <label htmlFor="body" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Body</label>
                    <textarea
                        id="body"
                        rows={10}
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        readOnly={isLoading || isSending || isSent}
                    ></textarea>
                </div>
            </div>
        )}

        <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border-t dark:border-gray-700 flex justify-end space-x-3">
          <button
            onClick={onClose}
            disabled={isSending}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white dark:bg-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
          >
            {isSent ? 'Close' : 'Cancel'}
          </button>
          <button
            onClick={handleSend}
            disabled={isLoading || isSending || isSent}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed"
          >
            {isSending ? <Spinner size="sm" /> : (isSent ? <CheckCircleIcon className="w-5 h-5 mr-2 -ml-1" /> : <PaperAirplaneIcon className="w-5 h-5 mr-2 -ml-1" />)}
            {isSending ? 'Sending...' : (isSent ? 'Email Sent' : 'Send Email')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmailNotificationModal;