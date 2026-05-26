import { motion } from 'framer-motion';

interface AnimatedLogoProps {
  size?: number;
  showText?: boolean;
}

export default function AnimatedLogo({ size = 88, showText = true }: AnimatedLogoProps) {
  const stroke = Math.max(1.4, size * 0.022);
  const iconSize = size * 0.68;
  const radius = size * 0.5;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
      <div style={{ position: 'relative', width: size, height: size }}>
        <motion.div
          animate={{ opacity: [0.45, 0.9, 0.45], scale: [0.96, 1.06, 0.96] }}
          transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'absolute',
            inset: '-22%',
            borderRadius: '34%',
            background: 'radial-gradient(circle, rgba(56,189,248,0.35) 0%, rgba(99,102,241,0.18) 36%, transparent 68%)',
            filter: 'blur(14px)',
          }}
        />

        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, type: 'spring', stiffness: 110, damping: 16 }}
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            borderRadius: size * 0.28,
            background: 'linear-gradient(145deg, rgba(15,23,42,0.95), rgba(30,41,59,0.72))',
            border: '1px solid rgba(255,255,255,0.18)',
            boxShadow: '0 24px 70px rgba(2,6,23,0.5), 0 0 42px rgba(14,165,233,0.24), inset 0 1px 0 rgba(255,255,255,0.22)',
            display: 'grid',
            placeItems: 'center',
            overflow: 'hidden',
          }}
        >
          <motion.div
            animate={{ x: ['-80%', '155%'] }}
            transition={{ duration: 2.8, repeat: Infinity, repeatDelay: 4.5, ease: 'easeInOut' }}
            style={{
              position: 'absolute',
              top: '-15%',
              left: 0,
              width: '48%',
              height: '130%',
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent)',
              transform: 'skewX(-18deg)',
            }}
          />

          <div style={{ position: 'absolute', inset: '10%', borderRadius: size * 0.22, border: '1px solid rgba(125,211,252,0.16)' }} />
          <div style={{ position: 'absolute', top: '10%', left: '14%', width: '26%', height: '1px', background: 'linear-gradient(90deg, rgba(125,211,252,0.75), transparent)' }} />
          <div style={{ position: 'absolute', bottom: '10%', right: '14%', width: '32%', height: '1px', background: 'linear-gradient(90deg, transparent, rgba(167,139,250,0.75))' }} />

          <motion.svg width={iconSize} height={iconSize} viewBox="0 0 64 64" fill="none" style={{ position: 'relative', zIndex: 2 }}>
            <defs>
              <linearGradient id="recoveryLogoMain" x1="8" y1="8" x2="56" y2="56" gradientUnits="userSpaceOnUse">
                <stop stopColor="#E0F2FE" />
                <stop offset="0.48" stopColor="#38BDF8" />
                <stop offset="1" stopColor="#A78BFA" />
              </linearGradient>
              <linearGradient id="recoveryLogoDim" x1="18" y1="16" x2="48" y2="48" gradientUnits="userSpaceOnUse">
                <stop stopColor="rgba(255,255,255,0.72)" />
                <stop offset="1" stopColor="rgba(125,211,252,0.18)" />
              </linearGradient>
            </defs>

            <motion.circle
              cx="32"
              cy="32"
              r="22"
              stroke="url(#recoveryLogoDim)"
              strokeWidth={stroke}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 1.1, delay: 0.15 }}
            />
            <motion.circle
              cx="32"
              cy="32"
              r="13"
              stroke="rgba(255,255,255,0.38)"
              strokeWidth={stroke * 0.82}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 0.95, delay: 0.35 }}
            />
            <motion.circle
              cx="32"
              cy="32"
              r="4.2"
              fill="url(#recoveryLogoMain)"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.62, type: 'spring', stiffness: 220, damping: 14 }}
            />

            <motion.path
              d="M32 32 L49 20"
              stroke="url(#recoveryLogoMain)"
              strokeWidth={stroke * 1.35}
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 0.65, delay: 0.72 }}
            />
            <motion.circle
              cx="49"
              cy="20"
              r="3.3"
              fill="#E0F2FE"
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.2, 1] }}
              transition={{ delay: 1.04, duration: 0.45 }}
            />

            <motion.path
              d="M12 32C12 20.95 20.95 12 32 12C40.1 12 47.08 16.82 50.23 23.75"
              stroke="url(#recoveryLogoMain)"
              strokeWidth={stroke * 1.45}
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: [0, 1, 1], opacity: [0, 1, 0.76] }}
              transition={{ duration: 2.4, delay: 0.8, repeat: Infinity, repeatDelay: 1.8, ease: 'easeInOut' }}
            />

            {[18, 26, 39, 46].map((x, index) => (
              <motion.path
                key={x}
                d={`M${x} ${47 - index * 3}H${x + 7}`}
                stroke={index % 2 === 0 ? '#38BDF8' : '#A78BFA'}
                strokeWidth={stroke * 0.82}
                strokeLinecap="round"
                initial={{ opacity: 0, x: -3 }}
                animate={{ opacity: [0.15, 0.9, 0.2], x: [index % 2 ? 2 : -2, 0, index % 2 ? -2 : 2] }}
                transition={{ duration: 2.2, delay: 1 + index * 0.18, repeat: Infinity, repeatDelay: 2.4 }}
              />
            ))}
          </motion.svg>
        </motion.div>

        {[0, 1, 2, 3, 4, 5].map((item) => {
          const angle = (item / 6) * Math.PI * 2;
          return (
            <motion.div
              key={item}
              animate={{
                x: [Math.cos(angle) * radius * 0.55, Math.cos(angle) * radius * 0.72, Math.cos(angle) * radius * 0.55],
                y: [Math.sin(angle) * radius * 0.55, Math.sin(angle) * radius * 0.72, Math.sin(angle) * radius * 0.55],
                opacity: [0.1, 0.82, 0.1],
                scale: [0.75, 1, 0.75],
              }}
              transition={{ duration: 3.4, delay: item * 0.25, repeat: Infinity, ease: 'easeInOut' }}
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: Math.max(3, size * 0.045),
                height: Math.max(3, size * 0.045),
                marginLeft: -Math.max(3, size * 0.045) / 2,
                marginTop: -Math.max(3, size * 0.045) / 2,
                borderRadius: '50%',
                background: item % 2 === 0 ? '#38bdf8' : '#a78bfa',
                boxShadow: `0 0 14px ${item % 2 === 0 ? '#38bdf8' : '#a78bfa'}`,
              }}
            />
          );
        })}
      </div>

      {showText && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45, duration: 0.55 }} style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: `clamp(1.35rem, ${size * 0.035}rem, 2.45rem)`, fontWeight: 950, letterSpacing: '-0.055em', background: 'linear-gradient(135deg, #ffffff 0%, #7dd3fc 52%, #c4b5fd 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>
            RECOVERY.UZ
          </h1>
          <motion.div initial={{ width: 0 }} animate={{ width: '72%' }} transition={{ delay: 0.7, duration: 0.7 }} style={{ height: 1, margin: '0.45rem auto 0.55rem', background: 'linear-gradient(90deg, transparent, rgba(125,211,252,0.8), transparent)' }} />
          <p style={{ fontSize: '0.82rem', color: '#94a3b8', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', margin: 0 }}>
            Data Recovery Lab
          </p>
        </motion.div>
      )}
    </div>
  );
}
