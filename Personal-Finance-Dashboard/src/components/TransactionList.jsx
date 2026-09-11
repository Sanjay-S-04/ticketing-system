import React, { useState } from 'react';
import { Trash2, Filter } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { motion, AnimatePresence } from 'framer-motion';

const TransactionList = () => {
  const { transactions, deleteTransaction } = useFinance();
  const [filter, setFilter] = useState('All');

  const categories = ['All', ...new Set(transactions.map(t => t.category))];
  
  const filteredTransactions = filter === 'All' 
    ? transactions 
    : transactions.filter(t => t.category === filter);

  return (
    <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '1.5rem',
        flexWrap: 'wrap',
        gap: '0.5rem'
      }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>History</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Filter size={16} color="var(--text-secondary)" />
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            style={{ padding: '0.3rem 0.6rem', fontSize: '0.85rem', width: 'auto' }}
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', maxHeight: '400px', paddingRight: '0.5rem' }}>
        {filteredTransactions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
            No transactions yet.
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            <AnimatePresence>
              {filteredTransactions.map((t) => (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  layout
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    borderLeft: `4px solid ${t.type === 'income' ? 'var(--success)' : 'var(--error)'}`,
                    backgroundColor: 'var(--bg-color)'
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
                    <span style={{ fontWeight: 500, fontSize: '0.95rem' }}>{t.description}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      {t.category} • {new Date(t.date).toLocaleDateString()}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ 
                      fontWeight: 600, 
                      color: t.type === 'income' ? 'var(--success)' : 'var(--error)',
                      fontSize: '1rem'
                    }}>
                      {t.type === 'income' ? '+' : '-'}${t.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                    <button 
                      onClick={() => deleteTransaction(t.id)}
                      className="btn btn-icon"
                      style={{ color: 'var(--text-secondary)', padding: '0.4rem' }}
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionList;
