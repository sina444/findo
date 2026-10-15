'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Thermometer, Droplets, Sun, Wind, Cpu, Sprout, AlertCircle,
  TrendingUp, Activity, Zap, Beaker
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, AreaChart, Area
} from 'recharts';
import { apiGet } from '@/lib/greenhouse-api';
import {
  StatCard, SectionCard, Badge, EmptyState, LoadingGrid, PageHeader, StatusDot, SENSOR_TYPES
} from '@/components/admin/GreenhouseUI';

interface Greenhouse { id: string; name: string; location: string; area: number; sensors: Sensor[]; equipment: Equipment[]; crops: Crop[]; }
interface Sensor { id: string; name: string; type: string; unit: string; status: string; lastReading: number | null; lastReadingAt: string | null; }
interface Equipment { id: string; name: string; type: string; status: string; }
interface Crop { id: string; name: string; growthStage: string; status: string; }
interface Alert { id: string; type: string; severity: string; message: string; acknowledged: boolean; createdAt: string; }
interface Reading { id: string; sensorId: string; value: number; timestamp: string; }

const SENSOR_ICONS: Record<string, any> = {
  TEMPERATURE: Thermometer, HUMIDITY: Droplets, LIGHT: Sun, CO2: Wind,
  SOIL_MOISTURE: Droplets, SOIL_PH: Beaker, EC: Zap,
};

const SENSOR_COLORS: Record<string, string> = {
  TEMPERATURE: '#ef4444', HUMIDITY: '#3b82f6', LIGHT: '#f59e0b', CO2: '#8b5cf6',
  SOIL_MOISTURE: '#06b6d4', SOIL_PH: '#10b981', EC: '#f97316',
};

