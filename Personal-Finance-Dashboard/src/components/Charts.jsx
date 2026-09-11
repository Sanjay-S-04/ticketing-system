import React from 'react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { useFinance } from '../context/FinanceContext';

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#ef4444', '#06b6d4', '#84cc16'];

const Charts = () => {
  const { transactions, totals } = useFinance();

  // Data for Pie Chart (Expense by Category)
  const expenseTransactions = transactions.filter(t => t.type === 'expense');
  const categoryData = expenseTransactions.reduce((acc, current) => {
    const existing = acc.find(item => item.name === current.category);
    if (existing) {
      existing.value += current.amount;
    } else {
      acc.push({ name: current.category, value: current.amount });
    }
    return acc;
  }, []);

  // Data for Bar Chart (Income vs Expense)
  const compareData = [
    { name: 'Income', value: totals.income, fill: 'var(--success)' },
    { name: 'Expense', value: totals.expenses, fill: 'var(--error)' }
  ];

  return (
    <div className="grid grid-cols-2" style={{ marginBottom: '2.5rem' }}>
      <div className="card" style={{ height: '400px', display: 'flex', flexDirection: 'column' }}>
        <h3 style={{ marginBottom: '1rem' }}>Expense Distribution</h3>
        {expenseTransactions.length === 0 ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
            No expense data yet
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'var(--card-bg)', 
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-primary)',
                  borderRadius: 'var(--radius-sm)'
                }}
                itemStyle={{ color: 'var(--text-primary)' }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="card" style={{ height: '400px', display: 'flex', flexDirection: 'column' }}>
        <h3 style={{ marginBottom: '1rem' }}>Income vs Expenses</h3>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={compareData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
            <XAxis dataKey="name" stroke="var(--text-secondary)" />
            <YAxis stroke="var(--text-secondary)" />
            <Tooltip 
               cursor={{ fill: 'transparent' }}
               contentStyle={{ 
                backgroundColor: 'var(--card-bg)', 
                borderColor: 'var(--border-color)',
                color: 'var(--text-primary)',
                borderRadius: 'var(--radius-sm)'
              }}
            />
            <Bar dataKey="value" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Charts;
