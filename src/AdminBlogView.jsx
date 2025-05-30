import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AdminBlogView.css';

const AdminBlogView = () => {
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    fetchBlog();
  }, [id]);

  const fetchBlog = async () => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:5000/api/blogs/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setBlog(response.data.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching blog:', err);
      setLoading(false);
    }
  };

  const handleEdit = () => {
    navigate(`/admin-blog?id=${id}`);
  };

  const handleBack = () => {
    navigate('/view');
  };

  if (loading) {
    return <div className="blog-view-container">Loading...</div>;
  }

  if (!blog) {
    return <div className="blog-view-container">Blog not found</div>;
  }

  return (
    <div className="blog-view-container">
      <div className="blog-view-header">
        <div className="blog-view-actions">
          <button onClick={handleBack} className="action-button">Back</button>
          <button onClick={handleEdit} className="action-button">Edit</button>
        </div>
        <div className="blog-view-tabs">
          <div className="tab active">Content</div>
          <div className="tab">Settings</div>
          <div className="tab">Optimize</div>
          <div className="tab">
            Publishing options
            <span className="new-badge">NEW</span>
          </div>
        </div>
        <div className="blog-view-actions">
          <button className="action-button secondary">Unpublish</button>
          <button className="action-button primary">Update</button>
        </div>
      </div>

      <div className="blog-view-content">
        <div className="blog-title">
          <h1>{blog.title}</h1>
          <p className="blog-author">Admin Author</p>
          
         
        </div>

        <div className="blog-media">
          {blog.mediaPath ? (
            <img 
              src={`http://localhost:5000/${blog.mediaPath}`} 
              alt={blog.title} 
            />
          ) : blog.mediaUrl ? (
            <img 
              src={blog.mediaUrl} 
              alt={blog.title} 
            />
          ) : null}
        </div>

        <div className="blog-description">
          <p>{blog.description}</p>
        </div>
      </div>
    </div>
  );
};

export default AdminBlogView;