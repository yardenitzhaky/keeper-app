import React, { useState, useEffect, useContext } from "react";
import Header from "./Header";
import Footer from "./Footer";
import Note from "./Note";
import CreateArea from "./CreateArea";
import Login from "./Login";
import Register from "./Register";
import ForgotPassword from "./ForgotPassword";
import ResetPassword from "./ResetPassword";
import VerifyEmail from "./VerifyEmail";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import axios from 'axios';
axios.defaults.withCredentials = true;
import { AuthContext } from "./AuthContext";
import PrivateRoute from "./PrivateRoute"; // Import the PrivateRoute


const API_URL = 'https://keeper-backend-kgj9.onrender.com';


function App() {

  const [notes, setNotes] = useState([]);
  const [editNote, setEditNote] = useState(null);
  const { user, setUser, loading, checkAuthStatus } = useContext(AuthContext);

  useEffect(() => {
    checkAuthStatus();
  }, []);
  
  useEffect(() => {
    if (user) {
      fetchNotes();
    }
  }, [user]);
  
  async function fetchNotes() {
    console.log("Fetching notes. Current user:", user);
    try {
      const response = await axios.get(`${API_URL}/notes`, { withCredentials: true });
      console.log("Notes fetched successfully:", response.data);
      setNotes(response.data);
    } catch (error) {
      console.error("Error fetching notes:", error.response?.data || error.message);
      if (error.response && error.response.status === 401) {
        console.log("Unauthorized. Clearing user state.");      }
    }
  }
  
  async function addNote(newNote) {
    try {
      const response = await axios.post(
        `${API_URL}/add`,
        newNote,
        { withCredentials: true }
      );
      const savedNote = response.data;
      setNotes(prevNotes => [...prevNotes, savedNote]);
    } catch (error) {
      console.error("Error adding note:", error);
    }
  }
  

  async function deleteNote(id) {
    try {
      await axios.delete(`${API_URL}/notes/${id}`, {withCredentials: true,} );
      setNotes(prevNotes => {
        return prevNotes.filter((noteItem) => noteItem.id !== id);
      });
    } catch (error) {
      console.error("There was an error deleting the note!", error);
    }
  }

  function handleEditClick(id, title, content) {
    setEditNote({
      id,
      title,
      content,
    });
  }

  async function updateNote(updatedNote) {
    try {
      const response = await axios.put(`${API_URL}/notes/${updatedNote.id}`,{withCredentials: true}, updatedNote,);
      setNotes(prevNotes =>
        prevNotes.map(noteItem =>
          noteItem.id === updatedNote.id ? response.data : noteItem
        )
      );
      setEditNote(null);
    } catch (error) {
      console.error("There was an error updating the note!", error);
    }
  }

  if (loading) {
    return <div>Loading...</div>; // Optionally, render a loading indicator
  }

  return (
      <Router>
        <Header />
        <Routes>
          <Route
            path="/"
            element={
              <PrivateRoute>
                <CreateArea onAdd={addNote} editNote={editNote} onUpdate={updateNote} />
                {notes.map((noteItem) => (
                  <Note
                    key={noteItem.id}
                    id={noteItem.id}
                    title={noteItem.title}
                    content={noteItem.content}
                    onDelete={deleteNote}
                    onEdit={handleEditClick}
                  />
                ))}
              </PrivateRoute>
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
        </Routes>
        <Footer />
      </Router>
  );

}

export default App;
