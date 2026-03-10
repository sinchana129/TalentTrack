import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../components/api';
import toast from 'react-hot-toast';
import { LogOut, CheckCircle, Clock, AlertCircle } from 'lucide-react';

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
            toast.success(`Task marked as ${newStatus}`);
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
                    <div className="nav-brand">TalentTrack Employee</div>
                    <div className="nav-links">
                        <span style={{ fontWeight: 500 }}>Hello, {user.name}</span>
                        <button onClick={logout} className="btn btn-outline" style={{ padding: '0.4rem 0.75rem' }}>
                            <LogOut size={16} /> Logout
                        </button>
                    </div>
                </div>
            </nav>

            <main className="container">
                <div className="card">
                    <h2 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>My Assigned Tasks</h2>

                    {tasks.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                            <CheckCircle size={48} style={{ margin: '0 auto 1rem', opacity: 0.2 }} />
                            <p>You have no tasks assigned to you right now. Great job!</p>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
                            {tasks.map(task => (
                                <div key={task._id} style={{
                                    border: '1px solid var(--border)',
                                    padding: '1.5rem',
                                    borderRadius: 'var(--radius)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                        <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>{task.title}</h3>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.25rem 0.5rem', backgroundColor: 'var(--surface)', borderRadius: '999px' }}>
                                            {getStatusIcon(task.status)}
                                            <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>{task.status}</span>
                                        </div>
                                    </div>

                                    <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.95rem', flex: 1, lineHeight: '1.5' }}>
                                        {task.description}
                                    </p>

                                    {task.feedback && (
                                        <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#fef3c7', borderLeft: '4px solid #f59e0b', borderRadius: '0 var(--radius) var(--radius) 0', fontSize: '0.9rem', color: '#92400e' }}>
                                            <span style={{ fontWeight: 700, display: 'block', marginBottom: '0.25rem' }}>Administrator Note: </span>
                                            <i>"{task.feedback}"</i>
                                        </div>
                                    )}

                                    <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.25rem', marginTop: 'auto' }}>
                                        <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.75rem', letterSpacing: '0.05em' }}>UPDATE STATUS</p>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button
                                                className={`btn ${task.status === 'Pending' ? 'btn-primary' : 'btn-outline'}`}
                                                style={{ padding: '0.5rem', fontSize: '0.85rem', flex: 1 }}
                                                disabled={task.status === 'Pending'}
                                                onClick={() => handleUpdateStatus(task._id, 'Pending')}
                                            >
                                                Pending
                                            </button>
                                            <button
                                                className={`btn ${task.status === 'In Progress' ? 'btn-primary' : 'btn-outline'}`}
                                                style={{ padding: '0.5rem', fontSize: '0.85rem', flex: 1 }}
                                                disabled={task.status === 'In Progress'}
                                                onClick={() => handleUpdateStatus(task._id, 'In Progress')}
                                            >
                                                Working
                                            </button>
                                            <button
                                                className={`btn ${task.status === 'Completed' ? 'btn-primary' : 'btn-outline'}`}
                                                style={{ padding: '0.5rem', fontSize: '0.85rem', flex: 1 }}
                                                disabled={task.status === 'Completed'}
                                                onClick={() => handleUpdateStatus(task._id, 'Completed')}
                                            >
                                                Finished
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
