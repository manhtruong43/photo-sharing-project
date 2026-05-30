import React, { useState, useEffect, useCallback } from "react";
import {
  Typography,
  CircularProgress,
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Alert,
} from "@mui/material";
import { useParams, Link, useNavigate } from "react-router-dom";

import "./styles.css";
import fetchModel from "../../lib/fetchModelData";

/**
 * Define UserPhotos, a React component of the Final Project.
 */
function UserPhotos({ advancedFeatures, setTopBarContext, loggedInUser }) {
    const { userId, photoId } = useParams();
    const navigate = useNavigate();

    const [photos, setPhotos] = useState([]);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Comment state per photo: { [photoId]: { text, error, submitting } }
    const [commentState, setCommentState] = useState({});

    const loadPhotos = useCallback(() => {
        setLoading(true);
        Promise.all([
            fetchModel(`/user/${userId}`),
            fetchModel(`/photosOfUser/${userId}`)
        ])
        .then(([userRes, photosRes]) => {
            setUser(userRes.data);
            setPhotos(photosRes.data || []);
            setTopBarContext(`Photos of ${userRes.data.first_name} ${userRes.data.last_name}`);
            setLoading(false);
        })
        .catch((err) => {
            console.error("Error loading photos:", err);
            setError(err);
            setLoading(false);
        });
    }, [userId, setTopBarContext]);

    useEffect(() => {
        loadPhotos();
    }, [loadPhotos]);

    // Handle redirection/deep-linking logic for advanced features
    useEffect(() => {
        if (advancedFeatures && photos.length > 0) {
            const found = photos.some((p) => p._id === photoId);
            if (!found) {
                navigate(`/photos/${userId}/${photos[0]._id}`, { replace: true });
            }
        }
    }, [advancedFeatures, photos, photoId, userId, navigate]);

    const handleCommentChange = (pid, value) => {
        setCommentState((prev) => ({
            ...prev,
            [pid]: { ...prev[pid], text: value, error: "" },
        }));
    };

    const handleCommentSubmit = (pid) => {
        const text = (commentState[pid]?.text || "").trim();
        if (!text) {
            setCommentState((prev) => ({
                ...prev,
                [pid]: { ...prev[pid], error: "Comment cannot be empty." },
            }));
            return;
        }
        setCommentState((prev) => ({
            ...prev,
            [pid]: { ...prev[pid], submitting: true, error: "" },
        }));
        fetch(`/commentsOfPhoto/${pid}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ comment: text }),
        })
            .then((res) => {
                if (!res.ok) return res.text().then((t) => { throw new Error(t); });
                // Clear comment and reload
                setCommentState((prev) => ({
                    ...prev,
                    [pid]: { text: "", error: "", submitting: false },
                }));
                loadPhotos();
                window.dispatchEvent(new CustomEvent("refreshUserList"));
            })
            .catch((err) => {
                setCommentState((prev) => ({
                    ...prev,
                    [pid]: { ...prev[pid], submitting: false, error: err.message || "Failed to add comment." },
                }));
            });
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="250px">
                <CircularProgress color="primary" />
            </Box>
        );
    }

    if (error) {
        return (
            <Typography color="error" variant="body1">
                Error loading photos.
            </Typography>
        );
    }

    if (photos.length === 0) {
        return (
            <Typography variant="body1" color="textSecondary" style={{ fontStyle: "italic" }}>
                This user has not uploaded any photos yet.
            </Typography>
        );
    }

    const formatDateTime = (isoString) => {
        if (!isoString) return "";
        const options = {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        };
        return new Date(isoString).toLocaleString("en-US", options);
    };

    const renderPhotoCard = (photo) => {
        // Use server path for images (works for both static & uploaded photos)
        let imageSrc = `/images/${photo.file_name}`;
        if (window.location.hostname.includes("csb.app")) {
            const backendHost = window.location.host.replace(/-300\d/, "-3000");
            imageSrc = `https://${backendHost}/images/${photo.file_name}`;
        }
        const cs = commentState[photo._id] || {};

        return (
            <Card key={photo._id} className="photo-card" elevation={0}>
                <div className="photo-header">
                    <Typography className="photo-date">
                        Uploaded on {formatDateTime(photo.date_time)}
                    </Typography>
                </div>
                <div className="photo-image-container">
                    <img
                        src={imageSrc}
                        alt={`Upload by ${user ? user.first_name : "user"}`}
                        className="photo-image"
                        onError={(e) => { e.target.style.display = "none"; }}
                    />
                </div>
                <CardContent className="comments-section">
                    <Typography className="comments-title">Comments</Typography>
                    {photo.comments && photo.comments.length > 0 ? (
                        photo.comments.map((comment) => (
                            <div key={comment._id} className="comment-item">
                                <div className="comment-header">
                                    <Link
                                        to={`/users/${comment.user._id}`}
                                        className="comment-author-link"
                                    >
                                        {comment.user.first_name} {comment.user.last_name}
                                    </Link>
                                    <Typography className="comment-date">
                                        {formatDateTime(comment.date_time)}
                                    </Typography>
                                </div>
                                <Typography className="comment-text">
                                    {comment.comment}
                                </Typography>
                            </div>
                        ))
                    ) : (
                        <Typography className="no-comments">
                            No comments yet. Be the first to say something!
                        </Typography>
                    )}

                    {/* Comment Input (only when logged in) */}
                    {loggedInUser && (
                        <div className="comment-input-section">
                            {cs.error && (
                                <Alert severity="error" sx={{ mb: 1, py: 0 }}>{cs.error}</Alert>
                            )}
                            <TextField
                                label="Add a comment..."
                                variant="outlined"
                                size="small"
                                fullWidth
                                multiline
                                rows={2}
                                value={cs.text || ""}
                                onChange={(e) => handleCommentChange(photo._id, e.target.value)}
                                className="comment-input-field"
                                id={`comment-input-${photo._id}`}
                            />
                            <Button
                                variant="contained"
                                size="small"
                                onClick={() => handleCommentSubmit(photo._id)}
                                disabled={cs.submitting}
                                className="comment-submit-btn"
                                id={`comment-submit-${photo._id}`}
                            >
                                {cs.submitting ? "Posting..." : "Post Comment"}
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        );
    };

    // If advanced stepper features is enabled
    if (advancedFeatures) {
        const currentPhoto = photos.find((p) => p._id === photoId) || photos[0];
        const currentIndex = photos.findIndex((p) => p._id === currentPhoto._id);

        if (currentIndex === -1) {
            return (
                <Box display="flex" justifyContent="center" alignItems="center" height="250px">
                    <CircularProgress color="primary" />
                </Box>
            );
        }

        return (
            <div className="photos-container">
                <div className="stepper-nav-bar">
                    <Button
                        variant="outlined"
                        className="stepper-button"
                        disabled={currentIndex === 0}
                        onClick={() => navigate(`/photos/${userId}/${photos[currentIndex - 1]._id}`)}
                    >
                        &larr; Back
                    </Button>
                    <Typography className="stepper-info">
                        Photo {currentIndex + 1} of {photos.length}
                    </Typography>
                    <Button
                        variant="outlined"
                        className="stepper-button"
                        disabled={currentIndex === photos.length - 1}
                        onClick={() => navigate(`/photos/${userId}/${photos[currentIndex + 1]._id}`)}
                    >
                        Next &rarr;
                    </Button>
                </div>
                {renderPhotoCard(currentPhoto)}
            </div>
        );
    }

    // Standard view: Render all photos
    return (
        <div className="photos-container">
            {photos.map((photo) => renderPhotoCard(photo))}
        </div>
    );
}

export default UserPhotos;

