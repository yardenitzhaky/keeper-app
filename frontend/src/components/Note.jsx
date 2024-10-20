import React from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";

const API_URL = 'https://keeper-backend-kgj9.onrender.com';


function Note(props) {
  function handleDeleteClick() {
    props.onDelete(props.id);
  }

  function handleEditClick() {
    props.onEdit(props.id, props.title, props.content);
  }

  return (
    <div className="note">
      <h1>{props.title}</h1>
      <p>{props.content}</p>
      <div className="note-buttons">
        <button onClick={handleEditClick}>
          <EditIcon />
        </button>
        <button onClick={handleDeleteClick}>
          <DeleteIcon />
        </button>
      </div>
    </div>
  );
}

export default Note;
