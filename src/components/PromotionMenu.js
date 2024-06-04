import React from 'react'
import "../stylesheets/PromotionMenu.css"

function PromotionMenu( {data, closeMenu, setPromotionPiece} ) {
    const styleContainer = {
        left: `${12.5 * (data.x-1)}%`,
        top:0
    }

    if(data.pieceColor === "Black"){
        styleContainer.top = "50%"
    }

    return (
    <>
    {data.active === true &&
        <div id="promotion-menu-background">
            <div id="promotion-menu-container" style={styleContainer}>
            <div 
                className={`chess-piece knight${data.pieceColor}`}
                onClick={()=>setPromotionPiece("knight")}
            >
            </div>
            <div 
                className={`chess-piece bishop${data.pieceColor}`}
                onClick={()=>setPromotionPiece("bishop")}
            >
            </div>
            <div 
                className={`chess-piece rook${data.pieceColor}`}
                onClick={()=>setPromotionPiece("rook")}
            >
            </div>
            <div 
                className={`chess-piece queen${data.pieceColor}`}
                onClick={()=>setPromotionPiece("queen")}
            >
            </div>
            <div onClick={closeMenu}>X</div>
            </div>
        </div>
    }
    </>
    )
}

export default PromotionMenu
