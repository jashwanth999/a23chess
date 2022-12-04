import { changeKingPosition, changeOpponentKingPosition } from "../api/action";
import { callingOpponentForCheckMate } from "./checkMateAttackHelpers";
import {
  checkMateStopFromOTherPiece,
  kingAbleToMoveAfterCheckMate,
} from "./finalCheckMateAttackHelpers";
import { gridConstants } from "./imageHelpers";
import { checkMateMessageToSocket, messageToSocket } from "./socketApiHelper";
import { isValidMoveForCheckMate, pieceValidMethodMap } from "./validHelpers";

export const grabPiece = (
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
  checkMatePopupData
) => {
  // if (myTurn && !checkMatePopupData) {
  try {
    let element = e.target;

    const chessboard = chessboardRef.current;

    // console.log(isCheckMate(pieces))

    if (element.classList.contains("piece")) {
      const grabX = Math.floor(
        (e.clientX - chessboard.offsetLeft) / (gridConstants.gridSize / 8)
      );
      const grabY = Math.abs(
        Math.floor(
          (e.clientY - chessboard.offsetTop) / (gridConstants.gridSize / 8)
        )
      );

      setGrabPosition([grabY, grabX]);

      let grabpos = grabY.toString() + ":" + grabX.toString();

      // console.log(grabpos);

      // console.log(users,user.username)

      if (
        users[0].username === user.username &&
        pieces[grabpos]?.color !== "b"
      ) {
        return;
      } else if (
        users[1].username === user.username &&
        piecesOpponent[grabpos]?.color !== "w"
      ) {
        return;
      }

      const x = e.clientX - gridConstants.gridSize / 8 / 2;
      const y = e.clientY - gridConstants.gridSize / 8 / 2;
      element.style.position = "absolute";
      element.style.left = `${x}px`;
      element.style.top = `${y}px`;

      setActivePiece(element);
    }
  } catch (e) {
    console.log("Error while grabbing piece", e.message);
  }
  // }
};

