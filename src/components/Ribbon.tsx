'use client';
import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  User,
  Palette,
  ChevronDown,
  FlaskConical,
  Check,
} from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { ThemeKey, themes } from '@/lib/theme';

export default function Ribbon() {
  const { theme, setTheme } = useTheme();
  const [themeOpen, setThemeOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const themeRef = useRef<HTMLDivElement>(null);

  const notifications = [
    { id: 1, text: 'Batch B-2024-089 awaiting QC review', time: '2m ago', dot: '#f59e0b' },
    { id: 2, text: 'Cubicle 3 instrument calibration due', time: '15m ago', dot: '#ef4444' },
    { id: 3, text: 'New batch assigned to you', time: '1h ago', dot: '#7c3aed' },
  ];

  return (
    <header
      style={{
        background: 'var(--ipqc-ribbon-bg)',
        borderBottom: '1.5px solid var(--ipqc-ribbon-border)',
        boxShadow: '0 2px 16px var(--ipqc-accent-glow)',
      }}
      className="fixed top-0 left-0 right-0 z-50 h-[72px] flex items-center px-6 gap-4"
    >
      {/* Logo + Brand */}
      <div className="flex items-center gap-3 flex-shrink-0">
        {/* Logo mark */}
        <div
          className="relative flex items-center justify-center rounded-xl"
          style={{
            width: 46,
            height: 46,
            background: 'linear-gradient(135deg, var(--ipqc-accent) 0%, var(--ipqc-accent-light) 100%)',
            boxShadow: '0 4px 14px var(--ipqc-accent-glow)',
          }}
        >
          <FlaskConical size={24} color="#fff" strokeWidth={1.8} />
          {/* Lab beaker accent dot */}
          <span
            className="absolute top-1 right-1 w-2 h-2 rounded-full"
            style={{ background: '#fff', opacity: 0.7 }}
          />
        </div>
        <div className="flex flex-col leading-tight">
          <span
            className="font-bold text-[17px] tracking-wide"
            style={{ color: 'var(--ipqc-text-primary)', fontFamily: 'Inter, sans-serif' }}
          >
            Lab Iconics
          </span>
          <span
            className="text-[11px] font-semibold tracking-[0.18em] uppercase"
            style={{ color: 'var(--ipqc-accent-light)' }}
          >
            IPQC
          </span>
        </div>
      </div>

      {/* Center spacer + title */}
      <div className="flex-1 flex items-center justify-center">
        <span
          className="hidden sm:block text-sm font-medium tracking-widest uppercase"
          style={{ color: 'var(--ipqc-text-muted)', letterSpacing: '0.2em' }}
        >
          In-Process Quality Control
        </span>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2 flex-shrink-0">

        {/* Notification */}
        <div className="relative" ref={null}>
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={() => { setNotifOpen(o => !o); setThemeOpen(false); setProfileOpen(false); }}
            className="relative flex items-center justify-center w-10 h-10 rounded-xl transition-colors"
            style={{
              background: notifOpen ? 'var(--ipqc-accent-ultra-light)' : 'transparent',
              color: 'var(--ipqc-text-muted)',
            }}
          >
            <Bell size={20} />
            <span
              className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full border-2"
              style={{ background: '#ef4444', borderColor: 'var(--ipqc-ribbon-bg)' }}
            />
          </motion.button>
          <AnimatePresence>
            {notifOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.96 }}
                transition={{ duration: 0.18 }}
                className="absolute right-0 top-12 w-80 rounded-2xl overflow-hidden"
                style={{
                  background: 'var(--ipqc-surface)',
                  border: '1px solid var(--ipqc-border)',
                  boxShadow: 'var(--ipqc-menu-shadow)',
                  zIndex: 100,
                }}
              >
                <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--ipqc-border)' }}>
                  <span className="text-sm font-semibold" style={{ color: 'var(--ipqc-text-primary)' }}>
                    Notifications
                  </span>
                </div>
                {notifications.map(n => (
                  <div
                    key={n.id}
                    className="flex items-start gap-3 px-4 py-3 transition-colors cursor-pointer"
                    style={{ borderBottom: '1px solid var(--ipqc-border)' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--ipqc-surface-hover)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <span className="mt-1.5 w-2 h-2 rounded-full flex-shrink-0" style={{ background: n.dot }} />
                    <div className="flex-1">
                      <p className="text-xs leading-snug" style={{ color: 'var(--ipqc-text-primary)' }}>{n.text}</p>
                      <p className="text-[11px] mt-0.5" style={{ color: 'var(--ipqc-text-muted)' }}>{n.time}</p>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Theme switcher */}
        <div className="relative" ref={themeRef}>
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={() => { setThemeOpen(o => !o); setNotifOpen(false); setProfileOpen(false); }}
            className="flex items-center gap-1.5 px-3 h-10 rounded-xl text-sm font-medium transition-colors"
            style={{
              background: themeOpen ? 'var(--ipqc-accent-ultra-light)' : 'transparent',
              color: 'var(--ipqc-text-muted)',
              border: '1px solid var(--ipqc-border)',
            }}
          >
            <Palette size={16} />
            <span className="hidden sm:inline">{themes[theme].label}</span>
            <ChevronDown size={14} className={`transition-transform ${themeOpen ? 'rotate-180' : ''}`} />
          </motion.button>
          <AnimatePresence>
            {themeOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.96 }}
                transition={{ duration: 0.18 }}
                className="absolute right-0 top-12 w-44 rounded-2xl overflow-hidden"
                style={{
                  background: 'var(--ipqc-surface)',
                  border: '1px solid var(--ipqc-border)',
                  boxShadow: 'var(--ipqc-menu-shadow)',
                  zIndex: 100,
                }}
              >
                {(Object.keys(themes) as ThemeKey[]).map(t => (
                  <button
                    key={t}
                    onClick={() => { setTheme(t); setThemeOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors"
                    style={{
                      color: 'var(--ipqc-text-primary)',
                      background: theme === t ? 'var(--ipqc-accent-ultra-light)' : 'transparent',
                    }}
                    onMouseEnter={e => { if (theme !== t) (e.currentTarget as HTMLButtonElement).style.background = 'var(--ipqc-surface-hover)'; }}
                    onMouseLeave={e => { if (theme !== t) (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
                  >
                    <span
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ background: themes[t].vars['--ipqc-accent'] }}
                    />
                    {themes[t].label}
                    {theme === t && <Check size={14} className="ml-auto" style={{ color: 'var(--ipqc-accent)' }} />}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Profile */}
        <div className="relative">
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={() => { setProfileOpen(o => !o); setThemeOpen(false); setNotifOpen(false); }}
            className="flex items-center gap-2 px-3 h-10 rounded-xl transition-colors"
            style={{
              background: profileOpen ? 'var(--ipqc-accent-ultra-light)' : 'transparent',
              border: '1px solid var(--ipqc-border)',
            }}
          >
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
              style={{ background: 'var(--ipqc-accent)', color: '#fff' }}
            >
              QC
            </div>
            <span className="hidden sm:block text-sm font-medium" style={{ color: 'var(--ipqc-text-primary)' }}>
              QC Manager
            </span>
          </motion.button>
          <AnimatePresence>
            {profileOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.96 }}
                transition={{ duration: 0.18 }}
                className="absolute right-0 top-12 w-52 rounded-2xl overflow-hidden"
                style={{
                  background: 'var(--ipqc-surface)',
                  border: '1px solid var(--ipqc-border)',
                  boxShadow: 'var(--ipqc-menu-shadow)',
                  zIndex: 100,
                }}
              >
                <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--ipqc-border)' }}>
                  <p className="text-sm font-semibold" style={{ color: 'var(--ipqc-text-primary)' }}>QC Manager</p>
                  <p className="text-xs" style={{ color: 'var(--ipqc-text-muted)' }}>qcmanager@labicon.com</p>
                </div>
                {['My Profile', 'Settings', 'Sign Out'].map(item => (
                  <button
                    key={item}
                    className="w-full text-left px-4 py-2.5 text-sm transition-colors"
                    style={{ color: item === 'Sign Out' ? '#ef4444' : 'var(--ipqc-text-primary)' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--ipqc-surface-hover)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    {item}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
