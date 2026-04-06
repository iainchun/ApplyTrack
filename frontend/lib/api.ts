import { getToken } from "./auth";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResponse = {
  access_token: string;
  token_type: string;
};

export type Application = {
  id: string;
  user_id: string;
  company_name: string;
  role_title: string;
  status: string;
  location?: string | null;
  work_mode?: string | null;
  source?: string | null;
  job_url?: string | null;
  salary_min?: number | null;
  salary_max?: number | null;
  application_date?: string | null;
  deadline_date?: string | null;
  response_date?: string | null;
  jd_text?: string | null;
  notes?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type CreateApplicationRequest = {
  company_name: string;
  role_title: string;
  status: string;
  location?: string;
  work_mode?: string;
  source?: string;
  job_url?: string;
  application_date?: string;
  deadline_date?: string;
  jd_text?: string;
  notes?: string;
};

async function request<T>(
  path: string,
  options: RequestInit = {},
  authRequired = false
): Promise<T> {
  const headers = new Headers(options.headers || {});
  headers.set("Content-Type", "application/json");

  if (authRequired) {
    const token = getToken();
    if (!token) {
      throw new Error("No auth token found");
    }
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let message = "Request failed";
    try {
      const data = await response.json();
      message = data.detail || JSON.stringify(data);
    } catch {
      message = await response.text();
    }
    throw new Error(message);
  }

  if (response.status === 204) {
    return null as T;
  }

  return response.json();
}

export type RegisterRequest = {
  name: string;
  email: string;
  password: string;
};

export type UserResponse = {
  id: string;
  name: string;
  email: string;
};

export async function register(data: RegisterRequest): Promise<UserResponse> {
  return request<UserResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function login(data: LoginRequest): Promise<LoginResponse> {
  return request<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getCurrentUser() {
  return request("/auth/me", { method: "GET" }, true);
}

export async function getApplications(): Promise<Application[]> {
  return request<Application[]>("/applications", { method: "GET" }, true);
}

export async function createApplication(
  data: CreateApplicationRequest
): Promise<Application> {
  return request<Application>(
    "/applications",
    {
      method: "POST",
      body: JSON.stringify(data),
    },
    true
  );
}

export async function getApplication(id: string): Promise<Application> {
  return request<Application>(`/applications/${id}`, { method: "GET" }, true);
}

export async function updateApplication(
  id: string,
  data: Partial<CreateApplicationRequest>
): Promise<Application> {
  return request<Application>(
    `/applications/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(data),
    },
    true
  );
}

export async function deleteApplication(id: string): Promise<void> {
  return request<void>(
    `/applications/${id}`,
    {
      method: "DELETE",
    },
    true
  );
}

export type DashboardSummary = {
  total_applications: number;
  interviews: number;
  offers: number;
  rejected: number;
  response_rate: number;
  offer_rate: number;
};

export type StatusDistributionItem = {
  status: string;
  count: number;
};

export type RecentApplication = {
  id: string;
  company_name: string;
  role_title: string;
  status: string;
  location?: string | null;
  created_at?: string | null;
};

export async function getDashboardSummary(): Promise<DashboardSummary> {
  return request<DashboardSummary>("/analytics/summary", { method: "GET" }, true);
}

export async function getStatusDistribution(): Promise<StatusDistributionItem[]> {
  return request<StatusDistributionItem[]>(
    "/analytics/status-distribution",
    { method: "GET" },
    true
  );
}

export async function getRecentApplications(): Promise<RecentApplication[]> {
  return request<RecentApplication[]>(
    "/analytics/recent-applications",
    { method: "GET" },
    true
  );
}

export type Document = {
  id: string;
  user_id: string;
  document_type: string;
  version_name: string;
  file_url?: string | null;
  tags?: string | null;
  created_at?: string | null;
};

export type CreateDocumentRequest = {
  document_type: string;
  version_name: string;
  file_url?: string;
  tags?: string;
};

export async function getDocuments(): Promise<Document[]> {
  return request<Document[]>("/documents", { method: "GET" }, true);
}

export async function createDocument(
  data: CreateDocumentRequest
): Promise<Document> {
  return request<Document>(
    "/documents",
    {
      method: "POST",
      body: JSON.stringify(data),
    },
    true
  );
}

export async function updateDocument(
  id: string,
  data: Partial<CreateDocumentRequest>
): Promise<Document> {
  return request<Document>(
    `/documents/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(data),
    },
    true
  );
}

export async function deleteDocument(id: string): Promise<void> {
  return request<void>(
    `/documents/${id}`,
    {
      method: "DELETE",
    },
    true
  );
}

export async function getApplicationDocuments(
  applicationId: string
): Promise<Document[]> {
  return request<Document[]>(
    `/applications/${applicationId}/documents`,
    { method: "GET" },
    true
  );
}

export async function linkDocumentsToApplication(
  applicationId: string,
  documentVersionIds: string[]
): Promise<{ message: string }> {
  return request<{ message: string }>(
    `/applications/${applicationId}/documents`,
    {
      method: "POST",
      body: JSON.stringify({
        document_version_ids: documentVersionIds,
      }),
    },
    true
  );
}