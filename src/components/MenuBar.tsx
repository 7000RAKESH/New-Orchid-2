'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Settings2,
  Database,
  PackageSearch,
  Warehouse,
  Wrench,
  SprayCan,
  Factory,
  MapPin,
  ShieldCheck,
  Ruler,
  Box,
  LayoutTemplate,
  Sliders,
  Pill,
  Thermometer,
  LocateFixed,
  Building2,
  Layers,
  HardDrive,
  ClipboardList,
  GitBranch,
  ToggleLeft,
  Scale,
  UserCheck,
  CalendarClock,
  Tag,
  ChevronRight,
  X,
} from 'lucide-react';

// ---------- data ----------
interface SubItem {
  label: string;
  icon: React.ElementType;
  subItems?: { label: string; icon: React.ElementType }[];
}
interface MenuItem {
  id: string;
  label: string;
  icon: React.ElementType;
  color: string;
  subItems: SubItem[];
}

const MENUS: MenuItem[] = [
  {
    id: 'admin',
    label: 'Administration',
    icon: Settings2,
    color: '#7c3aed',
    subItems: [
      { label: 'Site', icon: MapPin },
      { label: 'Identity Access', icon: ShieldCheck },
      { label: 'Unit of Measurements', icon: Ruler },
    ],
  },
  {
    id: 'masterdata',
    label: 'Master Data',
    icon: Database,
    color: '#2563eb',
    subItems: [
      { label: 'Cubicle Registration', icon: Box },
      { label: 'Template Creation', icon: LayoutTemplate },
      { label: 'Parameters', icon: Sliders },
      {
        label: 'Product',
        icon: Pill,
        subItems: [
          { label: 'Tablet', icon: Pill },
          { label: 'Capsule', icon: PackageSearch },
          { label: 'Dry Syrup', icon: Tag },
        ],
      },
    ],
  },
  {
    id: 'storage',
    label: 'Storage',
    icon: Warehouse,
    color: '#0f766e',
    subItems: [
      { label: 'Storage Condition', icon: Thermometer },
      { label: 'Storage Location', icon: LocateFixed },
      { label: 'Room', icon: Building2 },
      { label: 'Department', icon: Layers },
      { label: 'Storage Device', icon: HardDrive },
    ],
  },
  {
    id: 'batch',
    label: 'Batch Management',
    icon: PackageSearch,
    color: '#b45309',
    subItems: [
      { label: 'Batch Registration', icon: ClipboardList },
      { label: 'Batch Phase', icon: GitBranch },
      { label: 'Batch Status', icon: ToggleLeft },
      { label: 'Batch Quantity', icon: Scale },
      { label: 'Batch Assignment', icon: UserCheck },
      { label: 'Manufacturing Date', icon: CalendarClock },
    ],
  },
  {
    id: 'instrument',
    label: 'Instrument Management',
    icon: Wrench,
    color: '#0369a1',
    subItems: [
      { label: 'Instrument Name', icon: Tag },
    ],
  },
  {
    id: 'cleaning',
    label: 'Cleaning Management',
    icon: SprayCan,
    color: '#7e22ce',
    subItems: [
      { label: 'Batch Release Date', icon: CalendarClock },
    ],
  },
  {
    id: 'production',
    label: 'Production Plant',
    icon: Factory,
    color: '#15803d',
    subItems: [],
  },
];

