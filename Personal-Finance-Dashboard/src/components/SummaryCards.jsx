import React from 'react';
import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { motion } from 'framer-motion';

const SummaryCards = () => {
  const { totals, balance } = useFinance();

  const cards = [
    {
      title: 'Current Balance',
      amount: balance,
      icon: <Wallet size={24} />,
      color: 'var(--accent-primary)',
      bg: 'var(--card-bg)'
    },
    {
      title: 'Total Income',
      amount: totals.income,
      icon: <TrendingUp size={24} />,
      color: 'var(--success)',
      bg: 'var(--income-bg)',
      textColor: 'var(--income-text)'
    },
    {
      title: 'Total Expenses',
      amount: totals.expenses,
      icon: <TrendingDown size={24} />,
      color: 'var(--error)',
      bg: 'var(--expense-bg)',
      textColor: 'var(--expense-text)'
    }
  ];

  return (
    <div className="grid grid-cols-3" style={{ marginBottom: '2.5rem' }}>
      {cards.map((card, index) => (
        <motion.div
          key={card.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="card"
          style={{ 
            backgroundColor: card.bg,
            color: card.textColor || 'var(--text-primary)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 500, opacity: 0.8 }}>{card.title}</span>
            <div style={{ color: card.color }}>{card.icon}</div>
          </div>
          <h2 style={{ fontSize: '2rem', margin: 0 }}>
            ${card.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h2>
        </motion.div>
      ))}
    </div>
  );
};

export default SummaryCards;
