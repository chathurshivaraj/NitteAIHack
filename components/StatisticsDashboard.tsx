import React, { useMemo } from 'react';
import { Candidate, CandidateStatus } from '../types';
import { ChartBarIcon, BriefcaseIcon, UserGroupIcon } from './icons';

// Data processing logic
const processPipelineData = (candidates: Candidate[]) => {
  const statusCounts = candidates.reduce((acc, candidate) => {
    acc[candidate.status] = (acc[candidate.status] || 0) + 1;
    return acc;
  }, {} as Record<CandidateStatus, number>);

  const total = candidates.length;
  if (total === 0) return [];

  return Object.entries(statusCounts)
    .map(([status, count]) => ({
      status: status as CandidateStatus,
      count,
      percentage: (count / total) * 100,
    }))
    .sort((a, b) => b.count - a.count);
};

const processFitScoreData = (candidates: Candidate[]) => {
    const scoreBins = [
        { label: '1-3', min: 1, max: 3, count: 0 },
        { label: '4-6', min: 4, max: 6, count: 0 },
        { label: '7-8', min: 7, max: 8, count: 0 },
        { label: '9-10', min: 9, max: 10, count: 0 },
    ];

    candidates.forEach(c => {
        const score = c.analysis?.fitScore;
        if (score === undefined) return;
        const bin = scoreBins.find(b => score >= b.min && score <= b.max);
        if (bin) {
            bin.count++;
        }
    });

    const maxCount = Math.max(...scoreBins.map(b => b.count), 1);

    return scoreBins.map(bin => ({
        ...bin,
        percentage: (bin.count / maxCount) * 100,
    }));
};

