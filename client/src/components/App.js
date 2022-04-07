import "../styles/App.css";
import React, { useContext } from "react";
import NavBar from "./NavBar";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Post from "./Post";
import Login from "./Login";
import BottomBar from "./BottomBar";
import AboutUs from "./AboutUs";
import PostDetails from "./PostDetails";
import loginContext from "./../context/login/loginContext";
import Spinner from "./Spinner";
import { useEffect } from "react";
import axios from "axios";
import { HOST } from "../constants";

const App = () => {
  const contextLogin = useContext(loginContext);
  const { isLoggedIn, setIsLoggedIn } = contextLogin;

  useEffect(() => {
    async function getLoginStatus() {
      try {
        const LOGIN_CHECK_ENDPOINT = `${HOST}/api/v1/users/is-logged-in`
        const response = await axios.get(LOGIN_CHECK_ENDPOINT, {
          withCredentials: true,
          credentials: "include"
        });
        if (response.data.status === 'success')
          setIsLoggedIn('loggedin')
        else
          setIsLoggedIn('loggedout')
      } catch (err) {
        setIsLoggedIn('loggedout')
      }
    }
    getLoginStatus();
  }, [])

  return (
    <Router>
      <div>
        <NavBar />
        <div style={{ minHeight: "80vh" }}>
          <Routes>
            <Route
              path="/"
              element={isLoggedIn === "loggedin" ? <Post /> : (isLoggedIn === 'loggedout' ? <Login /> : <Spinner />)}
            />
            <Route path="/aboutus" element={<AboutUs />} />
            <Route path="/postdetails" element={<PostDetails />} />
          </Routes>
        </div>
        <BottomBar />
      </div>
    </Router>
  );
};

export default App;