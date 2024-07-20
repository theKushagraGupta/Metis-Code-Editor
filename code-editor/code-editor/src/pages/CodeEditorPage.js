import React, { useState, useRef, useEffect } from "react";
import toast from "react-hot-toast";
import User from "../compnents/User.js";
import Editor from "../compnents/Editor.js";
import ACTIONS from "../Actions";
import { initSocket } from "../Socket";
import {
  useLocation,
  useNavigate,
  Navigate,
  useParams,
} from "react-router-dom";


const CodeEditorPage = () => {
  const socketRef = useRef(null);
  const codeRef = useRef(null);
  const location = useLocation();
  const reactNavigator = useNavigate();
  const { roomID } = useParams();

  const [users, setUsers] = useState([]);

  useEffect(() => {
    const init = async () => {
      try {
        socketRef.current = await initSocket();

        socketRef.current.on("connect_error", handleErrors);
        socketRef.current.on("connect_failed", handleErrors);

        function handleErrors(e) {
          console.log("Socket error", e);
          toast.error("Socket connection failed, try again later.");
          reactNavigator("/");
        }

        socketRef.current.emit(ACTIONS.JOIN, {
          roomID,
          username: location.state?.username,
        });

        // Listening for joined event
        socketRef.current.on(ACTIONS.JOINED, ({ users, username, socketID }) => {
          if (username !== location.state?.username) {
            toast.success(`${username} has joined the room!`);
          }
          setUsers(users);
          socketRef.current.emit(ACTIONS.SYNC_CODE, {
            code: codeRef.current,
            socketID,
          });
        });

        // Listening for disconnected event
        socketRef.current.on(ACTIONS.DISCONNECTED, ({ socketID, username }) => {
          toast.success(`${username} left the room.`);
          setUsers((prev) => prev.filter((user) => user.socketID !== socketID));
        });
      } catch (err) {
        console.error("Socket initialization failed", err);
      }
    };
    init();


    // Clean up function
    return () => {
      if (socketRef.current) {
        socketRef.current.off(ACTIONS.JOINED);
        socketRef.current.off(ACTIONS.DISCONNECTED);
        socketRef.current.disconnect();
      }
    };
  }, [location.state?.username, reactNavigator, roomID]);

  async function copyRoomId() {
    try {
      await navigator.clipboard.writeText(roomID);
      toast.success('Room ID has been copied');
    } catch (err) {
      toast.error('Could not copy the Room ID');
      console.error(err);
    }
  }

  function leaveRoom() {
    reactNavigator('/');
  }

  if (!location.state) {
    return <Navigate to="/" />;
  }

  return (
    <div className="mainWrapper">
      <div className="sidePanelWrapper">
        <div className="sidePanelTop">
          <div className="logo">
            <img className="logoImage" src="/CollabImage.png" alt="logo" />
          </div>
          <h3>Connected</h3>
          <div className="userList">
            {users.map((user) => (
              <User key={user.socketID} username={user.username} />
            ))}
          </div>
        </div>
        <button className="btn copyBtn" onClick={copyRoomId}>Copy Room ID</button>
        <button className="btn leaveBtn" onClick={leaveRoom}>Leave Room</button>
      </div>
      <div className="editorWrapper">
        <Editor socketRef={socketRef} roomID={roomID} onCodeChange={(code) => {
          codeRef.current = code;
        }}/>
      </div>
    </div>
  );
};

export default CodeEditorPage;