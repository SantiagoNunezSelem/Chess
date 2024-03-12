import React,{useState,useEffect} from "react";
import "../stylesheets/ChessBoard.css";
import ChessSquare from "./ChessSquare.js";
import pawnWhite from "../img/chess-pieces/pawn-white.png";
import pawnBlack from "../img/chess-pieces/pawn-black.png";
import rookWhite from "../img/chess-pieces/rook-white.png";
import rookBlack from "../img/chess-pieces/rook-black.png";
import bishopWhite from "../img/chess-pieces/bishop-white.png";
import bishopBlack from "../img/chess-pieces/bishop-black.png";
import knightWhite from "../img/chess-pieces/knight-white.png";
import knightBlack from "../img/chess-pieces/knight-black.png";
import queenWhite from "../img/chess-pieces/queen-white.png";
import queenBlack from "../img/chess-pieces/queen-black.png";
import kingWhite from "../img/chess-pieces/king-white.png";
import kingBlack from "../img/chess-pieces/king-black.png";

function ChessBoard(){

    const [board,setBoard] = useState([])

    useEffect(() => {
        createBoard()
    },[])

    function createBoard() {
        const newBoard = []

        for(let y=8;y>0;y--){
            const row = []
            for(let x=1;x<=8;x++){
                /*const squareColor = (x + y) % 2 === 0 ? "square-black" : "square-white"; Por ahora me parece inutil diferenciar de que color es la casilla*/
                let pieceInfo = setPieces(x,y)
                row.push(
                    <ChessSquare
                    key={`${x}${y}`}
                    x={x} 
                    y={y} 
                    pieceName={pieceInfo.name}
                    pieceColor={pieceInfo.color}
                    pieceImg={pieceInfo.img}
                    legalPieceMoves={legalPieceMoves}
                    >
                    </ChessSquare>
                );
            }
            newBoard.push(row)
        }
        setBoard(newBoard)
    }

    function setPieces(x,y) {
        if(y===2)
            return {name:"pawn",color:"white",img:pawnWhite}
        if(y===7)
            return {name:"pawn",color:"black",img:pawnBlack}
        if((x===1 && y===1) || (x===8 && y===1))
            return {name:"rook",color:"white",img:rookWhite}
        if((x===1 && y===8) || (x===8 && y===8))
            return {name:"rook",color:"black",img:rookBlack}
        if((x===2 && y===1) || (x===7 && y===1))
            return {name:"knight",color:"white",img:knightWhite}
        if((x===2 && y===8) || (x===7 && y===8))
            return {name:"knight",color:"black",img:knightBlack}
        if((x===3 && y===1) || (x===6 && y===1))
            return {name:"bishop",color:"white",img:bishopWhite}
        if((x===3 && y===8) || (x===6 && y===8))
            return {name:"bishop",color:"black",img:bishopBlack}
        if(x===4 && y===1)
            return {name:"queen",color:"white",img:queenWhite}
        if(x===4 && y===8)
            return {name:"queen",color:"black",img:queenBlack}
        if(x===5 && y===1)
            return {name:"king",color:"white",img:kingWhite}
        if(x===5 && y===8)
            return {name:"king",color:"black",img:kingBlack}
        else
            return {}
    }

    function squareHasPiece(x,y) {
        /* The `some()` method performs a mapping and checks if at least one element in the array satisfies the provided testing function */
        const hasPiece = board.some(row => 
            row.some(square => 
                square.key === `${x}${y}` && square.props.pieceName !== undefined
            )
        );

        return hasPiece
    }

    function squareHasEnemyPiece(x1,y1,x2,y2) {
        /* x1 and y1 are the coordinates of the first square and x2 and y2 of the second one. They are compared to know if has pieces of the same team or not */
        if(getPieceColor(x1,y1) === getPieceColor(x2,y2))
            return false
        else
            return true
    }

    function squareHasTeamPiece(x1,y1,x2,y2) {
        /* x1 and y1 are the coordinates of the first square and x2 and y2 of the second one. They are compared to know if has pieces of the same team or not */
        if(getPieceColor(x1,y1) === getPieceColor(x2,y2))
            return true
        else
            return false
    }

    function getPieceColor(x,y) {
        const hasWhiteColor = board.some(row => 
            row.some(square => 
                square.key === `${x}${y}` && square.props.pieceColor === "white"
            )
        );
        
        if(hasWhiteColor)
            return "white"
        else
            return "black"
    }

    function validCoordinate(x,y){
        if(x>=1 && x<=8 && y>=1 && y<=8)
            return true
        else
            return false
    }

    function possibleRookMoves(x,y) {
        /* x and y refers to the position of the rook. The function returns an array of square coordinates */
        const possibleMoves = []
        let xAux = x;
        let yAux = y;
        /* CODIGO NO MUY OPTIMO, CUANDO TENGO QUE VERIFICAR SI LA PIEZA ES ENEMIGA (TOMAR MOVIMIENTO) TAMBIEN DEBO VERIFICAR SI ES UNA COORDENADA VALIDA */
        xAux = xAux + 1 /* looking to the right */

        while(validCoordinate(xAux,yAux) && !squareHasPiece(xAux,yAux)){
            possibleMoves.push({x:xAux,y:yAux})
            xAux = xAux + 1
        }
        if(validCoordinate(xAux,yAux) && squareHasEnemyPiece(x,y,xAux,yAux)) /* If the square has a enemy piece, it´s a valid move, but you can´t go further in the same direction */
            possibleMoves.push({x:xAux,y:yAux})

        xAux = x - 1 /* looking to the left */
        while(validCoordinate(xAux,yAux) && !squareHasPiece(xAux,yAux)){
            possibleMoves.push({x:xAux,y:yAux})
            xAux = xAux - 1
        }
        if(validCoordinate(xAux,yAux) && squareHasEnemyPiece(x,y,xAux,yAux))
            possibleMoves.push({x:xAux,y:yAux})

        xAux = x
        yAux = y - 1 /* looking to the down */ 
        while(validCoordinate(xAux,yAux) && !squareHasPiece(xAux,yAux)){
            possibleMoves.push({x:xAux,y:yAux})
            yAux = yAux - 1
        }
        if(validCoordinate(xAux,yAux) && squareHasEnemyPiece(x,y,xAux,yAux))
            possibleMoves.push({x:xAux,y:yAux})

        yAux = y + 1 /* looking to the top */ 
        while(validCoordinate(xAux,yAux) && !squareHasPiece(xAux,yAux)){
            possibleMoves.push({x:xAux,y:yAux})
            yAux = yAux + 1
        }
        if(validCoordinate(xAux,yAux) && squareHasEnemyPiece(x,y,xAux,yAux))
            possibleMoves.push({x:xAux,y:yAux})
        
        return possibleMoves
    }

    function legalPieceMoves(x,y,name,pieceColor) {
        /* The legal moves includes the captures and it´s returns an array of the coordinates */
        if(squareHasPiece(x,y)){
            if(name === "rook")
                console.log(possibleRookMoves(x,y))
        }
        else
            console.log("No hay ninguna pieza en esa casilla")
    }

    return(
        <div id="board-border" className="container">
            <div id="board-container" className="container">
                {board}
            </div>
        </div>
        
    );
}

export default ChessBoard;