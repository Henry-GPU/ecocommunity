import React, { useState, useEffect, useCallback } from "react";
import Navbar from "./components/Navbar";
import LoginRegisterModal from "./components/LoginRegisterModal";
import Feed from "./components/Feed";
import "./App.css";
import axios from 'axios';
import CreatePost from "./components/CreatePost";
import CreatePostModal from "./components/CreatePostModal";
import Settings from "./components/Settings";
import AdminDashboard from "./components/AdminDashboard"
import UsersDashboard from "./components/UsersDashboard"
import PostsDashboard from "./components/PostsDashboard";
import CommunitiesDashboard from "./components/CommunitiesDashboard";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Profile from "./components/Profile"
import url from "./components/serveo";
import UserInfo from "./components/UserInfo";
import ToolBar from "./components/ToolBar";
import placeholder from './images/placeholder.png';
import Communities from "./components/Communities";

const axiosInstance = axios.create({
  baseURL: url,
});

function App() {
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] =  useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [userEmail, setUserEmail] = useState("");
  const [posts, setPosts] = useState([]);
  const [communityPosts, setCommunityPosts] = useState([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSettingsFromMenu, setIsSettingsFromMenu] = useState(false);
  const [profileImage, setProfileImage] = useState(placeholder);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 800);
  const [userCommunities, setUserCommunities] = useState([]);

  const handleLogin = (profile) => {
    setIsAuthenticated(true);
    setUserProfile(profile);
    setUserEmail(profile.email);
    setUserRole(profile.role);
    console.log('rol del usuario', profile.role);
    setIsModalOpen(false);
    setIsCreatePostModalOpen(false);

    localStorage.setItem("userProfile", JSON.stringify(profile));
    localStorage.setItem("isAuthenticated", "true");
  };

  const handleLogout = () => {
    setUserRole(0);
    setUserName('');
    setProfileImage(placeholder);
    setIsAuthenticated(false);
    setUserProfile(null);
    setUserEmail('');

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
      console.log(userEmail)
      const response = await axios.get(`${url}/api/posts`, {
        params: {userEmail: userEmail}});
      setPosts(response.data);
    } catch (error) {
      console.error('Error al cargar los posts:', error);
    }
  };

  const loadUserCommunities = async() =>{
    try {
      const response = await axios.get(`${url}/api/user-communities`, {
        params: {userEmail: userEmail}});
      setUserCommunities(response.data);
    } catch (error) {
      console.error('Error al cargar los posts:', error);
    }
  };

  const loadCommunityPosts = async() =>{
    try {
      const response = await axios.get(`${url}/api/community-posts`, {
        params: {userEmail: userEmail}});
      setCommunityPosts(response.data);
    } catch (error) {
      console.error('Error al cargar los posts:', error);
    }
  }

  const fetchUserName = async () => {
    if (!userEmail) return; 

    try {
      const response = await axios.get(`${url}/api/get-user-name`, {
        params: { userEmail }},);
      setUserName(response.data.userName);
    } catch (error) {
      console.error("Error al obtener el nombre de usuario", error);
    }
  };

  const updateProfile = async (updatedProfile) => {
    try {
      const response = await axios.put(`${url}/api/update-profile`, {
        email: userEmail,
        ...updatedProfile
      },);

      if (response.status === 200) {
        setUserProfile(updatedProfile);
        setUserName(updatedProfile.username);
        localStorage.setItem("userProfile", JSON.stringify(updatedProfile));
      }
    } catch (error) {
      console.error('Error al actualizar el perfil:', error);
    }
  };

  const fetchProfileImage = useCallback(async () => {
    try {
      const email = userProfile?.email;
      if (email) {
        const response = await axiosInstance.get('/api/get-profile-image', {
          params: { email: email }
        });
        if (response.data.profileImage) {
          setProfileImage(`${url}/uploads/${response.data.profileImage}`);
        } else {
          setProfileImage(placeholder);
        }
      }
    } catch (error) {
      console.error('Error al obtener la imagen del perfil:', error);
      setProfileImage(placeholder);
    }
  }, [userProfile?.email]);

  useEffect(() => {
    const storedProfile = localStorage.getItem("userProfile");
    const storedAuth = localStorage.getItem("isAuthenticated");

    if (storedProfile && storedAuth === "true") {
      setUserProfile(JSON.parse(storedProfile));
      setIsAuthenticated(true);
      setUserEmail(JSON.parse(storedProfile).email);
      setUserRole(JSON.parse(storedProfile).role);
      console.log('role:', userRole);
    }
    if (userEmail) {
      fetchUserName();
      loadPosts();
      loadCommunityPosts();
      loadUserCommunities();
    }
    fetchProfileImage();
  }, [userEmail, userRole]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 800);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/service-worker.js')
        .then((registration) => {
          console.log('Service Worker registrado con éxito:', registration);
        })
        .catch((error) => {
          console.log('Error al registrar el Service Worker:', error);
        });
    }
  }, []);

  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {

      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isModalOpen]);

  return (
    <BrowserRouter>
      <div className="App">
        <Navbar
          userRole={userRole}
          isAuthenticated={isAuthenticated}
          fetchProfileImage={fetchProfileImage}
          profileImage={profileImage}
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
              <div className="main-container">
                {!isMobile && isAuthenticated &&
                  (<ToolBar
                  profileImage={profileImage} 
                  userName={userName}
                  userRole={userRole}
                  handleLogout={handleLogout}
                  isAuthenticated={isAuthenticated}
                  isCommunityFeed={false}
                  />)
                } 
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
                      userCommunities={userCommunities}
                  />
                )}
                <Feed 
                  posts={posts}
                  userEmail={userEmail}
                  userRole={userRole}
                />
              </div>
                
              </div>
            }
          />
          {(userRole === 1 || userRole === 2) && 
            (<Route 
              path="/admin-dashboard"
              element={
                <AdminDashboard
                  userRole={userRole}
                />
              }
            />)
          }
          <Route
            path="/communities"
            element={
              <Communities
                isAuthenticated={isAuthenticated}
                profileImage={profileImage}
                handleLogout={handleLogout}
                posts={communityPosts}
                userEmail={userEmail}
                userName={userName}
                userRole={userRole}
                isMobile={isMobile}
                refreshCommunityPosts={loadCommunityPosts}
              />
            }
          />
          {(userRole === 1 || userRole === 2) && 
            (
              <Route 
                path="/admin-users-dashboard"
                element={
                  <UsersDashboard
                    userRole={userRole}
                  />
                }
              />
            )
          }
          {(userRole === 1 || userRole === 2) && 
            (
              <Route 
                path="/admin-posts-dashboard"
                element={
                  <PostsDashboard
                    userRole={userRole}
                  />
                }
              />
            )
          }
          {(userRole === 1 || userRole === 2) && 
            (
              <Route 
                path="/admin-communities-dashboard"
                element={
                  <CommunitiesDashboard
                    userRole={userRole}
                  />
                }
              />
            )
          }
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
          <Route path="admin-users-dashboard/user/:id" 
                element={<UserInfo
                currentUserRole={userRole}/>}>
          </Route>
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
