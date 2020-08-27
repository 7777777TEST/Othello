class NNetWrapper {
	constructor(game,args) {

		const { w, h } = game.getBoardSize();
		this.board_x = w;
		this.board_y = h;
		this.args = args;
		this.action_size = game.getActionSize();

		const normalize1 = () => tf.layers.batchNormalization({ axis: 3 });
		const normalize2 = () => tf.layers.batchNormalization({ axis: 1 });
		const relu = () => tf.layers.activation({ activation: 'relu' });
		const conv2d_padding = () => tf.layers.conv2d({kernelSize: 3,filters: this.args.num_channels,padding: 'same',});
		const conv2d_valid = () => tf.layers.conv2d({ kernelSize: 3, filters: this.args.num_channels, padding: 'valid', });
		const dropout = () => tf.layers.dropout({ rate: this.args.dropout });

		const input = tf.layers.input({ shape: [this.board_x, this.board_y, 1] });
		const h_conv1 = normalize1().apply(normalize1().apply(conv2d_padding().apply(input)));
		const h_conv2 = normalize1().apply(normalize1().apply(conv2d_padding().apply(h_conv1)));
		const h_conv3 = normalize1().apply(normalize1().apply(conv2d_padding().apply(h_conv2)));
		const h_conv4 = normalize1().apply(normalize1().apply(conv2d_valid().apply(h_conv3)));

		const middle1 = tf.layers.flatten().apply(h_conv4);

		const denseLayer1 = tf.layers.dense({ units: 1024 }).apply(middle1);
		const middle2 = dropout().apply(relu().apply(normalize2().apply(denseLayer1)));
		const denseLayer2 = tf.layers.dense({ units: 512 }).apply(middle2);
		const middle3 = dropout().apply(relu().apply(normalize2().apply(denseLayer2)));

		const piLayer = tf.layers.dense({ units: this.action_size, activation: 'softmax' });
		const output1 = piLayer.apply(middle3);
		const vLayer = tf.layers.dense({ units: 1, activation: 'tanh' });
		const output2 = vLayer.apply(middle3);

		this.model = tf.model({ inputs: input, outputs: [output1, output2] });
		const optimizer = tf.train.adam(this.args.lr); // irir default//params.learningRate);
		this.model.compile({ optimizer, loss: ['categoricalCrossentropy', 'meanSquaredError'], });
	}

	async train(examples) {
		console.log('train -1. epoch size:', this.args.batch_size);
		console.log('examples:', examples);
		const total = examples.length;

		const inputData = [];
		const pisData = [];
		const vsData = [];

		for (let i = 0; i < total; i++) {
			const example = examples[i];
			const { input_boards, target_pis, target_vs } = example;
			inputData.push(input_boards);
			pisData.push(target_pis);
			vsData.push(target_vs);
		}

		let xTrain = tf.tensor3d(inputData, [total, 3, 3]);
		xTrain = xTrain.reshape([total, 3, 3, 1]);

		const yTrain1 = tf.tensor2d(pisData);
		const yTrain2 = tf.tensor2d(vsData, [total, 1]);
		console.log('start train');
		const history = await this.model.fit(xTrain, [yTrain1, yTrain2], { shuffle: true, batchSize: this.args.batch_size, epochs: this.args.epochs, callbacks: { onEpochEnd: (epoch, logs) => console.log('onEpochEnd'), }, });
	}

	async loadPretrained(url) {
		this.preTrainedModel = await tf.loadLayersModel(url);
	}

	predict(input) {
		return tf.tidy(() => {
			try {
				input = tf.tensor3d([input], [1, this.board_y, this.board_x]);
				let prediction;
				if (this.preTrainedModel) {
					prediction = this.preTrainedModel.predict(input);
				} else {
					input=input.reshape([1,this.board_x,this.board_y,1])
					prediction = this.model.predict(input);
				}
				const data1 = prediction[0].dataSync();
				const data12 = Array.from(data1);
				const data2 = Array.from(prediction[1].dataSync());
				const Ps = data12;
				const v = data2[0];
				prediction[0].dispose();
				prediction[1].dispose();
				input.dispose();
				return { Ps:Ps, v:v };
			} catch (err) {
				console.log('prediction error:', err);
			}
		});
	}

	save_checkpoint(folder = 'checkpoint', filename = 'checkpoint.pth.tar') {
	}
	load_checkpoint(folder = 'checkpoint', filename = 'checkpoint.pth.tar') {
	}
}