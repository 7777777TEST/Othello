var App=App||{};
App.args = {
	lr: 0.001,
	dropout: 0.3,
	batch_size: 64,
	cuda: false,
	num_channels: 512,
	numMCTSSims:50,
	cpuct:1.0
};
App.canvas=document.getElementById("canvas");
App.ctx=App.canvas.getContext("2d");
App.status=document.getElementById("status");
App.game=new Game()
App.board=App.game.getInitBoard();
const {w,h}=App.game.getBoardSize();
App.tilesize=40;
App.player=1;
App.canvas.width=App.tilesize*(w+1);
App.canvas.height=App.tilesize*(h+3);
App.ctx.lineWidth=1.0;
App.nnet=new NNetWrapper(App.game,App.args);
App.nnet.loadPretrained("https://7777777TEST.github.io/Othello/othello-model/model.json").then((e)=>{
	console.log("Loaded model");
App.start_player=1;
});
App.compute=()=>{
	let choice=(p=[0.0],values=null)=>{
		if (!values || values.length !== p.length) {
			values = [];
			for (let i = 0; i < p.length; i++) {
				values.push(i);
			}
		}
		const rand=Math.random()
		let sum=0;
		for(let i=0;i<p.length;i++){
			sum+=p[i];
			if(rand<sum)return values[i];
		}
		return values[values.length-1];
	}
	let mcts=new MCTS(App.game,App.nnet,App.args);
	const board=App.board.map((arr_val)=>arr_val.map((v)=>v*App.player));
	console.log(board)
	const probs=mcts.getActionProb(JSON.parse(JSON.stringify(board)),0.3);
	console.log(probs);
	const a=choice(probs);
	App.board=App.game.getNextState(App.board,App.player,a);
	App.player*=-1;
	App.locked=false;
	App.status.textContent="";
	App.game.draw(App.board,App.ctx);
	const game_state=App.game.getGameEnded(App.board,App.player)
	if(game_state!=0){
		if(game_state==1e-4){
			alert("DRAW");
		}else{
			alert("Player "+game_state+" wins!")
		}
		return;
	}
}
App.game.draw(App.board,App.ctx);
//App.locked=true;
App.canvas.addEventListener("click",(ev)=>{
	if(App.locked)return;
	if(App.game.getGameEnded(App.board,App.player)!=0){
		App.board=App.game.getInitBoard();
		App.player=1;
		App.start_player*=-1;
		alert("RESTART");
		App.game.draw(App.board,App.ctx);
		if(App.start_player==1){
			return;
		}
		App.locked=true;
		App.status.textContent="Thinking..";
		setTimeout(App.compute,100)
		return;
	}
	let a=App.game.getInput(ev,App.player);
	if(a<0||a>App.game.getActionSize())return;
	if(App.game.getValidMoves(App.board,App.player)[a]!=1)return;
	App.board=App.game.getNextState(App.board,App.player,a);
	App.game.draw(App.board,App.ctx);
	const game_state=App.game.getGameEnded(App.board,App.player)
	if(game_state!=0){
		if(game_state==1e-4){
			alert("DRAW");
		}else{
			alert("Player "+game_state+" wins!")
		}
		return;
	}
	App.player*=-1;
	App.status.textContent="Thinking..";
	App.locked=true;
	setTimeout(App.compute,100);
});
// App.status.textContent="Thinking..";
// setTimeout(App.compute,100)