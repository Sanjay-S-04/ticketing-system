import React, { createContext, useContext, useState, useEffect } from 'react';

const FinanceContext = createContext();

export const FinanceProvider = ({ children }) => {
  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem('finance_transactions');
    return saved ? JSON.parse(saved) : [];
  });

  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('finance_theme');
    return saved || 'light';
  });

  useEffect(() => {
    localStorage.setItem('finance_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('finance_theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const addTransaction = (transaction) => {
    setTransactions(prev => [
      { ...transaction, id: crypto.randomUUID(), date: transaction.date || new Date().toISOString() },
      ...prev
    ]);
  };

  const deleteTransaction = (id) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const totals = transactions.reduce((acc, current) => {
    const amount = parseFloat(current.amount);
    if (current.type === 'income') {
      acc.income += amount;
    } else {
      acc.expenses += amount;
    }
    return acc;
  }, { income: 0, expenses: 0 });

  const balance = totals.income - totals.expenses;

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <FinanceContext.Provider value={{ 
      transactions, 
      addTransaction, 
      deleteTransaction, 
      totals, 
      balance, 
      theme, 
      toggleTheme 
    }}>
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};
