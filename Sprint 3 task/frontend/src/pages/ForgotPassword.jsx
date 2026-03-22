import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../components/api';
import toast from 'react-hot-toast';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSent, setIsSent] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const response = await api.post('/auth/forgot-password', { email });
            toast.success(response.data.message || 'Request sent');
            setIsSent(true);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to send request');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '2rem 1rem' }}>
            <div className="card" style={{ maxWidth: '400px', width: '100%' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem', textAlign: 'center', color: 'var(--primary)' }}>
                    TalentTrack
                </h1>
                <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', textAlign: 'center' }}>Forgot Password</h2>

                {!isSent ? (
                    <form onSubmit={handleSubmit}>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.5rem', textAlign: 'center' }}>
                            Enter your email address and we will send you a token to reset your password.
                        </p>
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

                        <button
                            type="submit"
                            className="btn btn-primary"
                            style={{ width: '100%', marginTop: '1rem', padding: '0.75rem' }}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Sending Request...' : 'Send Reset Token'}
                        </button>
                    </form>
                ) : (
                    <div style={{ textAlign: 'center' }}>
                        <p style={{ fontSize: '0.95rem', color: 'var(--success)', marginBottom: '1.5rem', fontWeight: 500 }}>
                            If your email is registered, we have generated a reset token. Please check the backend console for the mock email.
                        </p>
                        <Link to="/reset-password" style={{ display: 'inline-block', width: '100%', padding: '0.75rem', backgroundColor: 'var(--primary)', color: 'white', borderRadius: 'var(--radius)', textDecoration: 'none', fontWeight: 500 }}>
                            Enter Token Here
                        </Link>
                    </div>
                )}

                <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem' }}>
                    Remember your password? <Link to="/login" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 500 }}>Sign In</Link>
                </div>
            </div>
        </div>
    );
}
