import React, { useState, useEffect } from "react";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import DoneIcon from '@mui/icons-material/Done';
import { Fab } from "@mui/material";
import { Zoom } from "@mui/material";
import axios from 'axios';
axios.defaults.withCredentials = true;


function CreateArea(props) {

  const [isExpanded, setExpanded] = useState(false);

  const [note, setNote] = useState({
    title: "",
    content: ""
  });

  useEffect(() => {
    if (props.editNote) {
      setNote({
        title: props.editNote.title,
        content: props.editNote.content,
      });
      setExpanded(true);
    }
  }, [props.editNote]);

  function handleChange(event) {
    const { name, value } = event.target;

    setNote(prevNote => {
      return {
        ...prevNote,
        [name]: value
      };
    });
  }

  async function submitNote(event) {
    event.preventDefault();
    if (props.editNote) {
      // Update existing note
      props.onUpdate({
        id: props.editNote.id,
        title: note.title,
        content: note.content,
      });
      // Clear the note and collapse the form
      setNote({
        title: "",
        content: ""
      });
      setExpanded(false);
    } else {
      // Create new note
      props.onAdd(note);
      // Clear the note and collapse the form
      setNote({
        title: "",
        content: ""
      });
      setExpanded(false);
    }
  }
  
  
  

  function expand() {
    setExpanded(true);
  }
  

  return (
    <div>
      <form className="create-note">
        {isExpanded ? <input
          name="title"
          onChange={handleChange}
          value={note.title}
          placeholder="Title"
        /> : null}
        <textarea
          onClick={expand}
          name="content"
          onChange={handleChange}
          value={note.content}
          placeholder="Take a note..."
          rows={isExpanded ? 3 : 1}
        />
        <Zoom in={isExpanded}>
        <Fab onClick={submitNote}>
        {props.editNote ? <DoneIcon /> : <AddIcon />}
        </Fab>
        </Zoom>
      </form>
    </div>
  );
}

export default CreateArea;
