import React,{useState,useEffect} from "react";
import "../stylesheets/ChessBoard.css";
import ChessSquare from "./ChessSquare.js";
import PromotionMenu from "./PromotionMenu.js";


function ChessBoard(){

    const [board,setBoard] = useState([])

    const [pieces,setPieces] = useState([])

    const [clickCoordinates,setClickCoordinates] = useState({})

    const [pieceMoveCoordinates,setPieceMoveCoordinates] = useState({}) //Coordinates of the piece that you want to move

    const [destinationMoveCoordinates,setDestinationMoveCoordinates] = useState({}) //Cordinates of the destination

    const [possibleMoves,setPossibleMoves] = useState({}) //Coordinates of the movements that the selected piece can make

    const [gameTurn,setGameTurn] = useState(1) //Odd number: White's turn. Even Number: Black's turn

    const [promotionMenu,setPromotionMenu] = useState({})

    useEffect(() => {
        if(pieces.length === 0){
            setInitialPieces()
        }
        createBoard()
    },[pieces,possibleMoves,clickCoordinates])

    useEffect(() => {
        //Takes the coordinates where the square was clicked in order to store them
        saveCoordinates()
    },[clickCoordinates])

    useEffect(() => {
        /*When a change is made to destinationMoveCoordinates, a move must be made. I must do it in a different useEffect since otherwise there will be no time for the data to be updated */
        if(Object.keys(destinationMoveCoordinates).length !== 0){
            handlePieceMove()
        }
    },[destinationMoveCoordinates])

    useEffect(() => {
        /* Every time the value of pieceMoveCoordinates is updated I want to store the coordinates of the squares where it can be moved */
        if(squareHasPiece(pieceMoveCoordinates.x,pieceMoveCoordinates.y))
            setPossibleMoves(legalPieceMoves(pieceMoveCoordinates.x,pieceMoveCoordinates.y))

        if(Object.keys(pieceMoveCoordinates).length === 0)
            setPossibleMoves({})
    },[pieceMoveCoordinates])

    useEffect(() => {
        if(Object.keys(promotionMenu).length !== 0){
            if(promotionMenu.pieceSelected !== ""){
                movePiecePromotion()
            }
        }
        else{
            setClickCoordinates({x:null,y:null})
            setDestinationMoveCoordinates({})
        }
    },[promotionMenu])

    function createBoard() {
        const newBoard = []

        for(let y=8;y>0;y--){
            const row = []
            for(let x=1;x<=8;x++){

                let pieceInfo = {name:"",color:String,imgClassName:String}
                pieces.forEach(p => {
                    if(p.x === x && p.y === y){
                        pieceInfo = {name:p.name, color:p.color, imgClassName:p.img}
                    }
                })

                row.push(
                    <ChessSquare
                    key={`${x}${y}`}
                    x={x} 
                    y={y} 
                    pieceName={pieceInfo.name}
                    pieceColor={pieceInfo.color}
                    pieceImg={pieceInfo.imgClassName}
                    clickCoordinates={setClickCoordinates}
                    infoSquareSelected={clickCoordinates}
                    infoPossiblesMoves={possibleMoves}
                    >
                    </ChessSquare>
                );
            }
            newBoard.push(row)
        }
        setBoard(newBoard)
    }

    function setInitialPieces() {
        const newPieces = []

        let pieceColor = ""

        for(let i=1;i<=8;i++){
            newPieces.push({name:"pawn",color:"White",img:"pawnWhite",x:i,y:2})
        }

        for(let i=1;i<=8;i++){
            newPieces.push({name:"pawn",color:"Black",img:"pawnBlack",x:i,y:7})
        }

        for(let i=1;i<=8;i=i+7){
            i === 1 ? pieceColor="White" : pieceColor="Black"

            newPieces.push({name:"rook",color:pieceColor,img:"rook"+pieceColor,x:1,y:i})
            newPieces.push({name:"rook",color:pieceColor,img:"rook"+pieceColor,x:8,y:i})

            newPieces.push({name:"knight",color:pieceColor,img:"knight"+pieceColor,x:2,y:i})
            newPieces.push({name:"knight",color:pieceColor,img:"knight"+pieceColor,x:7,y:i})

            newPieces.push({name:"bishop",color:pieceColor,img:"bishop"+pieceColor,x:3,y:i})
            newPieces.push({name:"bishop",color:pieceColor,img:"bishop"+pieceColor,x:6,y:i})

            newPieces.push({name:"queen",color:pieceColor,img:"queen"+pieceColor,x:4,y:i})

            newPieces.push({name:"king",color:pieceColor,img:"king"+pieceColor,x:5,y:i})
        }

        newPieces.push({name:"pawn",color:"White",img:"pawnWhite",x:6,y:6})
        //newPieces.push({name:"queen",color:"White",img:"queenWhite",x:4,y:4})

        setPieces(newPieces)
    }

    function closePromotionMenu() {
        setPromotionMenu({})
    }

    function setPromotionPiece(pieceName) {
        const newPromotionMenu = {...promotionMenu}
        newPromotionMenu.pieceSelected = pieceName

        setPromotionMenu(newPromotionMenu)
    }

    function isWhiteTurn() {
        console.log(gameTurn)
        return gameTurn % 2 === 1 //Odd number: White's turn. Even Number: Black's turn
    }

    function saveCoordinates() {
        const x = clickCoordinates.x
        const y = clickCoordinates.y
        //The coordinates of the click will be stored as the selected piece or as the destination coordinates of the movement

        //Possible cases
        //1- Para definir pieceMoveCoordinates tiene que haber una pieza que pertenezca al jugador del que es el turno
        //2- The first click is on a square without a piece => do not save the coordinates
        //3- The first click is on a square with a piece => save the coordinates in pieceMoveCoordinates
        //4- The second click is on a square without a piece or with an enemy piece => save the coordinates in destinationMoveCoordinates
        //5- The second click is on a square with an allied piece => save the coordinates in pieceMoveCoordinates

        if(validCoordinate(x,y)){
            if(Object.keys(pieceMoveCoordinates).length === 0){
                if(squareHasPiece(x,y)) //2 and 3
                    
                    if(pieceIsWhite(x,y) === isWhiteTurn()) //1
                            setPieceMoveCoordinates(clickCoordinates) 
            }
            else{
                const xPieceMove = pieceMoveCoordinates.x
                const yPieceMove = pieceMoveCoordinates.y
    
                if(squareHasPiece(x,y) && !squareHasEnemyPiece(xPieceMove,yPieceMove,x,y)){
                    setPieceMoveCoordinates(clickCoordinates) //5
                }
                else{
                    setDestinationMoveCoordinates(clickCoordinates) //4
                }
            }
        }
        
    }

    function handlePieceMove() {
        const x1 = pieceMoveCoordinates.x
        const y1 = pieceMoveCoordinates.y

        const x2 = destinationMoveCoordinates.x
        const y2 = destinationMoveCoordinates.y

        //I must verify if the destination coordinates correspond to a valid movement for the selected piece
        const legalMoves = legalPieceMoves(x1,y1) //It returns an array of coordinates

        const possibleMove = legalMoves.some(p => {
            return p.x === x2 && p.y === y2
        })

        if(possibleMove){
            const isSpecialMove = handleSpecialMoves(x1,y1,x2,y2)

            if(isSpecialMove){
                return null
            }
            movePiece(x1,y1,x2,y2)
            setGameTurn(gameTurn+1)
        }
        
        setClickCoordinates({x:null,y:null})
        setPieceMoveCoordinates({})
        setDestinationMoveCoordinates({})
    }

    function movePiece(x1,y1,x2,y2) {
        
        if(squareHasPiece(x1,y1)){

            let newPosition = pieces

            if(squareHasPiece(x2,y2)){

                if(squareHasEnemyPiece(x1,y1,x2,y2))
                    newPosition = newPosition.filter(piece => !(piece.x === x2 && piece.y === y2)); //Kill the enemy piece
                else
                    return -1 //Error

            }
            
            //Move the piece
            newPosition = newPosition.map(piece => {
                const updatedPiece = { ...piece };
                if (piece.x === x1 && piece.y === y1) {
                    updatedPiece.x = x2;
                    updatedPiece.y = y2;
                }
                return updatedPiece;
            });

            //Remove the piece from the past position
            newPosition = newPosition.filter(piece => !(piece.x === x1 && piece.y === y1));

            setPieces(newPosition)
        }
    }

    function handleSpecialMoves(x1,y1,x2,y2){
        if(squareHasPiece(x1,y1)){
            //Pawn promotion (white)
            if(y1 === 7 && getPieceName(x1,y1) === "pawn" && pieceIsWhite(x1,y1)){
                setPromotionMenu({
                    active:true,
                    pieceColor:"White",
                    pieceSelected:"",
                    x:x2
                })
                return true
            }

            //Pawn promotion (black)
            if(y1 === 2 && getPieceName(x1,y1) === "pawn" && !pieceIsWhite(x1,y1)){
                setPromotionMenu({
                    active:true,
                    pieceColor:"Black",
                    pieceSelected:"",
                    x:x2
                })
                return true
            }

            //The condition about if it´s possible to castle was made on possibleKingMoves
            //Castle (white) 
            if(x1 === 5 && y1 === 1 && getPieceName(x1,y1) === "king"){
                //Long castle
                if(x2 === 3 && y2 === 1){
                    movePiecesCastle(x1,y1,x2,y2,1,1,4,1)
                    return true
                }
                //Short castle
                if(x2 === 7 && y2 === 1){
                    movePiecesCastle(x1,y1,x2,y2,8,1,6,1)
                    return true
                }
            }

            //Castle (black)
            if(x1 === 5 && y1 === 8 && getPieceName(x1,y1) === "king"){
                //Long castle
                if(x2 === 3 && y2 === 8){
                    movePiecesCastle(x1,y1,x2,y2,1,8,4,8)
                    return true
                }
                //Short castle
                if(x2 === 7 && y2 === 8){
                    movePiecesCastle(x1,y1,x2,y2,8,8,6,8)
                    return true
                }
            }
        }
    }

    function movePiecePromotion(){
        const x1 = pieceMoveCoordinates.x
        const y1 = pieceMoveCoordinates.y

        const x2 = destinationMoveCoordinates.x
        const y2 = destinationMoveCoordinates.y

        const namePiece = promotionMenu.pieceSelected
        const pieceColor = promotionMenu.pieceColor

        let newPosition = pieces
        if(squareHasPiece(x2,y2)){

            if(squareHasEnemyPiece(x1,y1,x2,y2))
                newPosition = newPosition.filter(piece => !(piece.x === x2 && piece.y === y2)); //Kill the enemy piece
            else
                return -1 //Error
        }

        //Remove the pawn
        newPosition = newPosition.filter(piece => !(piece.x === x1 && piece.y === y1));

        //Add the promoted piece
        newPosition.push({name:namePiece,color:pieceColor,img:namePiece+pieceColor,x:x2,y:y2})

        closePromotionMenu()

        setPieces(newPosition)

        setGameTurn(gameTurn+1)

        setClickCoordinates({x:null,y:null})
        setPieceMoveCoordinates({})
        setDestinationMoveCoordinates({})
    }

    function movePiecesCastle(x1,y1,x2,y2,x1Rook,y1Rook,x2Rook,y2Rook) {
        
        if(squareHasPiece(x1,y1) && squareHasPiece(x1Rook,y1Rook)){
            console.log("entro")
            let newPosition = pieces

            //Move the king
            newPosition = newPosition.map(piece => {
                const updatedPiece = { ...piece }
                if (piece.x === x1 && piece.y === y1) {
                    updatedPiece.x = x2
                    updatedPiece.y = y2
                }
                return updatedPiece;
            });

            //Move the rook
            newPosition = newPosition.map(piece => {
                const updatedPiece = { ...piece }
                if (piece.x === x1Rook && piece.y === y1Rook) {
                    updatedPiece.x = x2Rook
                    updatedPiece.y = y2Rook
                }
                return updatedPiece;
            });

            //Remove the piece from the past position
            newPosition = newPosition.filter(piece => !(piece.x === x1 && piece.y === y1))
            newPosition = newPosition.filter(piece => !(piece.x === x1Rook && piece.y === y1Rook))

            setPieces(newPosition)
            setGameTurn(gameTurn+1)
        }

        setClickCoordinates({x:null,y:null})
        setPieceMoveCoordinates({})
        setDestinationMoveCoordinates({})
    }

    function squareHasPiece(x,y) {
        return pieces.some(piece => piece.x === x && piece.y === y)
    }

    function bothSquaresHasPieces(x1,y1,x2,y2) {
        if(squareHasPiece(x1,y1) && squareHasPiece(x2,y2))
            return true
        else
            return false
    }

    function squareHasEnemyPiece(x1,y1,x2,y2) {
        /* x1 and y1 are the coordinates of the first square and x2 and y2 of the second one. They are compared to know if has pieces of the same team or not */
        if(pieceIsWhite(x1,y1) === pieceIsWhite(x2,y2))
            return false
        else
            return true
    }

    function pieceIsWhite(x,y) {
        const piece = pieces.find(piece => piece.x === x && piece.y === y)
        if(piece.color === "White")
            return true
        else
            return false  
    }

    function getPieceName(x,y) {
        const piece = pieces.find(piece => piece.x === x && piece.y === y)

        return piece.name
    }

    function validCoordinate(x,y){
        if(x>=1 && x<=8 && y>=1 && y<=8)
            return true
        else
            return false
    }

    function possiblePawnMoves(x,y) {
        //If the pawn is white it can move to y+1, in case of captures y+1 x+1 or y+1 x-1, if it is at y=2 it can also move to y+2
        //If the pawn is black it can move to y-1, in case of captures y-1 x+1 or y-1 x-1, if it is at y=7 it can also move to y-2
        let possibleMoves = []
        
        if(pieceIsWhite(x,y)){
            if(validCoordinate(x,y+1) && !squareHasPiece(x,y+1)){
                possibleMoves.push({x:x,y:y+1})

                if(y === 2 && !squareHasPiece(x,y+2))
                possibleMoves.push({x:x,y:y+2}) 
            }

            if(validCoordinate(x-1,y+1) && squareHasPiece(x-1,y+1) && squareHasEnemyPiece(x,y,x-1,y+1))
                possibleMoves.push({x:x-1,y:y+1})

            if(validCoordinate(x+1,y+1) && squareHasPiece(x+1,y+1) && squareHasEnemyPiece(x,y,x+1,y+1))
                possibleMoves.push({x:x+1,y:y+1})
        }
        else{
            if(validCoordinate(x,y-1) && !squareHasPiece(x,y-1)){
                possibleMoves.push({x:x,y:y-1})

                if(y === 7 && !squareHasPiece(x,y-2))
                possibleMoves.push({x:x,y:y-2}) 
            }   

            if(validCoordinate(x-1,y-1) && squareHasPiece(x-1,y-1) && squareHasEnemyPiece(x,y,x-1,y-1))
                possibleMoves.push({x:x-1,y:y-1})

            if(validCoordinate(x+1,y-1) && squareHasPiece(x+1,y-1) && squareHasEnemyPiece(x,y,x+1,y-1))
                possibleMoves.push({x:x+1,y:y-1})
        }

        return possibleMoves 
    }

    function possibleRookMoves(x,y) {
        return possibleVerticalHorizontalMoves(x,y)
    }

    function possibleBishopMoves(x,y) {
        return possibleDiagonalMoves(x,y)
    }

    function possibleKnightMoves(x,y) {
        const possibleMoves = []

        //Left and right (4 moves)
        for(let i=0;i<5;i+=4){
            const xAux = x+i-2
            if(validCoordinate(xAux,y+1) && (!squareHasPiece(xAux,y+1) || squareHasEnemyPiece(x,y,xAux,y+1)))
                possibleMoves.push({x:xAux,y:y+1})
            
            if(validCoordinate(xAux,y-1) && (!squareHasPiece(xAux,y-1) || squareHasEnemyPiece(x,y,xAux,y-1)))
                possibleMoves.push({x:xAux,y:y-1})
        }

        for(let i=0;i<5;i+=4){
            const yAux = y+i-2
            if(validCoordinate(x+1,yAux) && (!squareHasPiece(x+1,yAux) || squareHasEnemyPiece(x,y,x+1,yAux)))
                possibleMoves.push({x:x+1,y:yAux})
            
            if(validCoordinate(x-1,yAux) && (!squareHasPiece(x-1,yAux) || squareHasEnemyPiece(x,y,x-1,yAux)))
                possibleMoves.push({x:x-1,y:yAux})
        }

        return possibleMoves
    }

    function possibleQueenMoves(x,y) {
        let possibleMoves = []
        
        const possibleVHMoves = possibleVerticalHorizontalMoves(x,y)
        const possibleDMoves = possibleDiagonalMoves(x,y)

        possibleMoves = possibleVHMoves.concat(possibleDMoves)

        return possibleMoves
    }

    function possibleKingMoves(x,y) {
        const possibleMoves = []

        for(let xAux=-1;xAux<2;xAux++){
            for(let yAux=-1;yAux<2;yAux++){
                if(validCoordinate(x+xAux,y+yAux) && !(x === xAux && y === yAux))

                    if(!squareHasPiece(x+xAux,y+yAux) || squareHasEnemyPiece(x,y,x+xAux,y+yAux))
                        possibleMoves.push({x:x+xAux,y:y+yAux})
            }
        }
        
        //Castle
        if(pieceIsWhite(x,y)){
            if(x === 5 && y === 1){
                //Long castle (white pieces)
                if(!squareHasPiece(2,1) && !squareHasPiece(3,1) && !squareHasPiece(4,1)){
                    if(squareHasPiece(1,1) && !squareHasEnemyPiece(1,1,5,1) && getPieceName(1,1) === "rook"){
                        possibleMoves.push({x:3,y:1})
                    }
                }

                //Shor castle (white pieces)
                if(!squareHasPiece(6,1) && !squareHasPiece(7,1)){
                    if(squareHasPiece(8,1) && !squareHasEnemyPiece(8,1,5,1) && getPieceName(8,1) === "rook"){
                        possibleMoves.push({x:7,y:1})
                    }
                }
            }
        }
        else{
            if(x === 5 && y === 8){
                //Long castle (black pieces)
                if(!squareHasPiece(2,8) && !squareHasPiece(3,8) && !squareHasPiece(4,8)){
                    if(squareHasPiece(1,8) && !squareHasEnemyPiece(1,8,5,8) && getPieceName(1,8) === "rook"){
                        possibleMoves.push({x:3,y:8})
                    }
                }

                //Shor castle (black pieces)
                if(!squareHasPiece(6,8) && !squareHasPiece(7,8)){
                    if(squareHasPiece(8,8) && !squareHasEnemyPiece(8,8,5,8) && getPieceName(8,8) === "rook"){
                        possibleMoves.push({x:7,y:8})
                    }
                }
            }
        }

        return possibleMoves
    }

    function possibleVerticalHorizontalMoves(x,y) {
        /* x and y refers to the position of the piece. The function returns an array of square coordinates */
        const possibleMoves = []
        let xAux = x
        let yAux = y

        xAux = x + 1 /* looking to the right */
        while(validCoordinate(xAux,yAux) && !squareHasPiece(xAux,yAux)){
            possibleMoves.push({x:xAux,y:yAux})
            xAux ++
        }
        if(validCoordinate(xAux,yAux) && squareHasEnemyPiece(x,y,xAux,yAux)) /* If the square has a enemy piece, it´s a valid move, but you can´t go further in the same direction */
            possibleMoves.push({x:xAux,y:yAux})

        xAux = x - 1 /* looking to the left */
        while(validCoordinate(xAux,yAux) && !squareHasPiece(xAux,yAux)){
            possibleMoves.push({x:xAux,y:yAux})
            xAux --
        }
        if(validCoordinate(xAux,yAux) && squareHasEnemyPiece(x,y,xAux,yAux))
            possibleMoves.push({x:xAux,y:yAux})

        xAux = x
        yAux = y - 1 /* looking down */ 
        while(validCoordinate(xAux,yAux) && !squareHasPiece(xAux,yAux)){
            possibleMoves.push({x:xAux,y:yAux})
            yAux --
        }
        if(validCoordinate(xAux,yAux) && squareHasEnemyPiece(x,y,xAux,yAux))
            possibleMoves.push({x:xAux,y:yAux})

        yAux = y + 1 /* looking to the top */ 
        while(validCoordinate(xAux,yAux) && !squareHasPiece(xAux,yAux)){
            possibleMoves.push({x:xAux,y:yAux})
            yAux ++
        }
        if(validCoordinate(xAux,yAux) && squareHasEnemyPiece(x,y,xAux,yAux))
            possibleMoves.push({x:xAux,y:yAux})
        
        return possibleMoves
    }

    function possibleDiagonalMoves(x,y) {
       /* x and y refers to the position of the piece. The function returns an array of square coordinates */
        const possibleMoves = []
        let xAux = x
        let yAux = y

        xAux = x + 1 
        yAux = y + 1 /* looking to the top-right */
        while(validCoordinate(xAux,yAux) && !squareHasPiece(xAux,yAux)){
            possibleMoves.push({x:xAux,y:yAux})
            xAux ++
            yAux ++
        }
        if(validCoordinate(xAux,yAux) && squareHasEnemyPiece(x,y,xAux,yAux)) /* If the square has a enemy piece, it´s a valid move, but you can´t go further in the same direction */
            possibleMoves.push({x:xAux,y:yAux})

        xAux = x - 1 
        yAux = y + 1 /* looking to the top-left */
        while(validCoordinate(xAux,yAux) && !squareHasPiece(xAux,yAux)){
            possibleMoves.push({x:xAux,y:yAux})
            xAux --
            yAux ++
        }
        if(validCoordinate(xAux,yAux) && squareHasEnemyPiece(x,y,xAux,yAux))
            possibleMoves.push({x:xAux,y:yAux})

        xAux = x + 1
        yAux = y - 1 /* looking down-right */ 
        while(validCoordinate(xAux,yAux) && !squareHasPiece(xAux,yAux)){
            possibleMoves.push({x:xAux,y:yAux})
            xAux ++
            yAux --
        }
        if(validCoordinate(xAux,yAux) && squareHasEnemyPiece(x,y,xAux,yAux))
            possibleMoves.push({x:xAux,y:yAux})

        xAux = x - 1 
        yAux = y - 1 /* looking down-left */ 
        while(validCoordinate(xAux,yAux) && !squareHasPiece(xAux,yAux)){
            possibleMoves.push({x:xAux,y:yAux})
            xAux --
            yAux --
        }
        if(validCoordinate(xAux,yAux) && squareHasEnemyPiece(x,y,xAux,yAux))
            possibleMoves.push({x:xAux,y:yAux})
        
        return possibleMoves
    }

    function legalPieceMoves(x,y) {
        /* The legal moves includes the captures and it returns an array of the coordinates */
        const pieceName = getPieceName(x,y)
        if(pieceName === "pawn")
            return possiblePawnMoves(x,y)
        if(pieceName === "rook")
            return possibleRookMoves(x,y)
        if(pieceName === "bishop")
            return possibleBishopMoves(x,y)
        if(pieceName === "knight")
            return possibleKnightMoves(x,y)
        if(pieceName === "queen")
            return possibleQueenMoves(x,y)
        if(pieceName === "king")
            return possibleKingMoves(x,y)
                
        return [{x:null,y:null}]
    }

    function piezaClavada() {
        // Se analiza si la pieza seleccionada se enucentra clavada en alguna direccion
        // Sin importar la pieza aliada se analiza si existe una diagonal, vertical u horizantal en el que el rey sea la primera pieza encontrada
        // En tal caso se analiza si en dicha vertical/horizontal u diagonal en sentido contrario existe una pieza enemiga que amenaze en dicha direccion.
        // Si se encuentra una pieza enemiga que amenaze en dicha direccion, la pieza aliada no podra moverse en otra direccion que no sea la amenaza.
        // Ejemplo: tengo un peon que esta en diagonal a mi rey, busco en dicha diagonal si hay pienza enemiga. hay pieza enemiga y es una dama. Entonces el peon solo podra moverse en dicha diagonal.
    }

    function legalMoveProtectKing() {
        // Si el estado es check = true, se analizan los movimientos legales de las piezas aliadas para protejer el rey.
        // Si la pieza que hace jaque es un caballo y es unica, solo se puede mover el rey o capturar el caballo.
        // Si la pieza que hace jaque es una pieza que se mueve en linea (torre, alfil, dama) y es unica, se puede mover el rey, capturar la pieza o interponerse entre la pieza y el rey.
    }

    function squareUnderAttack() {
        // Se analiza si la casilla se encuentra amenazada por alguna pieza enemiga
    }

    function isCheck() {
        // SquareUnderAttack(king); // se analiza si el rey esta bajo ataque luego del movimiento del rival
        

        // isCheckMate: analizar si es jaquemate
        // Si no es jaquemate:
            // definir estado: setCheck(true);
            // guardar la posicion de la pieza/s que hace jaque y la posicion del rey amenazado
    }

    function isCheckMate() {
        // 1- Se analiza si el rey tiene movimientos legales. Dentro de la funcion movimientos legales tienen que estar la funcion squareUnderAttack por cada uno.
        // 2- En caso de ser solo una pieza que hace jaque:
            // 2.1 Se analiza si alguna pieza puede capturar la pieza que esta haciendo jaque.
            // 2.2 Se analiza si alguna pieza puede interponerse entre la pieza que hace jaque y el rey.
        // Si ninguna de las condiciones se cumple, es jaquemate. handleCheckMate()
        // Si alguna de las condiciones se cumple, se permite al jugador continuar con el juego y el debera tocar la pieza que le permita defender su rey.
    }

    function handleCheckMate() {
        // Finaliza el juego
    }

    function isStaleMate() {
        // Se analiza si el jugador que tiene el turno no tiene movimientos legales y su rey no esta en jaque.
        // Se analiza si hay material suficiente para continuar la partida.
        // En caso de cumplirse las condiciones, se declara tablas.
    }

    function handleStaleMate() {
        // Finaliza el juego
    }

    return(
        <div id="board-border" className="container">
            <div id="board-container" className="container board">
                {board}
                <PromotionMenu data={promotionMenu} closeMenu={closePromotionMenu} setPromotionPiece={setPromotionPiece}/>
            </div>
        </div>
        
    );
}

export default ChessBoard;
