'use client';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  FlaskConical,
  Wrench,
  Package,
  Users,
  CircleDot,
  CalendarClock,
  Activity,
  BarChart3,
  ClipboardList,
  Settings,
} from 'lucide-react';
import { INITIAL_CUBICLES, STATUS_COLORS, STATUS_LABELS } from '@/lib/cubicleData';
import { ThemeProvider } from '@/components/ThemeProvider';
import Ribbon from '@/components/Ribbon';

function CubicleDetailContent() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const cubicle = INITIAL_CUBICLES.find(c => c.id === id);

  if (!cubicle) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4" style={{ background: 'var(--ipqc-bg)', color: 'var(--ipqc-text-primary)' }}>
        <FlaskConical size={48} style={{ color: 'var(--ipqc-accent)' }} />
        <p className="text-xl font-semibold">Cubicle not found</p>
        <p className="text-sm" style={{ color: 'var(--ipqc-text-muted)' }}>ID: {id}</p>
        <button
          onClick={() => router.push('/')}
          className="mt-2 px-4 py-2 rounded-xl text-sm font-medium"
          style={{ background: 'var(--ipqc-accent)', color: '#fff' }}
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  const statusColor = STATUS_COLORS[cubicle.status];

  const tabs = [
    { icon: Activity, label: 'Overview' },
    { icon: Wrench, label: 'Instruments' },
    { icon: Package, label: 'Equipment' },
    { icon: Users, label: 'Team' },
    { icon: ClipboardList, label: 'Logs' },
    { icon: BarChart3, label: 'Analytics' },
    { icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="min-h-screen" style={{ background: 'var(--ipqc-bg)', fontFamily: 'Inter, sans-serif' }}>
      {/* Ribbon */}
      <Ribbon />

      {/* Main content below ribbon */}
      <div className="pt-[72px]">
        {/* Back bar */}
        <div
          className="flex items-center gap-4 px-6 py-3"
          style={{ background: 'var(--ipqc-surface)', borderBottom: '1px solid var(--ipqc-border)' }}
        >
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-sm font-medium px-3 py-1.5 rounded-xl transition-colors"
            style={{
              color: 'var(--ipqc-text-muted)',
              border: '1px solid var(--ipqc-border)',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--ipqc-surface-hover)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
          >
            <ArrowLeft size={15} />
            Back to Dashboard
          </motion.button>

          <div className="flex items-center gap-2">
            <span style={{ color: 'var(--ipqc-text-muted)', fontSize: 13 }}>Floor</span>
            <span style={{ color: 'var(--ipqc-text-muted)' }}>/</span>
            <span className="text-sm font-semibold" style={{ color: 'var(--ipqc-text-primary)' }}>{cubicle.name}</span>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-8">
          {/* Hero card */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="rounded-2xl overflow-hidden mb-6"
            style={{
              background: 'var(--ipqc-surface)',
              border: '1px solid var(--ipqc-border)',
              boxShadow: 'var(--ipqc-menu-shadow)',
            }}
          >
            {/* Color band */}
            <div
              className="h-2 w-full"
              style={{ background: `linear-gradient(90deg, ${cubicle.color}, ${statusColor})` }}
            />

            <div className="p-6 flex flex-wrap items-center gap-6">
              {/* Icon */}
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{
                  background: cubicle.color + '18',
                  border: `2px solid ${cubicle.color}33`,
                  boxShadow: `0 4px 20px ${cubicle.color}22`,
                }}
              >
                <CircleDot size={28} style={{ color: cubicle.color }} />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-2xl font-bold" style={{ color: 'var(--ipqc-text-primary)' }}>
                    {cubicle.name}
                  </h1>
                  <span
                    className="text-xs font-semibold px-3 py-1 rounded-full"
                    style={{ background: statusColor + '20', color: statusColor }}
                  >
                    {STATUS_LABELS[cubicle.status]}
                  </span>
                </div>
                <p className="text-sm mt-1" style={{ color: 'var(--ipqc-text-muted)' }}>
                  ID: {cubicle.id.toUpperCase()} &bull; {cubicle.instruments.length} instruments &bull; {cubicle.employees.length} staff members
                </p>
              </div>

              {/* Quick stats */}
              <div className="flex gap-4">
                {[
                  { label: 'Instruments', value: cubicle.instruments.length, color: '#7c3aed' },
                  { label: 'Equipment', value: cubicle.equipment.length, color: '#2563eb' },
                  { label: 'Staff', value: cubicle.employees.length, color: '#0f766e' },
                ].map(s => (
                  <div key={s.label} className="text-center">
                    <div className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</div>
                    <div className="text-[11px] mt-0.5" style={{ color: 'var(--ipqc-text-muted)' }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tab bar */}
            <div
              className="flex overflow-x-auto px-6"
              style={{ borderTop: '1px solid var(--ipqc-border)' }}
            >
              {tabs.map((tab, i) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.label}
                    className="flex items-center gap-1.5 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2"
                    style={{
                      color: i === 0 ? 'var(--ipqc-accent)' : 'var(--ipqc-text-muted)',
                      borderBottomColor: i === 0 ? 'var(--ipqc-accent)' : 'transparent',
                    }}
                    onMouseEnter={e => { if (i !== 0) (e.currentTarget as HTMLButtonElement).style.color = 'var(--ipqc-text-primary)'; }}
                    onMouseLeave={e => { if (i !== 0) (e.currentTarget as HTMLButtonElement).style.color = 'var(--ipqc-text-muted)'; }}
                  >
                    <Icon size={14} />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </motion.div>

          {/* Content grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">

            {/* Instruments */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 }}
              className="rounded-2xl p-5"
              style={{ background: 'var(--ipqc-surface)', border: '1px solid var(--ipqc-border)', boxShadow: 'var(--ipqc-card-shadow)' }}
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: '#7c3aed18' }}>
                  <Wrench size={15} style={{ color: '#7c3aed' }} />
                </div>
                <span className="font-semibold text-sm" style={{ color: 'var(--ipqc-text-primary)' }}>Instruments</span>
                <span className="ml-auto text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--ipqc-accent-ultra-light)', color: 'var(--ipqc-accent)' }}>
                  {cubicle.instruments.length}
                </span>
              </div>
              {cubicle.instruments.length > 0 ? (
                <div className="space-y-2">
                  {cubicle.instruments.map((inst, i) => (
                    <div
                      key={inst}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
                      style={{ background: 'var(--ipqc-bg)', border: '1px solid var(--ipqc-border)' }}
                    >
                      <span className="w-6 h-6 rounded-lg text-[10px] font-bold flex items-center justify-center flex-shrink-0"
                        style={{ background: 'var(--ipqc-accent-ultra-light)', color: 'var(--ipqc-accent)' }}>
                        {i + 1}
                      </span>
                      <span className="text-sm" style={{ color: 'var(--ipqc-text-primary)' }}>{inst}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState label="No instruments assigned" />
              )}
            </motion.div>

            {/* Equipment */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12 }}
              className="rounded-2xl p-5"
              style={{ background: 'var(--ipqc-surface)', border: '1px solid var(--ipqc-border)', boxShadow: 'var(--ipqc-card-shadow)' }}
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: '#2563eb18' }}>
                  <Package size={15} style={{ color: '#2563eb' }} />
                </div>
                <span className="font-semibold text-sm" style={{ color: 'var(--ipqc-text-primary)' }}>Equipment</span>
                <span className="ml-auto text-xs px-2 py-0.5 rounded-full" style={{ background: '#2563eb15', color: '#2563eb' }}>
                  {cubicle.equipment.length}
                </span>
              </div>
              {cubicle.equipment.length > 0 ? (
                <div className="space-y-2">
                  {cubicle.equipment.map((eq, i) => (
                    <div
                      key={eq}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
                      style={{ background: 'var(--ipqc-bg)', border: '1px solid var(--ipqc-border)' }}
                    >
                      <span className="w-6 h-6 rounded-lg text-[10px] font-bold flex items-center justify-center flex-shrink-0"
                        style={{ background: '#2563eb15', color: '#2563eb' }}>
                        {i + 1}
                      </span>
                      <span className="text-sm" style={{ color: 'var(--ipqc-text-primary)' }}>{eq}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState label="No equipment assigned" />
              )}
            </motion.div>

            {/* Team */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.16 }}
              className="rounded-2xl p-5"
              style={{ background: 'var(--ipqc-surface)', border: '1px solid var(--ipqc-border)', boxShadow: 'var(--ipqc-card-shadow)' }}
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: '#0f766e18' }}>
                  <Users size={15} style={{ color: '#0f766e' }} />
                </div>
                <span className="font-semibold text-sm" style={{ color: 'var(--ipqc-text-primary)' }}>Team Members</span>
                <span className="ml-auto text-xs px-2 py-0.5 rounded-full" style={{ background: '#0f766e15', color: '#0f766e' }}>
                  {cubicle.employees.length}
                </span>
              </div>
              {cubicle.employees.length > 0 ? (
                <div className="space-y-2">
                  {cubicle.employees.map((emp, i) => {
                    const initials = emp.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
                    const colors = ['#7c3aed', '#2563eb', '#0f766e', '#b45309'];
                    const col = colors[i % colors.length];
                    return (
                      <div
                        key={emp}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
                        style={{ background: 'var(--ipqc-bg)', border: '1px solid var(--ipqc-border)' }}
                      >
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                          style={{ background: col + '20', color: col }}
                        >
                          {initials}
                        </div>
                        <div>
                          <p className="text-sm font-medium" style={{ color: 'var(--ipqc-text-primary)' }}>{emp}</p>
                          <p className="text-[11px]" style={{ color: 'var(--ipqc-text-muted)' }}>IPQC Analyst</p>
                        </div>
                        <span className="ml-auto w-2 h-2 rounded-full" style={{ background: '#22c55e' }} />
                      </div>
                    );
                  })}
                </div>
              ) : (
                <EmptyState label="No staff assigned" />
              )}
            </motion.div>

            {/* Status & Details */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-2xl p-5 md:col-span-2"
              style={{ background: 'var(--ipqc-surface)', border: '1px solid var(--ipqc-border)', boxShadow: 'var(--ipqc-card-shadow)' }}
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: statusColor + '18' }}>
                  <Activity size={15} style={{ color: statusColor }} />
                </div>
                <span className="font-semibold text-sm" style={{ color: 'var(--ipqc-text-primary)' }}>Cubicle Details</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { label: 'Status', value: STATUS_LABELS[cubicle.status], color: statusColor },
                  { label: 'Width', value: `${cubicle.width} units` },
                  { label: 'Depth', value: `${cubicle.depth} units` },
                  { label: 'Floor Position', value: cubicle.placed ? `(${cubicle.position.map(v => v.toFixed(1)).join(', ')})` : 'Not placed' },
                  { label: 'Rotation', value: `${(cubicle.rotationY * 180 / Math.PI).toFixed(0)}°` },
                  { label: 'Cubicle ID', value: cubicle.id.toUpperCase() },
                ].map(d => (
                  <div
                    key={d.label}
                    className="rounded-xl px-4 py-3"
                    style={{ background: 'var(--ipqc-bg)', border: '1px solid var(--ipqc-border)' }}
                  >
                    <p className="text-[10px] uppercase tracking-widest font-semibold mb-1" style={{ color: 'var(--ipqc-text-muted)' }}>
                      {d.label}
                    </p>
                    <p className="text-sm font-semibold" style={{ color: d.color || 'var(--ipqc-text-primary)' }}>
                      {d.value}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Placeholder future feature */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.24 }}
              className="rounded-2xl p-5 flex flex-col items-center justify-center text-center min-h-[180px]"
              style={{
                background: 'var(--ipqc-surface)',
                border: '1.5px dashed var(--ipqc-border-strong)',
                boxShadow: 'var(--ipqc-card-shadow)',
              }}
            >
              <CalendarClock size={28} className="mb-2" style={{ color: 'var(--ipqc-border-strong)' }} />
              <p className="font-semibold text-sm mb-1" style={{ color: 'var(--ipqc-text-primary)' }}>
                Activity Logs
              </p>
              <p className="text-xs" style={{ color: 'var(--ipqc-text-muted)' }}>
                This section is reserved for future features such as audit trails, process logs, and QC records.
              </p>
              <span
                className="mt-3 text-[10px] uppercase tracking-widest font-semibold px-3 py-1 rounded-full"
                style={{ background: 'var(--ipqc-accent-ultra-light)', color: 'var(--ipqc-accent)' }}
              >
                Coming Soon
              </span>
            </motion.div>

          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div
      className="rounded-xl p-4 text-center"
      style={{ background: 'var(--ipqc-bg)', border: '1px dashed var(--ipqc-border)' }}
    >
      <p className="text-xs" style={{ color: 'var(--ipqc-text-muted)' }}>{label}</p>
    </div>
  );
}

export default function CubicleDetailPage() {
  return (
    <ThemeProvider>
      <CubicleDetailContent />
    </ThemeProvider>
  );
}
