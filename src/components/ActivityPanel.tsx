'use client';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  Wrench,
  Package,
  Users,
  CircleDot,
  ChevronRight,
  X,
} from 'lucide-react';
import { CubicleData, STATUS_COLORS, STATUS_LABELS } from '@/lib/cubicleData';

interface Props {
  selectedCubicle: CubicleData | null;
  allCubicles: CubicleData[];
  onClose: () => void;
}

export default function ActivityPanel({ selectedCubicle, allCubicles, onClose }: Props) {
  const stats = {
    total: allCubicles.length,
    available: allCubicles.filter(c => c.placed && c.status === 'available').length,
    inUse: allCubicles.filter(c => c.placed && c.status === 'in-use').length,
    notAvailable: allCubicles.filter(c => c.placed && c.status === 'not-available').length,
    placed: allCubicles.filter(c => c.placed).length,
  };

  return (
    <div
      className="h-full flex flex-col overflow-hidden"
      style={{
        background: 'var(--ipqc-panel-bg)',
        backdropFilter: 'blur(16px)',
        borderRight: '1px solid var(--ipqc-border)',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-2 px-4 py-3 flex-shrink-0"
        style={{ borderBottom: '1px solid var(--ipqc-border)' }}
      >
        <Activity size={16} style={{ color: 'var(--ipqc-accent)' }} />
        <span className="font-semibold text-sm" style={{ color: 'var(--ipqc-text-primary)' }}>
          Activity Panel
        </span>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">

        {/* Floor stats */}
        <div>
          <p className="text-[10px] uppercase tracking-widest font-semibold mb-2" style={{ color: 'var(--ipqc-text-muted)' }}>
            Floor Overview
          </p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'On Floor', value: stats.placed, color: 'var(--ipqc-accent)' },
              { label: 'Available', value: stats.available, color: STATUS_COLORS.available },
              { label: 'In Use', value: stats.inUse, color: STATUS_COLORS['in-use'] },
              { label: 'Unavailable', value: stats.notAvailable, color: STATUS_COLORS['not-available'] },
            ].map(s => (
              <div
                key={s.label}
                className="rounded-xl p-3 flex flex-col"
                style={{ background: 'var(--ipqc-surface)', border: '1px solid var(--ipqc-border)' }}
              >
                <span className="text-xl font-bold" style={{ color: s.color }}>{s.value}</span>
                <span className="text-[11px] mt-0.5" style={{ color: 'var(--ipqc-text-muted)' }}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Selected cubicle detail */}
        <AnimatePresence mode="wait">
          {selectedCubicle ? (
            <motion.div
              key={selectedCubicle.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] uppercase tracking-widest font-semibold" style={{ color: 'var(--ipqc-text-muted)' }}>
                  Selected Cubicle
                </p>
                <button onClick={onClose}>
                  <X size={14} style={{ color: 'var(--ipqc-text-muted)' }} />
                </button>
              </div>

              <div
                className="rounded-2xl p-4"
                style={{
                  background: 'var(--ipqc-surface)',
                  border: `1.5px solid ${STATUS_COLORS[selectedCubicle.status]}44`,
                  boxShadow: `0 0 0 3px ${STATUS_COLORS[selectedCubicle.status]}18`,
                }}
              >
                {/* Name + status */}
                <div className="flex items-center gap-2 mb-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: selectedCubicle.color + '22' }}
                  >
                    <CircleDot size={16} style={{ color: selectedCubicle.color }} />
                  </div>
                  <div>
                    <p className="font-bold text-sm" style={{ color: 'var(--ipqc-text-primary)' }}>
                      {selectedCubicle.name}
                    </p>
                    <span
                      className="text-[11px] font-semibold"
                      style={{ color: STATUS_COLORS[selectedCubicle.status] }}
                    >
                      {STATUS_LABELS[selectedCubicle.status]}
                    </span>
                  </div>
                </div>

                <DetailSection
                  icon={<Wrench size={13} />}
                  label="Instruments"
                  items={selectedCubicle.instruments}
                />
                <DetailSection
                  icon={<Package size={13} />}
                  label="Equipment"
                  items={selectedCubicle.equipment}
                />
                <DetailSection
                  icon={<Users size={13} />}
                  label="Employees"
                  items={selectedCubicle.employees}
                />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="rounded-2xl p-5 text-center"
              style={{ background: 'var(--ipqc-surface)', border: '1px dashed var(--ipqc-border)' }}
            >
              <Activity size={28} className="mx-auto mb-2" style={{ color: 'var(--ipqc-border-strong)' }} />
              <p className="text-sm font-medium" style={{ color: 'var(--ipqc-text-muted)' }}>
                Click a cubicle on the floor to view its details
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* All placed cubicles list */}
        {allCubicles.filter(c => c.placed).length > 0 && (
          <div>
            <p className="text-[10px] uppercase tracking-widest font-semibold mb-2" style={{ color: 'var(--ipqc-text-muted)' }}>
              Placed Cubicles
            </p>
            <div className="space-y-1.5">
              {allCubicles.filter(c => c.placed).map(c => (
                <div
                  key={c.id}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-colors"
                  style={{
                    background: selectedCubicle?.id === c.id ? 'var(--ipqc-accent-ultra-light)' : 'var(--ipqc-surface)',
                    border: selectedCubicle?.id === c.id ? '1px solid var(--ipqc-border-strong)' : '1px solid var(--ipqc-border)',
                  }}
                >
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: STATUS_COLORS[c.status] }} />
                  <span className="text-sm font-medium flex-1" style={{ color: 'var(--ipqc-text-primary)' }}>{c.name}</span>
                  <span className="text-[10px]" style={{ color: 'var(--ipqc-text-muted)' }}>
                    {c.employees.length} staff
                  </span>
                  <ChevronRight size={12} style={{ color: 'var(--ipqc-text-muted)' }} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function DetailSection({ icon, label, items }: { icon: React.ReactNode; label: string; items: string[] }) {
  if (!items.length) return null;
  return (
    <div className="mb-3">
      <div className="flex items-center gap-1.5 mb-1.5">
        <span style={{ color: 'var(--ipqc-accent-light)' }}>{icon}</span>
        <span className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: 'var(--ipqc-text-muted)' }}>
          {label}
        </span>
      </div>
      <div className="flex flex-wrap gap-1">
        {items.map(item => (
          <span
            key={item}
            className="text-[11px] px-2 py-0.5 rounded-lg"
            style={{ background: 'var(--ipqc-accent-ultra-light)', color: 'var(--ipqc-text-secondary)' }}
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
