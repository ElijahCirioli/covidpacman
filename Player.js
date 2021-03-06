class Player {
	constructor() {
		this.offset = new Vec(7, 0);
		this.maxOffset = 7;
		this.pos = new Vec(13, 26);
		this.dir = new Vec(-1, 0);
		this.speed = playerSpeeds[0];
		this.lives = 3;
		this.animation = 0;
		this.dotTimer = 0;
		this.alive = true;
		this.fruitCount = 0;
	}

	update = () => {
		this.move();
		this.detect();
		this.animation++;
		if (this.alive) {
			if (this.animation > 9) {
				this.animation = 0;
			}
		}
	};

	move = () => {
		if (this.dir) {
			if (this.canMove(this.dir)) {
				//move
				this.offset.x += this.dir.x * this.speed;
				this.offset.y += this.dir.y * this.speed;

				if (this.dir.x !== 0) {
					//if actually moving
					if (this.offset.x > this.maxOffset) {
						this.offset.x = -this.maxOffset;
						this.pos.x++;
					} else if (this.offset.x < -this.maxOffset) {
						this.offset.x = this.maxOffset;
						this.pos.x--;
					}
				} else if (this.offset.x !== 0) {
					//center if not moving in this direction
					this.offset.x -= Math.sign(this.offset.x) * this.speed;
					if (Math.abs(this.offset.x) < this.speed) {
						this.offset.x = 0;
					}
				}

				if (this.dir.y !== 0) {
					//if actually moving
					if (this.offset.y > this.maxOffset) {
						this.offset.y = -this.maxOffset;
						this.pos.y++;
					} else if (this.offset.y < -this.maxOffset) {
						this.offset.y = this.maxOffset;
						this.pos.y--;
					}
				} else if (this.offset.y !== 0) {
					//center if not moving in this direction
					this.offset.y -= Math.sign(this.offset.y) * this.speed;
					if (Math.abs(this.offset.y) < this.speed) {
						this.offset.y = 0;
					}
				}
			} else {
				//if cant move then push to center of tile
				if (this.dir.x !== 0 && this.offset.x !== 0) {
					this.offset.x += this.dir.x * this.speed;
					if (Math.abs(this.offset.x) < this.speed) {
						this.offset.x = 0;
					}
				}

				if (this.dir.y !== 0 && this.offset.y !== 0) {
					this.offset.y += this.dir.y * this.speed;
					if (Math.abs(this.offset.y) < this.speed) {
						this.offset.y = 0;
					}
				}
			}

			//loop around
			if (this.pos.equals(new Vec(-1, 17))) {
				this.pos = new Vec(27, 17);
				this.offset.x = this.maxOffset;
			}

			if (this.pos.equals(new Vec(28, 17))) {
				this.pos = new Vec(0, 17);
				this.offset.x = -this.maxOffset;
			}
		}
	};

	canMove = (v) => {
		return board[this.pos.y + v.y][this.pos.x + v.x] !== 1;
	};

	detect = () => {
		if (board[this.pos.y][this.pos.x] === 0) {
			//consume pellet
			board[this.pos.y][this.pos.x] = 3;
			score += 10;
			dotCount--;
			if (this.dotTimer <= 240) {
				this.dotTimer = 0;
			}
			if (ghosts[2].mode === "jail") {
				ghosts[2].dotCount++;
			} else if (ghosts[3].mode === "jail") {
				ghosts[3].dotCount++;
			}
		} else if (board[this.pos.y][this.pos.x] === 4) {
			//consume powerup
			board[this.pos.y][this.pos.x] = 3;
			score += 50;

			let index = 0;
			if (level > 0 && level < 4) {
				index = 1;
			} else if (level > 3) {
				index = 2;
			}
			ghosts.forEach((g) => {
				if (g.mode !== "jail") {
					g.mode = "frightened";
					g.reverse();
					g.speed = ghostFrightenedSpeeds[index];
				}
			});

			index = 0;
			if (level > 2 && level < 10) {
				index = 1;
			} else if (level > 9) {
				index = 2;
			} else if (level > 18) {
				index = 3;
			}
			frightenedTimer = 60 * frightenedTimes[index];
			if (this.dotTimer <= 240) {
				this.dotTimer = 0;
			}
		} else if (board[this.pos.y][this.pos.x] === 5) {
			//consume fruit
			board[this.pos.y][this.pos.x] = 3;
			score += 100 * (level + 1);
			this.fruitCount++;
		} else {
			this.dotTimer++;
		}
	};

	spawn = () => {
		this.offset = new Vec(7, 0);
		this.maxOffset = 7;
		this.pos = new Vec(13, 26);
		this.dir = new Vec(-1, 0);
		this.dotTimer = 0;
		this.alive = true;
		this.animation = 0;
		controllable = true;
		ready = false;
		resetGhosts();
		setTimeout(() => {
			ready = true;
			this.dotTimer = 0;
		}, 2000);
	};

	death = () => {
		this.lives--;
		controllable = false;
		stick = new Vec(0, 0);
		this.animation = 0;
		this.alive = false;
		if (this.lives > 0) {
			setTimeout(this.spawn, 1500);
		} else {
			if (score > highscore) {
				highscore = score;
			}
			setTimeout(() => {
				setup();
			}, 2000);
		}
	};

	draw = () => {
		context.save();
		context.shadowColor = "rgba(0, 0, 0, 0.8)";
		context.shadowOffsetX = -1;
		context.shadowOffsetY = 1;
		context.shadowBlur = 8;
		context.translate(this.pos.x * ts + this.offset.x + 8, this.pos.y * ts + this.offset.y + 8);
		if (this.dir.x === -1) {
			context.scale(-1, 1);
		} else if (this.dir.y === -1) {
			context.rotate(-Math.PI / 2);
		} else if (this.dir.y === 1) {
			context.rotate(Math.PI / 2);
		}

		if (this.alive) {
			if (this.animation > 4 || this.offset.equals(new Vec(0, 0))) {
				context.drawImage(pacImage, 24, 0, 24, 24, -12, -12, 24, 24);
			} else {
				context.drawImage(pacImage, 0, 0, 24, 24, -12, -12, 24, 24);
			}
			context.shadowColor = "rgba(0, 0, 0, 0)";
			context.clearRect(-4, -4, 12, 8);
			if (this.animation > 4 || this.offset.equals(new Vec(0, 0))) {
				context.drawImage(pacImage, 24, 0, 24, 24, -12, -12, 24, 24);
			} else {
				context.drawImage(pacImage, 0, 0, 24, 24, -12, -12, 24, 24);
			}
		} else {
			if (this.animation < 10) {
				context.drawImage(pacImage, 24, 0, 24, 24, -12, -12, 24, 24);
			} else if (this.animation < 20) {
				context.drawImage(deathImage, 0, 0, 24, 24, -12, -12, 24, 24);
			} else if (this.animation < 30) {
				context.drawImage(deathImage, 24, 0, 24, 24, -12, -12, 24, 24);
			} else if (this.animation < 40) {
				context.drawImage(deathImage, 48, 0, 24, 24, -12, -12, 24, 24);
			}
			this.animation++;
		}

		context.restore();
	};
}
