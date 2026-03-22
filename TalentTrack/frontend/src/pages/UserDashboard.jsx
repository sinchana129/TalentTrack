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
                    <div className="nav-brand">TalentTrack</div>
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
                            <p>You have no tasks assigned at the moment.</p>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
                            {tasks.map(task => (
                                <div key={task._id} style={{ border: '1px solid var(--border)', padding: '1.25rem', borderRadius: 'var(--radius)', display: 'flex', flexDirection: 'column' }}>
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
                                        <div style={{ marginBottom: '1rem', padding: '0.75rem', backgroundColor: '#fef3c7', borderRadius: 'var(--radius)', fontSize: '0.875rem', color: '#92400e' }}>
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
