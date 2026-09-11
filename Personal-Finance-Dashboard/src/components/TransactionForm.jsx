import React, { useState } from 'react';
import { PlusCircle } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';

const categories = [
  'Food',
  'Transport',
  'Shopping',
  'Entertainment',
  'Books & Tuition',
  'Subscription',
  'Rent',
  'Part-time Job',
  'Others'
];

const TransactionForm = () => {
  const { addTransaction } = useFinance();
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    type: 'expense',
    category: 'Food',
    date: new Date().toISOString().split('T')[0]
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.description || !formData.amount || formData.amount <= 0) {
      alert('Please enter valid description and amount.');
      return;
    }

    addTransaction({
      ...formData,
      category: formData.type === 'income' ? 'Income' : formData.category,
      amount: parseFloat(formData.amount)
    });

    setFormData({
      description: '',
      amount: '',
      type: 'expense',
      category: 'Food',
      date: new Date().toISOString().split('T')[0]
    });
  };

  return (
    <div className="card" style={{ height: '100%' }}>
      <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <PlusCircle size={20} color="var(--accent-primary)" />
        Add Transaction
      </h3>
      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>
        <div>
          <label style={{ fontSize: '0.85rem', marginBottom: '0.4rem', display: 'block', color: 'var(--text-secondary)' }}>
            Description
          </label>
          <input 
            type="text" 
            placeholder="e.g., Campus Coffee"
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            required
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label style={{ fontSize: '0.85rem', marginBottom: '0.4rem', display: 'block', color: 'var(--text-secondary)' }}>
              Amount
            </label>
            <input 
              type="number" 
              placeholder="0.00"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({...formData, amount: e.target.value})}
              required
            />
          </div>
          <div>
            <label style={{ fontSize: '0.85rem', marginBottom: '0.4rem', display: 'block', color: 'var(--text-secondary)' }}>
              Type
            </label>
            <select 
              value={formData.type}
              onChange={(e) => setFormData({...formData, type: e.target.value})}
            >
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          {formData.type === 'expense' ? (
            <div>
              <label style={{ fontSize: '0.85rem', marginBottom: '0.4rem', display: 'block', color: 'var(--text-secondary)' }}>
                Category
              </label>
              <select 
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          ) : (
            <div>
              <label style={{ fontSize: '0.85rem', marginBottom: '0.4rem', display: 'block', color: 'var(--text-secondary)' }}>
                Category
              </label>
              <input type="text" value="Income" disabled style={{ opacity: 0.7, cursor: 'not-allowed' }} />
            </div>
          )}
          <div>
            <label style={{ fontSize: '0.85rem', marginBottom: '0.4rem', display: 'block', color: 'var(--text-secondary)' }}>
              Date
            </label>
            <input 
              type="date" 
              value={formData.date}
              onChange={(e) => setFormData({...formData, date: e.target.value})}
              required
            />
          </div>
        </div>

        <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
          Add Transaction
        </button>
      </form>
    </div>
  );
};

export default TransactionForm;
