import React, { useState } from 'react';
import { SparklesIcon, UserIcon } from './icons';
import { Candidate } from '../types';

interface LoginPageProps {
  onLogin: (userType: 'recruiter' | 'candidate', identifier: string) => void;
  candidates: Candidate[];
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, candidates }) => {
  const [activeTab, setActiveTab] = useState<'recruiter' | 'candidate'>('recruiter');
  const [password, setPassword] = useState('');
  const [candidateEmail, setCandidateEmail] = useState(candidates[0]?.email || '');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Basic password check
    if (password !== 'password') {
      setError('Incorrect password. Hint: it is "password".');
      return;
    }

    if (activeTab === 'recruiter') {
      onLogin('recruiter', 'recruiter');
    } else {
      onLogin('candidate', candidateEmail);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full mx-auto">
        <div className="flex items-center justify-center space-x-3 mb-6">
          <SparklesIcon className="h-10 w-10 text-indigo-500" />
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Resmo</h1>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden">
          <div className="flex">
            <button
              onClick={() => { setActiveTab('recruiter'); setError(''); setPassword(''); }}
              className={`flex-1 p-4 font-semibold text-center transition-colors ${activeTab === 'recruiter' ? 'bg-indigo-50 dark:bg-gray-700 text-indigo-600 dark:text-indigo-400' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700/50'}`}
            >
              Recruiter Login
            </button>
            <button
              onClick={() => { setActiveTab('candidate'); setError(''); setPassword(''); }}
              className={`flex-1 p-4 font-semibold text-center transition-colors ${activeTab === 'candidate' ? 'bg-indigo-50 dark:bg-gray-700 text-indigo-600 dark:text-indigo-400' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700/50'}`}
            >
              Candidate Login
            </button>
          </div>
          <div className="p-6 sm:p-8">
            <form onSubmit={handleLogin} className="space-y-6">
              {activeTab === 'recruiter' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="recruiter-username">
                    Username
                  </label>
                  <input
                    type="text"
                    id="recruiter-username"
                    value="recruiter"
                    disabled
                    className="mt-1 block w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm cursor-not-allowed"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="candidate-email">
                    Select Your Application
                  </label>
                  <select
                    id="candidate-email"
                    value={candidateEmail}
                    onChange={(e) => setCandidateEmail(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  >
                    {candidates.map(c => <option key={c.id} value={c.email}>{c.name} ({c.role})</option>)}
                  </select>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="password">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="••••••••"
                />
              </div>

              {error && <p className="text-sm text-red-600 dark:text-red-500">{error}</p>}

              <div>
                <button
                  type="submit"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Sign In
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
