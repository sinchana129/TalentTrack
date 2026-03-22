import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../components/api';
import toast from 'react-hot-toast';
import { LogOut, Plus, List, Users, BarChart2, Edit, Trash2, X } from 'lucide-react';

export default function AdminDashboard() {
    const { user, logout } = useContext(AuthContext);
    const [tasks, setTasks] = useState([]);
    const [usersList, setUsersList] = useState([]);
    const [activeTab, setActiveTab] = useState('tasks');
    const [loading, setLoading] = useState(true);
    const [analytics, setAnalytics] = useState(null);
    const [editingTask, setEditingTask] = useState(null);

    // New task form state
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [assignedTo, setAssignedTo] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [tasksRes, usersRes, analyticsRes] = await Promise.all([
                api.get('/tasks/'),
                api.get('/users/'),
                api.get('/tasks/analytics')
            ]);
            setTasks(tasksRes.data);
            setUsersList(usersRes.data);
            setAnalytics(analyticsRes.data);
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

    const handleDeleteTask = async (taskId) => {
        if (!window.confirm('Are you sure you want to delete this task?')) return;
        try {
            await api.delete(`/tasks/${taskId}`);
            toast.success('Task deleted successfully');
            fetchData();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to delete task');
        }
    };

    const handleUpdateTask = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/tasks/${editingTask._id}`, {
                title: editingTask.title,
                description: editingTask.description,
                assigned_to: editingTask.assigned_to
            });
            toast.success('Task updated successfully');
            setEditingTask(null);
            fetchData();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update task');
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
                    <button
                        className={`btn ${activeTab === 'analytics' ? 'btn-primary' : 'btn-outline'}`}
                        onClick={() => setActiveTab('analytics')}
                    >
                        <BarChart2 size={18} /> Analytics
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
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                    <h3 style={{ fontSize: '1.125rem', fontWeight: 600, margin: 0 }}>{task.title}</h3>
                                                    {getStatusBadge(task.status)}
                                                </div>
                                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                    <button className="btn btn-outline" style={{ padding: '0.25rem 0.5rem', color: 'var(--primary)', borderColor: 'var(--border)' }} onClick={() => setEditingTask({...task})}>
                                                        <Edit size={16} />
                                                    </button>
                                                    <button className="btn btn-outline" style={{ padding: '0.25rem 0.5rem', color: '#ef4444', borderColor: 'var(--border)' }} onClick={() => handleDeleteTask(task._id)}>
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
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

                {activeTab === 'analytics' && analytics && (
                    <div className="card">
                        <h2 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>Task Analytics</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                            <div style={{ padding: '1.5rem', backgroundColor: 'var(--surface)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', textAlign: 'center' }}>
                                <h3 style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Total Tasks</h3>
                                <p style={{ fontSize: '2.5rem', fontWeight: 700, margin: 0 }}>{analytics.total}</p>
                            </div>
                            <div style={{ padding: '1.5rem', backgroundColor: 'var(--surface)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', textAlign: 'center' }}>
                                <h3 style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Pending</h3>
                                <p style={{ fontSize: '2.5rem', fontWeight: 700, margin: 0, color: '#f59e0b' }}>{analytics.pending}</p>
                            </div>
                            <div style={{ padding: '1.5rem', backgroundColor: 'var(--surface)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', textAlign: 'center' }}>
                                <h3 style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>In Progress</h3>
                                <p style={{ fontSize: '2.5rem', fontWeight: 700, margin: 0, color: 'var(--primary)' }}>{analytics.in_progress}</p>
                            </div>
                            <div style={{ padding: '1.5rem', backgroundColor: 'var(--surface)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', textAlign: 'center' }}>
                                <h3 style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Completed</h3>
                                <p style={{ fontSize: '2.5rem', fontWeight: 700, margin: 0, color: '#10b981' }}>{analytics.completed}</p>
                            </div>
                            <div style={{ padding: '2rem', backgroundColor: 'var(--surface)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', textAlign: 'center', gridColumn: '1 / -1' }}>
                                <h3 style={{ fontSize: '1.25rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Task Completion Rate</h3>
                                <div style={{ height: '2rem', backgroundColor: 'var(--border)', borderRadius: '1rem', overflow: 'hidden', marginBottom: '1rem', width: '100%' }}>
                                    <div style={{ height: '100%', width: `${analytics.completion_rate}%`, backgroundColor: '#10b981', transition: 'width 0.5s ease', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 600, fontSize: '0.875rem' }}>
                                        {analytics.completion_rate >= 5 ? `${analytics.completion_rate}%` : ''}
                                    </div>
                                </div>
                                <p style={{ fontSize: '1.1rem', fontWeight: 500 }}>
                                    {analytics.completion_rate}% of tasks have been completed
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            {/* Edit Task Modal */}
            {editingTask && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
                    <div className="card" style={{ width: '100%', maxWidth: '500px', margin: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Edit Task</h2>
                            <button className="btn" style={{ padding: '0.25rem', backgroundColor: 'transparent', border: 'none', cursor: 'pointer' }} onClick={() => setEditingTask(null)}>
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleUpdateTask}>
                            <div className="input-group">
                                <label>Task Title</label>
                                <input type="text" className="input-field" value={editingTask.title} onChange={(e) => setEditingTask({...editingTask, title: e.target.value})} required />
                            </div>
                            <div className="input-group">
                                <label>Description</label>
                                <textarea className="input-field" rows="4" value={editingTask.description} onChange={(e) => setEditingTask({...editingTask, description: e.target.value})} required />
                            </div>
                            <div className="input-group">
                                <label>Assign To</label>
                                <select className="input-field" value={editingTask.assigned_to} onChange={(e) => setEditingTask({...editingTask, assigned_to: e.target.value})} style={{ backgroundColor: 'var(--surface)' }} required>
                                    <option value="" disabled>Select user...</option>
                                    {usersList.map(u => <option key={u._id} value={u._id}>{u.name} ({u.email})</option>)}
                                </select>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
                                <button type="button" className="btn btn-outline" onClick={() => setEditingTask(null)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Save Changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
