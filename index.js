let complexity = 'low';

const generateNewLevel = (hor = 3, ver = 3) => {
	const { Engine, Render, Runner, World, Bodies, Body, Events, MouseConstraint, Mouse } = Matter;

	let cellsHorizontal = hor;
	let cellsVertical = ver;
	const width = window.innerWidth;
	const height = window.innerHeight;

	const generateComplexity = (btnName) => {
		if (btnName === 'low') {
			World.remove(world, gameSection);
			cellsHorizontal = Math.floor(Math.random() * 3) + 4;
			cellsVertical = Math.floor(Math.random() * 3) + 4;
			generateNewLevel(cellsHorizontal, cellsVertical);
		} else if (btnName === 'medium') {
			World.remove(world, gameSection);
			cellsHorizontal = Math.floor(Math.random() * 3) + 8;
			cellsVertical = Math.floor(Math.random() * 3) + 8;
			generateNewLevel(cellsHorizontal, cellsVertical);
		} else if (btnName === 'hard') {
			World.remove(world, gameSection);
			cellsHorizontal = Math.floor(Math.random() * 3) + 16;
			cellsVertical = Math.floor(Math.random() * 3) + 16;
			generateNewLevel(cellsHorizontal, cellsVertical);
		} else if (btnName === 'extreme') {
			World.remove(world, gameSection);
			cellsHorizontal = Math.floor(Math.random() * 3) + 25;
			cellsVertical = Math.floor(Math.random() * 3) + 25;
			generateNewLevel(cellsHorizontal, cellsVertical);
		}
	};

	const extremeBtn = document.querySelector('.extreme');
	const hardBtn = document.querySelector('.hard');
	const mediumBtn = document.querySelector('.medium');
	const lowBtn = document.querySelector('.low');

	extremeBtn.addEventListener('click', function(event) {
		event.preventDefault();

		// const gameSection = document.querySelector('.game-section');
		// gameSection.removeChild(gameSection.lastChild);
		document.querySelector('.winner').classList.add('hidden');
		World.remove(world, gameSection);
		complexity = extremeBtn.value;
		restartRound();
	});
	hardBtn.addEventListener('click', function(event) {
		event.preventDefault();

		document.querySelector('.winner').classList.add('hidden');
		World.remove(world, gameSection);
		complexity = hardBtn.value;

		restartRound();
	});

	mediumBtn.addEventListener('click', function(event) {
		event.preventDefault();

		document.querySelector('.winner').classList.add('hidden');
		World.remove(world, gameSection);
		complexity = mediumBtn.value;
		restartRound();
	});

	lowBtn.addEventListener('click', function(event) {
		event.preventDefault();
		document.querySelector('.winner').classList.add('hidden');
		World.remove(world, gameSection);
		complexity = lowBtn.value;
		restartRound();
	});

	const unitLengthX = width / cellsHorizontal;
	const unitLengthY = height / cellsVertical;

	const engine = Engine.create();
	engine.world.gravity.y = 0;
	const { world } = engine;

	const gameSection = document.querySelector('.game-section');
	const render = Render.create({
		element: gameSection,
		engine: engine,
		options: {
			wireframes: false,
			width,
			height
		}
	});

	Render.run(render);
	Runner.run(Runner.create(), engine);
	if (width <= 1000) {
		World.add(
			world,
			MouseConstraint.create(engine, {
				mouse: Mouse.create(render.canvas)
			})
		);
	}
	//Walls

	const walls = [
		Bodies.rectangle(width / 2, 0, width, 2, {
			isStatic: true
		}),
		Bodies.rectangle(width / 2, height, width, 2, {
			isStatic: true
		}),
		Bodies.rectangle(0, height / 2, 2, height, {
			isStatic: true
		}),
		Bodies.rectangle(width, height / 2, 2, height, {
			isStatic: true
		})
	];

	World.add(world, walls);

	//Maze generation

	const shuffle = (arr) => {
		let counter = arr.length;

		while (counter > 0) {
			const index = Math.floor(Math.random() * counter);
			counter--;

			const temp = arr[counter];
			arr[counter] = arr[index];
			arr[index] = temp;
		}
		return arr;
	};

	const grid = Array(cellsVertical).fill(null).map(() => Array(cellsHorizontal).fill(false));
	const verticals = Array(cellsVertical).fill(null).map(() => Array(cellsHorizontal - 1).fill(false));
	const horizontals = Array(cellsVertical - 1).fill(null).map(() => Array(cellsHorizontal).fill(false));

	const startRow = Math.floor(Math.random() * cellsVertical);
	const startColumn = Math.floor(Math.random() * cellsHorizontal);

	const stepThroughCell = (row, column) => {
		// if i have visited the cell at [row, column], then return
		if (grid[row][column]) {
			return;
		}
		//mark this cell as being visited
		grid[row][column] = true;
		//assemble randomly-ordered list of neighbord
		const neighbors = shuffle([
			[ row - 1, column, 'up' ],
			[ row, column + 1, 'right' ],
			[ row + 1, column, 'down' ],
			[ row, column - 1, 'left' ]
		]);

		for (let neighbor of neighbors) {
			const [ nextRow, nextColumn, direction ] = neighbor;
			// console.log(nextRow, nextColumn);

			//see if that neighbor is out of bounds
			if (nextRow < 0 || nextRow >= cellsVertical || nextColumn < 0 || nextColumn >= cellsHorizontal) {
				continue;
			}

			//if we have visited that neighbor, continue to next neighbor
			if (grid[nextRow][nextColumn]) {
				continue;
			}

			//remove a wall
			if (direction === 'left') {
				verticals[row][column - 1] = true;
			} else if (direction === 'right') {
				verticals[row][column] = true;
			} else if (direction === 'up') {
				horizontals[row - 1][column] = true;
			} else if (direction === 'down') {
				horizontals[row][column] = true;
			}

			stepThroughCell(nextRow, nextColumn);
		}

		//visit a next cell
	};

	stepThroughCell(startRow, startColumn);

	horizontals.forEach((row, rowIndex) => {
		row.forEach((open, columnIndex) => {
			if (open) {
				return;
			} else {
				const wall = Bodies.rectangle(
					columnIndex * unitLengthX + unitLengthX / 2,
					rowIndex * unitLengthY + unitLengthY,
					unitLengthX,
					4,
					{
						label: 'wall',
						isStatic: true,
						render: {
							fillStyle: '#A1D6E2'
						}
					}
				);
				World.add(world, wall);
			}
		});
	});

	verticals.forEach((row, rowIndex) => {
		row.forEach((open, columnIndex) => {
			if (open) {
				return;
			}

			const wall = Bodies.rectangle(
				columnIndex * unitLengthX + unitLengthX,
				rowIndex * unitLengthY + unitLengthY / 2,
				4,
				unitLengthY,
				{
					label: 'wall',
					isStatic: true,
					render: {
						fillStyle: '#A1D6E2'
					}
				}
			);
			World.add(world, wall);
		});
	});

	//Goal

	const goal = Bodies.rectangle(
		width - unitLengthX / 2,
		height - unitLengthY / 2,
		unitLengthX * 0.7,
		unitLengthY * 0.7,
		{
			isStatic: true,
			label: 'goal',
			render: {
				fillStyle: '#456d92'
			}
		}
	);

	World.add(world, goal);

	//Ball
	const ballRadius = Math.min(unitLengthX, unitLengthY) / 4;
	const ball = Bodies.circle(unitLengthX / 2, unitLengthY / 2, ballRadius, {
		label: 'ball',
		render: {
			fillStyle: '#1995AD'
		}
	});
	World.add(world, ball);

	//position change
	document.addEventListener('keydown', (event) => {
		const { x, y } = ball.velocity;
		ball.restitution = 0.1;

		if (event.keyCode === 87 && ball.velocity.y > -8) {
			Body.setVelocity(ball, { x, y: y - 5 });
		}
		if (event.keyCode === 68 && ball.velocity.x < 8) {
			Body.setVelocity(ball, { x: x + 5, y });
		}
		if (event.keyCode === 83 && ball.velocity.y < 8) {
			Body.setVelocity(ball, { x, y: y + 5 });
		}
		if (event.keyCode === 65 && ball.velocity.x > -8) {
			Body.setVelocity(ball, { x: x - 5, y });
		}
	});

	// win conditions

	Events.on(engine, 'collisionStart', (event) => {
		event.pairs.forEach((collision) => {
			const labels = [ 'ball', 'goal' ];

			if (labels.includes(collision.bodyA.label) && labels.includes(collision.bodyB.label)) {
				engine.world.gravity.y = 1;
				if (engine.world.gravity.y === 1) {
					document.querySelector('.winner').classList.remove('hidden');
				}
				world.bodies.forEach((body) => {
					if (body.label === 'wall') {
						Body.setStatic(body, false);
					}
				});
			}
		});
	});

	const restartRound = () => {
		World.clear(world);
		Engine.clear(engine);
		render.canvas.remove();
		Render.stop(render);
		Runner.stop(Runner);
		render.canvas = null;
		render.context = null;
		render.textures = {};

		if (complexity === 'low') {
			document.querySelector('.winner').classList.add('hidden');
			generateComplexity(lowBtn.value);
		} else if (complexity === 'medium') {
			document.querySelector('.winner').classList.add('hidden');
			generateComplexity(mediumBtn.value);
		} else if (complexity === 'hard') {
			document.querySelector('.winner').classList.add('hidden');
			generateComplexity(hardBtn.value);
		} else if (complexity === 'extreme') {
			document.querySelector('.winner').classList.add('hidden');
			generateComplexity(extremeBtn.value);
		}
	};

	document.querySelector('.next-round').addEventListener('click', restartRound);
};

window.addEventListener('load', generateNewLevel());
