import React,{useState} from "react"
import "../stylesheets/ChessSquare.css";

function ChessSquare( {x,y,pieceName,pieceColor,pieceImg,legalPieceMoves} ){

    const [legalMoves,setLegalMoves] = useState([])

    return(
        <div className="chess-square" onClickCapture={() => setLegalMoves(legalPieceMoves(x,y,pieceName,pieceColor))}>
            <img src={pieceImg}/>
        </div>
    );
}

export default ChessSquare;