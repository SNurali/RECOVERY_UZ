import { useEffect, useState } from 'react';
import api from '../../lib/api';
import { Plus, Trash2, Save } from 'lucide-react';
import { toast } from 'sonner';

type CatalogTab = 'services' | 'equipments' | 'issues';

interface CatalogItem {
  id: string;
  name_rus: string;
  name_cyr: string;
  name_lat: string;
  name_eng: string;
}

export default function Catalog() {
  const [activeTab, setActiveTab] = useState<CatalogTab>('services');
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Omit<CatalogItem, 'id'>>({
    name_rus: '',
    name_cyr: '',
    name_lat: '',
    name_eng: ''
  });
  const [isAdding, setIsAdding] = useState(false);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/${activeTab}`);
      setItems(Array.isArray(data) ? data : data?.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Не удалось загрузить справочник');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
    setEditingId(null);
    setIsAdding(false);
  }, [activeTab]);

  const handleEditClick = (item: CatalogItem) => {
    setEditingId(item.id);
    setIsAdding(false);
    setEditForm({
      name_rus: item.name_rus || '',
      name_cyr: item.name_cyr || '',
      name_lat: item.name_lat || '',
      name_eng: item.name_eng || ''
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    setIsAdding(false);
  };

  const handleSave = async (id?: string) => {
    try {
      if (id) {
        await api.patch(`/${activeTab}/${id}`, editForm);
        toast.success('Запись успешно обновлена');
      } else {
        await api.post(`/${activeTab}`, editForm);
        toast.success('Запись успешно добавлена');
      }
      setEditingId(null);
      setIsAdding(false);
      await fetchItems();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Удалить "${name}"? Это действие нельзя отменить.`)) return;
    try {
      await api.delete(`/${activeTab}/${id}`);
      toast.success('Запись успешно удалена');
      await fetchItems();
    } catch (err) {
      console.error(err);
    }
  };

  const startAdd = () => {
    setIsAdding(true);
    setEditingId(null);
    setEditForm({
      name_rus: '',
      name_cyr: '',
      name_lat: '',
      name_eng: ''
    });
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Справочники</h1>
          <p className="page-description">Управление справочниками услуг, оборудования и неисправностей</p>
        </div>
        <button className="btn btn-primary" onClick={startAdd} disabled={isAdding}>
          <Plus size={18} />
          Добавить запись
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
        {(['services', 'equipments', 'issues'] as CatalogTab[]).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="btn"
            style={{
              backgroundColor: activeTab === tab ? 'var(--brand-light)' : 'transparent',
              color: activeTab === tab ? 'var(--brand-dark)' : 'var(--text-secondary)',
              border: 'none',
              fontWeight: activeTab === tab ? 'bold' : 'normal',
              textTransform: 'uppercase',
              fontSize: '0.85rem'
            }}
          >
            {tab === 'services' ? 'Услуги' : tab === 'equipments' ? 'Оборудование' : 'Неисправности'}
          </button>
        ))}
      </div>

      {loading ? (
        <div>Загрузка справочника...</div>
      ) : (
        <div className="card" style={{ padding: 0 }}>
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Русский</th>
                  <th>Узбекский (Кириллица)</th>
                  <th>Узбекский (Латиница)</th>
                  <th>Английский</th>
                  <th style={{ width: '150px', textAlign: 'center' }}>Действия</th>
                </tr>
              </thead>
              <tbody>
                {isAdding && (
                  <tr style={{ backgroundColor: 'var(--brand-light)' }}>
                    <td>
                      <input 
                        type="text" 
                        value={editForm.name_rus} 
                        onChange={e => setEditForm({ ...editForm, name_rus: e.target.value })} 
                        className="input-field"
                        style={{ width: '100%', padding: '0.25rem' }}
                        placeholder="Название (РУС)"
                      />
                    </td>
                    <td>
                      <input 
                        type="text" 
                        value={editForm.name_cyr} 
                        onChange={e => setEditForm({ ...editForm, name_cyr: e.target.value })} 
                        className="input-field"
                        style={{ width: '100%', padding: '0.25rem' }}
                        placeholder="Номи (КИР)"
                      />
                    </td>
                    <td>
                      <input 
                        type="text" 
                        value={editForm.name_lat} 
                        onChange={e => setEditForm({ ...editForm, name_lat: e.target.value })} 
                        className="input-field"
                        style={{ width: '100%', padding: '0.25rem' }}
                        placeholder="Nomi (LAT)"
                      />
                    </td>
                    <td>
                      <input 
                        type="text" 
                        value={editForm.name_eng} 
                        onChange={e => setEditForm({ ...editForm, name_eng: e.target.value })} 
                        className="input-field"
                        style={{ width: '100%', padding: '0.25rem' }}
                        placeholder="Name (ENG)"
                      />
                    </td>
                    <td style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                      <button className="btn btn-primary" style={{ padding: '0.25rem 0.5rem' }} onClick={() => handleSave()}>
                        <Save size={16} />
                      </button>
                      <button className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem' }} onClick={handleCancel}>
                        Отмена
                      </button>
                    </td>
                  </tr>
                )}

                {items.map(item => (
                  <tr key={item.id}>
                    {editingId === item.id ? (
                      <>
                        <td>
                          <input 
                            type="text" 
                            value={editForm.name_rus} 
                            onChange={e => setEditForm({ ...editForm, name_rus: e.target.value })} 
                            className="input-field"
                            style={{ width: '100%', padding: '0.25rem' }}
                          />
                        </td>
                        <td>
                          <input 
                            type="text" 
                            value={editForm.name_cyr} 
                            onChange={e => setEditForm({ ...editForm, name_cyr: e.target.value })} 
                            className="input-field"
                            style={{ width: '100%', padding: '0.25rem' }}
                          />
                        </td>
                        <td>
                          <input 
                            type="text" 
                            value={editForm.name_lat} 
                            onChange={e => setEditForm({ ...editForm, name_lat: e.target.value })} 
                            className="input-field"
                            style={{ width: '100%', padding: '0.25rem' }}
                          />
                        </td>
                        <td>
                          <input 
                            type="text" 
                            value={editForm.name_eng} 
                            onChange={e => setEditForm({ ...editForm, name_eng: e.target.value })} 
                            className="input-field"
                            style={{ width: '100%', padding: '0.25rem' }}
                          />
                        </td>
                        <td style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                          <button className="btn btn-primary" style={{ padding: '0.25rem 0.5rem' }} onClick={() => handleSave(item.id)}>
                            <Save size={16} />
                          </button>
                          <button className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem' }} onClick={handleCancel}>
                            Отмена
                          </button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td>{item.name_rus}</td>
                        <td>{item.name_cyr}</td>
                        <td>{item.name_lat}</td>
                        <td>{item.name_eng}</td>
                        <td style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                          <button className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem' }} onClick={() => handleEditClick(item)}>
                            Изменить
                          </button>
                          <button className="btn btn-danger" style={{ padding: '0.25rem 0.5rem' }} onClick={() => handleDelete(item.id, item.name_rus)}>
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
