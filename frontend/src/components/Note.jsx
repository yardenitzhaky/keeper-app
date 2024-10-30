import React, { useState } from "react";
import PropTypes from 'prop-types';
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import CircularProgress from '@mui/material/CircularProgress';
import Tooltip from '@mui/material/Tooltip';
import CategoryIcon from "@mui/icons-material/Category";
import Chip from '@mui/material/Chip';



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
  // Category color mapping
  const categoryColors = {
    'Politics': '#FF6B6B',      // Red
    'Sport': '#4DABF7',         // Blue
    'Technology': '#51CF66',    // Green
    'Entertainment': '#FFD43B',  // Yellow
    'Business': '#845EF7',      // Purple
    'Uncategorized': '#868E96'  // Gray
  };
  
  const getCategoryColor = (cat) => categoryColors[cat] || categoryColors.Uncategorized;

  

  // ============================================================================
  // RENDER
  // ============================================================================
  
  return (
    <div className="note" role="article">

   {/* Category Chip */}
   <div className="note-category">
        <Tooltip title={`Category: ${category}`}>
          <Chip
            icon={<CategoryIcon />}
            label={category}
            size="small"
            sx={{
              backgroundColor: getCategoryColor(category),
              color: category === 'Entertainment' ? 'black' : 'white',
              fontWeight: 500,
              marginBottom: '8px'
            }}
          />
        </Tooltip>
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

// ============================================================================
// PROP TYPES
// ============================================================================

Note.propTypes = {
  id: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number
  ]).isRequired,
  title: PropTypes.string.isRequired,
  content: PropTypes.string.isRequired,
  onDelete: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired
};

export default Note;