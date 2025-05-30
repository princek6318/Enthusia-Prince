import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import View from './View';
import AdminBlogForm from './AdminBlog';
import AdminLogin from './AdminLogin';
import AdminBlogView from './AdminBlogView';
import UserBlogList from './UserBlogList';
import UserBlogView from './UserBlogView';
import './index.css';

import './AdminBlog.css';
import './AdminLogin.css';
import './View.css';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('admin_token');
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
    <Routes>
      <Route path="/login" element={<AdminLogin />} />
      <Route path="/view" element={
        <ProtectedRoute>
          <View />
        </ProtectedRoute>
      } />
      <Route path="/admin-blog" element={
        <ProtectedRoute>
          <AdminBlogForm />
        </ProtectedRoute>
      } />
      <Route path="/blog-view/:id" element={
        <ProtectedRoute>
          <AdminBlogView />
        </ProtectedRoute>
      } />
      
      <Route path="/blogs" element={<UserBlogList />} />
      <Route path="/blog/:id" element={<UserBlogView />} />
      
      <Route path="/" element={<Navigate to="/blogs" replace />} />
      
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  </BrowserRouter>
);







