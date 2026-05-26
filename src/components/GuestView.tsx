import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  ArrowRight,
  Award,
  CheckCircle,
  Clock,
  Cpu,
  Database,
  ExternalLink,
  Gauge,
  HardDrive,
  Laptop,
  Lock,
  MapPin,
  MessageCircle,
  Phone,
  Search,
  Server,
  Shield,
  Users,
  Wrench,
  Zap,
} from 'lucide-react';
import { useI18n } from '../i18n/provider';
import LanguageSwitcher from './LanguageSwitcher';
import AnimatedLogo from './AnimatedLogo';

const contact = {
  phone: '+998 (97) 732-66-45',
  phoneHref: 'tel:+998977326645',
  address: 'г. Ташкент, Сагбон, Тупик-30, Дом-8, подъезд 4, подвал',
  telegram: 'https://t.me/Bro201',
  instagram: 'https://www.instagram.com/Recovery.uz',
  facebook: 'https://www.facebook.com/Recovery.uz',
  map: 'https://www.google.com/maps/place/Recovery.uz+%D0%9F%D1%80%D0%BE%D1%84%D0%B5%D1%81%D1%81%D0%B8%D0%BE%D0%BD%D0%B0%D0%BB%D1%8C%D0%BD%D0%BE%D0%B5+%D0%B2%D0%BE%D1%81%D1%81%D1%82%D0%B0%D0%BD%D0%BE%D0%B2%D0%BB%D0%B5%D0%BD%D0%B8%D0%B5+%D0%B4%D0%B0%D0%BD%D0%BD%D1%8B%D1%85+%D0%A2%D0%B0%D1%88%D0%BA%D0%B5%D0%BD%D1%82+(PC3000)/@41.3456922,69.2326357,17z',
};

