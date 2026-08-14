export type WorkType = 'Full-Time' | 'Part-Time' | 'Freelance' | 'Temporary' | 'Internship'
export type WorkMode = 'On-site' | 'Hybrid' | 'Remote'
export type ApplicationMethod = 'whatsapp' | 'email' | 'url'

export interface Job {
  id: string
  title: string
  company_name: string
  company_logo_url: string | null
  company_description: string
  location: string
  category: string
  work_type: WorkType
  work_mode: WorkMode
  short_description: string
  description: string
  requirements: string[]
  responsibilities: string[]
  salary_min: number | null
  salary_max: number | null
  salary_display: string | null
  salary_period: string | null
  application_method: ApplicationMethod
  application_email: string | null
  application_whatsapp: string | null
  application_url: string | null
  is_active: boolean
  is_featured: boolean
  is_urgent: boolean
  created_at: string
  updated_at: string
}

export type JobFormValues = Omit<Job, 'id' | 'created_at' | 'updated_at'>

export interface JobFilters {
  query: string
  location: string
  category: string
  workType: string
  latestOnly: boolean
}

export const emptyJobForm: JobFormValues = {
  title: '', company_name: '', company_logo_url: null, company_description: '',
  location: '', category: '', work_type: 'Part-Time', work_mode: 'On-site',
  short_description: '', description: '', requirements: [], responsibilities: [],
  salary_min: null, salary_max: null, salary_display: null, salary_period: 'jam',
  application_method: 'whatsapp', application_email: null, application_whatsapp: null,
  application_url: null, is_active: true, is_featured: false, is_urgent: false,
}
