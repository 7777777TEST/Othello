const EPS=1e-10

class MCTS{
	constructor(game,nnet,args){
		this.game=game;
		this.nnet=nnet;
		this.args=args;
		this.Qsa={};
		this.Nsa={};
		this.Ns={};
		this.Ps={};

		this.Es={};
		this.Vs={};
	}

	getActionProb(board,temp=1){
		for(let i=0;i<this.args.numMCTSSims;i++){
			this.search(JSON.parse(JSON.stringify(board)));
		}
		const s=this.game.stringRepresentation(board);
		const act_size=this.game.getActionSize();
		let counts=[];
		for(let a=0;a<act_size;a++){
			const saKey=`${s};${a}`;
			if(this.Nsa.hasOwnProperty(saKey)){
				counts.push(this.Nsa[saKey]);
			}else{
				counts.push(0);
			}
		}
		let probs;
		if(temp===0){
			const bestA=((list)=>{
				const len=list.length;
				let maxI=-1,maxV=Number.NEGATIVE_INFINITY;
				for(let i=0;i<len;i++){
					if(maxV<list[i]){
						maxI=i;
						maxV=list[i];
					}
				}
				return maxI;
			})(counts);
			probs=Array(counts.length).fill(0);
			probs[bestA]=1;
			return probs;
		}
		counts=counts.map(x=>x**(1.0/temp));
		const sum=counts.reduce((x,y)=>x+y);
		probs=counts.map(x=>x/sum);
		return probs;
	}
	search(board){
		let zip=(...args)=>{
			const r=[]
			const length=args[0].length;
			for(let i=0;i<length;i++){
				r.push([...args.map(arg=>arg[i])])
			}
			return r;
		};
		const s=this.game.stringRepresentation(board);
		if(!this.Es.hasOwnProperty(s)){
			this.Es[s]=this.game.getGameEnded(board,1);
		}
		if(this.Es[s]!=0){
			return -this.Es[s];
		}
		if(!this.Ps.hasOwnProperty(s)){
			const {Ps,v}=this.nnet.predict(board);
			this.Ps[s]=Ps;
			const valids=this.game.getValidMoves(board,1);
			this.Ps[s]=zip(this.Ps[s],valids).map((value)=>{
				return value[0]*value[1];
			})
			let sum=this.Ps[s].reduce((x,y)=>x+y);
			if(sum!=0){
				this.Ps[s]=this.Ps[s].map((v)=>v/sum);
			}else{
				throw "All valid moves were masked. do walk around";
			}
			this.Vs[s]=valids;
			this.Ns[s]=0;
			return v;
		}
		const valids=this.game.getValidMoves(board,1);
		const act_size=this.game.getActionSize();
		let best=Number.NEGATIVE_INFINITY;
		let best_act=-1;
		for(let a=0;a<act_size;a++){
			if(valids[a]>0){
				const saKey=`${s};${a}`;
				let u;
				if(this.Qsa.hasOwnProperty(saKey)){
					u=this.Qsa[saKey]+this.args.cpuct*this.Ps[s][a]*Math.sqrt(this.Ns[s]+EPS)/(1+this.Nsa[saKey])
				}else{
					u=this.args.cpuct*this.Ps[s][a]*Math.sqrt(this.Ns[s]+EPS);
				}
				if(u>best){
					best=u;
					best_act=a;
				}
			}
		}
		const a=best_act;
		const next_state=this.game.getNextState(board,1,a);
		const player=1;
		let state=next_state;
		state=state.map((v)=>v*player);
		const v=this.search(state);
		const saKey=`${s};${a}`;
		this.Ns[s]+=1;
		if(this.Qsa.hasOwnProperty(saKey)){
			this.Qsa[saKey]=(this.Nsa[saKey] * this.Qsa[saKey] + v) / (this.Nsa[saKey] + 1);
			this.Nsa[saKey]+=1;
		}else{
			this.Qsa[saKey]=v;
			this.Nsa[saKey]=1;
		}
		return -v;
	}
}