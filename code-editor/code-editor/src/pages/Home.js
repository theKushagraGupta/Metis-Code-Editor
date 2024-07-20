import React, { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

const Home = () => {
  const [roomID, setRoomID] = useState("");
  const [username, setUsername] = useState("");

  const navigate = useNavigate();

  const createNewRoom = (e) => {
    e.preventDefault(); // Prevent from refreshing the page
    const id = uuidv4();
    setRoomID(id);
    toast.success("Your room has been created 🥳");
  };

  const joinRoom = () => {
    if (!roomID){
      toast.error("Please enter the Room ID")
      return;
    }
    else if (!username){
      toast.error("Please enter your Username")
      return;
    }

    // Redirecting to Editor Page

    navigate(`/CodeEditor/${roomID}`,{
      state: {
        username,
      },
    });
  };

  const handleEnterKey = (e) => {                             // e implies for event
    if (e.code === "Enter"){                                  // e.code stores the key pressed
      joinRoom();
    }
  }

  return (
    <div className="homePageWrapper">
      <div className="formWrapper">
        <img
          className="logo"
          src="CollabImage.png"
          alt="Collaborative-Code-Editor-logo"
        />
        <h4 className="mainLabel">Enter Invitation ID</h4>
        <div className="inputs">
          <input
            type="text"
            className="inputBox"
            placeholder="Room ID"
            onChange={(e) => setRoomID(e.target.value)}
            value={roomID}
            onKeyUp = {handleEnterKey}
            />
          <input
            type="text"
            className="inputBox"
            placeholder="Username"
            onChange={(e) => setUsername(e.target.value)}
            value={username}
            onKeyUp = {handleEnterKey}
            />
          <button className="btn joinBtn" onClick = {joinRoom}>Join</button>
          <span className="createRoom">
            If you want to create a new room &nbsp;
            <a href="" onClick={createNewRoom} className="createNewBtn">
              click here
            </a>
          </span>
        </div>
      </div>
      <footer>
        <h4>
          Built by <a>Kushagra</a> & <a>Riya</a> 😎
        </h4>
      </footer>
    </div>
  );
};

export default Home;
