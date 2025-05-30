// src/components/AdminBlogForm.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import './AdminBlog.css';

const AdminBlogForm = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaUrl, setMediaUrl] = useState('');
  const [fileName, setFileName] = useState('No file chosen');
  const [blogId, setBlogId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  
  const API_BASE_URL = `${process.env.REACT_APP_BASE_API_URL}/api/blogs`;

  useEffect(() => {
    // Check if we're in edit mode by looking for id in URL params
    const params = new URLSearchParams(location.search);
    const id = params.get('id');
    
    if (id) {
      setBlogId(id);
      fetchBlogData(id);
    }
  }, [location]);

  const fetchBlogData = async (id) => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      const blog = response.data.data;
      setTitle(blog.title);
      setDescription(blog.description);
      setMediaUrl(blog.mediaUrl || '');
      setLoading(false);
    } catch (err) {
      console.error('Error fetching blog:', err);
      setError('Error loading blog data. Please try again.');
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMediaFile(file);
      setFileName(file.name);
    } else {
      setMediaFile(null);
      setFileName('No file chosen');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    const token = localStorage.getItem('admin_token');
    if (!token) {
      navigate('/login');
      return;
    }

    // Validate form
    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    
    if (!description.trim()) {
      setError('Description is required');
      return;
    }

    try {
      setLoading(true);
      
      // Create FormData object
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      
      // Only append media file if it exists
      if (mediaFile) {
        formData.append('media', mediaFile);
      }
      
      // Only append mediaUrl if it exists and no file is selected
      if (mediaUrl && !mediaFile) {
        formData.append('mediaUrl', mediaUrl);
      }

      // Determine if we're creating or updating
      const method = blogId ? 'put' : 'post';
      const url = blogId ? `${API_BASE_URL}/${blogId}` : API_BASE_URL;
      
      console.log(`Submitting ${method.toUpperCase()} request to ${url}`);
      
      // Make the API request
      const response = await axios({
        method,
        url,
        data: formData,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      console.log('API Response:', response.data);
      
      // Show success message
      alert(blogId ? 'Blog updated successfully!' : 'Blog created successfully!');
      
      // Redirect to blog list
      navigate('/view');
    } catch (err) {
      console.error('Error saving blog:', err);
      
      // Set appropriate error message
      if (err.response) {
        setError(`Server error: ${err.response.data.message || err.response.statusText}`);
      } else if (err.request) {
        setError('Network error. Please check your connection and try again.');
      } else {
        setError(`Error: ${err.message}`);
      }
      
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!blogId) return;
    
    if (!window.confirm('Are you sure you want to delete this blog?')) {
      return;
    }
    
    const token = localStorage.getItem('admin_token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      setLoading(true);
      
      await axios.delete(`${API_BASE_URL}/${blogId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      alert('Blog deleted successfully!');
      navigate('/view');
    } catch (err) {
      console.error('Error deleting blog:', err);
      setError('Error deleting blog. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="admin-blog-container">
      {error && <div className="error-message">{error}</div>}
      
      <form className="admin-blog-form" onSubmit={handleSubmit}>
        <h2>{blogId ? 'Update Blog' : 'Add New Blog'}</h2>
        
        <div className="form-group">
          <label htmlFor="title">Title</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter blog title"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter blog description"
            required
          />
        </div>
        
        <div className="file-input-container">
          <label className="file-input-label">Media File</label>
          <div className="file-input-wrapper">
            <label className="file-input-button" htmlFor="media-file">
              Choose File
            </label>
            <input
              type="file"
              id="media-file"
              accept="image/*,video/*"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
            <span className="file-name">{fileName}</span>
          </div>
        </div>
        
        <div className="form-group">
          <label htmlFor="media-url">Or paste media URL</label>
          <input
            type="url"
            id="media-url"
            value={mediaUrl}
            onChange={(e) => setMediaUrl(e.target.value)}
            placeholder="https://example.com/image.jpg"
          />
        </div>
        
        <div className="button-container">
          <button 
            type="submit" 
            className="submit-button"
            disabled={loading}
          >
            {loading ? 'Saving...' : blogId ? 'Update Blog' : 'Add Blog'}
          </button>
          
          {blogId && (
            <button 
              type="button" 
              onClick={handleDelete} 
              className="delete-button"
              disabled={loading}
            >
              {loading ? 'Deleting...' : 'Delete Blog'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default AdminBlogForm;
