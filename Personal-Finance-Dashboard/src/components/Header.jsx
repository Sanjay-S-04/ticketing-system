import React from 'react';
import { Sun, Moon, GraduationCap } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';

const Header = () => {
  const { theme, toggleTheme } = useFinance();

  return (
    <header className="glass" style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      padding: '1rem 0',
      marginBottom: '2rem',
      borderBottom: '1px solid var(--border-color)'
    }}>
      <div className="container" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0 1.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
            padding: '0.5rem',
            borderRadius: '0.75rem',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <GraduationCap size={24} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.25rem', marginBottom: '-0.2rem' }}>UniFinance</h1>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Student Dashboard</p>
          </div>
        </div>

        <button 
          onClick={toggleTheme}
          className="btn btn-icon"
          style={{ background: 'var(--border-color)', color: 'var(--text-primary)' }}
          aria-label="Toggle Theme"
        >
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>
      </div>
    </header>
  );
};

export default Header;
