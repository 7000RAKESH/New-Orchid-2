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

// Dynamically import the Three.js floor (SSR=false, WebGL requires browser)
const ThreeFloor = dynamic(() => import('@/components/ThreeFloor'), { ssr: false });

let nextCubicleNum = 7;

function Dashboard() {
  const [cubicles, setCubicles] = useState<CubicleData[]>(INITIAL_CUBICLES);
  const [selectedId, setSelectedId] = useState<string | null>(null);
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
        className="flex flex-1 overflow-hidden"
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
        </div>

        {/* RIGHT: Cubicle stack */}
        <div className="w-[220px] flex-shrink-0 overflow-hidden">
          <CubicleStack
            cubicles={cubicles}
            onDrop={handleStackDrop}
            onAddCubicle={handleAddCubicle}
            floorRef={floorDivRef}
          />
        </div>
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
