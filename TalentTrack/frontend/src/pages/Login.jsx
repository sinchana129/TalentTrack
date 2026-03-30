import { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../components/api';
import toast from 'react-hot-toast';
import ThemeToggle from '../components/ThemeToggle';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { login } = useContext(AuthContext);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const response = await api.post('/auth/login', { email, password });
            toast.success('Login successful!');
            login(response.data.user, response.data.token);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Login failed');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="container animate-fade-in" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '2rem 1rem', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem' }}>
                <ThemeToggle />
            </div>
            <div className="card animate-slide-up" style={{ maxWidth: '400px', width: '100%' }}>
                <h1 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '1.5rem', textAlign: 'center', background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    TalentTrack
                </h1>
                <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', textAlign: 'center' }}>Sign In</h2>

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label>Email Address</label>
                        <input
                            type="email"
                            className="input-field"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label>Password</label>
                        <input
                            type="password"
                            className="input-field"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <div style={{ textAlign: 'right', marginTop: '0.25rem' }}>
                            <Link to="/forgot-password" style={{ fontSize: '0.8rem', color: 'var(--primary)', textDecoration: 'none' }}>Forgot password?</Link>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ width: '100%', marginTop: '1rem', padding: '0.75rem' }}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem' }}>
                    Don't have an account? <Link to="/register" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 500 }}>Register</Link>
                </div>
            </div>
        </div>
    );
}
