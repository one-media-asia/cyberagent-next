const API_BASE =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ??
  "https://api.onemedia.asia";

type DjangoUser = {
  id: number;
  username: string;
  email: string;
};

type ApiError = {
  error?: string;
  detail?: string;
  message?: string;
  errors?: string[];
};

export type LabProgressRecord = {
  course_id: string;
  completed: boolean;
  quiz_score: number | null;
  updated_at?: string;
};

let csrfToken: string | null = null;

async function readJson<T>(response: Response): Promise<T> {
  const body = (await response.json().catch(() => ({}))) as T & ApiError;

  if (!response.ok) {
    throw new Error(
      body.error ||
        body.detail ||
        body.message ||
        body.errors?.join(" ") ||
        `Request failed (${response.status})`
    );
  }

  return body;
}

async function getCsrfToken(): Promise<string> {
  const response = await fetch(`${API_BASE}/api/academy/auth/csrf/`, {
    method: "GET",
    credentials: "include",
    headers: { Accept: "application/json" },
    cache: "no-store",
  });

  const data = await readJson<{ csrfToken?: string }>(response);
  csrfToken = data.csrfToken ?? csrfToken;

  if (!csrfToken) {
    throw new Error("The server did not provide a CSRF token. Please refresh and try again.");
  }

  return csrfToken;
}

async function djangoRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const method = (options.method ?? "GET").toUpperCase();
  const headers = new Headers(options.headers);
  headers.set("Accept", "application/json");

  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (!["GET", "HEAD", "OPTIONS", "TRACE"].includes(method)) {
    headers.set("X-CSRFToken", await getCsrfToken());
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    method,
    headers,
    credentials: "include",
    cache: "no-store",
  });

  return readJson<T>(response);
}

export async function djangoLogin(email: string, password: string) {
  return djangoRequest<{
    authenticated: boolean;
    user?: DjangoUser;
    csrfToken?: string;
  }>("/api/academy/auth/login/", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function djangoRegister(
  username: string,
  email: string,
  password: string
) {
  return djangoRequest<{ registered: boolean; message: string }>(
    "/api/academy/auth/register/",
    {
      method: "POST",
      body: JSON.stringify({ username, email, password }),
    }
  );
}

export async function djangoVerifyEmail(uid: string, token: string) {
  return djangoRequest<{ verified: boolean; message: string }>(
    `/api/academy/auth/verify-email/?uid=${encodeURIComponent(uid)}&token=${encodeURIComponent(token)}`
  );
}

export async function djangoRequestPasswordReset(email: string) {
  return djangoRequest<{ sent: boolean; message: string }>(
    "/api/academy/auth/password-reset/",
    {
      method: "POST",
      body: JSON.stringify({ email }),
    }
  );
}

export async function djangoConfirmPasswordReset(
  uid: string,
  token: string,
  password: string
) {
  return djangoRequest<{ reset: boolean; message: string }>(
    "/api/academy/auth/password-reset/confirm/",
    {
      method: "POST",
      body: JSON.stringify({ uid, token, password }),
    }
  );
}

export async function djangoLogout() {
  return djangoRequest<{ authenticated: boolean }>("/api/academy/auth/logout/", {
    method: "POST",
    body: JSON.stringify({}),
  });
}

export async function djangoMe() {
  return djangoRequest<{
    authenticated: boolean;
    user?: DjangoUser;
  }>("/api/academy/auth/me/");
}

export async function getDjangoLabProgress() {
  return djangoRequest<{
    progress: LabProgressRecord[];
    completed_course_ids: string[];
  }>("/api/academy/student/lab-progress/");
}

export async function saveDjangoLabProgress(
  courseId: string,
  quizScore = 100
) {
  return djangoRequest<{
    saved: boolean;
    created: boolean;
    course_id: string;
    completed: boolean;
    quiz_score: number;
  }>("/api/academy/student/lab-progress/", {
    method: "POST",
    body: JSON.stringify({
      course_id: courseId,
      completed: true,
      quiz_score: quizScore,
    }),
  });
}
