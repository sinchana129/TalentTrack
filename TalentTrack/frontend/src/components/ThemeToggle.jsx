import { useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
    const { theme, toggleTheme } = useContext(ThemeContext);

    return (
        <button 
            onClick={toggleTheme} 
            className="btn btn-outline" 
            style={{ 
                padding: '0.5rem', 
                borderRadius: '50%', 
                width: '40px', 
                height: '40px',
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                borderColor: 'var(--border)'
            }}
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>
    );
}
