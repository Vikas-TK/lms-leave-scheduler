import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { STUDENTS } from '../data/students.js';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: resolve(__dirname, '../../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const DEPTS = {
  CS:"Computer Science", IT:"Information Technology",
  AIDS:"AI & Data Science", AIML:"AI & Machine Learning",
  CY:"Cyber Security", MECH:"Mechanical Engineering",
  CIVIL:"Civil Engineering", BME:"Biomedical Engineering",
  EEE:"Electrical & Electronics", ECE:"Electronics & Communication",
};
const DEPT_KEYS = Object.keys(DEPTS);
const YEARS = [1,2,3,4];
const SECTIONS = ["A","B","C"];

const ADV_NAMES = [
  "Dr. Lakshmi Priya","Dr. Rajesh Mohan","Dr. Anita Rao","Dr. Sunil Kumar",
  "Dr. Preethi Nair","Dr. Kiran Babu","Dr. Meena Devi","Dr. Venkat Rao",
  "Prof. Kavitha S","Prof. Arun M","Prof. Shalini T","Prof. Ramesh N",
];
const HOD_NAMES = {
  CS:"Prof. Suresh Babu", IT:"Prof. Anil Menon", AIDS:"Prof. Deepa Nair",
  AIML:"Prof. Sanjay Iyer", CY:"Prof. Ramesh Pillai", MECH:"Prof. Anand Kumar",
  CIVIL:"Prof. Ravi Sharma", BME:"Prof. Uma Devi", EEE:"Prof. Ganesh Rao", ECE:"Prof. Priya S",
};

const buildUsers = () => {
  const usersToInsert = [];
  let ai = 0;
  
  // Students
  Object.values(STUDENTS).forEach(s => {
    if (!s.regNo) return; // skip metadata like _range
    usersToInsert.push({
      id: s.regNo,
      pass: s.pass,
      role: "student",
      name: s.name,
      dept: s.dept,
      year: s.year,
      section: s.section,
      rollNo: s.rollNo,
      regNo: s.regNo,
      photo: s.photo,
      password: s.pass // mapping for our db schema
    });
  });

  // Advisors
  DEPT_KEYS.forEach(dept => {
    YEARS.forEach(yr => {
      SECTIONS.forEach(sec => {
        usersToInsert.push({
          id: `ADV${dept}${yr}${sec}`,
          password: "advisor123",
          role: "advisor",
          name: ADV_NAMES[ai++ % ADV_NAMES.length],
          dept,
          year: yr,
          section: sec,
        });
      });
    });
    
    // HODs
    usersToInsert.push({
      id: `HOD${dept}`,
      password: "hod123",
      role: "hod",
      name: HOD_NAMES[dept],
      dept,
    });
  });
  
  return usersToInsert;
};

const SEED_APPLICATIONS = [
  {
    id: "OD-001",
    studentId: "714024104200",
    studentName: "714024104200",
    dept: "CS",
    year: 3,
    section: "D",
    rollNo: "200",
    requestType: "od",
    fromDate: "2026-08-10",
    fromTime: "09:00",
    toDate: "2026-08-12",
    toTime: "18:00",
    reason: "Smart India Hackathon 2026 Grand Finale at MIT World Peace University — Presenting AI Autonomous Traffic System",
    coApplicants: ["714024104189", "714024104190"],
    photo: "/students/714024104200.jpg",
    attachmentName: "SIH2026_Selection_Letter.pdf",
    letter: "29 August 2026\n\nTo,\nProf. Suresh Babu\nHead of the Department of Computer Science\n\nAnd\n\nProf. Arun M\nClass Advisor — CS3D\n\nRespected Faculty Members,\n\nSubject: Requisition for On-Duty (OD) Permission — Smart India Hackathon 2026\n\nI am writing to formally request On-Duty (OD) permission for 3 days from 10 August 2026 to 12 August 2026. Our team has qualified for the Grand Finale of Smart India Hackathon 2026 at MIT.\n\nKindly grant OD attendance for the mentioned duration.\n\nYours faithfully,\n714024104200\nRoll No: 200, CS3D",
    status: "completed",
    current_assignee_id: null,
    submittedAt: "2026-08-07",
  },
  {
    id: "OD-002",
    studentId: "714024104200",
    studentName: "714024104200",
    dept: "CS",
    year: 3,
    section: "D",
    rollNo: "200",
    requestType: "gatepass",
    fromDate: "2026-09-02",
    fromTime: "10:00",
    toDate: "2026-09-05",
    toTime: "17:00",
    reason: "Paper presentation on Quantum Computing & Cryptography at IEEE International Conference",
    coApplicants: ["714024104189"],
    photo: "/students/714024104200.jpg",
    attachmentName: "IEEE_Acceptance_Letter.pdf",
    letter: "29 August 2026\n\nTo,\nProf. Suresh Babu\nHead of the Department of Computer Science\n\nAnd\n\nProf. Arun M\nClass Advisor — CS3D\n\nRespected Sir/Madam,\n\nSubject: Application for Campus Gate Pass Permission\n\nI request Gate Pass clearance from 02 September 2026 to 05 September 2026 to represent our institution at the IEEE International Conference.\n\nThanking you,\n714024104200 (714024104200)",
    status: "completed",
    current_assignee_id: null,
    submittedAt: "2026-08-27",
  },
  {
    id: "OD-003",
    studentId: "714024104200",
    studentName: "714024104200",
    dept: "CS",
    year: 3,
    section: "D",
    rollNo: "200",
    requestType: "od",
    fromDate: "2026-09-12",
    fromTime: "09:00",
    toDate: "2026-09-14",
    toTime: "18:00",
    reason: "National Cyber Security Championship 2026 at IIT Bombay — Capture The Flag (CTF) Competition",
    coApplicants: ["714024104191"],
    photo: "/students/714024104200.jpg",
    attachmentName: "IITB_CTF_Invite.pdf",
    letter: "29 August 2026\n\nTo,\nProf. Suresh Babu\nHead of Department\n\nAnd\n\nProf. Arun M\nClass Advisor — CS3D\n\nSubject: Request for OD Approval for National Cyber Security Championship\n\nI request OD approval from 12 September 2026 to 14 September 2026 for representing our college at IIT Bombay.\n\nSincerely,\n714024104200",
    status: "in_progress",
    current_assignee_id: "ADVCS3D",
    submittedAt: "2026-08-29",
  },
];

