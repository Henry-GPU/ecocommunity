import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import LoginRegisterModal from "./components/LoginRegisterModal";
import Feed from "./components/Feed";
import "./App.css";
import axios from 'axios';
import CreatePost from "./components/CreatePost";
import CreatePostModal from "./components/CreatePostModal";
import Settings from "./components/Settings";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Profile from "./components/Profile"

function App() {
  const [userName, setUserName] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [userEmail, setUserEmail] = useState("");
  const [posts, setPosts] = useState([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSettingsFromMenu, setIsSettingsFromMenu] = useState(false);
  const handleLogin = (profile) => {
    setIsAuthenticated(true);
    setUserProfile(profile);
    setUserEmail(profile.email);
    setIsModalOpen(false);
    setIsCreatePostModalOpen(false);

    localStorage.setItem("userProfile", JSON.stringify(profile));
    localStorage.setItem("isAuthenticated", "true");
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserProfile(null);
    setUserEmail("");

    localStorage.removeItem('userProfile');
    localStorage.removeItem('isAuthenticated');
  };

  const toggleMode = () => {
    setIsLogin(prevIsLogin => !prevIsLogin);
  };

  const handleOpenSettings = () => {
    setIsSettingsOpen(true);
  };
  
  const handleCloseSettings = () => {
    setIsSettingsOpen(false);
  };

  // Función para cargar posts
  const loadPosts = async () => {
    try {
      const response = await axios.get('https://b1b4-181-174-106-75.ngrok-free.app/api/posts');
      setPosts(response.data);
    } catch (error) {
      console.error('Error al cargar los posts:', error);
    }
  };

  const fetchUserName = async () => {
    if (!userEmail) return; 

    try {
      const response = await axios.get('https://b1b4-181-174-106-75.ngrok-free.app/api/get-user-name', {
        params: { userEmail }
      });
      setUserName(response.data.userName);
    } catch (error) {
      console.error("Error al obtener el nombre de usuario", error);
    }
  };

  const updateProfile = async (updatedProfile) => {
    try {
      const response = await axios.put('https://b1b4-181-174-106-75.ngrok-free.app/api/update-profile', {
        email: userEmail,
        ...updatedProfile
      });

      if (response.status === 200) {
        setUserProfile(updatedProfile);
        setUserName(updatedProfile.username);
        localStorage.setItem("userProfile", JSON.stringify(updatedProfile));
      }
    } catch (error) {
      console.error('Error al actualizar el perfil:', error);
    }
  };

  useEffect(() => {
    const storedProfile = localStorage.getItem("userProfile");
    const storedAuth = localStorage.getItem("isAuthenticated");

    if (storedProfile && storedAuth === "true") {
      setUserProfile(JSON.parse(storedProfile));
      setIsAuthenticated(true);
      setUserEmail(JSON.parse(storedProfile).email);
    }

    fetchUserName();
    loadPosts();
  }, [userEmail]);

  return (
    <BrowserRouter>
      <div className="App">
        <Navbar
          isAuthenticated={isAuthenticated}
          userProfile={userProfile}
          userName={userName}
          handleLogout={handleLogout}
          openLoginModal={() => setIsModalOpen(true)}
          userEmail={userEmail}
          handleOpenSettings={handleOpenSettings}
        />
        <Routes>
          <Route
            path="/"
            element={
              <div className="posts-container">
                <CreatePost
                  isAuthenticated={isAuthenticated}
                  userProfile={userProfile}
                  openCreatePostModal={
                    () => setIsCreatePostModalOpen(true)
                  }
                  onClose={()=> setIsCreatePostModalOpen(false)}
                />
                {isCreatePostModalOpen && (
                  <CreatePostModal
                    onClose={
                      () => setIsCreatePostModalOpen(false)
                    }
                    userEmail={userEmail}
                    userName={userName}
                    refreshPosts={loadPosts}
                />
              )}
              <Feed 
                posts={posts}
                userEmail={userEmail}
              />
              </div>
            }
          />
          <Route
            path="/settings" 
            element={
              <Settings  
                isOpen={true} 
                onClose={handleCloseSettings} 
                currentProfileImage={userProfile?.profileImage} 
                currentUsername={userName} 
                onUpdateProfile={updateProfile} 
                currentEmail={userEmail}
              />
            } 
          />
          <Route
            path="/profile" 
            element={
              <Profile  
                isOpen={true} 
                onClose={handleCloseSettings} 
                currentProfileImage={userProfile?.profileImage} 
                currentUsername={userName} 
                onUpdateProfile={updateProfile} 
                currentEmail={userEmail}
              />
            } 
          />
        </Routes>
        {isModalOpen && (
          <LoginRegisterModal
            isLogin={isLogin}
            onClose={() => setIsModalOpen(false)}
            onLoginSuccess={handleLogin}
            toggleMode={toggleMode}
          />
        )}
      </div>
    </BrowserRouter>
  );
}

export default App;