export default function GuestView() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const [trackingNumber, setTrackingNumber] = useState('');

  const services = [
    {
      icon: HardDrive,
      title: t('guest.servicesSec.hdd.title'),
      label: t('guest.servicesSec.hdd.label'),
      text: t('guest.servicesSec.hdd.text'),
      image: 'https://recovery.uz/wp-content/uploads/2017/07/3-600x400.jpg',
      color: '#38bdf8',
    },
    {
      icon: Database,
      title: t('guest.servicesSec.ssd.title'),
      label: t('guest.servicesSec.ssd.label'),
      text: t('guest.servicesSec.ssd.text'),
      image: 'https://recovery.uz/wp-content/uploads/2017/07/2-600x400.jpg',
      color: '#a78bfa',
    },
    {
      icon: Server,
      title: t('guest.servicesSec.raid.title'),
      label: t('guest.servicesSec.raid.label'),
      text: t('guest.servicesSec.raid.text'),
      image: 'https://recovery.uz/wp-content/uploads/2017/07/6-600x400.png',
      color: '#22c55e',
    },
    {
      icon: Laptop,
      title: t('guest.servicesSec.pc.title'),
      label: t('guest.servicesSec.pc.label'),
      text: t('guest.servicesSec.pc.text'),
      image: 'https://recovery.uz/wp-content/uploads/2017/07/slide-3-1-1-600x400.jpg',
      color: '#f59e0b',
    },
  ];

  const advantages = [
    { icon: Award, title: t('guest.advantages.exp.title'), text: t('guest.advantages.exp.text') },
    { icon: Cpu, title: t('guest.advantages.pc3000.title'), text: t('guest.advantages.pc3000.text') },
    { icon: Lock, title: t('guest.advantages.privacy.title'), text: t('guest.advantages.privacy.text') },
    { icon: Users, title: t('guest.advantages.lab.title'), text: t('guest.advantages.lab.text') },
    { icon: Zap, title: t('guest.advantages.sameday.title'), text: t('guest.advantages.sameday.text') },
    { icon: Shield, title: t('guest.advantages.noprepay.title'), text: t('guest.advantages.noprepay.text') },
  ];

  const processSteps = [
    { title: t('guest.processSec.step1.title'), text: t('guest.processSec.step1.text') },
    { title: t('guest.processSec.step2.title'), text: t('guest.processSec.step2.text') },
    { title: t('guest.processSec.step3.title'), text: t('guest.processSec.step3.text') },
    { title: t('guest.processSec.step4.title'), text: t('guest.processSec.step4.text') },
  ];

  const cases = [
    t('guest.casesSec.items.0'),
    t('guest.casesSec.items.1'),
    t('guest.casesSec.items.2'),
    t('guest.casesSec.items.3'),
    t('guest.casesSec.items.4'),
    t('guest.casesSec.items.5'),
  ];

  const projects = [
    { title: 'AdminPE', text: t('guest.projectsSec.adminpe.text') },
    { title: 'AdminDP', text: t('guest.projectsSec.admindp.text') },
  ];

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (trackingNumber.trim()) {
      navigate(`/track?token=${encodeURIComponent(trackingNumber.trim())}`);
    }
  };

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div style={{ minHeight: '100vh', background: '#07111f', color: '#f8fafc', overflow: 'hidden' }}>
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', background: 'radial-gradient(circle at 15% 10%, rgba(14,165,233,0.22), transparent 28%), radial-gradient(circle at 85% 15%, rgba(99,102,241,0.18), transparent 26%), radial-gradient(circle at 50% 95%, rgba(16,185,129,0.12), transparent 32%)', zIndex: 0 }} />

      <nav style={{ position: 'sticky', top: 0, zIndex: 50, backdropFilter: 'blur(22px)', background: 'rgba(7,17,31,0.76)', borderBottom: '1px solid rgba(148,163,184,0.14)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
          <button onClick={() => scrollTo('top')} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'none', border: 0, cursor: 'pointer' }}>
            <div style={{ width: 42, height: 42, transform: 'scale(0.78)', transformOrigin: 'center' }}>
              <AnimatedLogo size={42} showText={false} />
            </div>
            <span style={{ fontSize: '1.05rem', fontWeight: 900, letterSpacing: '0.04em', color: '#f8fafc' }}>RECOVERY.UZ</span>
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            <div style={{ display: 'flex', gap: '0.25rem' }}>
              {[
                { label: t('guest.nav.services'), target: 'services' },
                { label: t('guest.nav.process'), target: 'process' },
                { label: t('guest.nav.contacts'), target: 'contacts' }
              ].map((item) => (
                <button key={item.target} onClick={() => scrollTo(item.target)} style={{ display: 'none', padding: '0.55rem 0.8rem', borderRadius: 999, border: '1px solid transparent', background: 'transparent', color: '#94a3b8', fontWeight: 700, cursor: 'pointer' }} className="desktop-nav-link">
                  {item.label}
                </button>
              ))}
            </div>
            <LanguageSwitcher />
            <button onClick={() => navigate('/login')} style={{ padding: '0.7rem 1rem', borderRadius: 12, border: '1px solid rgba(255,255,255,0.14)', background: 'rgba(255,255,255,0.06)', color: '#e2e8f0', fontWeight: 800, cursor: 'pointer' }}>
              {t('auth.loginButton')}
            </button>
          </div>
        </div>
      </nav>

      <main id="top" style={{ position: 'relative', zIndex: 1 }}>
        <section className="hero-section" style={{ maxWidth: 1200, margin: '0 auto', padding: '4.5rem 1.25rem 3.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))', gap: '2rem', alignItems: 'center' }}>
            <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.55rem', padding: '0.45rem 0.8rem', borderRadius: 999, background: 'rgba(14,165,233,0.1)', border: '1px solid rgba(14,165,233,0.28)', color: '#7dd3fc', fontWeight: 900, fontSize: '0.82rem', marginBottom: '1.4rem' }}>
                <Activity size={16} /> {t('guest.hero.badge')}
              </div>

              <h1 className="hero-title" style={{ fontSize: 'clamp(2.8rem, 7vw, 5.7rem)', lineHeight: 0.94, letterSpacing: '-0.07em', margin: '0 0 1.4rem', fontWeight: 950 }}>
                {t('guest.hero.title')}
              </h1>
              <p style={{ fontSize: 'clamp(1.05rem, 2vw, 1.3rem)', lineHeight: 1.7, color: '#a8b5c7', maxWidth: 640, margin: '0 0 1.8rem' }}>
                {t('guest.hero.desc')}
              </p>

              <div className="hero-actions" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem', marginBottom: '1.6rem' }}>
                <button className="hero-action" onClick={() => navigate('/guest/new-order')} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.65rem', padding: '1rem 1.35rem', borderRadius: 16, border: 0, background: 'linear-gradient(135deg, #0ea5e9, #6366f1)', color: 'white', fontWeight: 900, cursor: 'pointer', boxShadow: '0 18px 45px rgba(14,165,233,0.28)' }}>
                  {t('guest.hero.cta')} <ArrowRight size={19} />
                </button>
                <a className="hero-action" href={contact.phoneHref} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.65rem', padding: '1rem 1.2rem', borderRadius: 16, border: '1px solid rgba(255,255,255,0.16)', background: 'rgba(255,255,255,0.06)', color: '#f8fafc', textDecoration: 'none', fontWeight: 900 }}>
                  <Phone size={19} /> {contact.phone}
                </a>
              </div>

              <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(135px, 1fr))', gap: '0.8rem', maxWidth: 620 }}>
                {[
                  [t('guest.stats.expVal'), t('guest.stats.expLbl')],
                  [t('guest.stats.onlineVal'), t('guest.stats.onlineLbl')],
                  [t('guest.stats.diagVal'), t('guest.stats.diagLbl')],
                  [t('guest.stats.eqVal'), t('guest.stats.eqLbl')],
                ].map(([value, label]) => (
                  <div key={label} style={{ padding: '1rem', borderRadius: 18, background: 'rgba(15,23,42,0.72)', border: '1px solid rgba(148,163,184,0.14)' }}>
                    <div style={{ fontSize: '1.45rem', fontWeight: 950 }}>{value}</div>
                    <div style={{ color: '#94a3b8', fontWeight: 700, fontSize: '0.83rem' }}>{label}</div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.1 }} style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', inset: '-10%', background: 'radial-gradient(circle, rgba(14,165,233,0.18), transparent 62%)', filter: 'blur(18px)' }} />
              <div style={{ position: 'relative', borderRadius: 34, overflow: 'hidden', background: 'linear-gradient(145deg, rgba(15,23,42,0.92), rgba(30,41,59,0.72))', border: '1px solid rgba(255,255,255,0.16)', boxShadow: '0 35px 90px rgba(0,0,0,0.38)' }}>
                <div style={{ height: 250, backgroundImage: 'linear-gradient(180deg, rgba(7,17,31,0.1), rgba(7,17,31,0.92)), url(https://recovery.uz/wp-content/uploads/2017/07/london-uk-data-recovery-specialists.jpg)', backgroundSize: 'cover', backgroundPosition: 'center' }} />
                <div style={{ padding: '1.35rem' }}>
                  <AnimatedLogo size={78} showText={false} />
                  <h2 style={{ margin: '1rem 0 0.5rem', fontSize: '1.35rem' }}>{t('guest.trackCard.title')}</h2>
                  <p style={{ color: '#94a3b8', lineHeight: 1.6, margin: '0 0 1rem' }}>{t('guest.trackCard.desc')}</p>
                  <form onSubmit={handleTrack} style={{ display: 'flex', gap: '0.55rem' }}>
                    <input value={trackingNumber} onChange={(e) => setTrackingNumber(e.target.value)} placeholder={t('guest.trackPlaceholder')} style={{ flex: 1, minWidth: 0, padding: '0.9rem 1rem', borderRadius: 14, border: '1px solid rgba(255,255,255,0.14)', background: 'rgba(2,6,23,0.7)', color: '#f8fafc', outline: 'none' }} />
                    <button type="submit" style={{ width: 52, borderRadius: 14, border: 0, display: 'grid', placeItems: 'center', background: '#6366f1', color: 'white', cursor: 'pointer' }}>
                      <Search size={20} />
                    </button>
                  </form>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <motion.section id="services" initial={{ opacity: 0, y: 34 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.18 }} transition={{ duration: 0.55 }} style={{ maxWidth: 1200, margin: '0 auto', padding: '3.5rem 1.25rem' }}>
          <SectionHeader kicker={t('guest.servicesSec.kicker')} title={t('guest.servicesSec.title')} text={t('guest.servicesSec.desc')} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
            {services.map((service, index) => {
              const Icon = service.icon;
              return (
                <motion.article key={service.title} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.05 }} whileHover={{ y: -6 }} style={{ overflow: 'hidden', borderRadius: 28, background: 'rgba(15,23,42,0.72)', border: '1px solid rgba(148,163,184,0.14)', boxShadow: '0 24px 70px rgba(0,0,0,0.22)' }}>
                  <div style={{ height: 150, backgroundImage: `linear-gradient(180deg, rgba(7,17,31,0.02), rgba(7,17,31,0.86)), url(${service.image})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                  <div style={{ padding: '1.35rem' }}>
                    <div style={{ width: 52, height: 52, borderRadius: 16, display: 'grid', placeItems: 'center', background: `${service.color}1f`, color: service.color, border: `1px solid ${service.color}40`, marginTop: -46, marginBottom: '1rem', backdropFilter: 'blur(10px)' }}>
                      <Icon size={25} />
                    </div>
                    <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.16rem' }}>{service.title}</h3>
                    <div style={{ color: service.color, fontSize: '0.82rem', fontWeight: 900, marginBottom: '0.7rem' }}>{service.label}</div>
                    <p style={{ margin: 0, color: '#94a3b8', lineHeight: 1.65, fontSize: '0.95rem' }}>{service.text}</p>
                  </div>
                </motion.article>
              );
            })}
          </div>
        </motion.section>

        <motion.section initial={{ opacity: 0, y: 34 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.18 }} transition={{ duration: 0.55 }} style={{ maxWidth: 1200, margin: '0 auto', padding: '3.5rem 1.25rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', alignItems: 'stretch' }}>
            <div style={{ borderRadius: 30, padding: '2rem', background: 'linear-gradient(145deg, rgba(14,165,233,0.16), rgba(99,102,241,0.12))', border: '1px solid rgba(125,211,252,0.2)' }}>
              <div style={{ color: '#7dd3fc', fontWeight: 900, marginBottom: '0.7rem' }}>{t('guest.about.kicker')}</div>
              <h2 style={{ margin: '0 0 1rem', fontSize: 'clamp(1.8rem, 4vw, 3rem)', lineHeight: 1.05 }}>{t('guest.about.title')}</h2>
              <p style={{ color: '#cbd5e1', lineHeight: 1.7, margin: 0 }}>{t('guest.about.text')}</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '1rem' }}>
              {advantages.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} style={{ padding: '1.35rem', borderRadius: 24, background: 'rgba(15,23,42,0.72)', border: '1px solid rgba(148,163,184,0.14)' }}>
                    <Icon size={25} color="#38bdf8" />
                    <h3 style={{ margin: '0.85rem 0 0.45rem', fontSize: '1rem' }}>{item.title}</h3>
                    <p style={{ margin: 0, color: '#94a3b8', lineHeight: 1.55, fontSize: '0.9rem' }}>{item.text}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.section>

        <motion.section id="process" initial={{ opacity: 0, y: 34 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.18 }} transition={{ duration: 0.55 }} style={{ maxWidth: 1200, margin: '0 auto', padding: '3.5rem 1.25rem' }}>
          <SectionHeader kicker={t('guest.processSec.kicker')} title={t('guest.processSec.title')} text={t('guest.processSec.desc')} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '1rem' }}>
            {processSteps.map((step, index) => (
              <motion.div key={step.title} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.05 }} style={{ position: 'relative', padding: '1.5rem', borderRadius: 26, background: 'rgba(15,23,42,0.72)', border: '1px solid rgba(148,163,184,0.14)' }}>
                <div style={{ width: 42, height: 42, borderRadius: 14, display: 'grid', placeItems: 'center', background: 'rgba(14,165,233,0.14)', color: '#7dd3fc', fontWeight: 950, marginBottom: '1rem' }}>{index + 1}</div>
                <h3 style={{ margin: '0 0 0.55rem' }}>{step.title}</h3>
                <p style={{ margin: 0, color: '#94a3b8', lineHeight: 1.6 }}>{step.text}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        <motion.section initial={{ opacity: 0, y: 34 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.18 }} transition={{ duration: 0.55 }} style={{ maxWidth: 1200, margin: '0 auto', padding: '3.5rem 1.25rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
            <div style={{ padding: '2rem', borderRadius: 30, background: 'rgba(15,23,42,0.72)', border: '1px solid rgba(148,163,184,0.14)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', color: '#7dd3fc', fontWeight: 900, marginBottom: '1rem' }}><Wrench size={20} /> {t('guest.casesSec.title')}</div>
              <h2 style={{ margin: '0 0 1.2rem', fontSize: '2rem' }}>{t('guest.casesSec.subtitle')}</h2>
              <div style={{ display: 'grid', gap: '0.75rem' }}>
                {cases.map((item) => (
                  <div key={item} style={{ display: 'flex', gap: '0.7rem', alignItems: 'flex-start', color: '#cbd5e1' }}>
                    <CheckCircle size={18} color="#22c55e" style={{ flexShrink: 0, marginTop: 2 }} />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ padding: '2rem', borderRadius: 30, background: 'linear-gradient(145deg, rgba(16,185,129,0.14), rgba(14,165,233,0.12))', border: '1px solid rgba(34,197,94,0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', color: '#86efac', fontWeight: 900, marginBottom: '1rem' }}><Gauge size={20} /> {t('guest.projectsSec.kicker')}</div>
              <h2 style={{ margin: '0 0 1.2rem', fontSize: '2rem' }}>{t('guest.projectsSec.title')}</h2>
              <div style={{ display: 'grid', gap: '1rem' }}>
                {projects.map((project) => (
                  <div key={project.title} style={{ padding: '1rem', borderRadius: 18, background: 'rgba(2,6,23,0.28)', border: '1px solid rgba(255,255,255,0.12)' }}>
                    <h3 style={{ margin: '0 0 0.4rem' }}>{project.title}</h3>
                    <p style={{ margin: 0, color: '#cbd5e1', lineHeight: 1.55 }}>{project.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.section>

        <motion.section id="contacts" initial={{ opacity: 0, y: 34 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.18 }} transition={{ duration: 0.55 }} style={{ maxWidth: 1200, margin: '0 auto', padding: '3.5rem 1.25rem 5rem' }}>
          <div style={{ borderRadius: 36, overflow: 'hidden', background: 'rgba(15,23,42,0.82)', border: '1px solid rgba(148,163,184,0.18)', boxShadow: '0 35px 90px rgba(0,0,0,0.25)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
              <div style={{ padding: '2rem' }}>
                <div style={{ color: '#7dd3fc', fontWeight: 900, marginBottom: '0.7rem' }}>{t('guest.contactsSec.kicker')}</div>
                <h2 style={{ margin: '0 0 1rem', fontSize: 'clamp(2rem, 5vw, 3.4rem)', lineHeight: 1 }}>{t('guest.contactsSec.title')}</h2>
                <p style={{ color: '#94a3b8', lineHeight: 1.7, marginBottom: '1.5rem' }}>{t('guest.contactsSec.desc')}</p>
                <div style={{ display: 'grid', gap: '0.85rem' }}>
                  <ContactLine icon={<Phone size={20} />} label={t('guest.contactsSec.phone')} value={contact.phone} href={contact.phoneHref} />
                  <ContactLine icon={<MapPin size={20} />} label={t('guest.contactsSec.address.label')} value={t('guest.contactsSec.address.value')} href={contact.map} />
                  <ContactLine icon={<Clock size={20} />} label={t('guest.contactsSec.workTime.label')} value={t('guest.contactsSec.workTime.value')} />
                </div>
              </div>
              <div style={{ padding: '2rem', background: 'linear-gradient(145deg, rgba(14,165,233,0.14), rgba(99,102,241,0.16))', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1.5rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.5rem', margin: '0 0 0.75rem' }}>{t('guest.contactsSec.form.title')}</h3>
                  <p style={{ color: '#cbd5e1', lineHeight: 1.65, margin: 0 }}>{t('guest.contactsSec.form.desc')}</p>
                </div>
                <div style={{ display: 'grid', gap: '0.8rem' }}>
                  <button onClick={() => navigate('/guest/new-order')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.65rem', padding: '1rem 1.2rem', borderRadius: 16, border: 0, background: '#f8fafc', color: '#0f172a', fontWeight: 950, cursor: 'pointer' }}>
                    {t('guest.contactsSec.form.btn')} <ArrowRight size={18} />
                  </button>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
                    <SocialLink href={contact.telegram} icon={<MessageCircle size={17} />} label="Telegram" />
                    <SocialLink href={contact.instagram} icon={<ExternalLink size={17} />} label="Instagram" />
                    <SocialLink href={contact.facebook} icon={<ExternalLink size={17} />} label="Facebook" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.section>
      </main>

      <style>{`
        @media (min-width: 760px) {
          .desktop-nav-link { display: inline-flex !important; }
          .desktop-nav-link:hover { background: rgba(255,255,255,0.06) !important; color: #f8fafc !important; border-color: rgba(255,255,255,0.12) !important; }
        }
        @media (max-width: 640px) {
          .hero-section { padding-top: 2.25rem !important; padding-bottom: 2.5rem !important; }
          .hero-title { font-size: clamp(2.15rem, 14vw, 3.15rem) !important; letter-spacing: -0.055em !important; line-height: 0.98 !important; }
          .hero-actions { display: grid !important; grid-template-columns: 1fr !important; }
          .hero-action { justify-content: center !important; width: 100% !important; box-sizing: border-box !important; }
          .stats-grid { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
        }
        @media (max-width: 420px) {
          .stats-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

function SectionHeader({ kicker, title, text }: { kicker: string; title: string; text: string }) {
  return (
    <div style={{ maxWidth: 760, marginBottom: '2rem' }}>
      <div style={{ color: '#7dd3fc', fontWeight: 950, marginBottom: '0.65rem', letterSpacing: '0.05em', textTransform: 'uppercase', fontSize: '0.78rem' }}>{kicker}</div>
      <h2 style={{ margin: '0 0 0.85rem', fontSize: 'clamp(2rem, 5vw, 3.4rem)', lineHeight: 1.02, letterSpacing: '-0.045em' }}>{title}</h2>
      <p style={{ margin: 0, color: '#94a3b8', lineHeight: 1.7, fontSize: '1.05rem' }}>{text}</p>
    </div>
  );
}

function ContactLine({ icon, label, value, href }: { icon: React.ReactNode; label: string; value: string; href?: string }) {
  const content = (
    <>
      <div style={{ width: 42, height: 42, borderRadius: 14, display: 'grid', placeItems: 'center', background: 'rgba(14,165,233,0.13)', color: '#7dd3fc', flexShrink: 0 }}>{icon}</div>
      <div>
        <div style={{ color: '#64748b', fontSize: '0.78rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
        <div style={{ color: '#f8fafc', fontWeight: 800, lineHeight: 1.45 }}>{value}</div>
      </div>
    </>
  );

  if (href) {
    return <a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noreferrer" style={{ display: 'flex', gap: '0.85rem', alignItems: 'center', padding: '0.9rem', borderRadius: 18, background: 'rgba(255,255,255,0.045)', border: '1px solid rgba(255,255,255,0.1)', textDecoration: 'none' }}>{content}</a>;
  }

  return <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'center', padding: '0.9rem', borderRadius: 18, background: 'rgba(255,255,255,0.045)', border: '1px solid rgba(255,255,255,0.1)' }}>{content}</div>;
}

function SocialLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', padding: '0.65rem 0.85rem', borderRadius: 999, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.14)', color: '#f8fafc', textDecoration: 'none', fontWeight: 850 }}>
      {icon} {label}
    </a>
  );
}
