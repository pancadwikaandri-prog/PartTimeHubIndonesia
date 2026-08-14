alter table public.jobs drop constraint if exists jobs_work_type_check;

alter table public.jobs
add constraint jobs_work_type_check
check (work_type in ('Full-Time', 'Part-Time', 'Freelance', 'Temporary', 'Internship'));
