/**
 * App Component
 * Root component handling routing and note management functionality
 */

import React, { useState, useEffect, useContext } from "react";
import { HashRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import axios from 'axios';

// Layout Components
import Header from "./Header";
import Footer from "./Footer";

// Feature Components
import Note from "./Note";
import CreateArea from "./CreateArea";

// Authentication Components
import Login from "./Login";
import Register from "./Register";
import ForgotPassword from "./ForgotPassword";
import ResetPassword from "./ResetPassword";
import VerifyEmail from "./VerifyEmail";
import PrivateRoute from "./PrivateRoute";

// UI Components
import LoadingSpinner from "./LoadingSpinner";
import LoadingButton from "./LoadingButton";
import CookieAlert from "./CookieAlert";

// Context
import { AuthContext } from "./AuthContext";

// Configure axios defaults
axios.defaults.withCredentials = true;

// API configuration
const API_URL = 'https://keeper-app-bakcend-and-db.onrender.com';


function App() {
  // State declarations
  const [notes, setNotes] = useState([]);
  const [editNote, setEditNote] = useState(null);
  const { user, loading, checkAuthStatus } = useContext(AuthContext);

  // Check authentication on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);
  
  // Fetch notes when user is authenticated
  useEffect(() => {
    if (user) {
      fetchNotes();
    }
  }, [user]);
  
  // Note management functions
  async function fetchNotes() {
    console.log("Fetching notes. Current user:", user);
    try {
      const response = await axios.get(`${API_URL}/notes`, user, {withCredentials: true });
      console.log("Notes fetched successfully:", response.data);
      setNotes(response.data);
    } catch (error) {
      console.error("Error fetching notes:", error.response?.data || error.message);
      if (error.response && error.response.status === 401) {
        console.log("Unauthorized. Clearing user state.");
      }
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
      if (editNote && editNote.id === id) {
        setEditNote(null);
      }
      setNotes(prevNotes => {
        return prevNotes.filter((noteItem) => noteItem.id !== id);
      });
    } catch (error) {
      console.error("There was an error deleting the note!", error);
    }
  }

  function handleEditClick(id, title, content, category) {
    setEditNote({
      id,
      title,
      content,
      category,
    });
  }

  async function updateNote(updatedNote) {
    console.log("Updating note:", updatedNote);
    try {
      // Input validation
      if (!updatedNote.title || !updatedNote.content) {
        throw new Error("Title and content are required");
      }
  
      const response = await axios.put(
        `${API_URL}/notes/${updatedNote.id}`,
        {
          title: updatedNote.title,
          content: updatedNote.content,
          category: updatedNote.category
        },
        { withCredentials: true }
      );
      console.log("Update response:", response.data);
      setNotes(prevNotes =>
        prevNotes.map(noteItem =>
          noteItem.id === updatedNote.id ? response.data : noteItem
        )
      );
      setEditNote(null);
    } catch (error) {
      console.error("Error updating note:", error.response?.data || error.message);
    }
  }

  // Show loading state while checking authentication
  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Router>
      <Header />
      <CookieAlert />
      <Routes>
        {/* Main notes dashboard - protected route */}
        <Route
          path="/"
          element={
            <PrivateRoute>
              <div className="notes-container">
                <CreateArea onAdd={addNote} editNote={editNote} onUpdate={updateNote} />
                {notes.map((noteItem) => (
                  <Note
                    key={noteItem.id}
                    id={noteItem.id}
                    title={noteItem.title}
                    content={noteItem.content}
                    category={noteItem.category}  
                    onDelete={deleteNote}
                    onEdit={handleEditClick}
                  />
                ))}
              </div>
            </PrivateRoute>
          }
        />
        
        {/* Authentication routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        
        {/* Utility routes */}
        <Route path="/loading" element={<LoadingSpinner />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;