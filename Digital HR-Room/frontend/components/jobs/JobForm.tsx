'use client';
import { useState } from 'react';
import { PlusIcon, XIcon } from 'lucide-react';
import { jobsApi } from '@/lib/api';
import { useRouter } from 'next/navigation';

interface FormFields {
  title: string;
  description: string;
  department: string;
  location: string;
  employmentType: 'full-time' | 'part-time' | 'contract' | 'internship';
  minExperienceYears: number;
  educationRequirement: string;
  topN: 10 | 20;
}

interface WeightState {
  skills: number;
  experience: number;
  education: number;
  relevance: number;
}

interface FieldErrors {
  title?: string;
  description?: string;
  department?: string;
  location?: string;
}

export default function JobForm() {
  const router = useRouter();
  const [fields, setFields] = useState<FormFields>({
    title: '', description: '', department: '', location: '',
    employmentType: 'full-time', minExperienceYears: 0,
    educationRequirement: '', topN: 10,
  });
  const [requiredSkills, setRequiredSkills] = useState<string[]>([]);
  const [preferredSkills, setPreferredSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');
  const [prefSkillInput, setPrefSkillInput] = useState('');
  const [weights, setWeights] = useState<WeightState>({ skills: 40, experience: 30, education: 15, relevance: 15 });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const totalWeight = weights.skills + weights.experience + weights.education + weights.relevance;

  function set<K extends keyof FormFields>(key: K, value: FormFields[K]) {
    setFields(prev => ({ ...prev, [key]: value }));
  }

  function validate(): boolean {
    const errs: FieldErrors = {};
    if (fields.title.trim().length < 2) errs.title = 'Title is required';
    if (fields.description.trim().length < 20) errs.description = 'Description must be at least 20 characters';
    if (!fields.department.trim()) errs.department = 'Department is required';
    if (!fields.location.trim()) errs.location = 'Location is required';
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function addSkill(list: string[], setter: (v: string[]) => void, val: string) {
    if (val.trim() && !list.includes(val.trim())) setter([...list, val.trim()]);
  }

  function removeSkill(list: string[], setter: (v: string[]) => void, skill: string) {
    setter(list.filter(s => s !== skill));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    if (Math.abs(totalWeight - 100) > 0.5) { setError('Weights must sum to 100'); return; }
    setSubmitting(true);
    setError('');
    try {
      const res = await jobsApi.create({ ...fields, requiredSkills, preferredSkills, weights, status: 'active' });
      router.push(`/jobs/${res.data.data._id}`);
    } catch (e: unknown) {
      const err = e as { response?: { data?: { error?: string } } };
      setError(err?.response?.data?.error || 'Failed to create job');
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>}

      {/* Basic Info */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="font-semibold text-gray-900">Job Details</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Job Title *</label>
            <input value={fields.title} onChange={e => set('title', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. Senior Full Stack Developer" />
            {fieldErrors.title && <p className="text-red-500 text-xs mt-1">{fieldErrors.title}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Department *</label>
            <input value={fields.department} onChange={e => set('department', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Engineering" />
            {fieldErrors.department && <p className="text-red-500 text-xs mt-1">{fieldErrors.department}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
            <input value={fields.location} onChange={e => set('location', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Kigali, Rwanda" />
            {fieldErrors.location && <p className="text-red-500 text-xs mt-1">{fieldErrors.location}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Employment Type</label>
            <select value={fields.employmentType} onChange={e => set('employmentType', e.target.value as FormFields['employmentType'])} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="full-time">Full-time</option>
              <option value="part-time">Part-time</option>
              <option value="contract">Contract</option>
              <option value="internship">Internship</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Min Experience (years)</label>
            <input type="number" min={0} value={fields.minExperienceYears} onChange={e => set('minExperienceYears', parseInt(e.target.value) || 0)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Education Requirement</label>
            <input value={fields.educationRequirement} onChange={e => set('educationRequirement', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Bachelor's in Computer Science or equivalent" />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Job Description *</label>
            <textarea value={fields.description} onChange={e => set('description', e.target.value)} rows={4} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Describe the role, responsibilities, and what you're looking for..." />
            {fieldErrors.description && <p className="text-red-500 text-xs mt-1">{fieldErrors.description}</p>}
          </div>
        </div>
      </div>

      {/* Skills */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="font-semibold text-gray-900">Skills</h2>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Required Skills</label>
          <div className="flex gap-2 mb-2">
            <input value={skillInput} onChange={e => setSkillInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill(requiredSkills, setRequiredSkills, skillInput); setSkillInput(''); } }} className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Type skill and press Enter" />
            <button type="button" onClick={() => { addSkill(requiredSkills, setRequiredSkills, skillInput); setSkillInput(''); }} className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700"><PlusIcon size={16} /></button>
          </div>
          <div className="flex flex-wrap gap-2">
            {requiredSkills.map(s => (
              <span key={s} className="flex items-center gap-1 bg-blue-50 text-blue-700 text-xs px-2.5 py-1 rounded-full">
                {s}<button type="button" onClick={() => removeSkill(requiredSkills, setRequiredSkills, s)}><XIcon size={10} /></button>
              </span>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Skills</label>
          <div className="flex gap-2 mb-2">
            <input value={prefSkillInput} onChange={e => setPrefSkillInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill(preferredSkills, setPreferredSkills, prefSkillInput); setPrefSkillInput(''); } }} className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Type skill and press Enter" />
            <button type="button" onClick={() => { addSkill(preferredSkills, setPreferredSkills, prefSkillInput); setPrefSkillInput(''); }} className="bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200"><PlusIcon size={16} /></button>
          </div>
          <div className="flex flex-wrap gap-2">
            {preferredSkills.map(s => (
              <span key={s} className="flex items-center gap-1 bg-gray-100 text-gray-600 text-xs px-2.5 py-1 rounded-full">
                {s}<button type="button" onClick={() => removeSkill(preferredSkills, setPreferredSkills, s)}><XIcon size={10} /></button>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Scoring Weights */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="font-semibold text-gray-900">Scoring Weights</h2>
          <span className={`text-sm font-medium ${Math.abs(totalWeight - 100) < 0.5 ? 'text-green-600' : 'text-red-500'}`}>Total: {totalWeight}/100</span>
        </div>
        <p className="text-xs text-gray-500">Set how much each criterion matters for this role. Weights must sum to 100.</p>
        {(['skills', 'experience', 'education', 'relevance'] as (keyof WeightState)[]).map(key => (
          <div key={key}>
            <div className="flex justify-between mb-1">
              <label className="text-sm font-medium text-gray-700 capitalize">{key}</label>
              <span className="text-sm font-bold text-blue-600">{weights[key]}%</span>
            </div>
            <input type="range" min={0} max={100} step={5} value={weights[key]} onChange={e => setWeights(prev => ({ ...prev, [key]: parseInt(e.target.value) }))} className="w-full accent-blue-600" />
          </div>
        ))}
      </div>

      {/* Top N */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-900 mb-3">Shortlist Size</h2>
        <div className="flex gap-4">
          {([10, 20] as const).map(n => (
            <label key={n} className="flex items-center gap-2 cursor-pointer">
              <input type="radio" checked={fields.topN === n} onChange={() => set('topN', n)} className="accent-blue-600" />
              <span className="text-sm font-medium text-gray-700">Top {n} candidates</span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button type="button" onClick={() => router.back()} className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
        <button type="submit" disabled={submitting} className="px-6 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium">
          {submitting ? 'Creating...' : 'Create Job'}
        </button>
      </div>
    </form>
  );
}
