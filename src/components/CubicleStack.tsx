'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, GripVertical, Users, Wrench, Circle } from 'lucide-react';
import { CubicleData, STATUS_COLORS, STATUS_LABELS } from '@/lib/cubicleData';

interface Props {
  cubicles: CubicleData[];
  onDrop: (id: string, x: number, y: number) => void;
  onAddCubicle: () => void;
  floorRef: React.RefObject<HTMLDivElement>;
}

export default function CubicleStack({ cubicles, onDrop, onAddCubicle, floorRef }: Props) {
  const stackCubicles = cubicles.filter(c => !c.placed);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, id: string) => {
    e.dataTransfer.setData('cubicleId', id);
    e.dataTransfer.effectAllowed = 'move';
    setDraggingId(id);
  };

  const handleDragEnd = () => setDraggingId(null);

  return (
    <div
      className="h-full flex flex-col overflow-hidden"
      style={{
        background: 'var(--ipqc-panel-bg)',
        backdropFilter: 'blur(16px)',
        borderLeft: '1px solid var(--ipqc-border)',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 flex-shrink-0"
        style={{ borderBottom: '1px solid var(--ipqc-border)' }}
      >
        <div className="flex items-center gap-2">
          <Circle size={16} style={{ color: 'var(--ipqc-accent)' }} />
          <span className="font-semibold text-sm" style={{ color: 'var(--ipqc-text-primary)' }}>
            Cubicle Stack
          </span>
        </div>
        <span
          className="text-xs px-2 py-0.5 rounded-full font-medium"
          style={{ background: 'var(--ipqc-accent-ultra-light)', color: 'var(--ipqc-accent)' }}
        >
          {stackCubicles.length}
        </span>
      </div>

      {/* Instruction */}
      <div
        className="mx-3 mt-3 mb-1 px-3 py-2 rounded-xl text-center"
        style={{ background: 'var(--ipqc-accent-ultra-light)', border: '1px dashed var(--ipqc-border-strong)' }}
      >
        <p className="text-[11px] font-medium" style={{ color: 'var(--ipqc-accent)' }}>
          Drag a cubicle onto the 3D floor
        </p>
      </div>

      {/* Stack */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2">
        <AnimatePresence>
          {stackCubicles.map((c, i) => (
            <motion.div
              key={c.id}
              layout
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: i * 0.05 }}
            >
              {/* Separate draggable div to avoid framer-motion event type conflicts */}
              <div
                draggable
                onDragStart={(e) => handleDragStart(e, c.id)}
                onDragEnd={handleDragEnd}
                className="rounded-2xl overflow-hidden select-none"
                style={{
                  background: draggingId === c.id ? 'var(--ipqc-accent-ultra-light)' : 'var(--ipqc-surface)',
                  border: draggingId === c.id
                    ? '1.5px solid var(--ipqc-border-strong)'
                    : '1.5px solid var(--ipqc-border)',
                  boxShadow: 'var(--ipqc-card-shadow)',
                  opacity: draggingId === c.id ? 0.6 : 1,
                  cursor: 'grab',
                }}
              >
                {/* Color bar */}
                <div className="h-1 w-full" style={{ background: c.color }} />

                <div className="p-3">
                  {/* Name row */}
                  <div className="flex items-center gap-2 mb-2">
                    <GripVertical size={14} style={{ color: 'var(--ipqc-text-muted)', flexShrink: 0 }} />
                    <div
                      className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: c.color + '22' }}
                    >
                      <span className="text-[10px] font-bold" style={{ color: c.color }}>
                        {c.id.replace('c', '')}
                      </span>
                    </div>
                    <span className="font-semibold text-sm flex-1" style={{ color: 'var(--ipqc-text-primary)' }}>
                      {c.name}
                    </span>
                    {/* Status dot */}
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: STATUS_COLORS[c.status] }} />
                  </div>

                  {/* Stats row */}
                  <div className="flex items-center gap-3 text-[11px]" style={{ color: 'var(--ipqc-text-muted)' }}>
                    <span className="flex items-center gap-1">
                      <Wrench size={11} />
                      {c.instruments.length} inst.
                    </span>
                    <span className="flex items-center gap-1">
                      <Users size={11} />
                      {c.employees.length} staff
                    </span>
                  </div>

                  {/* Status badge */}
                  <div className="mt-2">
                    <span
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                      style={{
                        background: STATUS_COLORS[c.status] + '20',
                        color: STATUS_COLORS[c.status],
                      }}
                    >
                      {STATUS_LABELS[c.status]}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {stackCubicles.length === 0 && (
          <div
            className="rounded-2xl p-5 text-center"
            style={{ background: 'var(--ipqc-surface)', border: '1px dashed var(--ipqc-border)' }}
          >
            <p className="text-sm" style={{ color: 'var(--ipqc-text-muted)' }}>
              All cubicles are placed on the floor
            </p>
          </div>
        )}
      </div>

      {/* Add button */}
      <div className="px-3 pb-4 pt-2 flex-shrink-0">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onAddCubicle}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm transition-all"
          style={{
            background: 'var(--ipqc-accent)',
            color: '#fff',
            boxShadow: '0 4px 14px var(--ipqc-accent-glow)',
          }}
        >
          <Plus size={16} />
          Add Cubicle
        </motion.button>
      </div>
    </div>
  );
}
