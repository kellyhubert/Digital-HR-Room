import fs from 'fs';
import path from 'path';
import csvParser from 'csv-parser';
import * as XLSX from 'xlsx';

export interface ParsedCandidate {
  name: string;
  email: string;
  phone: string | null;
  location: string;
  skills: string[];
  totalExperienceYears: number;
  experience: { title: string; company: string; startDate: string; endDate: string | null; durationMonths: number; description: string }[];
  education: { degree: string; field: string; institution: string; graduationYear: number }[];
  portfolio: string | null;
  availability: string;
  linkedIn: string | null;
  github: string | null;
  summary: string | null;
  rawText: string;
}

function normalizeSkills(raw: string): string[] {
  return raw.split(/[,;|\/]/).map(s => s.trim()).filter(Boolean);
}

function estimateExperience(raw: string): number {
  const match = raw.match(/(\d+(\.\d+)?)\s*(years?|yrs?)/i);
  return match ? parseFloat(match[1]) : 0;
}

function normalizeAvailability(raw: string): string {
  const val = (raw || '').toLowerCase();
  if (val.includes('immediate') || val.includes('asap') || val.includes('now')) return 'immediate';
  if (val.includes('2') && val.includes('week')) return '2-weeks';
  if (val.includes('1') && val.includes('month')) return '1-month';
  if (val.includes('3') && val.includes('month')) return '3-months';
  return 'not-available';
}

function rowToCandidate(row: Record<string, string>): ParsedCandidate {
  const raw = JSON.stringify(row);
  const name = row['name'] || row['full_name'] || row['fullname'] || row['Name'] || 'Unknown';
  const email = row['email'] || row['Email'] || row['EMAIL'] || '';
  const skillsRaw = row['skills'] || row['Skills'] || row['SKILLS'] || '';
  const expRaw = row['experience'] || row['Experience'] || row['years_of_experience'] || '0';

  return {
    name,
    email,
    phone: row['phone'] || row['Phone'] || null,
    location: row['location'] || row['Location'] || row['city'] || '',
    skills: normalizeSkills(skillsRaw),
    totalExperienceYears: isNaN(parseFloat(expRaw)) ? estimateExperience(expRaw) : parseFloat(expRaw),
    experience: [],
    education: [],
    portfolio: row['portfolio'] || row['Portfolio'] || null,
    availability: normalizeAvailability(row['availability'] || row['Availability'] || ''),
    linkedIn: row['linkedin'] || row['LinkedIn'] || null,
    github: row['github'] || row['Github'] || row['GitHub'] || null,
    summary: row['summary'] || row['bio'] || row['Summary'] || null,
    rawText: raw,
  };
}

export async function parseCSV(filePath: string): Promise<ParsedCandidate[]> {
  return new Promise((resolve, reject) => {
    const results: ParsedCandidate[] = [];
    fs.createReadStream(filePath)
      .pipe(csvParser())
      .on('data', (row: Record<string, string>) => {
        results.push(rowToCandidate(row));
      })
      .on('end', () => resolve(results))
      .on('error', reject);
  });
}

export function parseExcel(filePath: string): ParsedCandidate[] {
  const workbook = XLSX.readFile(filePath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<Record<string, string>>(sheet, { defval: '' });
  return rows.map(rowToCandidate);
}

export async function parsePDF(filePath: string): Promise<ParsedCandidate[]> {
  try {
    // Dynamic import to avoid issues with pdf-parse
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const pdfParse = require('pdf-parse');
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer);
    const text: string = data.text;

    // Basic heuristic parsing for single-resume PDFs
    const emailMatch = text.match(/[\w.-]+@[\w.-]+\.\w+/);
    const phoneMatch = text.match(/[\+\d][\d\s\-().]{7,15}/);
    const linkedInMatch = text.match(/linkedin\.com\/in\/[\w-]+/i);
    const githubMatch = text.match(/github\.com\/[\w-]+/i);
    const expMatch = text.match(/(\d+)\+?\s*years?\s*(of\s*)?experience/i);
    const skillsSection = text.match(/skills[:\s]+([^\n]{10,200})/i);

    const candidate: ParsedCandidate = {
      name: path.basename(filePath, path.extname(filePath)).replace(/[-_]/g, ' '),
      email: emailMatch ? emailMatch[0] : '',
      phone: phoneMatch ? phoneMatch[0].trim() : null,
      location: '',
      skills: skillsSection ? normalizeSkills(skillsSection[1]) : [],
      totalExperienceYears: expMatch ? parseInt(expMatch[1]) : 0,
      experience: [],
      education: [],
      portfolio: null,
      availability: 'not-available',
      linkedIn: linkedInMatch ? linkedInMatch[0] : null,
      github: githubMatch ? githubMatch[0] : null,
      summary: text.substring(0, 500).trim(),
      rawText: text,
    };

    return [candidate];
  } catch {
    return [];
  }
}

export async function parseFile(filePath: string): Promise<ParsedCandidate[]> {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === '.csv') return parseCSV(filePath);
  if (ext === '.xlsx' || ext === '.xls') return parseExcel(filePath);
  if (ext === '.pdf') return parsePDF(filePath);
  throw new Error(`Unsupported file type: ${ext}`);
}
