// import React, { useState, useEffect, useContext } from "react";
// import Header from "./Header";
// import Footer from "./Footer";
// import Note from "./Note";
// import CreateArea from "./CreateArea";
// import Login from "./Login";
// import Register from "./Register";
// import ForgotPassword from "./ForgotPassword";
// import ResetPassword from "./ResetPassword";
// import VerifyEmail from "./VerifyEmail";
// import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
// import axios from 'axios';
// axios.defaults.withCredentials = true;
// import { AuthContext } from "./AuthContext";
// import PrivateRoute from "./PrivateRoute"; // Import the PrivateRoute
// import LoadingSpinner from "./LoadingSpinner";
// import LoadingButton from "./LoadingButton";
// import CookieAlert from "./CookieAlert";


// const API_URL = 'https://keeper-backend-kgj9.onrender.com';



// function App() {

//   const [notes, setNotes] = useState([]);
//   const [editNote, setEditNote] = useState(null);
//   const { user, loading, checkAuthStatus } = useContext(AuthContext);

//   useEffect(() => {
//     checkAuthStatus();
//   }, []);
  
//   useEffect(() => {
//     if (user) {
//       fetchNotes();
//     }
//   }, [user]);
  
//   async function fetchNotes() {
//     console.log("Fetching notes. Current user:", user);
//     try {
//       const response = await axios.get(`${API_URL}/notes`, user, {withCredentials: true });
//       console.log("Notes fetched successfully:", response.data);
//       setNotes(response.data);
//     } catch (error) {
//       console.error("Error fetching notes:", error.response?.data || error.message);
//       if (error.response && error.response.status === 401) {
//         console.log("Unauthorized. Clearing user state.");      }
//     }
//   }
  
//   async function addNote(newNote) {
//     try {
//       const response = await axios.post(
//         `${API_URL}/add`,
//         newNote,
//         { withCredentials: true }
//       );
//       const savedNote = response.data;
//       setNotes(prevNotes => [...prevNotes, savedNote]);
//     } catch (error) {
//       console.error("Error adding note:", error);
//     }
//   }
  

//   async function deleteNote(id) {
//     try {
//       await axios.delete(`${API_URL}/notes/${id}`, {withCredentials: true,} );
//       setNotes(prevNotes => {
//         return prevNotes.filter((noteItem) => noteItem.id !== id);
//       });
//     } catch (error) {
//       console.error("There was an error deleting the note!", error);
//     }
//   }

//   function handleEditClick(id, title, content) {
//     setEditNote({
//       id,
//       title,
//       content,
//     });
//   }

//   async function updateNote(updatedNote) {
//     console.log("Updating note:", updatedNote);
//     try {
//       // Ensure title and content are not null or undefined
//       if (!updatedNote.title || !updatedNote.content) {
//         throw new Error("Title and content are required");
//       }
  
//       const response = await axios.put(
//         `${API_URL}/notes/${updatedNote.id}`,
//         {
//           title: updatedNote.title,
//           content: updatedNote.content
//         },
//         { withCredentials: true }
//       );
//       console.log("Update response:", response.data);
//       setNotes(prevNotes =>
//         prevNotes.map(noteItem =>
//           noteItem.id === updatedNote.id ? response.data : noteItem
//         )
//       );
//       setEditNote(null);
//     } catch (error) {
//       console.error("Error updating note:", error.response?.data || error.message);
//     }
//   }

//   if (loading) {
//     return <LoadingSpinner />;
//   }

//   return (
//       <Router>
//         <Header />
//         <CookieAlert />
//         <Routes>
//           <Route
//             path="/"
//             element={
//               <PrivateRoute>
//               <div className="notes-container">
//                 <CreateArea onAdd={addNote} editNote={editNote} onUpdate={updateNote} />
//                 {notes.map((noteItem) => (
//                   <Note
//                     key={noteItem.id}
//                     id={noteItem.id}
//                     title={noteItem.title}
//                     content={noteItem.content}
//                     onDelete={deleteNote}
//                     onEdit={handleEditClick}
//                   />
//                 ))}
//               </div>
//             </PrivateRoute>
//             }
//           />
//           <Route path="/login" element={<Login />} />
//           <Route path="/register" element={<Register />} />
//           <Route path="/verify-email" element={<VerifyEmail />} />
//           <Route path="/forgot-password" element={<ForgotPassword />} />
//           <Route path="/reset-password/:token" element={<ResetPassword />} />
//           <Route path="/loading" element={<LoadingSpinner />} />
//           <Route path="*" element={<Navigate to="/" replace />} />
//         </Routes>
//         <Footer />
//       </Router>
//   );