// ---------- 3D icon canvas ----------
function Icon3D({ Icon, color }: { Icon: React.ElementType; color: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const W = 80, H = 80;
    canvas.width = W; canvas.height = H;
    // Draw 3D cube face
    ctx.clearRect(0, 0, W, H);
    // Shadow
    ctx.beginPath();
    ctx.ellipse(W / 2, H - 8, 24, 6, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0,0,0,0.12)';
    ctx.fill();
    // Top face
    const gradient = ctx.createLinearGradient(20, 10, 60, 50);
    gradient.addColorStop(0, lighten(color, 40));
    gradient.addColorStop(1, color);
    ctx.beginPath();
    ctx.moveTo(40, 8); ctx.lineTo(68, 22); ctx.lineTo(40, 36); ctx.lineTo(12, 22);
    ctx.closePath();
    ctx.fillStyle = lighten(color, 30);
    ctx.fill();
    // Right face
    ctx.beginPath();
    ctx.moveTo(40, 36); ctx.lineTo(68, 22); ctx.lineTo(68, 52); ctx.lineTo(40, 66);
    ctx.closePath();
    ctx.fillStyle = darken(color, 20);
    ctx.fill();
    // Left face
    ctx.beginPath();
    ctx.moveTo(40, 36); ctx.lineTo(12, 22); ctx.lineTo(12, 52); ctx.lineTo(40, 66);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
  }, [color]);

  return (
    <div className="relative flex items-center justify-center" style={{ width: 72, height: 72 }}>
      <canvas ref={canvasRef} className="absolute inset-0 opacity-30" style={{ width: 72, height: 72 }} />
      <Icon size={30} strokeWidth={1.6} style={{ color, position: 'relative', zIndex: 1 }} />
    </div>
  );
}

function lighten(hex: string, amount: number): string {
  try {
    const num = parseInt(hex.replace('#', ''), 16);
    const r = Math.min(255, (num >> 16) + amount);
    const g = Math.min(255, ((num >> 8) & 0xff) + amount);
    const b = Math.min(255, (num & 0xff) + amount);
    return `rgb(${r},${g},${b})`;
  } catch { return hex; }
}
function darken(hex: string, amount: number): string {
  try {
    const num = parseInt(hex.replace('#', ''), 16);
    const r = Math.max(0, (num >> 16) - amount);
    const g = Math.max(0, ((num >> 8) & 0xff) - amount);
    const b = Math.max(0, (num & 0xff) - amount);
    return `rgb(${r},${g},${b})`;
  } catch { return hex; }
}

// ---------- Ripple ----------
function Ripple({ x, y, onDone }: { x: number; y: number; onDone: () => void }) {
  return (
    <motion.span
      className="absolute rounded-full pointer-events-none"
      initial={{ width: 0, height: 0, opacity: 0.4, x, y, translateX: '-50%', translateY: '-50%' }}
      animate={{ width: 280, height: 280, opacity: 0 }}
      transition={{ duration: 0.55, ease: 'easeOut' }}
      onAnimationComplete={onDone}
      style={{ background: 'var(--ipqc-accent)', zIndex: 0 }}
    />
  );
}

