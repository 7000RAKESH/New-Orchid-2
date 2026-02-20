'use client';
import { useRef, useState, useCallback } from 'react';
import { ThemeProvider } from '@/components/ThemeProvider';
import Ribbon from '@/components/Ribbon';
import MenuBar from '@/components/MenuBar';
import ActivityPanel from '@/components/ActivityPanel';
import CubicleStack from '@/components/CubicleStack';
import dynamic from 'next/dynamic';
import { CubicleData, INITIAL_CUBICLES } from '@/lib/cubicleData';
import type { FloorRef } from '@/components/ThreeFloor';
import { ChevronLeft, ChevronRight, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Dynamically import the Three.js floor (SSR=false, WebGL requires browser)
const ThreeFloor = dynamic(() => import('@/components/ThreeFloor'), { ssr: false });

let nextCubicleNum = 7;

function Dashboard() {
  const [cubicles, setCubicles] = useState<CubicleData[]>(INITIAL_CUBICLES);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [stackVisible, setStackVisible] = useState(true);
  const floorRef = useRef<FloorRef>(null);
  const floorDivRef = useRef<HTMLDivElement>(null) as React.RefObject<HTMLDivElement>;

  const selectedCubicle = cubicles.find(c => c.id === selectedId) ?? null;

  const handleCubicleUpdate = useCallback((updated: CubicleData) => {
    setCubicles(prev => prev.map(c => c.id === updated.id ? updated : c));
  }, []);

  const handleCubicleSelect = useCallback((id: string | null) => {
    setSelectedId(id);
  }, []);

  const handleReturnToStack = useCallback((id: string) => {
    setCubicles(prev => prev.map(c =>
      c.id === id ? { ...c, placed: false, position: [0, 0, 0] } : c
    ));
    setSelectedId(prev => prev === id ? null : prev);
  }, []);

  const handleAddCubicle = useCallback(() => {
    const n = nextCubicleNum++;
    const newColors = ['#7c3aed', '#2563eb', '#0f766e', '#b45309', '#0369a1', '#7e22ce', '#15803d', '#c2410c'];
    const col = newColors[(n - 1) % newColors.length];
    const newCubicle: CubicleData = {
      id: `c${n}`,
      name: `Cubicle ${n}`,
      instruments: [],
      equipment: [],
      employees: [],
      status: 'available',
      color: col,
      placed: false,
      position: [0, 0, 0],
      width: 3,
      depth: 3,
      rotationY: 0,
    };
    setCubicles(prev => [...prev, newCubicle]);
    // Auto-show stack when a new cubicle is added
    setStackVisible(true);
  }, []);

  // Called by CubicleStack when a card is dropped onto the floor area
  const handleStackDrop = useCallback((id: string, screenX: number, screenY: number) => {
    floorRef.current?.handleDrop(id, screenX, screenY);
  }, []);

  // Handle native HTML5 drag drop onto the floor div
  const handleFloorDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleFloorDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('cubicleId');
    if (!id) return;
    floorRef.current?.handleDrop(id, e.clientX, e.clientY);
  }, []);

  const unplacedCount = cubicles.filter(c => !c.placed).length;

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: 'var(--ipqc-bg)', fontFamily: 'Inter, sans-serif' }}
    >
      {/* Fixed ribbon at top */}
      <Ribbon />

      {/* Menu bar below ribbon */}
      <div className="pt-[72px]">
        <MenuBar />
      </div>

      {/* Dashboard: 3-column layout */}
      <div
        className="flex flex-1 overflow-hidden relative"
        style={{ height: 'calc(100vh - 72px - 178px)', minHeight: 520 }}
      >
        {/* LEFT: Activity Panel */}
        <div className="w-[220px] flex-shrink-0 overflow-hidden hidden lg:block">
          <ActivityPanel
            selectedCubicle={selectedCubicle}
            allCubicles={cubicles}
            onClose={() => setSelectedId(null)}
          />
        </div>

        {/* CENTER: 3D floor */}
        <div
          ref={floorDivRef}
          className="flex-1 overflow-hidden relative"
          style={{ background: 'var(--ipqc-floor-bg)' }}
          onDragOver={handleFloorDragOver}
          onDrop={handleFloorDrop}
        >
          {/* Section label */}
          <div
            className="absolute top-3 left-1/2 -translate-x-1/2 z-10 px-4 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase"
            style={{
              background: 'var(--ipqc-panel-bg)',
              backdropFilter: 'blur(10px)',
              border: '1px solid var(--ipqc-border)',
              color: 'var(--ipqc-text-muted)',
              pointerEvents: 'none',
            }}
          >
            3D Manufacturing Floor &mdash; Digital Twin
          </div>

          <ThreeFloor
            ref={floorRef}
            cubicles={cubicles}
            onCubicleUpdate={handleCubicleUpdate}
            onCubicleSelect={handleCubicleSelect}
            onReturnToStack={handleReturnToStack}
            selectedId={selectedId}
          />

          {/* Stack toggle button — floats on the right edge of the floor */}
          <motion.button
            whileTap={{ scale: 0.94 }}
            onClick={() => setStackVisible(v => !v)}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-20 flex flex-col items-center gap-1.5 py-3 px-2 rounded-l-2xl"
            style={{
              background: 'var(--ipqc-surface)',
              border: '1px solid var(--ipqc-border)',
              borderRight: 'none',
              boxShadow: '-4px 0 16px rgba(0,0,0,0.08)',
              color: 'var(--ipqc-accent)',
            }}
            title={stackVisible ? 'Hide cubicle stack' : 'Show cubicle stack'}
          >
            <Layers size={16} style={{ color: 'var(--ipqc-accent)' }} />
            {/* Badge showing unplaced count */}
            {unplacedCount > 0 && (
              <span
                className="text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center"
                style={{ background: 'var(--ipqc-accent)', color: '#fff' }}
              >
                {unplacedCount}
              </span>
            )}
            {stackVisible
              ? <ChevronRight size={14} style={{ color: 'var(--ipqc-text-muted)' }} />
              : <ChevronLeft size={14} style={{ color: 'var(--ipqc-text-muted)' }} />
            }
          </motion.button>
        </div>

        {/* RIGHT: Cubicle stack — animated slide in/out */}
        <AnimatePresence initial={false}>
          {stackVisible && (
            <motion.div
              key="stack"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 220, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="flex-shrink-0 overflow-hidden"
              style={{ minWidth: 0 }}
            >
              <div style={{ width: 220 }}>
                <CubicleStack
                  cubicles={cubicles}
                  onDrop={handleStackDrop}
                  onAddCubicle={handleAddCubicle}
                  floorRef={floorDivRef}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Mobile activity panel (shown below floor on small screens) */}
      <div className="lg:hidden px-4 pb-4">
        <ActivityPanel
          selectedCubicle={selectedCubicle}
          allCubicles={cubicles}
          onClose={() => setSelectedId(null)}
        />
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <ThemeProvider>
      <Dashboard />
    </ThemeProvider>
  );
}
