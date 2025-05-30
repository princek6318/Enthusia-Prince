import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './UserBlogView.css';
import { BaseUrl } from '.';

const UserBlogView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [relatedBlogs, setRelatedBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('content');
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState({
    name: '',
    email: '',
    content: ''
  });
  const [commentError, setCommentError] = useState('');
  const commentSectionRef = useRef(null);
  
  const [shareUrl, setShareUrl] = useState('');
  const [showShareOptions, setShowShareOptions] = useState(false);
  const shareOptionsRef = useRef(null);
  
  useEffect(() => {
    setShareUrl(window.location.href);
    
    const handleClickOutside = (event) => {
      if (shareOptionsRef.current && !shareOptionsRef.current.contains(event.target)) {
        setShowShareOptions(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${process.env.REACT_APP_BASE_API_URL}/api/blogs/${id}`);
        
        if (response.data && response.data.data) {
          setBlog(response.data.data);
          
          const commentsResponse = await axios.get(`https://enthusia-prince-be.vercel.app/api/blogs/${id}/comments`);
          if (commentsResponse.data && commentsResponse.data.data) {
            setComments(commentsResponse.data.data.comments);
          }
          
          const relatedResponse = await axios.get('https://enthusia-prince-be.vercel.app/api/blogs');
          if (relatedResponse.data && relatedResponse.data.data) {
            const filtered = relatedResponse.data.data
              .filter(b => b._id !== id)
              .slice(0, 3);
            setRelatedBlogs(filtered);
          }
        } else {
          setError('Blog not found');
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching blog:', err);
        setError('Failed to load blog');
        setLoading(false);
      }
    };

    fetchBlog();
  }, [id]);

  useEffect(() => {
    if (blog) {
      const updateMetaTag = (name, content) => {
        let meta = document.querySelector(`meta[name="${name}"]`);
        if (!meta) {
          meta = document.createElement('meta');
          meta.setAttribute('name', name);
          document.head.appendChild(meta);
        }
        meta.setAttribute('content', content);
      };
      
      updateMetaTag('og:title', blog.title);
      updateMetaTag('og:description', blog.description.substring(0, 150) + '...');
      updateMetaTag('og:url', window.location.href);
      
      if (blog.mediaPath) {
        updateMetaTag('og:image', `https://enthusia-prince-be.vercel.app/${blog.mediaPath}`);
      } else if (blog.mediaUrl) {
        updateMetaTag('og:image', blog.mediaUrl);
      }
      
      updateMetaTag('twitter:card', 'summary_large_image');
      updateMetaTag('twitter:title', blog.title);
      updateMetaTag('twitter:description', blog.description.substring(0, 150) + '...');
      
      if (blog.mediaPath) {
        updateMetaTag('twitter:image', `https://enthusia-prince-be.vercel.app/${blog.mediaPath}`);
      } else if (blog.mediaUrl) {
        updateMetaTag('twitter:image', blog.mediaUrl);
      }
      
      document.title = `${blog.title} | Your Blog Name`;
    }
    
    return () => {
      document.title = 'Your Blog Name';
    };
  }, [blog]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleLike = async () => {
    try {
      const response = await axios.post(`https://enthusia-prince-be.vercel.app/api/blogs/${id}/like`);
      if (response.data.status === 'success') {
        setBlog({
          ...blog,
          likes: response.data.data.likes
        });
      }
    } catch (err) {
      console.error('Error liking blog:', err);
    }
  };

  const handleCommentChange = (e) => {
    const { name, value } = e.target;
    setNewComment({
      ...newComment,
      [name]: value
    });
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    setCommentError('');
    
    if (!newComment.name || !newComment.email || !newComment.content) {
      setCommentError('All fields are required');
      return;
    }
    
    try {
      const response = await axios.post(
        `https://enthusia-prince-be.vercel.app/api/blogs/${id}/comments`,
        newComment
      );
      
      if (response.data.status === 'success') {
        setComments([...comments, response.data.data.comment]);
        
        setNewComment({
          name: '',
          email: '',
          content: ''
        });
        
        if (commentSectionRef.current) {
          commentSectionRef.current.scrollIntoView({ behavior: 'smooth' });
        }
      }
    } catch (err) {
      console.error('Error adding comment:', err);
      setCommentError('Failed to add comment. Please try again.');
    }
  };

  const handleShareClick = () => {
    setShowShareOptions(!showShareOptions);
  };
  
  const shareViaWebAPI = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: blog.title,
          text: blog.description.substring(0, 100) + '...',
          url: shareUrl,
        });
        console.log('Shared successfully');
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      setShowShareOptions(true);
    }
  };
  
  const shareOnWhatsApp = () => {
    const encodedText = encodeURIComponent(`${blog.title} - ${shareUrl}`);
    window.open(`https://wa.me/?text=${encodedText}`, '_blank');
    setShowShareOptions(false);
  };
  
  const shareOnInstagram = () => {
  
    navigator.clipboard.writeText(shareUrl)
      .then(() => {
        alert('URL copied to clipboard. Open Instagram and paste in your story or direct message.');
      })
      .catch(err => {
        console.error('Failed to copy URL:', err);
      });
    setShowShareOptions(false);
  };
  
  const shareOnFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
    setShowShareOptions(false);
  };
  
  const shareOnTwitter = () => {
    const text = encodeURIComponent(`${blog.title}`);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(shareUrl)}`, '_blank');
    setShowShareOptions(false);
  };
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl)
      .then(() => {
        alert('URL copied to clipboard!');
      })
      .catch(err => {
        console.error('Failed to copy URL:', err);
      });
    setShowShareOptions(false);
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <div className="blog-loading">
        <div className="loading-spinner"></div>
        <p>Loading blog...</p>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="blog-error">
        <h2>Error</h2>
        <p>{error || 'Blog not found'}</p>
        <button onClick={handleBack}>Go Back</button>
      </div>
    );
  }

  return (
    <div className="blog-editor-container">
      <div className="blog-editor-header">
        <div className="left-actions">
          <button className="action-btn" onClick={handleBack}>Exit</button>
          <button className="action-btn">Save</button>
        </div>
        <div className="right-actions">
          <button className="action-btn secondary">Unpublish</button>
          <button className="action-btn primary">Update</button>
        </div>
      </div>
      
      <div className="blog-editor-tabs">
        <div 
          className={`tab ${activeTab === 'content' ? 'active' : ''}`}
          onClick={() => setActiveTab('content')}
        >
          Content
        </div>
        <div 
          className={`tab ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          Settings
        </div>
        <div 
          className={`tab ${activeTab === 'optimize' ? 'active' : ''}`}
          onClick={() => setActiveTab('optimize')}
        >
          Optimize
        </div>
        <div 
          className={`tab ${activeTab === 'publishing' ? 'active' : ''}`}
          onClick={() => setActiveTab('publishing')}
        >
          Publishing options
          <span className="new-badge">NEW</span>
        </div>
      </div>
      
      <div className="distraction-free-mode">
        <span>Distraction Free Mode</span>
        <div className="toggle-switch">
          <div className="toggle-knob"></div>
        </div>
        <button className="preview-btn">Preview</button>
      </div>
      
      <div className="blog-editor-content">
        <div className="blog-navigation">
          <div className="breadcrumb">
            <a href="/">Home</a> &gt; <span>post</span>
          </div>
          <div className="navigation-arrows">
            <button className="nav-arrow">&lt;</button>
            <button className="nav-arrow">&gt;</button>
          </div>
        </div>
        
        <div className="blog-editor-main">
      
          
          <div className="blog-content-area">
            <h1 className="blog-title">{blog.title}</h1>
            <p className="blog-author">Test author</p>
            
            <div className="social-share">
              <button className="social-btn twitter" onClick={shareOnTwitter}>
                <i className="fab fa-twitter"></i>
              </button>
              <button className="social-btn facebook" onClick={shareOnFacebook}>
                <i className="fab fa-facebook-f"></i>
              </button>
              <button className="social-btn linkedin">
                <i className="fab fa-linkedin-in"></i>
              </button>
            </div>
            
            <div className="blog-featured-image">
              {blog.mediaPath ? (
                <img 
                  src={`https://enthusia-prince-be.vercel.app/${blog.mediaPath}`} 
                  alt={blog.title} 
                />
              ) : blog.mediaUrl ? (
                <img 
                  src={blog.mediaUrl} 
                  alt={blog.title} 
                />
              ) : (
                <div className="placeholder-image">No Image Available</div>
              )}
            </div>
            
            <div className="blog-description">
              <p>{blog.description}</p>
            </div>
            
            <div className="blog-actions">
              <button className="like-btn" onClick={handleLike}>
                <i className="fas fa-heart"></i>
                <span>{blog.likes || 0} Likes</span>
              </button>
              <div className="share-btn" onClick={handleShareClick} ref={shareOptionsRef}>
                <i className="fas fa-share-alt"></i>
                <span>Share</span>
                
                {showShareOptions && (
                  <div className="share-options">
                    <div className="share-option" onClick={shareOnWhatsApp}>
                      <i className="fab fa-whatsapp"></i>
                      <span>WhatsApp</span>
                    </div>
                    <div className="share-option" onClick={shareOnInstagram}>
                      <i className="fab fa-instagram"></i>
                      <span>Instagram</span>
                    </div>
                    <div className="share-option" onClick={shareOnFacebook}>
                      <i className="fab fa-facebook"></i>
                      <span>Facebook</span>
                    </div>
                    <div className="share-option" onClick={shareOnTwitter}>
                      <i className="fab fa-twitter"></i>
                      <span>Twitter</span>
                    </div>
                    <div className="share-option" onClick={copyToClipboard}>
                      <i className="fas fa-copy"></i>
                      <span>Copy Link</span>
                    </div>
                    <div className="share-option" onClick={shareViaWebAPI}>
                      <i className="fas fa-share"></i>
                      <span>More Options</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="comment-section" ref={commentSectionRef}>
              <h3 className="comment-heading">
                <i className="fas fa-comments"></i> Comments ({comments.length})
              </h3>
              
              <div className="comment-form-container">
                <h4>Leave a Comment</h4>
                {commentError && <div className="comment-error">{commentError}</div>}
                <form className="comment-form" onSubmit={handleCommentSubmit}>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="name">Name</label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={newComment.name}
                        onChange={handleCommentChange}
                        placeholder="Your Name"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="email">Email</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={newComment.email}
                        onChange={handleCommentChange}
                        placeholder="Your Email"
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label htmlFor="content">Comment</label>
                    <textarea
                      id="content"
                      name="content"
                      value={newComment.content}
                      onChange={handleCommentChange}
                      placeholder="Your Comment"
                      rows="4"
                    ></textarea>
                  </div>
                  <button type="submit" className="submit-comment-btn">
                    Post Comment
                  </button>
                </form>
              </div>
              
              <div className="comments-list">
                {comments.length === 0 ? (
                  <div className="no-comments">
                    <p>No comments yet. Be the first to comment!</p>
                  </div>
                ) : (
                  comments.map((comment, index) => (
                    <div key={index} className="comment-item">
                      <div className="comment-avatar">
                        {comment.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="comment-content">
                        <div className="comment-header">
                          <h4 className="comment-author">{comment.name}</h4>
                          <span className="comment-date">
                            {formatDate(comment.createdAt)}
                          </span>
                        </div>
                        <p className="comment-text">{comment.content}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
            
            <div className="related-posts">
              <h3>Related Posts</h3>
              <div className="related-posts-grid">
                {relatedBlogs.map(relatedBlog => (
                  <div 
                    key={relatedBlog._id} 
                    className="related-post-card"
                    onClick={() => navigate(`/blog/${relatedBlog._id}`)}
                  >
                    <div className="related-post-image">
                      {relatedBlog.mediaPath ? (
                        <img 
                          src={`https://enthusia-prince-be.vercel.app/${relatedBlog.mediaPath}`} 
                          alt={relatedBlog.title} 
                        />
                      ) : relatedBlog.mediaUrl ? (
                        <img 
                          src={relatedBlog.mediaUrl} 
                          alt={relatedBlog.title} 
                        />
                      ) : (
                        <div className="placeholder-image">No Image</div>
                      )}
                    </div>
                    <h4>{relatedBlog.title}</h4>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="floating-share-button" onClick={shareViaWebAPI}>
        <i className="fas fa-share-alt"></i>
      </div>
    </div>
  );
};

export default UserBlogView;