const processTopSkillsData = (candidates: Candidate[]) => {
    const skillCounts = candidates
        .flatMap(c => c.analysis?.skills || [])
        .reduce((acc, skill) => {
            acc[skill] = (acc[skill] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

    return Object.entries(skillCounts)
        .sort(([, countA], [, countB]) => countB - countA)
        .slice(0, 5);
};

const processRoleData = (candidates: Candidate[]) => {
  const roleCounts = candidates.reduce((acc, candidate) => {
    const role = candidate.role || 'N/A';
    acc[role] = (acc[role] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const total = candidates.length;
  if (total === 0) return [];

  const roleColors = ['#4f46e5', '#7c3aed', '#db2777', '#f59e0b', '#10b981', '#06b6d4'];

  return Object.entries(roleCounts)
    .map(([role, count], index) => ({
      role,
      count,
      percentage: (count / total) * 100,
      color: roleColors[index % roleColors.length],
    }))
    .sort((a, b) => b.count - a.count);
};

const processExperienceData = (candidates: Candidate[]) => {
    const experienceBins = [
        { label: '0-2 yrs', min: 0, max: 2, count: 0 },
        { label: '3-5 yrs', min: 3, max: 5, count: 0 },
        { label: '6-8 yrs', min: 6, max: 8, count: 0 },
        { label: '9+ yrs', min: 9, max: Infinity, count: 0 },
    ];

    candidates.forEach(c => {
        const years = c.analysis?.experienceYears;
        if (years === undefined) return;
        const bin = experienceBins.find(b => years >= b.min && years <= b.max);
        if (bin) {
            bin.count++;
        }
    });
    
    const maxCount = Math.max(...experienceBins.map(b => b.count), 1);

    return experienceBins.map(bin => ({
        ...bin,
        percentage: (bin.count / maxCount) * 100,
    }));
};

// Sub-components for charts
const PipelineChart: React.FC<{ data: ReturnType<typeof processPipelineData> }> = ({ data }) => {
    const statusColors: { [key in CandidateStatus]: string } = {
        [CandidateStatus.New]: "bg-blue-500",
        [CandidateStatus.SkillCheckPending]: "bg-orange-500",
        [CandidateStatus.SkillCheckCompleted]: "bg-teal-500",
        [CandidateStatus.Shortlisted]: "bg-yellow-500",
        [CandidateStatus.Interviewing]: "bg-purple-500",
        [CandidateStatus.Hired]: "bg-green-500",
        [CandidateStatus.Rejected]: "bg-red-500",
    };

    return (
        <div className="space-y-3">
            {data.map(({ status, count, percentage }) => (
                <div key={status}>
                    <div className="flex justify-between items-center mb-1 text-sm">
                        <span className="font-medium text-gray-700 dark:text-gray-300">{status}</span>
                        <span className="text-gray-500 dark:text-gray-400 font-mono">{count}</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                        <div
                            className={`${statusColors[status]} h-2.5 rounded-full`}
                            style={{ width: `${percentage}%` }}
                        ></div>
                    </div>
                </div>
            ))}
        </div>
    );
};

const FitScoreChart: React.FC<{ data: ReturnType<typeof processFitScoreData> }> = ({ data }) => {
    return (
        <div className="flex justify-around items-end h-40 space-x-2">
            {data.map(({ label, count, percentage }) => (
                 <div key={label} className="flex flex-col items-center flex-1">
                    <div className="text-sm font-bold text-gray-800 dark:text-gray-200">{count}</div>
                    <div className="w-full h-full flex items-end">
                        <div
                            className="w-full bg-indigo-500 rounded-t-md hover:bg-indigo-600 transition-colors"
                            style={{ height: `${percentage}%` }}
                        ></div>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{label}</div>
                </div>
            ))}
        </div>
    );
};

const TopSkillsChart: React.FC<{ data: ReturnType<typeof processTopSkillsData> }> = ({ data }) => {
    if (data.length === 0) {
        return <p className="text-sm text-gray-500 dark:text-gray-400">No skill data available.</p>;
    }
    return (
        <div className="space-y-2">
            {data.map(([skill, count]) => (
                <div key={skill} className="flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-700 dark:text-gray-300">{skill}</span>
                    <span className="bg-indigo-100 text-indigo-800 text-xs font-medium px-2.5 py-0.5 rounded-full dark:bg-indigo-900 dark:text-indigo-300">{count}</span>
                </div>
            ))}
        </div>
    );
};

const DonutSegment: React.FC<{
  percentage: number;
  startAngle: number;
  color: string;
}> = ({ percentage, startAngle, color }) => {
  const radius = 90;
  const strokeWidth = 30;
  const innerRadius = radius - strokeWidth;
  const endAngle = startAngle + (percentage / 100) * 360;

  const getCoords = (angle: number, r: number) => ({
    x: 100 + r * Math.cos((angle - 90) * (Math.PI / 180)),
    y: 100 + r * Math.sin((angle - 90) * (Math.PI / 180)),
  });

  const start = getCoords(startAngle, radius);
  const end = getCoords(endAngle, radius);
  const startInner = getCoords(startAngle, innerRadius);
  const endInner = getCoords(endAngle, innerRadius);

  const largeArcFlag = percentage > 50 ? 1 : 0;

  const d = [
    `M ${start.x} ${start.y}`,
    `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`,
    `L ${endInner.x} ${endInner.y}`,
    `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${startInner.x} ${startInner.y}`,
    'Z',
  ].join(' ');

  return <path d={d} fill={color} />;
};


const RoleChart: React.FC<{ data: ReturnType<typeof processRoleData> }> = ({ data }) => {
    let accumulatedPercentage = 0;
    return (
        <div className="flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-8 h-full">
            <div className="relative w-40 h-40 flex-shrink-0">
                <svg viewBox="0 0 200 200">
                    {data.map((segment, index) => {
                        const startAngle = (accumulatedPercentage / 100) * 360;
                        accumulatedPercentage += segment.percentage;
                        return (
                            <DonutSegment
                                key={index}
                                percentage={segment.percentage}
                                startAngle={startAngle}
                                color={segment.color}
                            />
                        );
                    })}
                </svg>
            </div>
            <div className="space-y-2">
                {data.map((item) => (
                    <div key={item.role} className="flex items-center text-sm">
                        <span className="w-3 h-3 rounded-full mr-2 flex-shrink-0" style={{ backgroundColor: item.color }}></span>
                        <span className="font-medium text-gray-700 dark:text-gray-300">{item.role}</span>
                        <span className="ml-auto pl-4 text-gray-500 dark:text-gray-400 font-mono">{item.count}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

const ExperienceChart: React.FC<{ data: ReturnType<typeof processExperienceData> }> = ({ data }) => {
    return (
        <div className="flex justify-around items-end h-40 space-x-2">
            {data.map(({ label, count, percentage }) => (
                 <div key={label} className="flex flex-col items-center flex-1">
                    <div className="text-sm font-bold text-gray-800 dark:text-gray-200">{count}</div>
                    <div className="w-full h-full flex items-end">
                        <div
                            className="w-full bg-teal-500 rounded-t-md hover:bg-teal-600 transition-colors"
                            style={{ height: `${percentage}%` }}
                        ></div>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-center">{label}</div>
                </div>
            ))}
        </div>
    );
};


// Main Component
const StatisticsDashboard: React.FC<{ candidates: Candidate[] }> = ({ candidates }) => {
  const pipelineData = useMemo(() => processPipelineData(candidates), [candidates]);
  const fitScoreData = useMemo(() => processFitScoreData(candidates), [candidates]);
  const topSkillsData = useMemo(() => processTopSkillsData(candidates), [candidates]);
  const roleData = useMemo(() => processRoleData(candidates), [candidates]);
  const experienceData = useMemo(() => processExperienceData(candidates), [candidates]);

  return (
    <div className="mb-8">
      <div className="flex items-center space-x-3 mb-4">
        <ChartBarIcon className="w-6 h-6 text-gray-700 dark:text-gray-300" />
        <h2 className="text-xl font-semibold">Recruitment Analytics</h2>
      </div>
      <div className="space-y-6">
        {/* Top Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <h3 className="font-semibold mb-4 text-gray-800 dark:text-gray-200">Candidate Pipeline</h3>
                {candidates.length > 0 ? <PipelineChart data={pipelineData} /> : <p className="text-sm text-gray-500 dark:text-gray-400">No candidates in the pipeline.</p>}
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <h3 className="font-semibold mb-4 text-gray-800 dark:text-gray-200">AI Fit Score Distribution</h3>
                {candidates.length > 0 ? <FitScoreChart data={fitScoreData} /> : <p className="text-sm text-gray-500 dark:text-gray-400">No candidates to score.</p>}
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <h3 className="font-semibold mb-4 text-gray-800 dark:text-gray-200">Top 5 Skills</h3>
                <TopSkillsChart data={topSkillsData} />
            </div>
        </div>
        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <div className="flex items-center space-x-2 mb-4">
                    <BriefcaseIcon className="w-5 h-5 text-gray-600 dark:text-gray-300"/>
                    <h3 className="font-semibold text-gray-800 dark:text-gray-200">Role Distribution</h3>
                </div>
                 {candidates.length > 0 ? <RoleChart data={roleData} /> : <p className="text-sm text-gray-500 dark:text-gray-400">No candidates to display.</p>}
            </div>
             <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <div className="flex items-center space-x-2 mb-4">
                    <UserGroupIcon className="w-5 h-5 text-gray-600 dark:text-gray-300"/>
                    <h3 className="font-semibold text-gray-800 dark:text-gray-200">Experience Level Distribution</h3>
                </div>
                 {candidates.length > 0 ? <ExperienceChart data={experienceData} /> : <p className="text-sm text-gray-500 dark:text-gray-400">No candidates to display.</p>}
            </div>
        </div>
      </div>
    </div>
  );
};

export default StatisticsDashboard;