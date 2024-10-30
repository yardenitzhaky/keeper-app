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
import { Fab, Zoom } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import DoneIcon from '@mui/icons-material/Done';
import CircularProgress from '@mui/material/CircularProgress';

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

  // ============================================================================
  // EFFECTS
  // ============================================================================
  
  // Handle edit mode when a note is passed for editing
  useEffect(() => {
    if (props.editNote) {
      setNote({
        title: props.editNote.title,
        content: props.editNote.content,
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

         // Get category prediction
    const categoryResponse = await axios.post('/classify-text', {
      text: note.content
    });
    
    const noteWithCategory = {
      ...note,
      category: categoryResponse.data.category
    };
    if (props.editNote) {
      await props.onUpdate(noteWithCategory);
    } else {
      await props.onAdd(noteWithCategory);
    }

      // Reset form state
      setNote({
        title: "",
        content: ""
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

        {/* Submit button with loading state */}
        <Zoom in={isExpanded}>
          <Fab onClick={submitNote} disabled={isLoading}>
            {isLoading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              props.editNote ? <DoneIcon /> : <AddIcon />
            )}
          </Fab>
        </Zoom>
      </form>
    </div>
  );
}

export default CreateArea;