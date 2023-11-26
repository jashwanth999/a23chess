import React, { useEffect, useRef, useState } from "react";
import Box from "../components/Box";
import { socket, url } from "../helpers/apiHelpers";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  addUser,
  addUsers,
  changeOpponentPiecePositionAction,
  changePiecePositionAction,
  resetOpponentPieces,
  resetPiece,
} from "../api/action";
import {
  gridConstants,
  h,
  initialPieces,
  initialPiecesOpponent,
  p,
  po,
  tempInitialPieces,
  tempInitialPiecesOpponent,
  v,
} from "../helpers/imageHelpers";
import {
  dropPiece,
  getTurn,
  grabPiece,
  movePiece,
} from "../helpers/chessBoardHelpers";
import KilledPieceComponent from "../components/KilledPieceComponent";
import PawnReachedOtherSide from "../components/PawnReachedOtherSide";
import CheckMatePopUp from "../components/CheckMatePopUp";
import DetailsComponent from "../components/DetailsComponent";
import axios from "axios";
import { ArrowBack, ChevronLeft } from "@mui/icons-material";
import { Button, IconButton, Paper, Typography } from "@mui/material";

export default function ChessBoard() {
  const { roomid } = useParams();

  const _id = localStorage.getItem("_id");

  const dispatch = useDispatch();

  const navigate = useNavigate();

  const pieces = useSelector((state) => state.pieces.pieces);

  const piecesOpponent = useSelector(
    (state) => state.piecesOpponent.piecesOpponent
  );

  const users = useSelector((state) => state.users.users);

  const user = useSelector((state) => state.user.user);

  const kingPos = useSelector((state) => state.kingPos.kingPos);

  const kingPosOp = useSelector((state) => state.kingPosOp.kingPosOp);

  const [activePiece, setActivePiece] = useState(null);

  const [grabPosition, setGrabPosition] = useState([-1, -1]);

  const [killedPieces, setKilledPieces] = useState([]);

  const [opponentKilledPieces, setOpponentKilledPieces] = useState([]);

  const [myTurn, setMyTurn] = useState(true);

  const [minutes, setMinutes] = useState(10);

  const [seconds, setSeconds] = useState(0);

  const [opponentMinutes, setOpponentMinutes] = useState(10);

  const [opponentSeconds, setOpponentSeconds] = useState(0);

  const [pawnReachedOtherSideData, setPawnReachedOtherSideData] = useState({});

  const [opponetCalledForCheck, setOpponentCalledForCheck] = useState({});

  const [checkMatePopupData, setCheckMatePopUpData] = useState();

  const [prevMovePos, setPrevMovePos] = useState();

  const [allPos, setAllPos] = useState([]);

  const [allPosOp, setAllPosOp] = useState([]);

  const [allPosLength, setAllPosLength] = useState(0);

  const chessboardRef = useRef(null);

  const [moveTrack, setMoveTrack] = useState({});

  const audioRef = useRef();

  const scrollRef = useRef();

  let board = [];

  for (let i = 0; i < h.length; i++) {
    for (let j = 0; j < v.length; j++) {
      const number = j + i + 2;

      let cord = i.toString() + ":" + j.toString();

      board.push(
        <Box
          key={cord}
          image={pieces[cord]?.image}
          number={number}
          pos={i.toString() + ":" + j.toString()}
          prevGrabPos={prevMovePos?.grabpos}
          currentPos={prevMovePos?.pos}
          moveTrack={moveTrack}
        />
      );
    }
  }

  let time = {
    minutes: minutes,
    seconds: seconds,
    opponentMinutes: opponentMinutes,
    opponentSeconds: opponentSeconds,
  };

  const exitRoom = async () => {
    await axios.post(`${url}/update-user`, {
      _id: _id,
      isInGame: false,
      roomId: roomid,
    });

    socket.emit("leave_room", { roomId: roomid });

    dispatch(resetPiece(initialPieces));
    dispatch(resetOpponentPieces(initialPiecesOpponent));

    navigate("/home");

    window.location.reload();
  };

  const [cards, setCards] = useState(
    [
      {
        id: 1,
        title: "Blink Card",
        text: "Move one of your pieces to any unoccupied square.players cannot move a piece to a square that is already occupied by another piece.",
        image: "https://www.chess.com/bundles/web/images/variants/4pc.svg",
      },
      {
        id: 2,
        title: "Mirror Image",
        text: "Copy the movement of an opponent's piece for one turn",
        image:
          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSbgw5ILyoTVJfWWt9I9_2PXGHdy0F1WvyCJw&usqp=CAU",
      },
      {
        id: 3,
        title: "Swaparoo",
        text: "Switch the positions of two of your pieces",
        image:
          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRjSgS24Tk_UAhCuZqdXAH3H1o5zTODiGysLJ1d8HIhMD4AqBu2TMk9f1aA-kbU-s7CK2E&usqp=CAU",
      },

      {
        id: 4,
        title: "Pawn Promotion",
        text: "Promote a pawn to any piece of your choice.",
        image:
          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQXx6OHihTgrloibMAarzjzjnTYh74CQsh0cQ&usqp=CAU",
      },

      {
        id: 5,
        title: "Enchant Card",
        text: "The Enchant card imbues a selected piece with temporary enhanced abilities or attributes for a specified duration.",
        image:
          "https://www.chess.com/bundles/web/images/variants/setup_chess.svg",
      },

      {
        id: 6,
        title: "Double Trouble",
        text: "Move one piece twice in a turn, but you won’t be able to capture the opponent's piece after your second turn. Please note that it follows traditional chess rules.",
        image:
          "https://i.etsystatic.com/38033202/r/il/d76423/4339197639/il_1588xN.4339197639_n2e6.jpg",
      },

      {
        id: 7,
        title: "Ferocity Fusion",
        text: "It is similar to the Triple Thread card but it can capture the opponent’s piece on the third move",
        image:
          "https://www.shutterstock.com/image-photo/knight-capturing-rook-chess-game-260nw-200041058.jpg",
      },

      {
        id: 8,
        title: "Fog of war",
        text: "Opponent cannot see your moves for one turn",
        image:
          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTYViBjTtgkanViXkw4FCyppnqTEDhhSaRyZQ&usqp=CAU",
      },
      {
        id: 9,
        title: "Freeze",
        text: "Opponent won’t be able to move any of his pieces for a turn.",
        image:
          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRh5XquckO2u6-mlHgFEswgykSqWe7XL-ELvA&usqp=CAU",
      },

      {
        id: 10,
        title: "Revival",
        text: "Bring one captured piece back onto the board.",
        image:
          "https://i.pinimg.com/474x/9c/18/8f/9c188f4d3b0861217b40ba0a13d6adb3.jpg",
      },
    ].reverse()
  );

  function getWindowDimensions() {
    const { innerWidth: width, innerHeight: height } = window;
    return {
      width,
      height,
    };
  }

  const [windowDimensions, setWindowDimensions] = useState(
    getWindowDimensions()
  );

  useEffect(() => {
    function handleResize() {
      setWindowDimensions(getWindowDimensions());
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div style={rootDiv}>
      <div>
        <IconButton
          onClick={exitRoom}
          style={{ top: 10, left: 10, position: "absolute", color: "white" }}
        >
          <ArrowBack style={{ color: "white" }} />
        </IconButton>
        <div style={topAndBottomDiv}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <h3 style={{ margin: 1, color: "white" }}>
              {users[0]?.username === user?.username
                ? users[1]?.username
                : users[0]?.username}
            </h3>
            <KilledPieceComponent
              users={users}
              user={user}
              killedPieces={opponentKilledPieces}
              opponentKilledPieces={killedPieces}
            />
          </div>

          <h3 style={{ margin: 1, color: myTurn ? "white" : "#D35400" }}>
            {" "}
            {opponentMinutes.toString().length < 2
              ? "0" + opponentMinutes
              : opponentMinutes}
            :
            {opponentSeconds.toString().length < 2
              ? "0" + opponentSeconds
              : opponentSeconds}{" "}
          </h3>
        </div>

        <div
          onMouseMove={(e) =>
            movePiece(e, chessboardRef, activePiece, setActivePiece)
          }
          onMouseDown={(e) =>
            grabPiece(
              e,
              chessboardRef,
              setGrabPosition,
              users,
              user,
              pieces,
              piecesOpponent,
              setActivePiece,
              gridConstants,
              myTurn,
              checkMatePopupData,
              setMoveTrack
            )
          }
          onMouseUp={(e) =>
            dropPiece(
              e,
              chessboardRef,
              activePiece,
              grabPosition,
              users,
              user,
              pieces,
              piecesOpponent,
              audioRef,
              setActivePiece,
              setMyTurn,
              dispatch,
              kingPos,
              kingPosOp,
              myTurn,
              killedPieces,
              opponentKilledPieces,
              setKilledPieces,
              setOpponentKilledPieces,
              roomid,
              time,
              setPawnReachedOtherSideData,
              setOpponentCalledForCheck,
              setCheckMatePopUpData,
              setPrevMovePos,
              setAllPos,
              allPos,
              setAllPosLength,
              allPosLength,
              setMoveTrack,
              allPosOp,
              setAllPosOp
            )
          }
          // onTouchStart={(e) => grabPiece(e)}
          // onTouchMove={(e) => movePiece(e)}
          // onTouchEnd={(e) => dropPiece(e)}

          ref={chessboardRef}
          style={chessBoardDiv}
        >
          <PawnReachedOtherSide
            pawnReachedOtherSideData={pawnReachedOtherSideData}
            roomid={roomid}
            setPawnReachedOtherSideData={setPawnReachedOtherSideData}
          />
          {board}
        </div>

        <div style={topAndBottomDiv}>
          {" "}
          <div style={{ display: "flex", flexDirection: "column" }}>
            <h3 style={{ margin: 1, color: "white" }}> {user?.username} </h3>
            <KilledPieceComponent
              users={users}
              user={user}
              killedPieces={killedPieces}
              opponentKilledPieces={opponentKilledPieces}
            />
          </div>
          <h3 style={{ margin: 1, color: myTurn ? "#D35400" : "white" }}>
            {" "}
            {minutes.toString().length < 2 ? "0" + minutes : minutes}:
            {seconds.toString().length < 2 ? "0" + seconds : seconds}{" "}
          </h3>
        </div>

        <audio src={require("../sounds/piece-move.wav")} ref={audioRef} />
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {cards.length > 0 && (
          <Button
            variant="contained"
            color="secondary"
            onClick={() => {
              setCards((cards) => cards.slice(0, -1));
            }}
            style={{ position: "relative", top: 20 }}
          >
            Pick Card
          </Button>
        )}
        <div style={rightDiv}>
          {cards.map((card, index) => {
            return (
              <Paper
                elevation={1}
                key={card.id}
                style={{
                  height: 350,
                  width: 250,
                  position: "absolute",
                  display: "flex",
                  alignItems: "center",
                  flexDirection: "column",
                  marginRight: index * 8,
                  marginBottom: index * 6,
                  justifyContent: "space-around",
                }}
              >
                <h2 style={{ color: "#3498DB" }}> {card.title}</h2>
                <img
                  style={{ objectFit: "contain", height: 150, width: 150 }}
                  src={card.image}
                />
                <Typography
                  style={{
                    textAlign: "center",
                    margin: 10,
                    fontWeight: "bold",
                    fontSize: 14,
                    color: "#EABF69",
                  }}
                >
                  <q>{card.text}</q>
                </Typography>
              </Paper>
            );
          })}
        </div>
      </div>
    </div>
  );
}

const rootDiv = {
  display: "flex",
  justifyContent: "center",
  minHeight: "100vh",
  alignItems: "center",
  flexDirection: "row",
  backgroundColor: "rgba(46, 46, 46,0.9)",
  flexWrap: "wrap",
};
const chessBoardDiv = {
  height: gridConstants.gridSize,
  width: gridConstants.gridSize,
  backgroundColor: "orange",
  borderRadius: 2,
  display: "grid",
  flexWrap: "wrap",
  gridTemplateColumns: `repeat(8,${gridConstants.gridSize / 8}px)`,
  gridTemplateRows: `repeat(8,${gridConstants.gridSize / 8}px)`,
  flex: 1,
};

const topAndBottomDiv = {
  width: gridConstants.gridSize - 5,
  display: "flex",
  justifyContent: "space-between",
  margin: 5,
  padding: 2,
  height: 40,
};

const rightDiv = {
  marginTop: 20,
  marginLeft: 20,
  display: "flex",
  height: gridConstants.gridSize,
  width: gridConstants.gridSize,
  justifyContent: "center",
  alignItems: "center",
  flexDirection: "column",
};
