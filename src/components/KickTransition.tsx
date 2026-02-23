'use client';

import { motion, AnimatePresence } from 'motion/react';

interface KickTransitionProps {
  active: boolean;
  onComplete: () => void;
}

export default function KickTransition({ active, onComplete }: KickTransitionProps) {
  return (
    <AnimatePresence>
      {active && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center"
          style={{ zIndex: 9999, backgroundColor: 'var(--color-bg)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          {/* Flash circular que se expande */}
          <motion.div
            className="absolute rounded-full"
            style={{ backgroundColor: 'var(--color-primary)' }}
            initial={{ width: 0, height: 0, opacity: 0.6 }}
            animate={{ width: '250vmax', height: '250vmax', opacity: 0 }}
            transition={{ duration: 1, ease: 'easeOut', delay: 0.1 }}
          />

          {/* Logo - efecto patada */}
          <motion.img
            src="/assets/LOGO LARGE 96x96.svg"
            alt=""
            className="relative"
            style={{ width: '160px', height: '160px', objectFit: 'contain' }}
            initial={{ scale: 0, rotate: -30, opacity: 0 }}
            animate={{
              scale: [0, 1.4, 1],
              rotate: [-30, 10, 0],
              opacity: [0, 1, 1],
            }}
            transition={{
              duration: 0.6,
              ease: [0.22, 1, 0.36, 1],
              times: [0, 0.6, 1],
            }}
            onAnimationComplete={() => {
              setTimeout(onComplete, 800);
            }}
          />

          {/* Texto llamativo */}
          <div className="absolute bottom-[12%] flex flex-col items-center gap-2">
            <motion.p
              className="text-center font-black uppercase text-2xl sm:text-3xl"
              style={{
                color: 'var(--color-primary)',
                letterSpacing: '0.15em',
                textShadow: '0 2px 12px rgba(0,0,0,0.15)',
              }}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: [0.5, 1.1, 1] }}
              transition={{ delay: 0.4, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              ¡ESTÁS EN JUEGO!
            </motion.p>
            <motion.p
              className="text-center font-medium text-xs sm:text-sm uppercase tracking-[0.25em]"
              style={{ color: 'var(--color-muted)' }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 0.8, y: 0 }}
              transition={{ delay: 0.7, duration: 0.4 }}
            >
              Pronósticos registrados con éxito
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
