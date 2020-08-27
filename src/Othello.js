class Game{
	constructor(n=8){
		this.n=n;
	}
	_check_xy(board,player,x,y){
		const n=this.n;
		function check_dxy(x,y,dx,dy){
			x+=dx;
			y+=dy;
			if(x<0||y<0||x>=n||y>=n){
				return false;
			}
			if(board[y][x]!=-player){
				return false;
			}
			for(let j=0;j<n;j++){
				if(x<0||y<0||x>=n||y>=n){
					return false;
				}
				if(board[y][x]==0){
					return false;
				}
				if(board[y][x]==player){
					return true;
				}
				x+=dx;
				y+=dy;
			}
			return false;
		}
		if(board[y][x]!=0){
			return false;
		}
		const dxy=[[1,0],[1,1],[0,1],[-1,1],[-1,0],[-1,-1],[0,-1],[1,-1]];
		for(let d of dxy){
			if(check_dxy(x,y,d[0],d[1])){
				return true;
			}
		}
		return false;
	}
	_put_xy(board,player,x,y){
		const n=this.n;
		function check_dxy(x,y,dx,dy){
			x+=dx;
			y+=dy;
			if(x<0||y<0||x>=n||y>=n){
				return false;
			}
			if(board[y][x]!=-player){
				return false;
			}
			for(let j=0;j<n;j++){
				if(x<0||y<0||x>=n||y>=n){
					return false;
				}
				if(board[y][x]==0){
					return false;
				}
				if(board[y][x]==player){
					for(let i=0;i<n;i++){
						x-=dx;
						y-=dy;
						if(board[y][x]==player){
							return true;
						}
						board[y][x]=player;
					}
				}
				x+=dx;
				y+=dy;
			}
			return false;
		}
		board[y][x]=player;
		const dxy=[[1,0],[1,1],[0,1],[-1,1],[-1,0],[-1,-1],[0,-1],[1,-1]];
		for(let d of dxy){
			check_dxy(x,y,d[0],d[1])
		}
		return board;
	}
	getInitBoard(){
		var board= [];
		for(let y=0;y<this.n;y++){
			board[y]=Array(this.n).fill(0);
		}
		board[Math.floor(this.n/2)][Math.floor(this.n/2)]=-1
		board[Math.floor(this.n/2)-1][Math.floor(this.n/2)-1]=-1;
		board[Math.floor(this.n/2)-1][Math.floor(this.n/2)]=1
		board[Math.floor(this.n/2)][Math.floor(this.n/2)-1]=1;
		return board
	}
	getBoardSize(){
		return {w:this.n,h:this.n};
	}
	getActionSize(){
		return this.n**2+1;
	}
	getNextState(board,player=1,action=0){
		if(action==this.n**2){
			return board;
		}
		let x=action%this.n;
		let y=Math.floor(action/this.n);
		board=this._put_xy(board,player,x,y);
		return board;
	}
	getValidMoves(board,player=1){
		let ret=new Array(this.n**2+1).fill(0);
		let has_legal_action=false;
		for(let x=0;x<this.n;x++){
			for(let y=0;y<this.n;y++){
				if(this._check_xy(board,player,x,y)){
					ret[y*this.n+x]=1;
					has_legal_action=true;
				}
			}
		}
		if(!has_legal_action){
			ret[this.n**2]=1;
		}
		return ret;
	}
	getGameEnded(board,player=1){
		let player1=0,player2=0;
		for(let x=0;x<this.n;x++){
			for(let y=0;y<this.n;y++){
				if(board[y][x]==1){
					player1++;
				}else if(board[y][x]==-1){
					player2++;
				}
			}
		}
		if(player1+player2<this.n**2){
			if(this.getValidMoves(board,player)[this.n**2]+this.getValidMoves(board,-player)[this.n**2]!=2){
				return 0;
			}
		}
		if(player1>player2){
			return 1;
		}else if(player2>player1){
			return -1;
		}
		return 1e-4;
	}
	stringRepresentation(board){
		return JSON.stringify(board);
	}
	getInput(ev){
		const tilesize=40;
		let mx=ev.clientX-ev.target.getBoundingClientRect().left-tilesize/2;
		let my=ev.clientY-ev.target.getBoundingClientRect().top-tilesize/2;
		let a=Math.floor(my/tilesize)*this.n+Math.floor(mx/tilesize);
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