import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../components/api';
import toast from 'react-hot-toast';
import ThemeToggle from '../components/ThemeToggle';

export default function ResetPassword() {
    const [token, setToken] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await api.post('/auth/reset-password', { token, new_password: newPassword });
            toast.success('Password reset successfully! You can now sign in.');
            navigate('/login');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to reset password');
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
                <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', textAlign: 'center' }}>Reset Password</h2>

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label>Reset Token</label>
                        <input
                            type="text"
                            className="input-field"
                            value={token}
                            onChange={(e) => setToken(e.target.value)}
                            placeholder="Paste token here..."
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label>New Password</label>
                        <input
                            type="password"
                            className="input-field"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ width: '100%', marginTop: '1rem', padding: '0.75rem' }}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Resetting...' : 'Set New Password'}
                    </button>
                </form>

                <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem' }}>
                    Back to <Link to="/login" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 500 }}>Sign In</Link>
                </div>
            </div>
        </div>
    );
}