export default function GreenhouseDashboard() {
  const [greenhouses, setGreenhouses] = useState<Greenhouse[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [readings, setReadings] = useState<Reading[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [ghData, alertData] = await Promise.all([
        apiGet<Greenhouse[]>('/greenhouse'),
        apiGet<Alert[]>('/alerts'),
      ]);
      setGreenhouses(ghData);
      setAlerts(alertData.filter(a => !a.acknowledged).slice(0, 5));
      if (ghData.length > 0 && !selectedId) setSelectedId(ghData[0].id);
    } catch (e) {
      // data not yet seeded
    }
    setLoading(false);
  }, [selectedId]);

  useEffect(() => { loadData(); }, [loadData]);

  useEffect(() => {
    if (!selectedId) return;
    const gh = greenhouses.find(g => g.id === selectedId);
    if (!gh) return;

    // Load readings for all sensors in this greenhouse
    Promise.all(
      gh.sensors.map(s => apiGet<Reading[]>(`/sensor-readings?sensorId=${s.id}&hours=24`))
    ).then(results => {
      setReadings(results.flat());
    }).catch(() => {});
  }, [selectedId, greenhouses]);

  const selectedGh = greenhouses.find(g => g.id === selectedId);

  // Group readings by sensor for charts
  const sensorChartData = (selectedGh?.sensors || []).map(sensor => {
    const sensorReadings = readings.filter(r => r.sensorId === sensor.id);
    return {
      sensor,
      data: sensorReadings.map(r => ({
        time: new Date(r.timestamp).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
        value: r.value,
      })),
    };
  });

  // Equipment stats
  const equipmentStats = selectedGh?.equipment.reduce((acc, eq) => {
    acc[eq.status] = (acc[eq.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  // Active crops
  const activeCrops = selectedGh?.crops.filter(c => c.status === 'ACTIVE') || [];

  return (
    <div>
      <PageHeader
        title="داشبورد گلخانه هوشمند"
        subtitle="نظارت لحظه‌ای بر وضعیت گلخانه، حسگرها و تجهیزات"
        action={
          greenhouses.length > 0 ? (
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className="rounded-lg border border-[#E8F0E5] bg-white px-4 py-2 text-sm text-[#20251F] outline-none focus:border-[#3F6B45]"
            >
              {greenhouses.map(gh => (
                <option key={gh.id} value={gh.id}>{gh.name} — {gh.location}</option>
              ))}
            </select>
          ) : undefined
        }
      />

      {loading ? (
        <LoadingGrid count={4} />
      ) : !selectedGh ? (
        <SectionCard>
          <EmptyState
            title="هیچ گلخانه‌ای ثبت نشده است"
            message="برای شروع، ابتدا یک گلخانه جدید ایجاد کنید"
            icon={Sprout}
          />
        </SectionCard>
      ) : (
        <>
          {/* Sensor stat cards */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {selectedGh.sensors.slice(0, 4).map(sensor => {
              const Icon = SENSOR_ICONS[sensor.type] || Activity;
              const color = SENSOR_COLORS[sensor.type] || '#3F6B45';
              return (
                <StatCard
                  key={sensor.id}
                  label={SENSOR_TYPES[sensor.type] || sensor.type}
                  value={sensor.lastReading ?? '—'}
                  unit={sensor.unit}
                  icon={Icon}
                  color=""
                  sublabel={sensor.status === 'ONLINE' ? 'آنلاین' : sensor.status === 'OFFLINE' ? 'آفلاین' : 'خطا'}
                />
              );
            })}
          </div>

          {/* Quick stats */}
          <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard label="تجهیزات فعال" value={equipmentStats.ONLINE || 0} icon={Cpu} color="bg-[#3F6B45]" />
            <StatCard label="محصولات فعال" value={activeCrops.length} icon={Sprout} color="bg-[#7FA77D]" />
            <StatCard label="حسگرهای آنلاین" value={selectedGh.sensors.filter(s => s.status === 'ONLINE').length} icon={Activity} color="bg-[#AFC8A8]" />
            <StatCard label="هشدارهای فعال" value={alerts.length} icon={AlertCircle} color="bg-[#C9825A]" />
          </div>

          {/* Charts */}
          <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
            {sensorChartData.filter(s => s.data.length > 0).slice(0, 4).map(({ sensor, data }) => {
              const color = SENSOR_COLORS[sensor.type] || '#3F6B45';
              return (
                <SectionCard key={sensor.id} title={`${SENSOR_TYPES[sensor.type] || sensor.type} — ${sensor.name}`}>
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={data}>
                      <defs>
                        <linearGradient id={`grad-${sensor.id}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={color} stopOpacity={0.3} />
                          <stop offset="100%" stopColor={color} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E8F0E5" />
                      <XAxis dataKey="time" tick={{ fontSize: 11 }} stroke="#687067" />
                      <YAxis tick={{ fontSize: 11 }} stroke="#687067" />
                      <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                      <Area type="monotone" dataKey="value" stroke={color} strokeWidth={2} fill={`url(#grad-${sensor.id})`} />
                    </AreaChart>
                  </ResponsiveContainer>
                  {sensor.status !== 'ONLINE' && (
                    <p className="mt-2 text-xs text-amber-600">⚠ حسگر {sensor.status === 'OFFLINE' ? 'آفلاین است' : 'خطا دارد'}</p>
                  )}
                </SectionCard>
              );
            })}
          </div>

          {/* Alerts & Equipment */}
          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            <SectionCard title="هشدارهای اخیر">
              {alerts.length === 0 ? (
                <EmptyState title="هیچ هشدار فعالی وجود ندارد" icon={AlertCircle} />
              ) : (
                <div className="space-y-2">
                  {alerts.map(alert => (
                    <div key={alert.id} className="flex items-start gap-2 rounded-lg border border-[#E8F0E5] p-3">
                      <Badge color={alert.severity === 'CRITICAL' ? 'red' : alert.severity === 'WARNING' ? 'yellow' : 'blue'}>
                        {alert.severity === 'CRITICAL' ? 'بحرانی' : alert.severity === 'WARNING' ? 'هشدار' : 'اطلاع'}
                      </Badge>
                      <p className="flex-1 text-sm text-[#20251F]">{alert.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </SectionCard>

            <SectionCard title="وضعیت تجهیزات">
              {selectedGh.equipment.length === 0 ? (
                <EmptyState title="تجهیزاتی ثبت نشده است" icon={Cpu} />
              ) : (
                <div className="space-y-2">
                  {selectedGh.equipment.slice(0, 5).map(eq => (
                    <div key={eq.id} className="flex items-center justify-between rounded-lg border border-[#E8F0E5] p-3">
                      <div className="flex items-center gap-2">
                        <StatusDot status={eq.status} />
                        <span className="text-sm text-[#20251F]">{eq.name}</span>
                      </div>
                      <Badge color={eq.status === 'ONLINE' ? 'green' : eq.status === 'OFFLINE' ? 'gray' : 'yellow'}>
                        {eq.status === 'ONLINE' ? 'آنلاین' : eq.status === 'OFFLINE' ? 'آفلاین' : eq.status === 'MAINTENANCE' ? 'در تعمیر' : 'خطا'}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </SectionCard>
          </div>

          {/* Active crops */}
          <div className="mt-6">
            <SectionCard title="محصولات در حال کشت">
              {activeCrops.length === 0 ? (
                <EmptyState title="محصول فعالی وجود ندارد" icon={Sprout} />
              ) : (
                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                  {activeCrops.map(crop => (
                    <div key={crop.id} className="rounded-lg border border-[#E8F0E5] p-4">
                      <p className="font-medium text-[#20251F]">{crop.name}</p>
                      <Badge color="green">{crop.growthStage === 'SEEDLING' ? 'پاجوش' : crop.growthStage === 'VEGETATIVE' ? 'رویشی' : crop.growthStage === 'FLOWERING' ? 'گلدهی' : crop.growthStage === 'FRUITING' ? 'میوه‌دهی' : crop.growthStage === 'HARVEST_READY' ? 'آماده برداشت' : 'برداشت شده'}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </SectionCard>
          </div>
        </>
      )}
    </div>
  );
}
