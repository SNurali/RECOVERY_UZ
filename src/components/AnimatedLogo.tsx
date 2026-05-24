import { motion } from 'framer-motion';

interface AnimatedLogoProps {
  size?: number;
  showText?: boolean;
}

export default function AnimatedLogo({ size = 80, showText = true }: AnimatedLogoProps) {
  const iconSize = size * 0.45;
  const particleCount = 8;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
      {/* Logo container */}
      <div style={{ position: 'relative', width: size, height: size }}>
        {/* Outer glow ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          style={{ position: 'absolute', inset: '-4px', borderRadius: '24px', background: 'conic-gradient(from 0deg, transparent, rgba(14,165,233,0.4), transparent, rgba(99,102,241,0.4), transparent)', opacity: 0.6 }}
        />

        {/* Pulsing glow */}
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          style={{ position: 'absolute', inset: '-12px', borderRadius: '28px', background: 'radial-gradient(circle, rgba(14,165,233,0.2) 0%, transparent 70%)' }}
        />

        {/* Main logo box */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, type: 'spring' }}
          style={{ position: 'relative', width: '100%', height: '100%', background: 'linear-gradient(135deg, #0ea5e9, #4f46e5, #7c3aed)', borderRadius: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 20px 40px rgba(14,165,233,0.3), inset 0 1px 0 rgba(255,255,255,0.1)', overflow: 'hidden' }}
        >
          {/* Inner shine */}
          <motion.div
            animate={{ x: ['-100%', '200%'] }}
            transition={{ duration: 3, repeat: Infinity, repeatDelay: 4, ease: 'easeInOut' }}
            style={{ position: 'absolute', top: 0, left: 0, width: '50%', height: '100%', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)', transform: 'skewX(-20deg)' }}
          />

          {/* HDD/Data icon - custom SVG */}
          <motion.svg
            width={iconSize}
            height={iconSize}
            viewBox="0 0 48 48"
            fill="none"
            initial={{ y: 5, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            {/* Disk platter */}
            <motion.circle
              cx="24" cy="24" r="18"
              stroke="rgba(255,255,255,0.9)"
              strokeWidth="2"
              fill="none"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.5, delay: 0.5 }}
            />
            <motion.circle
              cx="24" cy="24" r="12"
              stroke="rgba(255,255,255,0.5)"
              strokeWidth="1.5"
              fill="none"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.2, delay: 0.8 }}
            />
            <motion.circle
              cx="24" cy="24" r="6"
              stroke="rgba(255,255,255,0.3)"
              strokeWidth="1"
              fill="none"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1, delay: 1 }}
            />
            {/* Center hub */}
            <motion.circle
              cx="24" cy="24" r="3"
              fill="rgba(255,255,255,0.9)"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 1.2, type: 'spring' }}
            />
            {/* Read arm */}
            <motion.path
              d="M24 24 L38 14"
              stroke="rgba(255,255,255,0.8)"
              strokeWidth="2.5"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ delay: 1.4, duration: 0.6 }}
            />
            <motion.circle
              cx="38" cy="14" r="2"
              fill="rgba(255,255,255,0.9)"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 1.8, type: 'spring' }}
            />
          </motion.svg>
        </motion.div>

        {/* Floating data particles */}
        {Array.from({ length: particleCount }).map((_, i) => {
          const angle = (i / particleCount) * 360;
          const delay = i * 0.2;
          const radius = size * 0.55;

          return (
            <motion.div
              key={i}
              animate={{
                x: [0, Math.cos((angle * Math.PI) / 180) * radius * 0.3],
                y: [0, Math.sin((angle * Math.PI) / 180) * radius * 0.3],
                opacity: [0, 1, 0],
                scale: [0, 1, 0],
              }}
              transition={{
                duration: 2.5,
                delay: delay + 2,
                repeat: Infinity,
                repeatDelay: 3,
                ease: 'easeOut',
              }}
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: '4px',
                height: '4px',
                borderRadius: '50%',
                background: i % 2 === 0 ? '#0ea5e9' : '#8b5cf6',
                boxShadow: `0 0 6px ${i % 2 === 0 ? '#0ea5e9' : '#8b5cf6'}`,
              }}
            />
          );
        })}
      </div>

      {/* Text */}
      {showText && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          style={{ textAlign: 'center' }}
        >
          <h1 style={{ fontSize: size * 0.035 + 'rem', fontWeight: 900, letterSpacing: '-0.03em', background: 'linear-gradient(135deg, #f8fafc 0%, #94a3b8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '0.25rem' }}>
            RECOVERY.UZ
          </h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 500 }}
          >
            Восстановление данных
          </motion.p>
        </motion.div>
      )}
    </div>
  );
}
