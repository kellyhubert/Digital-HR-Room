'use client';
import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { BuildingIcon, UploadIcon, FilterIcon } from 'lucide-react';
import PageWrapper from '@/components/layout/PageWrapper';
import ScreeningProgress from '@/components/screening/ScreeningProgress';
import { jobsApi, screeningApi, umuravaApi } from '@/lib/api';
import { Job } from '@/lib/types';

type Scenario = 'umurava' | 'external' | null;

export default function ScreenPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const [job, setJob] = useState<Job | null>(null);
  const [scenario, setScenario] = useState<Scenario>(null);
  const [screening, setScreening] = useState(false);
  const [topN, setTopN] = useState<10 | 20>(10);
  const [error, setError] = useState('');

  // Umurava filters
  const [skillFilter, setSkillFilter] = useState('');
  const [minExp, setMinExp] = useState(0);
  const [location, setLocation] = useState('');
  const [availability, setAvailability] = useState<string[]>([]);
  const [talentCount, setTalentCount] = useState<number | null>(null);

  // External upload
  const [file, setFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    jobsApi.get(jobId).then(res => {
      const j = res.data.data;
      setJob(j);
      setTopN(j.topN || 10);
    });
  }, [jobId]);

  // Live talent count when filters change
  useEffect(() => {
    if (scenario !== 'umurava') return;
    const params: Record<string, string> = {};
    if (skillFilter) params.skills = skillFilter;
    if (minExp > 0) params.minExperienceYears = String(minExp);
    if (location) params.location = location;
    if (availability.length > 0) params.availability = availability.join(',');
    umuravaApi.getTalents(params).then(res => setTalentCount(res.data.total)).catch(() => {});
  }, [scenario, skillFilter, minExp, location, availability]);

  async function startScreening() {
    setError('');
    setScreening(true);
    try {
      if (scenario === 'umurava') {
        const filters: Record<string, unknown> = {};
        if (skillFilter) filters.skills = skillFilter.split(',').map(s => s.trim());
        if (minExp > 0) filters.minExperienceYears = minExp;
        if (location) filters.location = location;
        if (availability.length > 0) filters.availability = availability;
        await screeningApi.triggerUmurava(jobId, { filters, topN });
      } else if (scenario === 'external' && file) {
        await screeningApi.triggerExternal(jobId, file, topN);
      }
    } catch (e: unknown) {
      const err = e as { response?: { data?: { error?: string } } };
      setError(err?.response?.data?.error || 'Failed to start screening');
      setScreening(false);
    }
  }

  if (screening) return <PageWrapper><ScreeningProgress jobId={jobId} /></PageWrapper>;

  return (
    <PageWrapper>
      <div className="max-w-2xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Screen Candidates</h1>
          <p className="text-gray-500 text-sm mt-1">{job?.title}</p>
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-6">{error}</div>}

        {/* Step 1: Scenario selection */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-5">
          <h2 className="font-semibold text-gray-900 mb-4">Step 1: Choose Candidate Source</h2>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setScenario('umurava')}
              className={`border-2 rounded-xl p-5 text-left transition-all ${scenario === 'umurava' ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
            >
              <BuildingIcon size={24} className={`mb-3 ${scenario === 'umurava' ? 'text-blue-600' : 'text-gray-400'}`} />
              <p className="font-semibold text-gray-900 text-sm">Umurava Platform</p>
              <p className="text-xs text-gray-500 mt-1">Screen from structured talent profiles</p>
            </button>
            <button
              onClick={() => setScenario('external')}
              className={`border-2 rounded-xl p-5 text-left transition-all ${scenario === 'external' ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
            >
              <UploadIcon size={24} className={`mb-3 ${scenario === 'external' ? 'text-blue-600' : 'text-gray-400'}`} />
              <p className="font-semibold text-gray-900 text-sm">External Upload</p>
              <p className="text-xs text-gray-500 mt-1">Upload CSV, Excel, or PDF resumes</p>
            </button>
          </div>
        </div>

        {/* Step 2a: Umurava filters */}
        {scenario === 'umurava' && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-5">
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><FilterIcon size={16} />Step 2: Filter Talent Pool</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Skills (comma-separated)</label>
                <input value={skillFilter} onChange={e => setSkillFilter(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="React, TypeScript, Node.js" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Min Experience: {minExp}y</label>
                  <input type="range" min={0} max={15} value={minExp} onChange={e => setMinExp(parseInt(e.target.value))} className="w-full accent-blue-600" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input value={location} onChange={e => setLocation(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Kigali" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Availability</label>
                <div className="flex flex-wrap gap-2">
                  {['immediate', '2-weeks', '1-month', '3-months'].map(a => (
                    <label key={a} className="flex items-center gap-1.5 cursor-pointer">
                      <input type="checkbox" checked={availability.includes(a)} onChange={e => setAvailability(e.target.checked ? [...availability, a] : availability.filter(x => x !== a))} className="accent-blue-600" />
                      <span className="text-sm text-gray-700">{a}</span>
                    </label>
                  ))}
                </div>
              </div>
              {talentCount !== null && (
                <div className="bg-blue-50 border border-blue-100 rounded-lg px-3 py-2 text-sm text-blue-700">
                  <strong>{talentCount}</strong> talent{talentCount !== 1 ? 's' : ''} match these filters
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 2b: File upload */}
        {scenario === 'external' && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-5">
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><UploadIcon size={16} />Step 2: Upload Candidates</h2>
            <div
              onClick={() => fileRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors ${file ? 'border-green-400 bg-green-50' : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'}`}
            >
              <UploadIcon size={32} className={`mx-auto mb-3 ${file ? 'text-green-500' : 'text-gray-400'}`} />
              {file ? (
                <>
                  <p className="font-medium text-green-700">{file.name}</p>
                  <p className="text-xs text-green-600 mt-1">{(file.size / 1024).toFixed(0)} KB — click to change</p>
                </>
              ) : (
                <>
                  <p className="font-medium text-gray-700">Drop file or click to upload</p>
                  <p className="text-xs text-gray-400 mt-1">CSV, Excel (.xlsx), or PDF — max 10MB</p>
                </>
              )}
            </div>
            <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls,.pdf" className="hidden" onChange={e => setFile(e.target.files?.[0] || null)} />
          </div>
        )}

        {/* Step 3: Top N & Run */}
        {scenario && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900 mb-3">Step 3: Shortlist Size</h2>
            <div className="flex gap-4 mb-6">
              {([10, 20] as const).map(n => (
                <label key={n} className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" checked={topN === n} onChange={() => setTopN(n)} className="accent-blue-600" />
                  <span className="text-sm font-medium text-gray-700">Top {n} candidates</span>
                </label>
              ))}
            </div>
            <button
              onClick={startScreening}
              disabled={scenario === 'external' && !file}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Run AI Screening
            </button>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
