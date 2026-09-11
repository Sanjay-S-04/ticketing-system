import React from 'react';
import { FinanceProvider } from './context/FinanceContext';
import Header from './components/Header';
import SummaryCards from './components/SummaryCards';
import TransactionForm from './components/TransactionForm';
import TransactionList from './components/TransactionList';
import Charts from './components/Charts';

function App() {
  return (
    <FinanceProvider>
      <div style={{ minHeight: '100vh', paddingBottom: '3rem' }}>
        <Header />
        
        <main className="container">
          <SummaryCards />
          
          <Charts />
          
          <div className="grid grid-cols-2" style={{ alignItems: 'start' }}>
            <TransactionForm />
            <TransactionList />
          </div>
        </main>

        <footer style={{ 
          marginTop: '4rem', 
          textAlign: 'center', 
          color: 'var(--text-secondary)',
          fontSize: '0.85rem'
        }}>
          <p>&copy; {new Date().getFullYear()} UniFinance Dashboard • Built for Students</p>
        </footer>
      </div>
    </FinanceProvider>
  );
}

export default App;