// ---------- Dropdown ----------
function Dropdown({
  items,
  onClose,
}: {
  items: SubItem[];
  onClose: () => void;
}) {
  const [hoveredSub, setHoveredSub] = useState<string | null>(null);

  return (
    <motion.div
      initial={{ opacity: 0, y: -6, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -6, scale: 0.97 }}
      transition={{ duration: 0.18 }}
      className="absolute top-full left-0 mt-2 min-w-[200px] rounded-2xl overflow-visible"
      style={{
        background: 'var(--ipqc-surface)',
        border: '1px solid var(--ipqc-border)',
        boxShadow: 'var(--ipqc-menu-shadow)',
        zIndex: 200,
      }}
    >
      {items.map((item) => {
        const Sub = item.icon;
        const hasSub = item.subItems && item.subItems.length > 0;
        return (
          <div key={item.label} className="relative">
            <button
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors"
              style={{ color: 'var(--ipqc-text-primary)' }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.background = 'var(--ipqc-surface-hover)';
                if (hasSub) setHoveredSub(item.label);
              }}
              onMouseLeave={e => {
                if (!hasSub) (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
              }}
              onMouseOut={e => {
                if (!hasSub) (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
              }}
            >
              <Sub size={15} style={{ color: 'var(--ipqc-accent-light)', flexShrink: 0 }} />
              <span className="flex-1 font-medium">{item.label}</span>
              {hasSub && <ChevronRight size={13} style={{ color: 'var(--ipqc-text-muted)' }} />}
            </button>
            {/* Nested sub-menu */}
            {hasSub && hoveredSub === item.label && (
              <motion.div
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -6 }}
                className="absolute left-full top-0 min-w-[180px] rounded-2xl overflow-hidden"
                style={{
                  background: 'var(--ipqc-surface)',
                  border: '1px solid var(--ipqc-border)',
                  boxShadow: 'var(--ipqc-menu-shadow)',
                  zIndex: 300,
                }}
                onMouseLeave={() => setHoveredSub(null)}
              >
                {item.subItems!.map(s => {
                  const SI = s.icon;
                  return (
                    <button
                      key={s.label}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors"
                      style={{ color: 'var(--ipqc-text-primary)' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'var(--ipqc-surface-hover)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      <SI size={15} style={{ color: 'var(--ipqc-accent-light)', flexShrink: 0 }} />
                      {s.label}
                    </button>
                  );
                })}
              </motion.div>
            )}
          </div>
        );
      })}
    </motion.div>
  );
}

// ---------- Menu Card ----------
function MenuCard({ menu }: { menu: MenuItem }) {
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);
  const [open, setOpen] = useState(false);
  const [pressed, setPressed] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const rippleId = useRef(0);

  const handleClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = ++rippleId.current;
    setRipples(prev => [...prev, { id, x, y }]);
    setPressed(true);
    setTimeout(() => setPressed(false), 150);
    setOpen(o => !o);
  }, []);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (cardRef.current && !cardRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div ref={cardRef} className="relative flex-shrink-0">
      <motion.button
        onClick={handleClick}
        animate={{ scale: pressed ? 0.97 : 1 }}
        whileHover={{ y: -4 }}
        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
        className="relative flex flex-col items-center justify-center overflow-hidden cursor-pointer select-none"
        style={{
          width: 160,
          height: 150,
          borderRadius: 16,
          background: open ? 'var(--ipqc-accent-ultra-light)' : 'var(--ipqc-surface)',
          border: open
            ? '1.5px solid var(--ipqc-border-strong)'
            : '1.5px solid var(--ipqc-border)',
          boxShadow: open
            ? `var(--ipqc-card-shadow), 0 0 0 3px var(--ipqc-accent-glow)`
            : 'var(--ipqc-card-shadow)',
          padding: '20px 16px 16px',
          transition: 'border-color 0.2s, background 0.2s, box-shadow 0.2s',
        }}
      >
        {/* Ripples */}
        {ripples.map(r => (
          <Ripple
            key={r.id}
            x={r.x}
            y={r.y}
            onDone={() => setRipples(prev => prev.filter(p => p.id !== r.id))}
          />
        ))}

        {/* Glow bg on hover */}
        <div
          className="absolute inset-0 rounded-[16px] pointer-events-none transition-opacity"
          style={{
            background: `radial-gradient(ellipse at 50% 60%, ${menu.color}18 0%, transparent 70%)`,
          }}
        />

        {/* Icon */}
        <Icon3D Icon={menu.icon} color={menu.color} />

        {/* Label */}
        <span
          className="text-center text-[12px] font-semibold leading-snug mt-1 relative z-10"
          style={{ color: 'var(--ipqc-text-primary)', fontFamily: 'Inter, sans-serif' }}
        >
          {menu.label}
        </span>

        {/* Active indicator */}
        {open && (
          <motion.span
            layoutId="menu-indicator"
            className="absolute bottom-2 w-6 h-1 rounded-full"
            style={{ background: 'var(--ipqc-accent)' }}
          />
        )}
      </motion.button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && menu.subItems.length > 0 && (
          <Dropdown items={menu.subItems} onClose={() => setOpen(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}

// ---------- Main export ----------
export default function MenuBar() {
  return (
    <div
      className="w-full overflow-x-auto"
      style={{
        background: 'var(--ipqc-bg-secondary)',
        borderBottom: '1px solid var(--ipqc-border)',
        boxShadow: '0 2px 12px var(--ipqc-accent-glow)',
      }}
    >
      <div className="flex items-end gap-4 px-8 py-4 min-w-max">
        {MENUS.map(m => (
          <MenuCard key={m.id} menu={m} />
        ))}
      </div>
    </div>
  );
}
