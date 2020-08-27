export class Game{
	constructor(){
		throw "No implemention";
	}
	getInitBoard(){
		throw "No implemention";
		return new Int8Array(0);
	}
	getBoardSize(){
		throw "No implemention";
		return {w:0,h:0};
	}
	getActionSize(){
		throw "No implemention";
		return 0;
	}
	getNextState(board,player,action){
		throw "No implemention";
		return {state:new Int8Array(),player:1}
	}
	getValidMoves(board,plyer){
		throw "No implemention";
		return new Int8Array()
	}
	getGameEnded(board,player){
		throw "No implemention";
		return false
	}
	getCanonicalForm(board, player){
		throw "No implemention";
		return new Int8Array()
	}
	stringRepresentation(board){
		throw "No implemention";
		return ""
	}
	getInput(ev){
		throw "No implemention";
	}
	draw(board,ctx){
		throw "No implemention";
	}
}