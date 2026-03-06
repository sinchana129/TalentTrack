import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../components/api';
import toast from 'react-hot-toast';
import { LogOut, Plus, List, Users } from 'lucide-react';

export default function AdminDashboard() {
    const { user, logout } = useContext(AuthContext);
    const [tasks, setTasks] = useState([]);
    const [usersList, setUsersList] = useState([]);
    const [activeTab, setActiveTab] = useState('tasks');
    const [loading, setLoading] = useState(true);

    // New task form state
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [assignedTo, setAssignedTo] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [tasksRes, usersRes] = await Promise.all([
                api.get('/tasks/'),
                api.get('/users/')
            ]);
            setTasks(tasksRes.data);
            setUsersList(usersRes.data);
        } catch (err) {
            toast.error('Failed to fetch dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTask = async (e) => {
        e.preventDefault();
        if (!assignedTo) return toast.error('Please assign to a user');

        try {
            await api.post('/tasks/', { title, description, assigned_to: assignedTo });
            toast.success('Task created successfully');
            setTitle('');
            setDescription('');
            setAssignedTo('');
            fetchData(); // Refresh tasks
            setActiveTab('tasks');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to create task');
        }
    };

    const handleProvideFeedback = async (taskId) => {
        const feedback = window.prompt("Enter feedback for this task:");
        if (!feedback) return;

        try {
            await api.put(`/tasks/${taskId}/feedback`, { feedback });
            toast.success('Feedback submitted');
            fetchData();
        } catch (err) {
            toast.error('Failed to submit feedback');
        }
    };

    const getStatusBadge = (status) => {
        if (status === 'Pending') return <span className="badge badge-pending">Pending</span>;
        if (status === 'In Progress') return <span className="badge badge-progress">In Progress</span>;
        return <span className="badge badge-completed">Completed</span>;
    };

    if (loading) return <div className="container" style={{ padding: '2rem' }}>Loading dashboard...</div>;

    return (
        <div>
            <nav className="navbar">
                <div className="container navbar-container">
                    <div className="nav-brand">TalentTrack Admin</div>
                    <div className="nav-links">
                        <span style={{ fontWeight: 500 }}>Hello, {user.name}</span>
                        <button onClick={logout} className="btn btn-outline" style={{ padding: '0.4rem 0.75rem' }}>
                            <LogOut size={16} /> Logout
                        </button>
                    </div>
                </div>
            </nav>

            <main className="container">
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                    <button
                        className={`btn ${activeTab === 'tasks' ? 'btn-primary' : 'btn-outline'}`}
                        onClick={() => setActiveTab('tasks')}
                    >
                        <List size={18} /> All Tasks
                    </button>
                    <button
                        className={`btn ${activeTab === 'create' ? 'btn-primary' : 'btn-outline'}`}
                        onClick={() => setActiveTab('create')}
                    >
                        <Plus size={18} /> Create Task
                    </button>
                </div>

                {activeTab === 'tasks' && (
                    <div className="card">
                        <h2 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>Task Overview</h2>

                        {tasks.length === 0 ? (
                            <p style={{ color: 'var(--text-muted)' }}>No tasks have been created yet.</p>
                        ) : (
                            <div style={{ display: 'grid', gap: '1rem' }}>
                                {tasks.map(task => {
                                    const assignee = usersList.find(u => u._id === task.assigned_to);
                                    return (
                                        <div key={task._id} style={{ border: '1px solid var(--border)', padding: '1.25rem', borderRadius: 'var(--radius)' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                                                <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>{task.title}</h3>
                                                {getStatusBadge(task.status)}
                                            </div>
                                            <p style={{ color: 'var(--text-muted)', marginBottom: '1rem', fontSize: '0.9rem' }}>{task.description}</p>

                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.875rem' }}>
                                                <div>
                                                    <span style={{ fontWeight: 500 }}>Assigned to:</span> {assignee ? assignee.name : 'Unknown User'}
                                                </div>
                                                <div>
                                                    <button
                                                        className="btn btn-outline"
                                                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
                                                        onClick={() => handleProvideFeedback(task._id)}
                                                    >
                                                        Add Feedback
                                                    </button>
                                                </div>
                                            </div>

                                            {task.feedback && (
                                                <div style={{ marginTop: '1rem', padding: '0.75rem', backgroundColor: 'var(--bg-color)', borderRadius: 'var(--radius)', fontSize: '0.875rem' }}>
                                                    <span style={{ fontWeight: 600 }}>Your Feedback: </span> {task.feedback}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'create' && (
                    <div className="card" style={{ maxWidth: '600px' }}>
                        <h2 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>Create New Task</h2>
                        <form onSubmit={handleCreateTask}>
                            <div className="input-group">
                                <label>Task Title</label>
                                <input
                                    type="text"
                                    className="input-field"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="input-group">
                                <label>Description</label>
                                <textarea
                                    className="input-field"
                                    rows="4"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="input-group">
                                <label>Assign To</label>
                                <select
                                    className="input-field"
                                    value={assignedTo}
                                    onChange={(e) => setAssignedTo(e.target.value)}
                                    style={{ backgroundColor: 'var(--surface)' }}
                                    required
                                >
                                    <option value="" disabled>Select a user...</option>
                                    {usersList.map(u => (
                                        <option key={u._id} value={u._id}>{u.name} ({u.email})</option>
                                    ))}
                                </select>
                            </div>

                            <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }}>
                                <Plus size={18} /> Create Task
                            </button>
                        </form>
                    </div>
                )}
            </main>
        </div>
    );
}
