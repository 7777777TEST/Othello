let zip=(...args)=>{
	const r=[]
	const length=args[0].length;
	for(let i=0;i<length;i++){
		r.push([...args.map(arg=>arg[i])])
	}
	return r;
};

let choice=(p=[0.0],values=new Array(1))=>{
	const rand=Math.random()
	let sum=0;
	for(let i=0;i<p.length;i++){
		sum+=p[i];
		if(rand<sum)return values[i];
	}
	return values[values.length-1];
}