async function seed() {
  console.log("Seeding Users...");
  const users = buildUsers();
  
  // Since we might have lots of users, let's insert in batches
  const batchSize = 50;
  for (let i = 0; i < users.length; i += batchSize) {
    const batch = users.slice(i, i + batchSize);
    
    // We omit 'pass' as it's just local to the old model, we use 'password' in DB
    const cleanBatch = batch.map(u => {
      const { pass, ...rest } = u;
      return rest;
    });

    const { error } = await supabase.from('users').upsert(cleanBatch);
    if (error) {
      console.error("Error inserting users:", error);
      process.exit(1);
    }
  }
  console.log(`Inserted ${users.length} users successfully.`);

  console.log("Seeding Applications...");
  
  const cleanApps = SEED_APPLICATIONS.map(a => {
    return {
      id: a.id,
      studentId: a.studentId,
      studentName: a.studentName,
      dept: a.dept,
      year: a.year,
      section: a.section,
      rollNo: a.rollNo,
      requestType: a.requestType,
      fromDate: a.fromDate,
      fromTime: a.fromTime,
      toDate: a.toDate,
      toTime: a.toTime,
      reason: a.reason,
      coApplicants: a.coApplicants,
      photo: a.photo,
      attachmentName: a.attachmentName,
      letter: a.letter,
      status: a.status,
      current_assignee_id: a.current_assignee_id,
      submittedAt: a.submittedAt
    };
  });

  const { error: appError } = await supabase.from('applications').upsert(cleanApps);
  if (appError) {
    console.error("Error inserting applications:", appError);
    process.exit(1);
  }
  
  console.log(`Inserted ${SEED_APPLICATIONS.length} applications successfully.`);

  const SEED_HISTORY = [
    { applicationId: "OD-001", actionByUserId: "714024104200", actionTaken: "created_and_forwarded", forwardedToUserId: "ADVCS3D" },
    { applicationId: "OD-001", actionByUserId: "ADVCS3D", actionTaken: "forwarded", forwardedToUserId: "HODCS" },
    { applicationId: "OD-001", actionByUserId: "HODCS", actionTaken: "completed" },
    { applicationId: "OD-002", actionByUserId: "714024104200", actionTaken: "created_and_forwarded", forwardedToUserId: "ADVCS3D" },
    { applicationId: "OD-002", actionByUserId: "ADVCS3D", actionTaken: "forwarded", forwardedToUserId: "HODCS" },
    { applicationId: "OD-002", actionByUserId: "HODCS", actionTaken: "completed" },
    { applicationId: "OD-003", actionByUserId: "714024104200", actionTaken: "created_and_forwarded", forwardedToUserId: "ADVCS3D" }
  ];
  await supabase.from('application_routing_history').insert(SEED_HISTORY);

  console.log("Seeding complete!");
}

seed();