// }

// export default App;


// ============================================================================
// IMPORTS
// ============================================================================

// React and hooks
import React, { useState, useEffect, useContext } from "react";

// Routing
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// Components
import Header from "./Header";
import Footer from "./Footer";
import Note from "./Note";
import CreateArea from "./CreateArea";
import LoadingSpinner from "./LoadingSpinner";
import LoadingButton from "./LoadingButton";
import CookieAlert from "./CookieAlert";

// Authentication Components
import Login from "./Login";
import Register from "./Register";
import ForgotPassword from "./ForgotPassword";
import ResetPassword from "./ResetPassword";
import VerifyEmail from "./VerifyEmail";
import PrivateRoute from "./PrivateRoute";
import { AuthContext } from "./AuthContext";

// HTTP Client
import axios from 'axios';
axios.defaults.withCredentials = true;

// API Configuration
const API_URL = 'https://keeper-backend-kgj9.onrender.com';

/**
 * Main App Component
 * Handles routing, note management, and authentication state
 */
function App() {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  
  // Notes state
  const [notes, setNotes] = useState([]);
  const [editNote, setEditNote] = useState(null);
  
  // Auth context
  const { user, loading, checkAuthStatus } = useContext(AuthContext);

  // ============================================================================
  // EFFECTS
  // ============================================================================
  
  // Check authentication status on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);
  
  // Fetch notes when user is authenticated
  useEffect(() => {
    if (user) {
      fetchNotes();
    }
  }, [user]);

  // ============================================================================
  // API CALLS
  // ============================================================================
  
  /**
   * Fetches all notes for the authenticated user
   */
  async function fetchNotes() {
    console.log("Fetching notes. Current user:", user);
    try {
      const response = await axios.get(`${API_URL}/notes`, user, {withCredentials: true });
      console.log("Notes fetched successfully:", response.data);
      setNotes(response.data);
    } catch (error) {
      console.error("Error fetching notes:", error.response?.data || error.message);
      if (error.response?.status === 401) {
        console.log("Unauthorized. Clearing user state.");
      }
    }
  }
  
  /**
   * Adds a new note to the database
   * @param {Object} newNote - The note to be added
   */
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
  
  /**
   * Deletes a note from the database
   * @param {string} id - ID of the note to delete
   */
  async function deleteNote(id) {
    try {
      await axios.delete(`${API_URL}/notes/${id}`, {withCredentials: true});
      setNotes(prevNotes => prevNotes.filter(noteItem => noteItem.id !== id));
    } catch (error) {
      console.error("There was an error deleting the note!", error);
    }
  }

  /**
   * Sets up a note for editing
   * @param {string} id - Note ID
   * @param {string} title - Note title
   * @param {string} content - Note content
   */
  function handleEditClick(id, title, content) {
    setEditNote({ id, title, content });
  }

  /**
   * Updates an existing note
   * @param {Object} updatedNote - The note with updated values
   */
  async function updateNote(updatedNote) {
    console.log("Updating note:", updatedNote);
    try {
      // Validate required fields
      if (!updatedNote.title || !updatedNote.content) {
        throw new Error("Title and content are required");
      }
  
      const response = await axios.put(
        `${API_URL}/notes/${updatedNote.id}`,
        {
          title: updatedNote.title,
          content: updatedNote.content
        },
        { withCredentials: true }
      );
      
      // Update local state
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

  // Show loading spinner while checking auth status
  if (loading) {
    return <LoadingSpinner />;
  }

  // ============================================================================
  // RENDER
  // ============================================================================
  
  return (
    <Router>
      <Header />
      <CookieAlert />
      <Routes>
        {/* Protected Home Route */}
        <Route
          path="/"
          element={
            <PrivateRoute>
              <div className="notes-container">
                <CreateArea 
                  onAdd={addNote} 
                  editNote={editNote} 
                  onUpdate={updateNote} 
                />
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
              </div>
            </PrivateRoute>
          }
        />
        
        {/* Authentication Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/loading" element={<LoadingSpinner />} />
        
        {/* Fallback Route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;