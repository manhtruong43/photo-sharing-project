import React, { useState, useEffect } from "react";
import {
  Typography,
  CircularProgress,
  Box,
  Card,
  CardActionArea,
  CardContent,
  Avatar,
  Divider,
} from "@mui/material";
import { useParams, useNavigate, Link } from "react-router-dom";
import CommentIcon from "@mui/icons-material/Comment";

import "./styles.css";
import fetchModel from "../../lib/fetchModelData";

function UserComments({ setTopBarContext }) {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchModel(`/user/${userId}`),
      fetchModel(`/commentsOfUser/${userId}`),
    ])
      .then(([userRes, commentsRes]) => {
        setUser(userRes.data);
        setComments(commentsRes.data || []);
        setTopBarContext(`Comments of ${userRes.data.first_name} ${userRes.data.last_name}`);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading user comments:", err);
        setError(err);
        setLoading(false);
      });
  }, [userId, setTopBarContext]);

  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  const handleCardClick = (photoOwnerId, photoId) => {
    navigate(`/photos/${photoOwnerId}/${photoId}`);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="250px">
        <CircularProgress color="primary" />
      </Box>
    );
  }

  if (error || !user) {
    return (
      <Box className="comments-error-container">
        <Typography color="error" variant="h6">
          Failed to load user comments
        </Typography>
        <Typography color="textSecondary" variant="body2" sx={{ mt: 1 }}>
          The requested member could not be found or a network error occurred.
        </Typography>
      </Box>
    );
  }

  return (
    <Box className="user-comments-container">
      {/* Header section with user profile card style */}
      <Box className="comments-header-section">
        <Avatar className="comments-user-avatar">
          {user.first_name[0]}
          {user.last_name[0]}
        </Avatar>
        <Box>
          <Typography variant="h5" className="comments-title">
            {user.first_name} {user.last_name}
          </Typography>
          <Typography variant="body2" className="comments-subtitle">
            All comments authored across the network
          </Typography>
        </Box>
        <Box className="comments-count-badge">
          <CommentIcon sx={{ fontSize: 18, mr: 0.5 }} />
          <Typography variant="body2" fontWeight="bold">
            {comments.length}
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ mb: 4, borderColor: "#e2e8f0" }} />

      {comments.length === 0 ? (
        <Box className="no-comments-state">
          <CommentIcon className="no-comments-icon" />
          <Typography variant="h6" className="no-comments-text">
            No Comments Yet
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {user.first_name} hasn't authored any comments in the system.
          </Typography>
        </Box>
      ) : (
        <Box className="comments-grid">
          {comments.map((comment) => (
            <Card key={comment._id} className="comment-card" elevation={0}>
              <CardActionArea
                onClick={() => handleCardClick(comment.photo_owner_id, comment.photo_id)}
                className="comment-card-action"
              >
                <Box className="comment-card-layout">
                  {/* Left Side: Photo Thumbnail */}
                  <Box className="comment-thumbnail-container">
                    <img
                      src={`/images/${comment.file_name}`}
                      alt="Photo comment was made on"
                      className="comment-photo-thumbnail"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://via.placeholder.com/150?text=Photo+Missing";
                      }}
                    />
                  </Box>

                  {/* Right Side: Comment Details */}
                  <CardContent className="comment-content-area">
                    <Typography variant="body2" className="comment-text-bubble">
                      "{comment.comment}"
                    </Typography>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
                      <Typography variant="caption" className="comment-date">
                        Posted on {formatDate(comment.date_time)}
                      </Typography>
                      <span className="view-photo-link">
                        View Photo &rarr;
                      </span>
                    </Box>
                  </CardContent>
                </Box>
              </CardActionArea>
            </Card>
          ))}
        </Box>
      )}
    </Box>
  );
}

export default UserComments;
