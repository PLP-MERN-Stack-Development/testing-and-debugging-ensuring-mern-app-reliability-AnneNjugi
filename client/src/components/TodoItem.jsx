import { useState } from 'react';

function TodoItem({ todo, onToggle, onUpdate, onDelete }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    title: todo.title,
    description: todo.description || ''
  });

  const handleToggle = () => {
    onToggle(todo._id);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      await onUpdate(todo._id, editData);
      setIsEditing(false);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCancel = () => {
    setEditData({ title: todo.title, description: todo.description || '' });
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this todo?')) {
      try {
        await onDelete(todo._id);
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const handleChange = (e) => {
    setEditData({
      ...editData,
      [e.target.name]: e.target.value
    });
  };

  if (isEditing) {
    return (
      <div className="todo-item editing">
        <input
          type="text"
          name="title"
          value={editData.title}
          onChange={handleChange}
        />
        <input
          type="text"
          name="description"
          value={editData.description}
          onChange={handleChange}
          placeholder="Description"
        />
        <button onClick={handleSave}>Save</button>
        <button onClick={handleCancel}>Cancel</button>
      </div>
    );
  }

  return (
    <div className={`todo-item ${todo.completed ? 'completed' : ''} priority-${todo.priority}`}>
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={handleToggle}
        aria-label="Toggle todo"
      />
      <div className="todo-content">
        <h3>{todo.title}</h3>
        {todo.description && <p>{todo.description}</p>}
        <span className="priority-badge">{todo.priority}</span>
      </div>
      <div className="todo-actions">
        <button onClick={handleEdit} aria-label="Edit todo">Edit</button>
        <button onClick={handleDelete} aria-label="Delete todo">Delete</button>
      </div>
    </div>
  );
}

export default TodoItem;
