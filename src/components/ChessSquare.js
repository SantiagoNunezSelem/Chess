import React,{useState} from "react"
import "../stylesheets/ChessSquare.css";

function ChessSquare( {x,y,pieceName,pieceColor,pieceImg,clickCoordinates,infoSquareSelected,infoPossiblesMoves} ){

    //Tal vez me convenga gestionarlo con javascript
    let squareSelected = ""
    if(pieceName !== "" && infoSquareSelected.x === x && infoSquareSelected.y === y)
        squareSelected = "square-selected"

    let moveSymbol = ""
    let captureSymbol = ""
    if(Object.keys(infoPossiblesMoves).length !== 0){
        const isMoveSquare = infoPossiblesMoves.some(p => p.x === x && p.y === y)
        if(isMoveSquare){
            if(pieceName === "")
                moveSymbol = "square-move-symbol" 
            else
                captureSymbol = "square-capture-symbol"
        }
    }

    return(
        <div
            className={`chess-square ${squareSelected} ${moveSymbol} ${captureSymbol}`}

            onClick={() => clickCoordinates({x:x,y:y})}
            >
                {pieceName !== "" && 
                    <div 
                    className={`chess-piece ${pieceImg}`}
                    > 
                    </div>
                }
                
        </div>
    );
}

export default ChessSquare;