import React, { useState, useEffect } from "react";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import DoneIcon from '@mui/icons-material/Done';
import { Fab } from "@mui/material";
import { Zoom } from "@mui/material";
import axios from 'axios';
axios.defaults.withCredentials = true;
import LoadingButton from "./LoadingButton";



function CreateArea(props) {

  const [isExpanded, setExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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
    setIsLoading(true);
    try {
      if (props.editNote) {
        await props.onUpdate({
          id: props.editNote.id,
          title: note.title,
          content: note.content,
        });
      } else {
        await props.onAdd(note);
      }
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


  function expand() {
    setExpanded(true);
  }
  

  return (
    <div>
      <form className="create-note">
        {isExpanded && (
          <input
            name="title"
            onChange={handleChange}
            value={note.title}
            placeholder="Title"
          />
        )}
        <textarea
          onClick={expand}
          name="content"
          onChange={handleChange}
          value={note.content}
          placeholder="Take a note..."
          rows={isExpanded ? 3 : 1}
        />
        <Zoom in={isExpanded}>
          <LoadingButton
            onClick={submitNote}
            loading={isLoading}
            sx={{
              position: 'absolute',
              right: '18px',
              bottom: '-18px',
              backgroundColor: '#f5ba13',
              color: '#fff',
              border: 'none',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
              cursor: 'pointer',
              outline: 'none',
            }}
          >
            {props.editNote ? <DoneIcon /> : <AddIcon />}
          </LoadingButton>
        </Zoom>
      </form>
    </div>
  );
}

export default CreateArea;
