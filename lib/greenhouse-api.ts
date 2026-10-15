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

// ===== Greenhouse-specific types =====

export interface Greenhouse {
  id: string;
  name: string;
  location: string;
  area: number;
  description?: string;
  active: boolean;
}

export interface Sensor {
  id: string;
  greenhouseId: string;
  name: string;
  type: string;
  unit: string;
  status: string;
  lastReading?: number | null;
  lastReadingAt?: string | null;
}

export interface SensorReading {
  id: string;
  sensorId: string;
  value: number;
  timestamp: string;
}

export interface Crop {
  id: string;
  greenhouseId: string;
  name: string;
  variety?: string;
  plantDate: string;
  harvestDate?: string;
  expectedHarvestDate?: string;
  plantCount: number;
  area: number;
  growthStage: string;
  status: string;
  notes?: string;
}

export interface IrrigationSchedule {
  id: string;
  greenhouseId: string;
  cropId?: string;
  name: string;
  method: string;
  frequency: string;
  durationMin: number;
  waterAmount: number;
  active: boolean;
  notes?: string;
}

export interface IrrigationLog {
  id: string;
  greenhouseId: string;
  cropId?: string;
  method: string;
  durationMin: number;
  waterAmount: number;
  timestamp: string;
  notes?: string;
}

export interface Equipment {
  id: string;
  greenhouseId: string;
  name: string;
  type: string;
  status: string;
  lastService?: string;
  nextService?: string;
  notes?: string;
}

export interface Alert {
  id: string;
  type: string;
  severity: string;
  message: string;
  source?: string;
  acknowledged: boolean;
  createdAt: string;
}

export interface Expense {
  id: string;
  category: string;
  description: string;
  amount: number;
  date: string;
  cropId?: string;
  notes?: string;
}

export interface Harvest {
  id: string;
  cropId: string;
  amount: number;
  quality: string;
  date: string;
  notes?: string;
}

export interface Worker {
  id: string;
  name: string;
  role: string;
  phone?: string;
  email?: string;
  active: boolean;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  assignedTo?: string;
  status: string;
  priority: string;
  dueDate?: string;
  completedAt?: string;
}

export interface PlantScan {
  id: string;
  cropId?: string;
  imageUrl: string;
  diagnosis?: string;
  confidence?: number;
  symptoms?: string;
  recommendations?: string;
  notes?: string;
  createdAt: string;
}

// ===== Label maps (Persian) =====

export const SENSOR_TYPES: Record<string, string> = {
  TEMPERATURE: 'دما',
  HUMIDITY: 'رطوبت هوا',
  LIGHT: 'نور',
  CO2: 'دی‌اکسید کربن',
  SOIL_MOISTURE: 'رطوبت خاک',
  SOIL_PH: 'اسیدیته خاک',
  EC: 'هدایت الکتریکی',
};

export const EQUIPMENT_TYPES: Record<string, string> = {
  FAN: 'فن تهویه',
  PUMP: 'پمپ آب',
  HEATER: 'سیستم گرمایش',
  COOLER: 'سیستم سرمایش',
  LIGHT: 'سیستم نورپردازی',
  SENSOR: 'حسگر',
  OTHER: 'سایر',
};

export const GROWTH_STAGES: Record<string, string> = {
  SEEDLING: 'پاجوش',
  VEGETATIVE: 'رویشی',
  FLOWERING: 'گلدهی',
  FRUITING: 'میوه‌دهی',
  HARVEST_READY: 'آماده برداشت',
  HARVESTED: 'برداشت شده',
};

export const CROP_STATUS: Record<string, string> = {
  ACTIVE: 'فعال',
  HARVESTED: 'برداشت شده',
  FAILED: 'ناموفق',
};

export const EXPENSE_CATEGORIES: Record<string, string> = {
  SEED: 'بذر و نشا',
  FERTILIZER: 'کود و سم',
  WATER: 'آب',
  ELECTRICITY: 'برق',
  LABOR: 'نیروی انسانی',
  EQUIPMENT: 'تجهیزات',
  REPAIR: 'تعمیرات',
  OTHER: 'سایر',
};

export const WORKER_ROLES: Record<string, string> = {
  ADMIN: 'مدیر اصلی',
  GREENHOUSE_MANAGER: 'مدیر گلخانه',
  AGRONOMIST: 'کارشناس کشاورزی',
  WORKER: 'کارمند',
  VIEWER: 'مشاهده‌کننده',
};

export const TASK_STATUS: Record<string, string> = {
  PENDING: 'در انتظار',
  IN_PROGRESS: 'در حال انجام',
  COMPLETED: 'تکمیل شده',
  CANCELLED: 'لغو شده',
};

export const TASK_PRIORITY: Record<string, string> = {
  LOW: 'کم',
  MEDIUM: 'متوسط',
  HIGH: 'زیاد',
};

export const ALERT_SEVERITY: Record<string, string> = {
  INFO: 'اطلاع‌رسانی',
  WARNING: 'هشدار',
  CRITICAL: 'بحرانی',
};

export const IRRIGATION_METHODS: Record<string, string> = {
  DRIP: 'قطره‌ای',
  SPRINKLER: 'اسپرینکلر',
  FLOOD: 'غرقابی',
  MANUAL: 'دستی',
};
