const API_BASE = '/api';

export async function apiGet<T = any>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function apiPost<T = any>(path: string, data?: any): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: data ? JSON.stringify(data) : undefined,
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function apiPut<T = any>(path: string, data: any): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function apiDelete<T = any>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, { method: 'DELETE' });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
