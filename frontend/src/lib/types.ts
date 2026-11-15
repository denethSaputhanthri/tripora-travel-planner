export interface User {
  _id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface Destination {
  _id: string;
  name: string;
  country: string;
  category: "beach" | "city" | "mountain" | "culture" | "adventure";
  description: string;
  imageUrl: string;
  dailyCostUsd: number;
  tips: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Trip {
  _id: string;
  title: string;
  description?: string;
  destination: Destination | string;
  startDate: string;
  endDate: string;
  budgetCents: number;
  budgetCurrency: string;
  owner: string;
  status: "upcoming" | "ongoing" | "completed";
  createdAt: string;
  updatedAt: string;
}

export interface Activity {
  _id: string;
  trip: string;
  title: string;
  type: "accommodation" | "sightseeing" | "food" | "transport";
  date: string;
  startTime?: string;
  endTime?: string;
  notes?: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface Expense {
  _id: string;
  trip: string;
  title: string;
  amountCents: number;
  currency: string;
  category: "accommodation" | "food" | "transport" | "activities" | "shopping" | "other";
  date: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Meta {
  total: number;
  page?: number;
  limit?: number;
  totalPages?: number;
}

export interface ExpenseMeta {
  total: number;
  totalSpentCents: number;
  budgetCents: number;
  budgetCurrency: string;
  remainingCents: number;
}

export interface CreateTripData {
  title: string;
  description?: string;
  destination: string;
  startDate: string;
  endDate: string;
  budgetCents: number;
  budgetCurrency: string;
}

export interface CreateActivityData {
  title: string;
  type: "accommodation" | "sightseeing" | "food" | "transport";
  date: string;
  startTime?: string;
  endTime?: string;
  notes?: string;
  order?: number;
}

export interface CreateExpenseData {
  title: string;
  amountCents: number;
  currency: string;
  category: "accommodation" | "food" | "transport" | "activities" | "shopping" | "other";
  date: string;
  notes?: string;
}
