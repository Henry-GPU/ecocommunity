// src/contexts/UserContext.jsx
import React, { createContext, useState } from 'react';

const UserContext = createContext();

const UserProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userProfile, setUserProfile] = useState(null);

  const login = (profile) => {
    setIsAuthenticated(true);
    setUserProfile(profile);
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUserProfile(null);
  };

  return (
    <UserContext.Provider value={{ isAuthenticated, userProfile, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};

export { UserContext, UserProvider };
