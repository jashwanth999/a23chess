import { Avatar, Button } from "@mui/material";
import axios from "axios";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { addUser } from "../api/action";
import { socket, url } from "../helpers/apiHelpers";

export default function Home() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const user = useSelector((state) => state.user.user);

  const logout = () => {
    localStorage.removeItem("_id");
    navigate("/");
    window.location.reload();
  };

  const joinChessRoom = (min) => {
    navigate(`/room/1`);
  };

  return (
    <div style={rootDiv}>
      <div
        style={{
          height: 60,
          display: "flex",
          width: "100%",
          backgroundColor: "#eabf69",
          alignItems: "center",
          justifyContent: "space-around",
        }}
      >
        <img
          src={"https://www.a23.com/index_assets/images/a23-games-logo.svg"}
          alt=""
          style={{ height: 40, width: 40, margin: 5 }}
        />
      </div>

      <div style={{ padding: 10 }}>
        <h2 style={{ color: "white" }}> Play </h2>
        <div
          style={{ display: "flex", flexDirection: "row", flexWrap: "wrap" }}
        >
          <Button
            onClick={() => {
              joinChessRoom(3);
            }}
            style={timeComp}
          >
            3 min
          </Button>
          <Button
            onClick={() => {
              joinChessRoom(5);
            }}
            style={timeComp}
          >
            5 min
          </Button>
          <Button
            onClick={() => {
              joinChessRoom(10);
            }}
            style={timeComp}
          >
            10 min
          </Button>
          <Button
            onClick={() => {
              joinChessRoom(15);
            }}
            style={timeComp}
          >
            15 min
          </Button>
          <Button
            onClick={() => {
              joinChessRoom(30);
            }}
            style={timeComp}
          >
            30 min
          </Button>
        </div>
        <br />

        <h2 style={{ color: "white" }}> Other </h2>

        <div
          style={{ display: "flex", flexDirection: "row", flexWrap: "wrap" }}
        >
          <Button style={otherComponent}>Custom Game</Button>
          <Button style={otherComponent}>Play Friend</Button>
        </div>
      </div>
    </div>
  );
}

const rootDiv = {
  display: "flex",
  height: "100vh",
  backgroundColor: "rgb(46, 46, 46)",
  flexDirection: "column",
};

const timeComp = {
  color: "white",
  backgroundColor: "rgba(191, 41, 41, 0.5)",
  height: 60,
  margin: 2,
  fontSize: 20,
};

const otherComponent = {
  color: "white",
  backgroundColor: "rgba(191, 41, 41, 0.5)",
  height: 60,
  margin: 2,
  fontSize: 16,
};
