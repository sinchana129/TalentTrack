import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../components/api';
import toast from 'react-hot-toast';
import { LogOut, CheckCircle, Clock, AlertCircle, Sparkles } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';
import confetti from 'canvas-confetti';

export default function UserDashboard() {
    const { user, logout } = useContext(AuthContext);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        try {
            const res = await api.get('/tasks/');
            setTasks(res.data);
        } catch (err) {
            toast.error('Failed to fetch tasks');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (taskId, newStatus) => {
        try {
            await api.put(`/tasks/${taskId}/status`, { status: newStatus });
            if (newStatus === 'Completed') {
                confetti({
                    particleCount: 100,
                    spread: 70,
                    origin: { y: 0.6 },
                    colors: ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6']
                });
                toast.success('Task completed! Great job! 🎉');
            } else {
                toast.success(`Task marked as ${newStatus}`);
            }
            fetchTasks();
        } catch (err) {
            toast.error('Failed to update status');
        }
    };

    const getStatusIcon = (status) => {
        if (status === 'Pending') return <AlertCircle size={18} color="var(--warning)" />;
        if (status === 'In Progress') return <Clock size={18} color="var(--primary)" />;
        return <CheckCircle size={18} color="var(--success)" />;
    };

    if (loading) return <div className="container" style={{ padding: '2rem' }}>Loading dashboard...</div>;

    return (
        <div>
            <nav className="navbar">
                <div className="container navbar-container">
                    <div className="nav-brand">TalentTrack</div>
                    <div className="nav-links">
                        <ThemeToggle />
                        <span style={{ fontWeight: 500 }}>Hello, {user.name}</span>
                        <button onClick={logout} className="btn btn-outline" style={{ padding: '0.4rem 0.75rem' }}>
                            <LogOut size={16} /> Logout
                        </button>
                    </div>
                </div>
            </nav>

            <main className="container animate-fade-in">
                {/* AI Summary Widget */}
                {tasks.length > 0 && (
                    <div className="card glass animate-slide-up" style={{ marginBottom: '2rem', display: 'flex', alignItems: 'flex-start', gap: '1rem', background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.05), rgba(139, 92, 246, 0.05))', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
                        <div style={{ backgroundColor: 'rgba(139, 92, 246, 0.1)', padding: '0.75rem', borderRadius: '50%', color: '#8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Sparkles size={24} />
                        </div>
                        <div>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem', color: '#8b5cf6', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                AI Focus Summary
                            </h3>
                            <p style={{ color: 'var(--text)', lineHeight: '1.5', margin: 0 }}>
                                {tasks.filter(t => t.status === 'Completed').length === tasks.length 
                                    ? "Incredible work! You've completed all your assigned tasks. Take a well-deserved break! 🎉" 
                                    : `You have ${tasks.filter(t => t.status === 'Pending').length} pending tasks and ${tasks.filter(t => t.status === 'In Progress').length} in progress. ${tasks.filter(t => t.status === 'Pending').length > 0 ? "Focus on finishing your pending tasks to stay on track." : "Keep up the momentum on your active tasks!"} You're doing great!`}
                            </p>
                        </div>
                    </div>
                )}

                <div className="card">
                    <h2 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>My Assigned Tasks</h2>

                    {tasks.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                            <CheckCircle size={48} style={{ margin: '0 auto 1rem', opacity: 0.2 }} />
                            <p>You have no tasks assigned at the moment.</p>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
                            {tasks.map(task => (
                                <div key={task._id} className="glass animate-slide-up" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                                        <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>{task.title}</h3>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            {getStatusIcon(task.status)}
                                        </div>
                                    </div>

                                    <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem', flex: 1 }}>
                                        {task.description}
                                    </p>

                                    {task.feedback && (
                                        <div style={{ marginBottom: '1rem', padding: '0.75rem', backgroundColor: 'rgba(245, 158, 11, 0.15)', borderRadius: 'var(--radius)', fontSize: '0.875rem', color: '#fbbf24', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                                            <span style={{ fontWeight: 600 }}>Admin Feedback: </span> {task.feedback}
                                        </div>
                                    )}

                                    <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem', marginTop: 'auto' }}>
                                        <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>UPDATE STATUS:</p>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button
                                                className={`btn ${task.status === 'Pending' ? 'btn-primary' : 'btn-outline'}`}
                                                style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem', flex: 1 }}
                                                disabled={task.status === 'Pending'}
                                                onClick={() => handleUpdateStatus(task._id, 'Pending')}
                                            >
                                                Pending
                                            </button>
                                            <button
                                                className={`btn ${task.status === 'In Progress' ? 'btn-primary' : 'btn-outline'}`}
                                                style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem', flex: 1 }}
                                                disabled={task.status === 'In Progress'}
                                                onClick={() => handleUpdateStatus(task._id, 'In Progress')}
                                            >
                                                In Progress
                                            </button>
                                            <button
                                                className={`btn ${task.status === 'Completed' ? 'btn-primary' : 'btn-outline'}`}
                                                style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem', flex: 1 }}
                                                disabled={task.status === 'Completed'}
                                                onClick={() => handleUpdateStatus(task._id, 'Completed')}
                                            >
                                                Completed
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
