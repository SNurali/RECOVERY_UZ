import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, ArrowRight, Send, CheckCircle, HardDrive, MessageCircle,
  Plus, Trash2, ShoppingBag,
} from 'lucide-react';
import { useI18n } from '../i18n/provider';
import LanguageSwitcher from '../components/LanguageSwitcher';
import api from '../lib/api';
import { toast } from 'sonner';

const STEPS = ['equipment', 'issue', 'contact', 'review'] as const;

interface OrderItemDraft {
  equipment_id: string;
  issue_id: string;
  notes: string;
}

export default function GuestOrderPage() {
  const navigate = useNavigate();
  const { language, t } = useI18n();

  const [step, setStep] = useState(0);
  const [equipments, setEquipments] = useState<any[]>([]);
  const [issues, setIssues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<any>(null);

  // Multiple devices in one order, like the old project
  const [items, setItems] = useState<OrderItemDraft[]>([]);
  const [draft, setDraft] = useState<OrderItemDraft>({ equipment_id: '', issue_id: '', notes: '' });

  const [contact, setContact] = useState({
    client_name: '',
    phone: '',
    telegram: '',
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [eqRes, isRes] = await Promise.all([
          api.get('/equipments'),
          api.get('/issues'),
        ]);
        setEquipments(eqRes.data?.data || eqRes.data || []);
        setIssues(isRes.data?.data || isRes.data || []);
      } catch (err) {
        console.error(err);
        toast.error(t('errors.unknownError'));
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [t]);

  const getName = (obj: any) => {
    if (!obj) return '';
    if (language === 'uz-lat') return obj.name_lat || obj.name_rus;
    if (language === 'uz-cyr') return obj.name_cyr || obj.name_rus;
    if (language === 'en')     return obj.name_eng || obj.name_rus;
    return obj.name_rus;
  };

  const getEquipmentName = (id: string) => getName(equipments.find(e => e.id === id));
  const getIssueName     = (id: string) => getName(issues.find(i => i.id === id));

  const draftEquipment = useMemo(() => equipments.find(e => e.id === draft.equipment_id), [equipments, draft.equipment_id]);
  const draftIssue     = useMemo(() => issues.find(i => i.id === draft.issue_id),         [issues, draft.issue_id]);

  const canGoNext = () => {
    if (step === 0) return !!draft.equipment_id;
    if (step === 1) return !!draft.issue_id;
    if (step === 2) return !!contact.client_name.trim() && !!contact.phone.trim();
    return true;
  };

  // Add the in-progress draft to the list and reset for next item.
  // No limit on how many devices can be added.
  const addCurrentDraft = () => {
    if (!draft.equipment_id || !draft.issue_id) {
      toast.error(t('guestOrder.pickEquipmentAndIssue'));
      return;
    }
    const snapshot = { ...draft };
    setItems(prev => [...prev, snapshot]);
    setDraft({ equipment_id: '', issue_id: '', notes: '' });
    setStep(0);
    setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 50);
  };

  const removeItem = (index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  // After issue step, push current draft into items and continue to contact step.
  const finishItemAndContinue = () => {
    if (draft.equipment_id && draft.issue_id) {
      const snapshot = { ...draft };
      setItems(prev => [...prev, snapshot]);
      setDraft({ equipment_id: '', issue_id: '', notes: '' });
      setStep(2);
    } else if (items.length > 0) {
      // Draft is empty but cart has items — just go to contacts
      setStep(2);
    } else {
      toast.error(t('guestOrder.pickEquipmentAndIssue'));
    }
  };

  const handleSubmit = async () => {
    if (!contact.client_name.trim() || !contact.phone.trim()) {
      toast.error(t('guestOrder.fillContact'));
      return;
    }
    // Combine saved items + current draft (if user is on step 1 and chose to submit directly)
    const allItems = [...items];
    if (draft.equipment_id && draft.issue_id) allItems.push(draft);
    if (!allItems.length) {
      toast.error(t('guestOrder.addDeviceFirst'));
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/guest/orders', {
        client_name: contact.client_name.trim(),
        phone: contact.phone.trim(),
        telegram: contact.telegram.trim() || undefined,
        details: allItems.map(it => ({
          equipment_id: it.equipment_id,
          issue_id: it.issue_id,
          notes: it.notes || undefined,
        })),
      });
      setCreatedOrder(res.data?.data || res.data);
      setSuccess(true);
      toast.success(t('guestOrder.submitted'));
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || t('errors.unknownError'));
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '0.85rem 1rem', borderRadius: '12px',
    border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(15,23,42,0.8)',
    color: '#f1f5f9', fontSize: '0.95rem', outline: 'none', transition: 'border-color 0.2s',
  };
  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.5rem',
  };
  const cardStyle: React.CSSProperties = {
    background: 'rgba(30,41,59,0.6)', backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255,255,255,0.08)', borderRadius: '24px',
    padding: '2rem', boxShadow: '0 25px 50px rgba(0,0,0,0.3)',
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#64748b', fontSize: '1rem' }}>{t('common.loading')}</div>
      </div>
    );
  }

  if (success && createdOrder) {
    const botName = 'recoveryhdd_bot';
    const telegramLink = `https://t.me/${botName}?start=${createdOrder.id}`;

    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{ ...cardStyle, maxWidth: '480px', width: '100%', textAlign: 'center' }}
        >
          <div style={{ width: '80px', height: '80px', background: 'rgba(16,185,129,0.15)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
            <CheckCircle size={40} style={{ color: '#10b981' }} />
          </div>

          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.5rem' }}>
            {t('guestOrder.submittedTitle')}
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            {t('guestOrder.submittedDesc')}
          </p>

          <div style={{ background: 'rgba(14,165,233,0.1)', border: '1px solid rgba(14,165,233,0.2)', borderRadius: '12px', padding: '1rem', marginBottom: '1.5rem' }}>
            <p style={{ color: '#64748b', fontSize: '0.8rem', marginBottom: '0.25rem' }}>{t('guestOrder.orderNumber')}</p>
            <p style={{ color: '#0ea5e9', fontSize: '1.25rem', fontWeight: 700, fontFamily: 'monospace' }}>
              #{(createdOrder.public_tracking_token || createdOrder.id || '').toString().toUpperCase()}
            </p>
          </div>

          <div style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: '16px', padding: '1.25rem', marginBottom: '1.5rem', textAlign: 'left' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <MessageCircle size={18} style={{ color: '#3b82f6' }} />
              <span style={{ color: '#e2e8f0', fontSize: '0.9rem', fontWeight: 600 }}>{t('guestOrder.telegramTitle')}</span>
            </div>
            <p style={{ color: '#94a3b8', fontSize: '0.8rem', marginBottom: '0.75rem', lineHeight: 1.5 }}>
              {t('guestOrder.telegramDesc')}
            </p>
            <a
              href={telegramLink}
              target="_blank"
              rel="noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.25rem', borderRadius: '10px', background: 'linear-gradient(135deg, #2563eb, #3b82f6)', color: 'white', fontSize: '0.85rem', fontWeight: 600, textDecoration: 'none' }}
            >
              <Send size={16} />
              {t('guestOrder.telegramConnect')}
            </a>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={() => navigate(`/track?token=${createdOrder.public_tracking_token || createdOrder.id}`)}
              style={{ flex: 1, padding: '0.8rem', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #0ea5e9, #6366f1)', color: 'white', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer' }}
            >
              {t('guestOrder.trackOrder')}
            </button>
            <button
              onClick={() => navigate('/')}
              style={{ flex: 1, padding: '0.8rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.05)', color: '#e2e8f0', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer' }}
            >
              {t('auth.backToHome')}
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  const totalDevicesPlanned = items.length + (step <= 1 && (draft.equipment_id || draft.issue_id) ? 1 : 0);

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2rem 1.5rem', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: '-15%', right: '-5%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(14,165,233,0.06) 0%, transparent 70%)', borderRadius: '50%' }} />

      <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', zIndex: 20 }}>
        <LanguageSwitcher />
      </div>

      <div style={{ width: '100%', maxWidth: '640px', position: 'relative', zIndex: 10 }}>
        {/* Back */}
        <button
          onClick={() => step > 0 ? setStep(step - 1) : navigate('/')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer', marginBottom: '1.5rem', fontSize: '0.9rem', fontWeight: 500 }}
        >
          <ArrowLeft size={18} />
          {step > 0 ? t('common.back') : t('auth.backToHome')}
        </button>

        {/* Progress bar */}
        <div style={{ display: 'flex', gap: '4px', marginBottom: '2rem' }}>
          {STEPS.map((_, idx) => (
            <div
              key={idx}
              style={{
                flex: 1, height: '4px', borderRadius: '2px',
                background: idx <= step ? 'linear-gradient(90deg, #0ea5e9, #6366f1)' : 'rgba(255,255,255,0.08)',
                transition: 'background 0.3s',
              }}
            />
          ))}
        </div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: 'center', marginBottom: '1.5rem' }}
        >
          <div style={{ width: '56px', height: '56px', background: 'linear-gradient(135deg, #0ea5e9, #6366f1)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', boxShadow: '0 12px 25px rgba(14,165,233,0.2)' }}>
            <HardDrive size={28} color="white" />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f8fafc', marginBottom: '0.4rem' }}>
            {step === 0 && (items.length > 0
              ? t('guestOrder.addNextDevice')
              : t('guestOrder.stepEquipmentTitle'))}
            {step === 1 && t('guestOrder.stepIssueTitle')}
            {step === 2 && t('guestOrder.stepContactTitle')}
            {step === 3 && t('guestOrder.stepReviewTitle')}
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
            {step === 0 && (items.length > 0
              ? `${t('guestOrder.deviceNumberPrefix')}${items.length + 1}. ${t('guestOrder.stepEquipmentSubtitle')}`
              : t('guestOrder.stepEquipmentSubtitle'))}
            {step === 1 && t('guestOrder.stepIssueSubtitle')}
            {step === 2 && t('guestOrder.stepContactSubtitle')}
            {step === 3 && t('guestOrder.stepReviewSubtitle')}
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {/* STEP 0 — equipment */}
          {step === 0 && (
            <motion.div key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} style={cardStyle}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '0.75rem' }}>
                {equipments.map(eq => {
                  const selected = draft.equipment_id === eq.id;
                  return (
                    <button
                      key={eq.id}
                      onClick={() => { setDraft({ ...draft, equipment_id: eq.id }); setStep(1); }}
                      style={{
                        padding: '1rem', borderRadius: '14px', textAlign: 'center',
                        border: selected ? '2px solid rgba(14,165,233,0.5)' : '1px solid rgba(255,255,255,0.08)',
                        background: selected ? 'rgba(14,165,233,0.1)' : 'rgba(15,23,42,0.6)',
                        color: '#f1f5f9', fontSize: '0.9rem', fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem',
                      }}
                    >
                      <div style={{
                        width: '44px', height: '44px', borderRadius: '50%', display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                        background: selected ? '#0ea5e9' : 'rgba(15,23,42,0.8)',
                        color: selected ? 'white' : '#94a3b8',
                      }}>
                        <HardDrive size={22} />
                      </div>
                      <span style={{ lineHeight: 1.2 }}>{getName(eq)}</span>
                    </button>
                  );
                })}
              </div>

              {/* Cart of already added items (visible from step 0 once user has added at least one) */}
              {items.length > 0 && (
                <>
                  <CartSummary
                    items={items}
                    getEquipmentName={getEquipmentName}
                    getIssueName={getIssueName}
                    onRemove={removeItem}
                    onCheckout={() => setStep(2)}
                    t={t}
                  />
                  <p style={{ color: '#94a3b8', fontSize: '0.82rem', textAlign: 'center', marginTop: '1rem', lineHeight: 1.5 }}>
                    {t('guestOrder.unlimitedHint')}
                  </p>
                </>
              )}
            </motion.div>
          )}

          {/* STEP 1 — issue */}
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} style={cardStyle}>
              {draftEquipment && (
                <div style={{ marginBottom: '1.25rem', padding: '0.75rem 1rem', background: 'rgba(14,165,233,0.08)', border: '1px solid rgba(14,165,233,0.2)', borderRadius: '12px', color: '#cbd5e1', fontSize: '0.85rem' }}>
                  <span style={{ color: '#64748b' }}>{t('guestOrder.selectedEquipment')}:</span>{' '}
                  <strong style={{ color: '#f1f5f9' }}>{getName(draftEquipment)}</strong>
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1.25rem' }}>
                {issues.map(iss => (
                  <button
                    key={iss.id}
                    onClick={() => setDraft({ ...draft, issue_id: iss.id })}
                    style={{
                      width: '100%', padding: '0.85rem 1.1rem', borderRadius: '12px', textAlign: 'left',
                      border: draft.issue_id === iss.id ? '2px solid rgba(14,165,233,0.5)' : '1px solid rgba(255,255,255,0.08)',
                      background: draft.issue_id === iss.id ? 'rgba(14,165,233,0.1)' : 'rgba(15,23,42,0.6)',
                      color: '#f1f5f9', fontSize: '0.92rem', fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s',
                    }}
                  >
                    {getName(iss)}
                  </button>
                ))}
              </div>

              <div>
                <label style={labelStyle}>{t('guestOrder.notesLabel')}</label>
                <textarea
                  rows={3}
                  value={draft.notes}
                  onChange={e => setDraft({ ...draft, notes: e.target.value })}
                  placeholder={t('guestOrder.notesPlaceholder')}
                  style={{ ...inputStyle, resize: 'vertical' }}
                />
              </div>

              {/* Existing items + add-more action */}
              {items.length > 0 && (
                <CartSummary
                  items={items}
                  getEquipmentName={getEquipmentName}
                  getIssueName={getIssueName}
                  onRemove={removeItem}
                  onCheckout={() => setStep(2)}
                  t={t}
                />
              )}

              {/* Action row: Add another vs Continue to contact */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginTop: '1.5rem' }}>
                <button
                  onClick={addCurrentDraft}
                  style={{
                    width: '100%', padding: '0.85rem', borderRadius: '12px',
                    border: '2px solid rgba(16,185,129,0.45)',
                    background: 'rgba(16,185,129,0.15)',
                    color: '#a7f3d0', fontSize: '0.95rem', fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                    transition: 'transform 0.15s, background 0.15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(16,185,129,0.25)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(16,185,129,0.15)'; }}
                >
                  <Plus size={18} />
                  {t('guestOrder.addAnotherDevice')}
                </button>

                <button
                  onClick={finishItemAndContinue}
                  style={{
                    width: '100%', padding: '0.9rem', borderRadius: '12px', border: 'none',
                    background: 'linear-gradient(135deg, #0ea5e9, #6366f1)',
                    color: 'white', fontSize: '1rem', fontWeight: 600,
                    cursor: 'pointer',
                    boxShadow: '0 10px 25px rgba(14,165,233,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                  }}
                >
                  {t('guestOrder.proceedToContact')}
                  <ArrowRight size={18} />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 2 — contact */}
          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} style={cardStyle}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <label style={labelStyle}>{t('guestOrder.nameLabel')} *</label>
                  <input
                    type="text"
                    value={contact.client_name}
                    onChange={e => setContact({ ...contact, client_name: e.target.value })}
                    placeholder={t('guestOrder.namePlaceholder')}
                    required
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={labelStyle}>{t('guestOrder.phoneLabel')} *</label>
                  <input
                    type="tel"
                    value={contact.phone}
                    onChange={e => setContact({ ...contact, phone: e.target.value })}
                    placeholder="+998 90 123-45-67"
                    required
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={labelStyle}>{t('guestOrder.telegramLabel')}</label>
                  <input
                    type="text"
                    value={contact.telegram}
                    onChange={e => setContact({ ...contact, telegram: e.target.value })}
                    placeholder="@username"
                    style={inputStyle}
                  />
                  <p style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '0.4rem' }}>
                    {t('guestOrder.telegramHint')}
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 3 — review */}
          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} style={cardStyle}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '0.75rem' }}>
                {t('guestOrder.reviewDevices')} ({items.length})
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1.25rem' }}>
                {items.map((it, idx) => (
                  <div key={idx} style={{ background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '0.85rem 1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                      <span style={{ width: 22, height: 22, borderRadius: '50%', background: 'rgba(14,165,233,0.15)', color: '#7dd3fc', fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{idx + 1}</span>
                      <strong style={{ color: '#f1f5f9', fontSize: '0.92rem' }}>{getEquipmentName(it.equipment_id)}</strong>
                    </div>
                    <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: 0 }}>
                      {getIssueName(it.issue_id)}{it.notes ? ` — ${it.notes}` : ''}
                    </p>
                  </div>
                ))}
              </div>

              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '0.75rem' }}>
                {t('guestOrder.reviewContact')}
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <ReviewRow label={t('guestOrder.nameLabel')} value={contact.client_name} />
                <ReviewRow label={t('guestOrder.phoneLabel')} value={contact.phone} />
                {contact.telegram && <ReviewRow label="Telegram" value={contact.telegram} />}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer navigation (hidden on step 1, where we have its own action row) */}
        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
          {step === 2 && (
            <>
              <button
                onClick={() => setStep(1)}
                style={{ flex: 1, padding: '0.85rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.05)', color: '#e2e8f0', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
              >
                <ArrowLeft size={18} />
                {t('common.back')}
              </button>
              <button
                onClick={() => canGoNext() && setStep(3)}
                disabled={!canGoNext()}
                style={{
                  flex: 1, padding: '0.85rem', borderRadius: '12px', border: 'none',
                  background: canGoNext() ? 'linear-gradient(135deg, #0ea5e9, #6366f1)' : 'rgba(100,116,139,0.3)',
                  color: 'white', fontSize: '0.9rem', fontWeight: 600,
                  cursor: canGoNext() ? 'pointer' : 'not-allowed',
                  boxShadow: canGoNext() ? '0 10px 25px rgba(14,165,233,0.2)' : 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                }}
              >
                {t('common.next')}
                <ArrowRight size={18} />
              </button>
            </>
          )}

          {step === 3 && (
            <>
              <button
                onClick={() => setStep(2)}
                style={{ flex: 1, padding: '0.85rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.05)', color: '#e2e8f0', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
              >
                <ArrowLeft size={18} />
                {t('common.back')}
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                style={{ flex: 1, padding: '0.9rem', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #0ea5e9, #6366f1)', color: 'white', fontSize: '1rem', fontWeight: 600, cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.6 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', boxShadow: '0 10px 25px rgba(14,165,233,0.25)' }}
              >
                <Send size={18} />
                {submitting ? t('common.loading') : t('guestOrder.submit')}
              </button>
            </>
          )}
        </div>

        {/* Bottom cart hint */}
        {step <= 1 && totalDevicesPlanned === 0 && (
          <p style={{ color: '#475569', fontSize: '0.78rem', textAlign: 'center', marginTop: '1.5rem' }}>
            {t('guestOrder.multiHint')}
          </p>
        )}
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------------
function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
      <span style={{ color: '#64748b', fontSize: '0.85rem' }}>{label}</span>
      <span style={{ color: '#f1f5f9', fontWeight: 500, fontSize: '0.9rem' }}>{value}</span>
    </div>
  );
}

interface CartSummaryProps {
  items: OrderItemDraft[];
  getEquipmentName: (id: string) => string;
  getIssueName: (id: string) => string;
  onRemove: (index: number) => void;
  onCheckout: () => void;
  t: (k: string, params?: Record<string, string>) => string;
}

function CartSummary({ items, getEquipmentName, getIssueName, onRemove, onCheckout, t }: CartSummaryProps) {
  return (
    <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
      <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: '16px', padding: '1.1rem 1.2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.85rem' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(16,185,129,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShoppingBag size={18} style={{ color: '#34d399' }} />
          </div>
          <div>
            <div style={{ color: '#a7f3d0', fontSize: '0.95rem', fontWeight: 700 }}>
              {t('guestOrder.devicesAdded').replace('{count}', String(items.length))}
            </div>
            <div style={{ color: '#6ee7b7', fontSize: '0.78rem' }}>
              {t('guestOrder.addMoreOrCheckout')}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '0.9rem' }}>
          {items.map((it, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.6rem',
                padding: '0.7rem 0.85rem', background: 'rgba(15,23,42,0.5)',
                border: '1px solid rgba(16,185,129,0.12)', borderRadius: '10px',
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ color: '#f1f5f9', fontSize: '0.9rem', fontWeight: 600 }}>
                  {getEquipmentName(it.equipment_id)}
                </div>
                <div style={{ color: '#94a3b8', fontSize: '0.8rem', marginTop: '0.15rem' }}>
                  {getIssueName(it.issue_id)}{it.notes ? ` — ${it.notes}` : ''}
                </div>
              </div>
              <button
                onClick={() => onRemove(idx)}
                aria-label="remove"
                style={{ padding: '0.35rem', border: 'none', background: 'transparent', color: '#f87171', cursor: 'pointer', borderRadius: '6px' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.12)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>

        <button
          onClick={onCheckout}
          style={{
            width: '100%', padding: '0.85rem', borderRadius: '12px', border: 'none',
            background: 'linear-gradient(135deg, #10b981, #14b8a6)',
            color: 'white', fontSize: '0.95rem', fontWeight: 700,
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
            boxShadow: '0 10px 25px rgba(16,185,129,0.2)',
          }}
        >
          {t('guestOrder.proceedToContactWithCount').replace('{count}', String(items.length))}
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}
