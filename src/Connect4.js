class Game{
	constructor(w=7,h=6){
		this.w=w;
		this.h=h;
	}
	getInitBoard(){
		var board= Array(this.h);
		for(var y=0;y<this.h;y++){
			board[y]=Array(this.w).fill(0)
		}
		return board
	}
	getBoardSize(){
		return {w:this.w,h:this.h};
	}
	getActionSize(){
		return this.w;
	}
	getNextState(board,player=1,action=0){
		for(let y=this.h-1;y>=0;y--)
			if((board[y])[action]==0){
				board[y][action]=player;
				return board;
			}
		return board;
	}
	getValidMoves(board,player=1){
		let ret=new Array(this.w).fill(1);
		for(let i=0;i<this.w;i++){
			if(board[0][i]!=0){
				ret[i]=0;
			}
		}
		return ret;
	}
	getGameEnded(board,player=1){
		const is_comp=(x,y,dx,dy,player)=>{
			for(let k=0;k<4;k++){
				if(x<0||x>this.w-1||y<0||y>this.h-1){
					return false;
				}else if(board[y][x]!=player){
					return false;
				}else{
					x+=dx;
					y+=dy;
				}
			}
			return true;
		}

		for(let x=0;x<this.w;x++){
			for(let y=0;y<this.h;y++){
				if(is_comp(x,y,1,0,1)||is_comp(x,y,0,1,1)||is_comp(x,y,1,1,1)||is_comp(x,y,1,-1,1)){
					return 1;
				}else if(is_comp(x,y,1,0,-1)||is_comp(x,y,0,1,-1)||is_comp(x,y,1,1,-1)||is_comp(x,y,1,-1,-1)){
					return -1;
				}
			}
		}

		if(this.getValidMoves(board,player).reduce((x,y)=>x+y)==0){
			return 1e-4;
		}

		return 0
	}
	stringRepresentation(board){
		return JSON.stringify(board);
	}
	getInput(ev){
		const tilesize=40;
		var mx=ev.clientX-ev.target.getBoundingClientRect().left-tilesize/2;
		var a=Math.floor(mx/tilesize);
		return a;
	}
	draw(board,ctx){
		const tilesize=40;
		const {w,h}=this.getBoardSize()
		ctx.clearRect(0,0,(w+1)*tilesize,(h+1)*tilesize);
		ctx.beginPath();
		ctx.strokeStyle="#000";
		for(var x=0;x<w;x++){
			ctx.moveTo((x+1)*tilesize,0);
			ctx.lineTo((x+1)*tilesize,(h+1)*App.tilesize);
		}
		for(var y=0;y<h;y++){
			ctx.moveTo(0,(y+1)*tilesize);
			ctx.lineTo((w+1)*tilesize,(y+1)*tilesize);
		}
		ctx.stroke();
		for(var x=0;x<w;x++){
			for(var y=0;y<h;y++){
				if(board[y][x]==1){
					ctx.strokeStyle="#09D";
				}else if(board[y][x]==-1){
					ctx.strokeStyle="#D08";
				}else{
					continue;
				}
				ctx.beginPath();
				ctx.arc((x+1)*tilesize,(y+1)*tilesize,tilesize/2-2,0,6.3);
				ctx.stroke();
			}
		}
	}
}