export const movePiece = (e, chessboardRef, activePiece, setActivePiece) => {
  const chessboard = chessboardRef.current;
  if (activePiece && chessboard) {
    const minX = chessboard.offsetLeft;
    const minY = chessboard.offsetTop;

    const maxX = chessboard.offsetLeft + chessboard.clientWidth - 56;
    const maxY = chessboard.offsetTop + chessboard.clientHeight - 56;

    // console.log(chessboard.offsetLeft, chessboard.clientWidth);

    const x = e.clientX - 40;
    const y = e.clientY - 40;
    activePiece.style.position = "absolute";
    activePiece.style.left = `${x}px`;
    activePiece.style.top = `${y}px`;

    // console.log(x, y);

    // If x is smaller than minimum amount
    //   if (x < minX) {
    //     activePiece.style.position = "absolute";
    //     activePiece.style.left = `${minX}px`;
    //   }
    //   //If x is bigger than maximum amount
    //   else if (x > maxX) {
    //     activePiece.style.position = "absolute";
    //     activePiece.style.left = `${maxX}px`;
    //   }
    //   //If x is in the constraints
    //   else {
    //     activePiece.style.position = "absolute";
    //     activePiece.style.left = `${x}px`;
    //   }

    //   //If y is smaller than minimum amount
    //   if (y < minY) {
    //     activePiece.style.position = "absolute";
    //     activePiece.style.top = `${minY}px`;
    //   }
    //   //If y is bigger than maximum amount
    //   else if (y > maxY) {
    //     activePiece.style.position = "absolute";
    //     activePiece.style.top = `${maxY}px`;
    //   }
    //   //If y is in the constraints
    //   else {
    //     activePiece.style.position = "absolute";
    //     activePiece.style.top = `${y}px`;
    //   }
  }
};
export const dropPiece = (
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
  timer,
  opponentTimer,
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
  setCheckMatePopUpData
) => {
  try {
    const chessboard = chessboardRef.current;

    if (activePiece && chessboard) {
      const x = Math.floor(
        (e.clientX - chessboard.offsetLeft) / (gridConstants.gridSize / 8)
      );
      const y = Math.abs(
        Math.floor(
          (e.clientY - chessboard.offsetTop) / (gridConstants.gridSize / 8)
        )
      );

      let pos = y.toString() + ":" + x.toString();

      // console.log(pos);

      let posOp = (7 - y).toString() + ":" + x.toString();

      let grabpos =
        grabPosition[0].toString() + ":" + grabPosition[1].toString();

      let grabposOp =
        (7 - grabPosition[0]).toString() + ":" + grabPosition[1].toString();

      // console.log(grabpos)

      if (
        !pieceValidMethodMap(
          grabPosition[0],
          grabPosition[1],
          y,
          x,
          users[0]?.username === user.username
            ? pieces[grabpos]?.pieceName
            : piecesOpponent[grabpos]?.pieceName,
          users[0]?.username === user.username ? pieces : piecesOpponent
        )
      ) {
        activePiece.style.position = "relative";
        activePiece.style.removeProperty("top");
        activePiece.style.removeProperty("left");
      } else if (users[0].username === user.username && pieces[grabpos]) {
        let piecesData = pieces[grabpos];

        let piecesDataOp = piecesOpponent[grabposOp];

        let piecesPosData = pieces[pos];

        let piecesPosDataOp = piecesOpponent[posOp];

        if (
          pieces[pos] &&
          (pieces[pos].color === pieces[grabpos].color ||
            pieces[pos].pieceName === "k")
        ) {
          activePiece.style.position = "relative";
          activePiece.style.removeProperty("top");
          activePiece.style.removeProperty("left");

          setActivePiece(null);

          return;
        }

        let kingFlag = false;

        if (pieces[grabpos].pieceName === "k") {
          kingFlag = true;
          dispatch(changeKingPosition(pos));
        }
        let killedPiecesData;

        if (pieces[pos]) {
          killedPiecesData = pieces[pos];
        }

        pieces[grabpos] = "";
        pieces[pos] = piecesData;

        piecesOpponent[posOp] = piecesDataOp;
        piecesOpponent[grabposOp] = "";

        if (
          isValidMoveForCheckMate(
            kingFlag
              ? Number(pos.split(":")[0])
              : Number(kingPos.split(":")[0]),
            kingFlag
              ? Number(pos.split(":")[1])
              : Number(kingPos.split(":")[1]),
            pieces
          )
        ) {
          pieces[grabpos] = piecesData;

          pieces[pos] = piecesPosData;

          piecesOpponent[grabposOp] = piecesDataOp;

          piecesOpponent[posOp] = piecesPosDataOp;

          if (kingFlag) {
            dispatch(changeKingPosition(grabpos));
          }

          activePiece.style.position = "relative";
          activePiece.style.removeProperty("top");
          activePiece.style.removeProperty("left");

          setActivePiece(null);

          return;
        }

        //after success ,  checking our move for checkmate

        if (
          callingOpponentForCheckMate(
            7 - Number(kingPosOp.split(":")[0]),
            Number(kingPosOp.split(":")[1]),
            y,
            x,
            pieces[pos].pieceName,
            pieces
          ) &&
          pieces[pos].pieceName !== "k"
        ) {
          console.log("check called by opponent");

          setOpponentCalledForCheck(true);

          let checkMateCount = isValidMoveForCheckMate(
            7 - Number(kingPos.split(":")[0]),
            Number(kingPos.split(":")[1]),
            pieces
          );

          console.log("checkMateCount", checkMateCount);

          if (checkMateCount > 1) {
            if (
              !kingAbleToMoveAfterCheckMate(
                7 - Number(kingPosOp.split(":")[0]),
                Number(kingPosOp.split(":")[1]),
                pieces
              )
            ) {
              setCheckMatePopUpData({
                roomId: roomid,
                winnerName: users[0].username,
                color: "b",
              });

              checkMateMessageToSocket(roomid, users[0].username, "b");
            }
          } else if (
            !checkMateStopFromOTherPiece(
              pieces,
              7 - Number(kingPosOp.split(":")[0]),
              Number(kingPosOp.split(":")[1]),
              y,
              x
            ) &&
            !kingAbleToMoveAfterCheckMate(
              7 - Number(kingPosOp.split(":")[0]),
              Number(kingPosOp.split(":")[1]),
              pieces
            )
          ) {
            setCheckMatePopUpData({
              roomId: roomid,
              winnerName: users[0].username,
              color: "b",
            });

            checkMateMessageToSocket(roomid, users[0].username, "b");
          }
        } else setOpponentCalledForCheck(false);

        activePiece.style.position = "relative";
        activePiece.style.removeProperty("top");
        activePiece.style.removeProperty("left");

        if (grabpos === pos) {
          clearInterval(opponentTimer);
          setMyTurn(true);
        } else {
          setMyTurn(false);
        }

        if (killedPiecesData) {
          setKilledPieces([...killedPieces, killedPiecesData]);
        }
        audioRef.current.play();

        if (y === 0 && pieces[pos] && pieces[pos].pieceName === "p") {
          setPawnReachedOtherSideData({
            open: true,
            pieces,
            piecesOpponent,
            pos: pos,
            posOp: posOp,
            roomid,
            myTurn,
            killedPieces,
            opponentKilledPieces,
            time,
            opponent: false,
          });
        }

        messageToSocket(
          roomid,
          pieces,
          piecesOpponent,
          myTurn,
          killedPiecesData ? [...killedPieces, killedPiecesData] : killedPieces,
          opponentKilledPieces,
          time
        );
      } else if (
        users[1].username === user.username &&
        piecesOpponent[grabpos]
      ) {
        let piecesData = piecesOpponent[grabpos];

        let piecesDataOp = pieces[grabposOp];

        let piecesPosData = piecesOpponent[pos];

        let piecesPosDataOp = pieces[posOp];

        if (
          piecesOpponent[pos] &&
          (piecesOpponent[pos].color === piecesOpponent[grabpos].color ||
            piecesOpponent[pos].pieceName === "k")
        ) {
          activePiece.style.position = "relative";
          activePiece.style.removeProperty("top");
          activePiece.style.removeProperty("left");

          setActivePiece(null);

          return;
        }

        let kingFlag = false;

        if (piecesOpponent[grabpos].pieceName === "k") {
          kingFlag = true;
          dispatch(changeOpponentKingPosition(pos));
        }

        let killedPiecesOpponentData;

        if (piecesOpponent[pos]) {
          killedPiecesOpponentData = piecesOpponent[pos];
        }

        piecesOpponent[grabpos] = "";
        piecesOpponent[pos] = piecesData;

        pieces[posOp] = piecesDataOp;
        pieces[grabposOp] = "";

        if (
          isValidMoveForCheckMate(
            kingFlag
              ? Number(pos.split(":")[0])
              : Number(kingPosOp.split(":")[0]),
            kingFlag
              ? Number(pos.split(":")[1])
              : Number(kingPosOp.split(":")[1]),
            piecesOpponent
          )
        ) {
          piecesOpponent[grabpos] = piecesData;

          piecesOpponent[pos] = piecesPosData;

          pieces[grabposOp] = piecesDataOp;

          pieces[posOp] = piecesPosDataOp;

          if (kingFlag) {
            dispatch(changeOpponentKingPosition(grabpos));
          }

          activePiece.style.position = "relative";
          activePiece.style.removeProperty("top");
          activePiece.style.removeProperty("left");

          setActivePiece(null);

          return;
        }

        //after success checking our move for checkmate

        if (
          callingOpponentForCheckMate(
            7 - Number(kingPosOp.split(":")[0]),
            Number(kingPosOp.split(":")[1]),
            y,
            x,
            piecesOpponent[pos].pieceName,
            piecesOpponent
          ) &&
          piecesOpponent[pos].pieceName !== "k"
        ) {
          console.log("check called by opponent");

          setOpponentCalledForCheck(true);

          let checkMateCount = isValidMoveForCheckMate(
            7 - Number(kingPos.split(":")[0]),
            Number(kingPos.split(":")[1]),
            piecesOpponent
          );

          console.log("checkMateCount", checkMateCount);

          if (checkMateCount > 1) {
            if (
              !kingAbleToMoveAfterCheckMate(
                7 - Number(kingPosOp.split(":")[0]),
                Number(kingPosOp.split(":")[1]),
                piecesOpponent
              )
            ) {
              setCheckMatePopUpData({
                roomId: roomid,
                winnerName: users[1].username,
                color: "w",
              });

              checkMateMessageToSocket(roomid, users[1].username, "w");
            }
          } else if (
            !checkMateStopFromOTherPiece(
              piecesOpponent,
              7 - Number(kingPosOp.split(":")[0]),
              Number(kingPosOp.split(":")[1]),
              y,
              x
            ) &&
            !kingAbleToMoveAfterCheckMate(
              7 - Number(kingPosOp.split(":")[0]),
              Number(kingPosOp.split(":")[1]),
              piecesOpponent
            )
          ) {
            setCheckMatePopUpData({
              roomId: roomid,
              winnerName: users[1].username,
              color: "w",
            });

            checkMateMessageToSocket(roomid, users[1].username, "w");
          }
        } else setOpponentCalledForCheck(false);

        activePiece.style.position = "relative";
        activePiece.style.removeProperty("top");
        activePiece.style.removeProperty("left");

        if (grabpos === pos) {
          clearInterval(opponentTimer);
          setMyTurn(true);
        } else {
          setMyTurn(false);
        }
        if (killedPiecesOpponentData) {
          setOpponentKilledPieces([
            ...opponentKilledPieces,
            killedPiecesOpponentData,
          ]);
        }

        audioRef.current.play();

        if (
          y === 0 &&
          piecesOpponent[pos] &&
          piecesOpponent[pos].pieceName === "p"
        ) {
          setPawnReachedOtherSideData({
            open: true,
            pieces: pieces,
            piecesOpponent: piecesOpponent,
            pos: posOp,
            posOp: pos,
            roomid,
            myTurn,
            killedPieces,
            opponentKilledPieces,
            time,
            opponent: true,
          });
        }
        messageToSocket(
          roomid,
          pieces,
          piecesOpponent,
          myTurn,
          killedPieces,
          killedPiecesOpponentData
            ? [...opponentKilledPieces, killedPiecesOpponentData]
            : opponentKilledPieces,
          time
        );
      }

      setActivePiece(null);
    }
  } catch (e) {
    console.log("Error while drop piece : ", e.message);
  }
};

export const changePawnRechedOtherSizeData = (
  pawnReachedOtherSideData,
  setPawnReachedOtherSideData
) => {
  pawnReachedOtherSideData.pieces[pawnReachedOtherSideData.pos] =
    pawnReachedOtherSideData.newPieceData;
  pawnReachedOtherSideData.piecesOpponent[pawnReachedOtherSideData.posOp] =
    pawnReachedOtherSideData.newPieceData;

  messageToSocket(
    pawnReachedOtherSideData.roomid,
    pawnReachedOtherSideData.pieces,
    pawnReachedOtherSideData.piecesOpponent,
    pawnReachedOtherSideData.myTurn,
    pawnReachedOtherSideData.killedPieces,
    pawnReachedOtherSideData.opponentKilledPieces,
    pawnReachedOtherSideData.time
  );

  setPawnReachedOtherSideData({});
};
