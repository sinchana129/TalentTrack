import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../components/api';
import toast from 'react-hot-toast';
import { LogOut, Plus, Edit2, Trash2, Users } from 'lucide-react';

export default function AdminDashboard() {
    const { user, logout } = useContext(AuthContext);
    const [tasks, setTasks] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    // Create/Edit Form State
    const [showForm, setShowForm] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentTaskId, setCurrentTaskId] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        assigned_to: ''
    });

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
            setUsers(usersRes.data);
        } catch (err) {
            toast.error('Failed to load dashboard data');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const openCreateForm = () => {
        setIsEditing(false);
        setFormData({ title: '', description: '', assigned_to: '' });
        setShowForm(true);
    };

    const openEditForm = (task) => {
        setIsEditing(true);
        setCurrentTaskId(task._id);
        setFormData({
            title: task.title,
            description: task.description,
            assigned_to: task.assigned_to
        });
        setShowForm(true);
    };

    const handleSubmitTask = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                // Ensure the payload matches what the python backend expects for an update
                await api.put(`/tasks/${currentTaskId}`, {
                    title: formData.title,
                    description: formData.description,
                    assigned_to: formData.assigned_to
                });
                toast.success('Task updated successfully');
            } else {
                await api.post('/tasks/', formData);
                toast.success('Task created successfully');
            }
            setShowForm(false);
            fetchData();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to save task');
        }
    };

    const handleDeleteTask = async (taskId) => {
        if (!window.confirm("Are you sure you want to delete this task?")) return;

        try {
            await api.delete(`/tasks/${taskId}`);
            toast.success('Task deleted successfully');
            fetchData();
        } catch (err) {
            toast.error('Failed to delete task');
        }
    };

    const handleAddFeedback = async (taskId, currentFeedback) => {
        const feedback = window.prompt("Enter feedback for this task:", currentFeedback || "");
        if (feedback === null) return; // User cancelled

        try {
            await api.put(`/tasks/${taskId}/feedback`, { feedback });
            toast.success('Feedback added placeholder');
            fetchData();
        } catch (err) {
            toast.error('Failed to add feedback');
        }
    };

    const getStatusColor = (status) => {
        if (status === 'Pending') return 'var(--warning)';
        if (status === 'In Progress') return 'var(--primary)';
        return 'var(--success)';
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Task Management</h1>
                    <button onClick={openCreateForm} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Plus size={18} /> Create New Task
                    </button>
                </div>

                {showForm && (
                    <div className="card" style={{ marginBottom: '2rem', border: '2px solid var(--primary)' }}>
                        <h2 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>
                            {isEditing ? 'Edit Task' : 'Create New Task'}
                        </h2>
                        <form onSubmit={handleSubmitTask}>
                            <div className="input-group">
                                <label>Task Title</label>
                                <input
                                    type="text"
                                    name="title"
                                    className="input-field"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className="input-group">
                                <label>Description</label>
                                <textarea
                                    name="description"
                                    className="input-field"
                                    rows="3"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    required
                                ></textarea>
                            </div>

                            <div className="input-group">
                                <label>Assign To</label>
                                <select
                                    name="assigned_to"
                                    className="input-field"
                                    value={formData.assigned_to}
                                    onChange={handleInputChange}
                                    required
                                    style={{ backgroundColor: 'var(--surface)' }}
                                >
                                    <option value="">Select a user...</option>
                                    {users.map(u => (
                                        <option key={u._id} value={u._id}>{u.name} ({u.email})</option>
                                    ))}
                                </select>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                                <button type="submit" className="btn btn-primary">
                                    {isEditing ? 'Update Task' : 'Save Task'}
                                </button>
                                <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)}>
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                <div className="card">
                    <h2 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>All Tasks</h2>

                    {tasks.length === 0 ? (
                        <p style={{ color: 'var(--text-muted)' }}>No tasks have been created yet.</p>
                    ) : (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ borderBottom: '2px solid var(--border)', textAlign: 'left' }}>
                                        <th style={{ padding: '1rem', fontWeight: 600 }}>Task</th>
                                        <th style={{ padding: '1rem', fontWeight: 600 }}>Assigned To</th>
                                        <th style={{ padding: '1rem', fontWeight: 600 }}>Status</th>
                                        <th style={{ padding: '1rem', fontWeight: 600 }}>Feedback</th>
                                        <th style={{ padding: '1rem', fontWeight: 600, textAlign: 'right' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tasks.map(task => {
                                        const assignedUser = users.find(u => u._id === task.assigned_to);
                                        return (
                                            <tr key={task._id} style={{ borderBottom: '1px solid var(--border)' }}>
                                                <td style={{ padding: '1rem' }}>
                                                    <div style={{ fontWeight: 500 }}>{task.title}</div>
                                                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                                                        {task.description.length > 50 ? task.description.substring(0, 50) + '...' : task.description}
                                                    </div>
                                                </td>
                                                <td style={{ padding: '1rem' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                                                        <Users size={14} color="var(--text-muted)" />
                                                        {assignedUser ? assignedUser.name : 'Unknown User'}
                                                    </div>
                                                </td>
                                                <td style={{ padding: '1rem' }}>
                                                    <span style={{
                                                        display: 'inline-block',
                                                        padding: '0.25rem 0.75rem',
                                                        borderRadius: '999px',
                                                        fontSize: '0.75rem',
                                                        fontWeight: 600,
                                                        backgroundColor: `${getStatusColor(task.status)}20`,
                                                        color: getStatusColor(task.status)
                                                    }}>
                                                        {task.status}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '1rem' }}>
                                                    {task.feedback ? (
                                                        <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }} title={task.feedback}>
                                                            {task.feedback.length > 20 ? task.feedback.substring(0, 20) + '...' : task.feedback}
                                                        </span>
                                                    ) : (
                                                        <button
                                                            onClick={() => handleAddFeedback(task._id, task.feedback)}
                                                            style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.875rem', padding: 0 }}
                                                        >
                                                            + Add
                                                        </button>
                                                    )}
                                                </td>
                                                <td style={{ padding: '1rem', textAlign: 'right' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                                        <button
                                                            onClick={() => openEditForm(task)}
                                                            className="btn btn-outline"
                                                            style={{ padding: '0.4rem', border: '1px solid var(--border)' }}
                                                            title="Edit Task"
                                                        >
                                                            <Edit2 size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteTask(task._id)}
                                                            className="btn btn-outline"
                                                            style={{ padding: '0.4rem', border: '1px solid var(--error)', color: 'var(--error)' }}
                                                            title="Delete Task"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
