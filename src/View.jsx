import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import './View.css';

const View = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Fetch all blog posts on load
  useEffect(() => {
    fetchData();
    
    // Set page title
    document.title = 'Blog Management | Admin Dashboard';
  }, []);

  const fetchData = () => {
    const token = localStorage.getItem("admin_token");
    
    if (!token) {
      console.error("No authentication token found");
      // Redirect to login with the current location
      navigate('/login', { 
        state: { from: { pathname: '/view' } },
        replace: true 
      });
      return;
    }

    setLoading(true);
    axios
      .get("http://localhost:5000/api/blogs", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        console.log("Blogs fetched:", res.data);
        setData(res.data.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching blogs:", err.response?.data || err.message);
        setError("Failed to load blogs. Please try again.");
        setLoading(false);
        if (err.response?.status === 401) {
          // Redirect to login if unauthorized with the current location
          navigate('/login', { 
            state: { from: { pathname: '/view' } },
            replace: true 
          });
        }
      });
  };

  const HandleView = (e) => {
    const id = e.target.getAttribute("data");
    navigate(`/blog-view/${id}`);
  };

  const onDel = (id) => {
    if (window.confirm("Are you sure you want to delete this blog?")) {
      const token = localStorage.getItem("admin_token");

      axios
        .delete(`http://localhost:5000/api/blogs/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((res) => {
          if (res.data.status === "success") {
            alert("Blog deleted successfully");
            fetchData(); // refresh blog list
          }
        })
        .catch((err) => {
          console.error("Delete failed:", err.response?.data || err.message);
          alert("Failed to delete blog. Please try again.");
        });
    }
  };

  const handleUpdate = (id) => {
    navigate(`/admin-blog?id=${id}`);
  };

  const addBlog = () => {
    navigate("/admin-blog");
  };

  // Function to truncate text
  const truncateText = (text, maxLength = 100) => {
    if (!text) return "No description";
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
        <button onClick={fetchData} className="retry-button">Retry</button>
      </div>
    );
  }

  return (
    <div className="admin-view-container">
      <div className="admin-header">
        <h2>Blog Management</h2>
        <button className="add-blog-button" onClick={addBlog}>
          <i className="fas fa-plus"></i> Add New Blog
        </button>
      </div>
      
      <div className="table-container">
        {data.length === 0 ? (
          <div className="no-data">
            <p>No blogs found. Click "Add New Blog" to create your first blog post.</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Description</th>
                <th>Image</th>
                <th>Media URL</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map((blog, index) => (
                <tr key={blog._id}>
                  <td className="id-cell">{index + 1}</td>
                  <td className="title-cell">{blog.title || "Untitled"}</td>
                  <td className="description-cell">
                    <div className="truncated-text">
                      {truncateText(blog.description)}
                    </div>
                  </td>
                  <td className="image-cell">
                    {blog.mediaPath ? (
                      <img
                        src={`http://localhost:5000/${blog.mediaPath}`}
                        alt="Blog media"
                        className="table-thumbnail"
                        onClick={() => navigate(`/blog-view/${blog._id}`)}
                      />
                    ) : blog.mediaUrl ? (
                      <img
                        src={blog.mediaUrl}
                        alt="Blog media"
                        className="table-thumbnail"
                        onClick={() => navigate(`/blog-view/${blog._id}`)}
                      />
                    ) : (
                      <div className="no-image">No Image</div>
                    )}
                  </td>
                  <td className="url-cell">
                    {blog.mediaUrl ? (
                      <a 
                        href={blog.mediaUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="media-url-link"
                      >
                        <i className="fas fa-external-link-alt"></i> View
                      </a>
                    ) : (
                      <span className="no-url">No URL</span>
                    )}
                  </td>
                  <td className="actions-cell">
                    <div className="action-buttons">
                      <button 
                        className="view-button" 
                        onClick={() => navigate(`/blog-view/${blog._id}`)}
                        title="View Blog"
                      >
                        <i className="fas fa-eye"></i>
                      </button>
                      <button 
                        className="edit-button" 
                        onClick={() => handleUpdate(blog._id)}
                        title="Edit Blog"
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button 
                        className="delete-button" 
                        onClick={() => onDel(blog._id)}
                        title="Delete Blog"
                      >
                        <i className="fas fa-trash-alt"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default View;
