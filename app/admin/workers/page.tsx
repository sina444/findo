'use client';

import { useEffect, useState, useCallback } from 'react';
import { Users, Plus, Edit2, Trash2, CheckCircle, Clock, ListChecks } from 'lucide-react';
import { apiGet, apiPost, apiPut, apiDelete, WORKER_ROLES, TASK_STATUS, TASK_PRIORITY, type Worker, type Task } from '@/lib/greenhouse-api';
import { PageHeader, SectionCard, Badge, Modal, ConfirmDialog, EmptyState, LoadingGrid, Field, inputClass, StatCard } from '@/components/admin/GreenhouseUI';

export default function WorkersPage() {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [workerModal, setWorkerModal] = useState(false);
  const [taskModal, setTaskModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteType, setDeleteType] = useState<'worker' | 'task'>('worker');
  const [workerForm, setWorkerForm] = useState({ name: '', role: 'WORKER', phone: '', email: '', active: true });
  const [taskForm, setTaskForm] = useState({ title: '', description: '', assignedTo: '', status: 'PENDING', priority: 'MEDIUM', dueDate: '' });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [w, t] = await Promise.all([apiGet<Worker[]>('/workers'), apiGet<Task[]>('/tasks')]);
      setWorkers(w); setTasks(t);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleWorkerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) await apiPut(`/workers/${editingId}`, workerForm);
    else await apiPost('/workers', workerForm);
    setWorkerModal(false); load();
  };

  const handleTaskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await apiPost('/tasks', { ...taskForm, dueDate: taskForm.dueDate ? new Date(taskForm.dueDate) : null });
    setTaskModal(false); load();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await apiDelete(`/${deleteType === 'worker' ? 'workers' : 'tasks'}/${deleteId}`);
    setDeleteId(null); load();
  };

  const completeTask = async (id: string) => {
    await apiPut(`/tasks/${id}`, { status: 'COMPLETED', completedAt: new Date() });
    load();
  };

  const pendingTasks = tasks.filter(t => t.status === 'PENDING' || t.status === 'IN_PROGRESS');

  return (
    <div>
      <PageHeader
        title="کارکنان و وظایف"
        subtitle="مدیریت کارکنان، نقش‌ها و وظایف گلخانه"
        action={
          <div className="flex gap-2">
            <button onClick={() => { setTaskForm({ title: '', description: '', assignedTo: '', status: 'PENDING', priority: 'MEDIUM', dueDate: '' }); setTaskModal(true); }} className="flex items-center gap-2 rounded-lg border border-[#3F6B45] px-4 py-2 text-sm font-medium text-[#3F6B45] hover:bg-[#E8F0E5]">
              <ListChecks className="h-4 w-4" /> وظیفه جدید
            </button>
            <button onClick={() => { setEditingId(null); setWorkerForm({ name: '', role: 'WORKER', phone: '', email: '', active: true }); setWorkerModal(true); }} className="flex items-center gap-2 rounded-lg bg-[#3F6B45] px-4 py-2 text-sm font-medium text-white hover:bg-[#4A7D52]">
              <Plus className="h-4 w-4" /> کارمند جدید
            </button>
          </div>
        }
      />

      {loading ? <LoadingGrid /> : (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard label="کارکنان فعال" value={workers.filter(w => w.active).length} icon={Users} color="bg-[#3F6B45]" />
            <StatCard label="کل کارکنان" value={workers.length} icon={Users} color="bg-[#7FA77D]" />
            <StatCard label="وظایف در انتظار" value={pendingTasks.length} icon={Clock} color="bg-amber-500" />
            <StatCard label="وظایف تکمیل شده" value={tasks.filter(t => t.status === 'COMPLETED').length} icon={CheckCircle} color="bg-green-500" />
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <SectionCard title="کارکنان">
              {workers.length === 0 ? <EmptyState title="کارمندی ثبت نشده است" icon={Users} /> : (
                <div className="space-y-2">
                  {workers.map(w => (
                    <div key={w.id} className="flex items-center justify-between rounded-lg border border-[#E8F0E5] p-3">
                      <div>
                        <p className="font-medium text-[#20251F]">{w.name}</p>
                        <p className="text-xs text-[#687067]">{w.phone || 'بدون تلفن'}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge color={w.role === 'ADMIN' ? 'red' : w.role === 'GREENHOUSE_MANAGER' ? 'purple' : w.role === 'AGRONOMIST' ? 'blue' : 'gray'}>
                          {WORKER_ROLES[w.role]}
                        </Badge>
                        <button onClick={() => { setEditingId(w.id); setWorkerForm({ name: w.name, role: w.role, phone: w.phone || '', email: w.email || '', active: w.active }); setWorkerModal(true); }} className="rounded p-1.5 text-[#687067] hover:bg-[#F7F5EC]"><Edit2 className="h-4 w-4" /></button>
                        <button onClick={() => { setDeleteId(w.id); setDeleteType('worker'); }} className="rounded p-1.5 text-red-500 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </SectionCard>

            <SectionCard title="وظایف">
              {tasks.length === 0 ? <EmptyState title="وظیفه‌ای ثبت نشده است" icon={ListChecks} /> : (
                <div className="space-y-2">
                  {tasks.map(task => (
                    <div key={task.id} className="flex items-center justify-between rounded-lg border border-[#E8F0E5] p-3">
                      <div className="flex-1">
                        <p className={`text-sm font-medium ${task.status === 'COMPLETED' ? 'text-[#687067] line-through' : 'text-[#20251F]'}`}>{task.title}</p>
                        {task.assignedTo && <p className="text-xs text-[#687067]">مسئول: {task.assignedTo}</p>}
                        {task.dueDate && <p className="text-xs text-[#687067]">مهلت: {new Date(task.dueDate).toLocaleDateString('fa-IR')}</p>}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge color={task.priority === 'HIGH' ? 'red' : task.priority === 'MEDIUM' ? 'yellow' : 'gray'}>{TASK_PRIORITY[task.priority]}</Badge>
                        <Badge color={task.status === 'COMPLETED' ? 'green' : task.status === 'IN_PROGRESS' ? 'blue' : 'gray'}>{TASK_STATUS[task.status]}</Badge>
                        {task.status !== 'COMPLETED' && <button onClick={() => completeTask(task.id)} className="rounded p-1.5 text-[#3F6B45] hover:bg-[#E8F0E5]"><CheckCircle className="h-4 w-4" /></button>}
                        <button onClick={() => { setDeleteId(task.id); setDeleteType('task'); }} className="rounded p-1.5 text-red-500 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </SectionCard>
          </div>
        </>
      )}

      {/* Worker modal */}
      <Modal open={workerModal} onClose={() => setWorkerModal(false)} title={editingId ? 'ویرایش کارمند' : 'کارمند جدید'}>
        <form onSubmit={handleWorkerSubmit} className="space-y-4">
          <Field label="نام و نام خانوادگی" required><input className={inputClass} value={workerForm.name} onChange={e => setWorkerForm({ ...workerForm, name: e.target.value })} required /></Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="نقش">
              <select className={inputClass} value={workerForm.role} onChange={e => setWorkerForm({ ...workerForm, role: e.target.value })}>
                {Object.entries(WORKER_ROLES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </Field>
            <Field label="تلفن"><input className={inputClass} value={workerForm.phone} onChange={e => setWorkerForm({ ...workerForm, phone: e.target.value })} /></Field>
          </div>
          <Field label="ایمیل"><input className={inputClass} value={workerForm.email} onChange={e => setWorkerForm({ ...workerForm, email: e.target.value })} /></Field>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={workerForm.active} onChange={e => setWorkerForm({ ...workerForm, active: e.target.checked })} />
            فعال
          </label>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setWorkerModal(false)} className="rounded-lg border border-[#E8F0E5] px-4 py-2 text-sm text-[#687067] hover:bg-[#F7F5EC]">انصراف</button>
            <button type="submit" className="rounded-lg bg-[#3F6B45] px-4 py-2 text-sm font-medium text-white hover:bg-[#4A7D52]">ذخیره</button>
          </div>
        </form>
      </Modal>

      {/* Task modal */}
      <Modal open={taskModal} onClose={() => setTaskModal(false)} title="وظیفه جدید">
        <form onSubmit={handleTaskSubmit} className="space-y-4">
          <Field label="عنوان" required><input className={inputClass} value={taskForm.title} onChange={e => setTaskForm({ ...taskForm, title: e.target.value })} required /></Field>
          <Field label="توضیحات"><textarea className={inputClass} rows={2} value={taskForm.description} onChange={e => setTaskForm({ ...taskForm, description: e.target.value })} /></Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="مسئول"><input className={inputClass} value={taskForm.assignedTo} onChange={e => setTaskForm({ ...taskForm, assignedTo: e.target.value })} /></Field>
            <Field label="اولویت">
              <select className={inputClass} value={taskForm.priority} onChange={e => setTaskForm({ ...taskForm, priority: e.target.value })}>
                {Object.entries(TASK_PRIORITY).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </Field>
            <Field label="مهلت انجام"><input type="date" className={inputClass} value={taskForm.dueDate} onChange={e => setTaskForm({ ...taskForm, dueDate: e.target.value })} /></Field>
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setTaskModal(false)} className="rounded-lg border border-[#E8F0E5] px-4 py-2 text-sm text-[#687067] hover:bg-[#F7F5EC]">انصراف</button>
            <button type="submit" className="rounded-lg bg-[#3F6B45] px-4 py-2 text-sm font-medium text-white hover:bg-[#4A7D52]">ذخیره</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="حذف" message="آیا از حذف مطمئن هستید؟" />
    </div>
  );
}
