import React, {useState} from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import CircularProgress from '@mui/material/CircularProgress';


const API_URL = 'https://keeper-backend-kgj9.onrender.com';


function Note(props) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  async function handleDeleteClick() {
    setIsDeleting(true);
    try {
      await props.onDelete(props.id);
    } catch (error) {
      console.error("Error deleting note:", error);
    } finally {
      setIsDeleting(false);
    }
  }

  async function handleEditClick() {
    setIsEditing(true);
    try {
      await props.onEdit(props.id, props.title, props.content);
    } catch (error) {
      console.error("Error editing note:", error);
    } finally {
      setIsEditing(false);
    }
  }

  return (
    <div className="note">
      <h1>{props.title}</h1>
      <p>{props.content}</p>
      <div className="note-buttons">
        <button onClick={handleEditClick} disabled={isEditing || isDeleting}>
          {isEditing ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            <EditIcon />
          )}
        </button>
        <button onClick={handleDeleteClick} disabled={isEditing || isDeleting}>
          {isDeleting ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            <DeleteIcon />
          )}
        </button>
      </div>
    </div>
  );
}

export default Note;
