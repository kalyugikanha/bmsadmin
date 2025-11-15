import React from 'react'; // Removed useState, useEffect
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import EditBlog from './components/blogs/EditBlog'; // Import EditBlog component
import { AuthProvider, useAuth } from './context/AuthContext'; // Import AuthProvider and useAuth
import { ToastContainer } from 'react-toastify'; // Import ToastContainer
import 'react-toastify/dist/ReactToastify.css'; // Import react-toastify CSS
import './ql-editor.css'; // Import App CSS

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>; // Or a spinner component
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

function App() {
  // Removed local auth state and useEffect as AuthProvider will manage it

  const { isAuthenticated } = useAuth(); // Get isAuthenticated from context for root route redirection

  return (
    <BrowserRouter>
      <ToastContainer /> {/* Add ToastContainer here */}
      <Routes>
        <Route path="/login" element={<Login />} /> {/* Removed setAuth prop */}
        <Route
          path="/dashboard/*" // This wildcard allows nested routes inside Dashboard
          element={
            <PrivateRoute>
              <Dashboard /> {/* Removed auth and setAuth props */}
            </PrivateRoute>
          }
        />
        <Route
          path="/"
          element={isAuthenticated ? <Navigate to="/dashboard/upcoming" replace /> : <Navigate to="/login" replace />} 
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

const AppWrapper = () => (
  <AuthProvider>
    <App />
  </AuthProvider>
);

export default AppWrapper; // Export AppWrapper instead of App