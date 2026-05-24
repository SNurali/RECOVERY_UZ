import React, { useState, useMemo } from 'react';
import { Search, ChevronUp, ChevronDown } from 'lucide-react';
import { useI18n } from '../i18n/provider';

interface Column<T> {
  key: keyof T | string;
  title: string;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  onRowClick?: (item: T) => void;
  searchable?: boolean;
}

export function DataTable<T extends Record<string, any>>({ 
  data, 
  columns, 
  onRowClick,
  searchable = true
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const { t } = useI18n();

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const processedData = useMemo(() => {
    let result = [...data];

    // Filter
    if (searchTerm) {
      const lowercasedSearch = searchTerm.toLowerCase();
      result = result.filter(item => {
        return Object.values(item).some(
          val => String(val).toLowerCase().includes(lowercasedSearch)
        );
      });
    }

    // Sort
    if (sortConfig) {
      result.sort((a, b) => {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];
        
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [data, searchTerm, sortConfig]);

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      {searchable && (
        <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)' }}>
          <div className="input-field flex items-center gap-2" style={{ maxWidth: '300px' }}>
            <Search size={18} color="var(--text-secondary)" />
            <input 
              type="text" 
              placeholder={t('common.search')}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ border: 'none', outline: 'none', background: 'transparent', width: '100%' }}
            />
          </div>
        </div>
      )}

      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              {columns.map(col => (
                <th 
                  key={String(col.key)} 
                  onClick={() => col.sortable !== false ? handleSort(String(col.key)) : undefined}
                  style={{ cursor: col.sortable !== false ? 'pointer' : 'default' }}
                >
                  <div className="flex items-center gap-2">
                    {col.title}
                    {sortConfig?.key === col.key && (
                      sortConfig.direction === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {processedData.length > 0 ? (
              processedData.map((item, idx) => (
                <tr 
                  key={item.id || idx} 
                  onClick={() => onRowClick && onRowClick(item)}
                  style={{ cursor: onRowClick ? 'pointer' : 'default' }}
                >
                  {columns.map(col => (
                    <td key={String(col.key)}>
                      {col.render ? col.render(item) : String(item[col.key] || '')}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="text-center" style={{ padding: '3rem' }}>
                  <div className="text-secondary mb-4">{t('common.noData')}</div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      <div style={{ padding: '1rem', borderTop: '1px solid var(--border-color)', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
        {t('clients.totalRecords')}: {processedData.length}
      </div>
    </div>
  );
}
