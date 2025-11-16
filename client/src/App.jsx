import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import TodoList from './components/TodoList';
import ErrorBoundary from './components/ErrorBoundary';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
  }, []);

  const handleLogin = (token) => {
    localStorage.setItem('token', token);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
  };

  return (
    <ErrorBoundary>
      <Router>
        <div className="App">
          <Routes>
            <Route 
              path="/login" 
              element={
                isAuthenticated ? 
                  <Navigate to="/todos" /> : 
                  <Login onLogin={handleLogin} />
              } 
            />
            <Route 
              path="/register" 
              element={
                isAuthenticated ? 
                  <Navigate to="/todos" /> : 
                  <Register onRegister={handleLogin} />
              } 
            />
            <Route 
              path="/todos" 
              element={
                isAuthenticated ? 
                  <TodoList onLogout={handleLogout} /> : 
                  <Navigate to="/login" />
              } 
            />
            <Route path="/" element={<Navigate to="/todos" />} />
          </Routes>
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
