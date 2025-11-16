import { useState } from 'react';
import { useTodos } from '../hooks/useTodos';
import TodoItem from './TodoItem';
import TodoForm from './TodoForm';

function TodoList({ onLogout }) {
  const { todos, loading, error, addTodo, editTodo, removeTodo, toggleTodo } = useTodos();
  const [filter, setFilter] = useState('all');

  const handleAddTodo = async (todoData) => {
    try {
      await addTodo(todoData);
    } catch (err) {
      alert(err.message);
    }
  };

  const filteredTodos = todos.filter(todo => {
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true;
  });

  return (
    <div className="todo-container">
      <header>
        <h1>My Todos</h1>
        <button onClick={onLogout}>Logout</button>
      </header>

      <TodoForm onSubmit={handleAddTodo} />

      <div className="filter-buttons">
        <button 
          className={filter === 'all' ? 'active' : ''} 
          onClick={() => setFilter('all')}
        >
          All
        </button>
        <button 
          className={filter === 'active' ? 'active' : ''} 
          onClick={() => setFilter('active')}
        >
          Active
        </button>
        <button 
          className={filter === 'completed' ? 'active' : ''} 
          onClick={() => setFilter('completed')}
        >
          Completed
        </button>
      </div>

      {error && <div className="error-message" role="alert">{error}</div>}
      
      {loading ? (
        <div className="loading">Loading todos...</div>
      ) : (
        <div className="todo-list">
          {filteredTodos.length === 0 ? (
            <p className="no-todos">No todos found</p>
          ) : (
            filteredTodos.map(todo => (
              <TodoItem
                key={todo._id}
                todo={todo}
                onToggle={toggleTodo}
                onUpdate={editTodo}
                onDelete={removeTodo}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default TodoList;
