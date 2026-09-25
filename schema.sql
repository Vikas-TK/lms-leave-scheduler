-- Table: users
CREATE TABLE IF NOT EXISTS public.users (
    id TEXT PRIMARY KEY,
    role TEXT NOT NULL,
    password TEXT NOT NULL,
    name TEXT,
    dept TEXT,
    year INTEGER,
    section TEXT,
    "rollNo" TEXT,
    "regNo" TEXT,
    photo TEXT
);

-- Table: applications
CREATE TABLE IF NOT EXISTS public.applications (
    id TEXT PRIMARY KEY,
    "studentId" TEXT NOT NULL,
    "studentName" TEXT,
    dept TEXT,
    year INTEGER,
    section TEXT,
    "rollNo" TEXT,
    "requestType" TEXT,
    "fromDate" TEXT,
    "fromTime" TEXT,
    "toDate" TEXT,
    "toTime" TEXT,
    reason TEXT,
    "coApplicants" JSONB,
    photo TEXT,
    "attachmentName" TEXT,
    letter TEXT,
    status TEXT DEFAULT 'draft',
    "current_assignee_id" TEXT REFERENCES public.users(id),
    "submittedAt" TEXT,
    "validityRef" TEXT,
    "signedBy" JSONB
);

-- Table: application_routing_history
CREATE TABLE IF NOT EXISTS public.application_routing_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "applicationId" TEXT NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
    "actionByUserId" TEXT NOT NULL REFERENCES public.users(id),
    "forwardedToUserId" TEXT REFERENCES public.users(id),
    "actionTaken" TEXT NOT NULL,
    comments TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Note: Because this is just for a school project demo, we aren't setting up complex Row Level Security (RLS) policies right now. 
-- In a real-world application, RLS would be used to ensure students can only see their own applications.
-- For now, we will disable RLS so our frontend can read and write freely during development.
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.application_routing_history DISABLE ROW LEVEL SECURITY;
