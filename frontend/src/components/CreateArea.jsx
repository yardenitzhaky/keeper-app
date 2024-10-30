/**
 * CreateArea Component
 * Handles the creation and editing of notes with an expandable form interface
 * @component
 * @param {Object} props
 * @param {Function} props.onAdd - Callback for adding a new note
 * @param {Function} props.onUpdate - Callback for updating an existing note
 * @param {Object} props.editNote - Note being edited (null if creating new note)
 */

import React, { useState, useEffect } from "react";

// Material-UI Components
import { Fab, Zoom, FormControl, InputLabel, Select, MenuItem, Typography } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import DoneIcon from '@mui/icons-material/Done';
import CircularProgress from '@mui/material/CircularProgress';
import CategoryIcon from "@mui/icons-material/Category";
import InfoIcon from "@mui/icons-material/Info";
import Tooltip from '@mui/material/Tooltip';

// Custom Components
import LoadingButton from "./LoadingButton.jsx";
import LoadingSpinner from "./LoadingSpinner.jsx";

// HTTP Client
import axios from 'axios';
axios.defaults.withCredentials = true;

function CreateArea(props) {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  
  const [isExpanded, setExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [note, setNote] = useState({
    title: "",
    content: ""
  });

  const categoryColors = {
    'Politics': '#FF6B6B',
    'Sport': '#4DABF7',
    'Technology': '#51CF66',
    'Entertainment': '#FFD43B',
    'Business': '#845EF7',
    'Uncategorized': '#868E96'
  };


  // ============================================================================
  // EFFECTS
  // ============================================================================
  
  // Handle edit mode when a note is passed for editing
  useEffect(() => {
    if (props.editNote) {
      setNote({
        title: props.editNote.title,
        content: props.editNote.content,
        category: props.editNote.category || ""
      });
      setExpanded(true);
    }
  }, [props.editNote]);

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================
  
  /**
   * Handles input changes in the form fields
   * @param {React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>} event
   */
  function handleChange(event) {
    const { name, value } = event.target;
    setNote(prevNote => ({
      ...prevNote,
      [name]: value
    }));
  }

  /**
   * Handles form submission for both creating and editing notes
   * @param {React.FormEvent} event
   */
  async function submitNote(event) {
    event.preventDefault();
    setIsLoading(true);
  
    try {
      // If a category is manually selected, use it. Otherwise, get prediction
      let noteCategory = note.category;
      
      if (!noteCategory) {
        try {
          const response = await axios.post('/classify-text', {
            text: note.content
          });
          noteCategory = response.data.category;
        } catch (error) {
          console.error("Classification error:", error);
          noteCategory = "Uncategorized";
        }
      }
  
      const noteWithCategory = {
        ...note,
        category: noteCategory
      };
  
      if (props.editNote) {
        await props.onUpdate({
          ...props.editNote,
          ...noteWithCategory
        });
      } else {
        await props.onAdd(noteWithCategory);
      }
  
      // Reset form state
      setNote({
        title: "",
        content: "",
        category: ""
      });
      setExpanded(false);
    } catch (error) {
      console.error("Error submitting note:", error);
    } finally {
      setIsLoading(false);
    }
  }

  /**
   * Expands the form to show title input
   */
  function expand() {
    setExpanded(true);
  }

  // ============================================================================
  // RENDER
  // ============================================================================
  
  return (
    <div>
      <form className="create-note">
        {/* Title input - only shown when form is expanded */}
        {isExpanded && (
          <input
            name="title"
            onChange={handleChange}
            value={note.title}
            placeholder="Title"
          />
        )}

        {/* Note content textarea */}
        <textarea
          onClick={expand}
          name="content"
          onChange={handleChange}
          value={note.content}
          placeholder="Take a note..."
          rows={isExpanded ? 3 : 1}
        />

        {/* Category Selection and Submit Button */}
        {isExpanded && (
          <div className="note-options">
            <FormControl size="small" sx={{ minWidth: 200, marginTop: 1 }}>
              <InputLabel>Category (Optional)</InputLabel>
              <Select
                name="category"
                value={note.category}
                onChange={handleChange}
                label="Category (Optional)"
              >
                <MenuItem value=""><em>Auto-detect category</em></MenuItem>
                {["Politics", "Sport", "Technology", "Entertainment", "Business"].map((cat) => (
                  <MenuItem key={cat} value={cat}>
                    <CategoryIcon sx={{ mr: 1, color: categoryColors[cat] }} />
                    {cat}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <Typography 
              variant="caption" 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                mt: 1,
                color: 'text.secondary'
              }}
            >
              <InfoIcon sx={{ fontSize: 16, mr: 0.5 }} />
              AI will auto-detect the category if none selected
            </Typography>
          </div>
        )}

        {/* Submit Button with Zoom */}
        {isExpanded && (
          <Zoom in={true}>
            <Fab 
              onClick={submitNote} 
              disabled={isLoading}
              sx={{ position: 'absolute', right: 18, bottom: -18 }}
            >
              {isLoading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                props.editNote ? <DoneIcon /> : <AddIcon />
              )}
            </Fab>
          </Zoom>
        )}
      </form>
    </div>
  );
}

export default CreateArea;