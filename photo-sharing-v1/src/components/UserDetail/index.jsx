import React, { useState, useEffect } from "react";
import { 
  Card, 
  CardContent, 
  Typography, 
  Button, 
  CircularProgress, 
  Box 
} from "@mui/material";
import { useParams, Link } from "react-router-dom";

import "./styles.css";
import fetchModel from "../../lib/fetchModelData";

/**
 * Define UserDetail, a React component of Project 4.
 */
function UserDetail({ setTopBarContext }) {
    const { userId } = useParams();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        setLoading(true);
        fetchModel(`/user/${userId}`)
            .then((response) => {
                setUser(response.data);
                setTopBarContext(`${response.data.first_name} ${response.data.last_name}`);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Error fetching user detail:", err);
                setError(err);
                setLoading(false);
            });
    }, [userId, setTopBarContext]);

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="250px">
                <CircularProgress color="primary" />
            </Box>
        );
    }

    if (error || !user) {
        return (
            <Typography color="error" variant="body1">
                User not found or error loading details.
            </Typography>
        );
    }

    return (
        <Card className="userdetail-card" elevation={0}>
          <div className="userdetail-header">
            <Typography variant="h4" className="userdetail-name">
              {user.first_name} {user.last_name}
            </Typography>
            <div className="userdetail-info-row">
              <span className="userdetail-info-icon">💼</span>
              <Typography variant="body1">{user.occupation}</Typography>
            </div>
            <div className="userdetail-info-row">
              <span className="userdetail-info-icon">📍</span>
              <Typography variant="body1">{user.location}</Typography>
            </div>
          </div>
          
          <CardContent className="userdetail-body">
            <div>
              <Typography className="userdetail-section-title">About Me</Typography>
              <div 
                className="userdetail-description"
                dangerouslySetInnerHTML={{ __html: user.description }}
              />
            </div>

            <Box display="flex" justifyContent="flex-end" style={{ marginTop: "10px" }}>
              <Button 
                variant="contained" 
                component={Link} 
                to={`/photos/${user._id}`} 
                className="userdetail-action-btn"
              >
                View Photos &rarr;
              </Button>
            </Box>
          </CardContent>
        </Card>
    );
}

export default UserDetail;
