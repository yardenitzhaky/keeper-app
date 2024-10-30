import React, { useState } from "react";
import PropTypes from 'prop-types';
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import CircularProgress from '@mui/material/CircularProgress';
import Tooltip from '@mui/material/Tooltip';
import CategoryIcon from "@mui/icons-material/Category";
import Chip from '@mui/material/Chip';
import { Menu, MenuItem } from '@mui/material';
import axios from 'axios';
axios.defaults.withCredentials = true;

const API_URL = 'https://keeper-backend-kgj9.onrender.com';



/**
 * Note Component
 * Displays a single note with title, content, and action buttons
 * Supports edit and delete functionality with loading states
 */
const Note = ({ id, title, content, category = "Uncategorized", onDelete, onEdit }) => {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(category);



  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================
  
  const handleDeleteClick = async () => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      setIsDeleting(true);
      setError(null);
      
      try {
        await onDelete(id);
      } catch (error) {
        console.error("Error deleting note:", error);
        setError("Failed to delete note");
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleEditClick = async () => {
    setIsEditing(true);
    setError(null);
    
    try {
      await onEdit(id, title, content);
    } catch (error) {
      console.error("Error editing note:", error);
      setError("Failed to edit note");
    } finally {
      setIsEditing(false);
    }
  };

  const handleCategoryChange = async (event) => {
    const newCategory = event.target.value;
    setSelectedCategory(newCategory);

    try {
      await axios.put(`${API_URL}/notes/${id}/category`, { category: newCategory }, { withCredentials: true });
      onEdit(id, title, content, newCategory);
    } catch (error) {
      console.error("Failed to update category:", error);
    }
  };

  const categoryColors = {
    'Politics': '#FF6B6B',
    'Sport': '#4DABF7',
    'Technology': '#51CF66',
    'Entertainment': '#FFD43B',
    'Business': '#845EF7',
    'Uncategorized': '#868E96'
  };
  
  const getCategoryColor = (cat) => categoryColors[cat] || categoryColors.Uncategorized;

  

  // ============================================================================
  // RENDER
  // ============================================================================
  
  return (
    <div className="note" role="article">
      {/* Category Chip */}
      <div className="note-category">
      <select 
        value={selectedCategory} 
        onChange={handleCategoryChange}
        className="category-select"
      >
        <option value="Uncategorized">Uncategorized</option>
        <option value="Politics">Politics</option>
        <option value="Sport">Sport</option>
        <option value="Technology">Technology</option>
        <option value="Entertainment">Entertainment</option>
        <option value="Business">Business</option>
      </select>
    </div>

      {/* Note Content */}
      <h1>{title}</h1>
      <p>{content}</p>

      {/* Error Message */}
      {error && (
        <div 
          role="alert" 
          style={{ 
            color: '#e53e3e', 
            fontSize: '0.875rem', 
            marginBottom: '8px' 
          }}
        >
          {error}
        </div>
      )}

      {/* Action Buttons */}
      <div className="note-buttons">
        <Tooltip title="Edit note" placement="top">
          <button
            onClick={handleEditClick}
            disabled={isEditing || isDeleting}
            aria-label="Edit note"
          >
            {isEditing ? (
              <CircularProgress 
                size={24} 
                color="inherit" 
                aria-label="Editing..." 
              />
            ) : (
              <EditIcon aria-hidden="true" />
            )}
          </button>
        </Tooltip>

        <Tooltip title="Delete note" placement="top">
          <button
            onClick={handleDeleteClick}
            disabled={isEditing || isDeleting}
            aria-label="Delete note"
          >
            {isDeleting ? (
              <CircularProgress 
                size={24} 
                color="inherit" 
                aria-label="Deleting..." 
              />
            ) : (
              <DeleteIcon aria-hidden="true" />
            )}
          </button>
        </Tooltip>
      </div>
    </div>
  );
};

export default Note;