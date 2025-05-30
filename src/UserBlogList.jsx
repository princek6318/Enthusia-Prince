import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './UserBlogList.css';
import { BaseUrl } from '.';

const UserBlogList = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${process.env.REACT_APP_BASE_API_URL}/api/blogs`);
        if (response.data && response.data.data) {
          setBlogs(response.data.data);
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching blogs:', err);
        setError('Failed to load blogs. Please try again later.');
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  const handleLike = async (id) => {
    try {
      const response = await axios.post(`https://enthusia-prince-be.vercel.app/api/blogs/${id}/like`);
      if (response.data.status === 'success') {
        // Update the blogs state with the updated like count
        setBlogs(blogs.map(blog => 
          blog._id === id ? { ...blog, likes: response.data.data.likes } : blog
        ));
      }
    } catch (err) {
      console.error('Error liking blog:', err);
    }
  };

  // Function to truncate text
  const truncateText = (text, maxLength = 150) => {
    if (!text) return "No description available";
    return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading blogs...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h3>Error</h3>
        <p>{error}</p>
        <button onClick={() => window.location.reload()} className="retry-button">Retry</button>
      </div>
    );
  }

  if (blogs.length === 0) {
    return (
      <div className="empty-container">
        <h2>No Blogs Found</h2>
        <p>There are no blogs available at the moment. Please check back later.</p>
      </div>
    );
  }

  return (
    <div className="blog-container">
      <h1>Latest Blogs</h1>
      <div className="blog-list">
        {blogs.map(blog => (
          <div key={blog._id} className="blog-card">
            <div className="blog-image">
              {blog.mediaPath ? (
                <img
                  src={`https://enthusia-prince-be.vercel.app/${blog.mediaPath}`}
                  alt={blog.title}
                  className="blog-card-image"
                />
              ) : blog.mediaUrl ? (
                <img
                  src={blog.mediaUrl}
                  alt={blog.title}
                  className="blog-card-image"
                />
              ) : (
                <div className="placeholder-image">No Image Available</div>
              )}
            </div>
            <div className="blog-content">
              <div className="blog-header">
                <h2>{blog.title}</h2>
                <button 
                  className="like-button-top" 
                  onClick={(e) => {
                    e.preventDefault();
                    handleLike(blog._id);
                  }}
                >
                  <i className="fas fa-heart"></i>
                  <span>{blog.likes || 0}</span>
                </button>
              </div>
              <div className="blog-description">
                {truncateText(blog.description)}
              </div>
              <div className="blog-actions">
                <Link to={`/blog/${blog._id}`} className="read-more">
                  Read More
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserBlogList;








