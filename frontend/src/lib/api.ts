import type {
  User,
  Destination,
  Trip,
  Activity,
  Expense,
  Meta,
  ExpenseMeta,
  CreateTripData,
  CreateActivityData,
  CreateExpenseData,
} from "./types";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: "Request failed" }));
    throw new Error(body.message || "Request failed");
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

// Auth
export const authApi = {
  register: (data: { name: string; email: string; password: string }) =>
    request<{ user: User }>("/auth/register", { method: "POST", body: JSON.stringify(data) }),
  login: (data: { email: string; password: string }) =>
    request<{ user: User }>("/auth/login", { method: "POST", body: JSON.stringify(data) }),
  logout: () => request("/auth/logout", { method: "POST" }),
  me: () => request<{ user: User }>("/auth/me"),
};

// Destinations
export const destinationsApi = {
  list: (params?: Record<string, string>) =>
    request<{ items: Destination[]; meta: Meta }>(`/destinations?${new URLSearchParams(params)}`),
  get: (id: string) => request<{ destination: Destination }>(`/destinations/${id}`),
};

// Favorites
export const favoritesApi = {
  list: () => request<{ items: Destination[] }>("/users/me/favorites"),
  add: (id: string) => request(`/users/me/favorites/${id}`, { method: "POST" }),
  remove: (id: string) => request(`/users/me/favorites/${id}`, { method: "DELETE" }),
};

// Trips
export const tripsApi = {
  list: () => request<{ items: Trip[]; meta: { total: number } }>("/trips"),
  get: (id: string) => request<{ trip: Trip }>(`/trips/${id}`),
  create: (data: CreateTripData) =>
    request<{ trip: Trip }>("/trips", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: Partial<CreateTripData>) =>
    request<{ trip: Trip }>(`/trips/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  delete: (id: string) => request(`/trips/${id}`, { method: "DELETE" }),
};

// Itinerary
export const itineraryApi = {
  list: (tripId: string) =>
    request<{ items: Activity[]; meta: { total: number } }>(`/trips/${tripId}/itinerary`),
  create: (tripId: string, data: CreateActivityData) =>
    request(`/trips/${tripId}/itinerary`, { method: "POST", body: JSON.stringify(data) }),
  update: (tripId: string, id: string, data: Partial<CreateActivityData>) =>
    request(`/trips/${tripId}/itinerary/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  delete: (tripId: string, id: string) =>
    request(`/trips/${tripId}/itinerary/${id}`, { method: "DELETE" }),
};

// Expenses
export const expensesApi = {
  list: (tripId: string) =>
    request<{ items: Expense[]; meta: ExpenseMeta }>(`/trips/${tripId}/expenses`),
  create: (tripId: string, data: CreateExpenseData) =>
    request(`/trips/${tripId}/expenses`, { method: "POST", body: JSON.stringify(data) }),
  update: (tripId: string, id: string, data: Partial<CreateExpenseData>) =>
    request(`/trips/${tripId}/expenses/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  delete: (tripId: string, id: string) =>
    request(`/trips/${tripId}/expenses/${id}`, { method: "DELETE" }),
};
