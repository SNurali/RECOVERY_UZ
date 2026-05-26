import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Send, Plus, Trash2, HardDrive, ShoppingBag } from 'lucide-react';
import { useI18n } from '../../i18n/provider';
import api from '../../lib/api';
import { toast } from 'sonner';

interface OrderItemDraft {
  equipment_id: string;
  issue_id: string;
  serial_number: string;
  notes: string;
}

const EMPTY_DRAFT: OrderItemDraft = { equipment_id: '', issue_id: '', serial_number: '', notes: '' };

export default function ClientNewOrder() {
  const navigate = useNavigate();
  const { t, language } = useI18n();

  const [equipments, setEquipments] = useState<any[]>([]);
  const [issues, setIssues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Multi-device: list of finalized items + current draft
  const [items, setItems] = useState<OrderItemDraft[]>([]);
  const [draft, setDraft] = useState<OrderItemDraft>({ ...EMPTY_DRAFT });

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

  const addDraftToCart = () => {
    if (!draft.equipment_id || !draft.issue_id) {
      toast.error(t('guestOrder.pickEquipmentAndIssue'));
      return;
    }
    setItems(prev => [...prev, { ...draft }]);
    setDraft({ ...EMPTY_DRAFT });
    toast.success(t('clientOrder.deviceAdded'));
  };

  const removeItem = (index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Collect all items: cart + current draft (if filled)
    const allItems = [...items];
    if (draft.equipment_id && draft.issue_id) {
      allItems.push({ ...draft });
    }
    if (!allItems.length) {
      toast.error(t('guestOrder.addDeviceFirst'));
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/orders', {
        details: allItems.map(it => ({
          equipment_id: it.equipment_id,
          issue_id: it.issue_id,
          serial_number: it.serial_number || undefined,
          notes: it.notes || undefined,
        })),
      });
      toast.success(t('clientOrder.submitted'));
      navigate('/client');
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '4rem', color: '#64748b' }}>{t('common.loading')}</div>;

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '0.85rem 1rem', borderRadius: '12px',
    border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(15,23,42,0.8)',
    color: '#f1f5f9', fontSize: '0.95rem', outline: 'none', transition: 'border-color 0.2s',
  };
  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.5rem',
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      {/* Back */}
      <button
        onClick={() => navigate('/client')}
        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer', marginBottom: '1.5rem', fontSize: '0.9rem' }}
      >
        <ArrowLeft size={18} />
        {t('clientOrder.backToOrders')}
      </button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ background: 'rgba(30,41,59,0.6)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '24px', padding: '2.5rem', boxShadow: '0 25px 50px rgba(0,0,0,0.3)' }}
      >
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.5rem', textAlign: 'center' }}>
          {t('clientOrder.title')}
        </h2>
        <p style={{ color: '#64748b', fontSize: '0.9rem', textAlign: 'center', marginBottom: '2rem' }}>
          {t('clientOrder.subtitle')}
        </p>

        {/* Already added devices (cart) */}
        {items.length > 0 && (
          <div style={{ marginBottom: '1.5rem', background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '16px', padding: '1rem 1.1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <ShoppingBag size={18} style={{ color: '#34d399' }} />
              <span style={{ color: '#a7f3d0', fontSize: '0.9rem', fontWeight: 700 }}>
                {t('guestOrder.devicesAdded').replace('{count}', String(items.length))}
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {items.map((it, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0.8rem', background: 'rgba(15,23,42,0.5)', border: '1px solid rgba(16,185,129,0.12)', borderRadius: '10px' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: '#f1f5f9', fontSize: '0.88rem', fontWeight: 600 }}>
                      {getEquipmentName(it.equipment_id)}
                    </div>
                    <div style={{ color: '#94a3b8', fontSize: '0.78rem', marginTop: '0.1rem' }}>
                      {getIssueName(it.issue_id)}
                      {it.serial_number ? ` • S/N: ${it.serial_number}` : ''}
                      {it.notes ? ` — ${it.notes}` : ''}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(idx)}
                    style={{ padding: '0.3rem', border: 'none', background: 'transparent', color: '#f87171', cursor: 'pointer', borderRadius: '6px' }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Current device form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Section header when adding more */}
          {items.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', paddingBottom: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <HardDrive size={16} style={{ color: '#7dd3fc' }} />
              <span style={{ color: '#cbd5e1', fontSize: '0.85rem', fontWeight: 600 }}>
                {t('clientOrder.addNextDevice')} #{items.length + 1}
              </span>
            </div>
          )}

          <div>
            <label style={labelStyle}>{t('clientOrder.equipmentLabel')} *</label>
            <select
              value={draft.equipment_id}
              onChange={e => setDraft({ ...draft, equipment_id: e.target.value })}
              style={{ ...inputStyle, appearance: 'none' }}
              onFocus={(e) => { e.target.style.borderColor = 'rgba(14,165,233,0.5)'; }}
              onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; }}
            >
              <option value="" style={{ background: '#1e293b' }}>{t('clientOrder.equipmentPlaceholder')}</option>
              {equipments.map(eq => (
                <option key={eq.id} value={eq.id} style={{ background: '#1e293b' }}>{getName(eq)}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={labelStyle}>{t('clientOrder.issueLabel')} *</label>
            <select
              value={draft.issue_id}
              onChange={e => setDraft({ ...draft, issue_id: e.target.value })}
              style={{ ...inputStyle, appearance: 'none' }}
              onFocus={(e) => { e.target.style.borderColor = 'rgba(14,165,233,0.5)'; }}
              onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; }}
            >
              <option value="" style={{ background: '#1e293b' }}>{t('clientOrder.issuePlaceholder')}</option>
              {issues.map(iss => (
                <option key={iss.id} value={iss.id} style={{ background: '#1e293b' }}>{getName(iss)}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={labelStyle}>{t('clientOrder.serialLabel')}</label>
            <input
              type="text"
              value={draft.serial_number}
              onChange={e => setDraft({ ...draft, serial_number: e.target.value })}
              placeholder="S/N: WD-WCC7K4PZ9"
              style={inputStyle}
              onFocus={(e) => { e.target.style.borderColor = 'rgba(14,165,233,0.5)'; }}
              onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; }}
            />
          </div>

          <div>
            <label style={labelStyle}>{t('guestOrder.notesLabel')}</label>
            <textarea
              rows={3}
              value={draft.notes}
              onChange={e => setDraft({ ...draft, notes: e.target.value })}
              placeholder={t('guestOrder.notesPlaceholder')}
              style={{ ...inputStyle, resize: 'vertical' }}
              onFocus={(e) => { e.target.style.borderColor = 'rgba(14,165,233,0.5)'; }}
              onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; }}
            />
          </div>

          {/* Add another device button */}
          <button
            type="button"
            onClick={addDraftToCart}
            style={{
              width: '100%', padding: '0.8rem', borderRadius: '12px',
              border: '2px solid rgba(16,185,129,0.4)',
              background: 'rgba(16,185,129,0.1)',
              color: '#a7f3d0', fontSize: '0.92rem', fontWeight: 600,
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(16,185,129,0.2)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(16,185,129,0.1)'; }}
          >
            <Plus size={18} />
            {t('guestOrder.addAnotherDevice')}
          </button>
          <p style={{ color: '#64748b', fontSize: '0.78rem', textAlign: 'center', marginTop: '-0.5rem' }}>
            {t('guestOrder.unlimitedHint')}
          </p>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            style={{
              width: '100%', padding: '0.9rem', borderRadius: '12px', border: 'none',
              background: 'linear-gradient(135deg, #0ea5e9, #6366f1)',
              color: 'white', fontSize: '1rem', fontWeight: 600,
              cursor: submitting ? 'not-allowed' : 'pointer',
              opacity: submitting ? 0.6 : 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
              marginTop: '0.5rem', boxShadow: '0 10px 25px rgba(14,165,233,0.25)',
              transition: 'transform 0.15s',
            }}
            onMouseEnter={(e) => { if (!submitting) e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            <Send size={18} />
            {submitting ? t('common.loading') : t('clientOrder.submit')}
            {(items.length > 0 || (draft.equipment_id && draft.issue_id)) && (
              <span style={{ background: 'rgba(255,255,255,0.2)', borderRadius: '8px', padding: '0.15rem 0.5rem', fontSize: '0.8rem', marginLeft: '0.25rem' }}>
                {items.length + (draft.equipment_id && draft.issue_id ? 1 : 0)}
              </span>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
