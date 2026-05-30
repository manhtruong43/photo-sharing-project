import React, { useState, useEffect } from "react";
import {
  List,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Typography,
  CircularProgress,
  Box,
} from "@mui/material";
import { Link, useLocation, useNavigate } from "react-router-dom";

import "./styles.css";
import fetchModel from "../../lib/fetchModelData";

/**
 * Define UserList, a React component of Project 4.
 */
function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = () => {
      fetchModel("/user/list")
        .then((response) => {
          setUsers(response.data);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Error fetching user list:", err);
          setError(err);
          setLoading(false);
        });
    };

    fetchUsers();

    window.addEventListener("refreshUserList", fetchUsers);
    return () => {
      window.removeEventListener("refreshUserList", fetchUsers);
    };
  }, []);

  const handleCommentBubbleClick = (e, userId) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/comments/${userId}`);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="150px">
        <CircularProgress color="primary" />
      </Box>
    );
  }

  if (error) {
    return (
      <Typography color="error" variant="body2">
        Failed to load users.
      </Typography>
    );
  }

  return (
    <div className="userlist-container">
      <Typography variant="h6" className="userlist-header">
        Members
      </Typography>
      <List className="userlist-list">
        {users.map((item) => {
          const isActive = location.pathname.includes(item._id);
          return (
            <ListItemButton
              key={item._id}
              component={Link}
              to={`/users/${item._id}`}
              className={`userlist-item-btn ${isActive ? "userlist-item-active" : ""}`}
            >
              <ListItemAvatar>
                <Avatar className="userlist-avatar">
                  {item.first_name[0]}{item.last_name[0]}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={`${item.first_name} ${item.last_name}`}
                primaryTypographyProps={{ className: "userlist-item-text" }}
              />
              <Box display="flex" gap={1} alignItems="center">
                <span
                  className="userlist-count-badge badge-photos"
                  title={`${item.photo_count || 0} photos`}
                >
                  {item.photo_count || 0}
                </span>
                <span
                  className="userlist-count-badge badge-comments"
                  onClick={(e) => handleCommentBubbleClick(e, item._id)}
                  title={`Click to view ${item.comment_count || 0} comments`}
                >
                  {item.comment_count || 0}
                </span>
              </Box>
            </ListItemButton>
          );
        })}
      </List>
    </div>
  );
}

export default UserList;
