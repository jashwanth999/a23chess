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
import { IconButton } from "@mui/material";

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

  const [cards, setCards] = useState([
    {
      id: 1,
      text: "Move one piece three times in a turn, but it cannot capture on the third move",
    },
    {
      id: 2,
      text: "Place an obstacle on an empty square; pieces cannot move through it for one turn.",
    },
    {
      id: 3,
      text: "Swap the positions of one of your pieces with one of your opponent's.",
    },
  ]);

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
        <button
          onClick={() => {
            setCards((cards) => cards.slice(0, -1));
          }}
          style={{ width: 100 }}
        >
          Pick Card
        </button>
        <div style={rightDiv}>
          {cards.map((card, index) => {
            return (
              <div
                key={card.id}
                style={{
                  height: 300,
                  width: 200,
                  backgroundColor: "white",
                  borderRadius: 10,
                  position: "absolute",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <p style={{ textAlign: "center" }}> {card.text} </p>
              </div>
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
  margin: 10,
  display: "flex",
  height: gridConstants.gridSize,
  width: gridConstants.gridSize,
  justifyContent: "center",
  alignItems: "center",
  flexDirection: "column",
};
