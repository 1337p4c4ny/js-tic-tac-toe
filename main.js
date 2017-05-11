var FIELD_SIZE = 7;
var TO_WIN = 5;
var MAX_LEVEL = 3;
var SCALE = 75;

function Game() {
    function genField(fieldSize) {
        var field = [];
        for (var i = 0; i < fieldSize; ++i) {
            var row = [];
            for (var j = 0; j < fieldSize; ++j) {
                row.push(0);
            }
            field.push(row);
        }
        return field;
    };

    return {
        cellData: genField(FIELD_SIZE),
        aiMoves: false,
        finished: false,
        gameOver: function(field) {
            for (var i = 0; i < FIELD_SIZE; i++) {
                var cnt = 1;
                var el = 0;
                for (var j = 1; j < FIELD_SIZE; ++j) {
                    el = field[i][j];
                    if (field[i][j] == field[i][j-1]) {
                        cnt++;
                    } else {
                        cnt = 1;
                    }
                    if (cnt == TO_WIN && el != 0) {
                        return true;
                    }
                }
            }
            for (var i = 0; i < FIELD_SIZE; i++) {
                var cnt = 1;
                var el = 0;
                if (field[0][i] == 0) {
                    break;
                }
                for (var j = 1; j < FIELD_SIZE; ++j) {
                    el = field[j][i];
                    if (field[j][i] == field[j-1][i]) {
                        cnt++;
                    } else {
                        cnt = 1;
                    }
                    if (cnt == TO_WIN && el != 0) {
                        return true;
                    }
                }
            }

            for (var k = 0; k < FIELD_SIZE - TO_WIN; ++k) {
                for (var l = 0; l < FIELD_SIZE - TO_WIN; ++l) {
                    var cnt = 1;
                    var el = 0;
                    for (var i = k+1; i < k+TO_WIN; ++i) {
                        var j = l+1;
                        el = field[i][j];
                        if (field[i][j] == field[i-1][j-1]) {
                            cnt++;
                        } else {
                            cnt = 1;
                        }
                        if (cnt == TO_WIN && el != 0) {
                            return true;
                        }
                    }
                }
            }

            for (var k = 0; k < FIELD_SIZE - TO_WIN; ++k) {
                for (var l = 0; l < FIELD_SIZE - TO_WIN; ++l) {
                    var cnt = 1;
                    var el = 0;
                    for (var i = k+1; i < k+TO_WIN; ++i) {
                        var j = i - TO_WIN;
                        el = field[i][j];
                        if (field[i][j] == field[i-1][j-1]) {
                            cnt++;
                        } else {
                            cnt = 1;
                        }
                        if (cnt == TO_WIN && el != 0) {
                            return true;
                        }
                    }
                }
            }

            for (var i = 0; i < FIELD_SIZE; i++) {
                for (var j = 0; j < FIELD_SIZE; j++) {
                    if (field[i][j] == 0)
                        return 0;
                }
            }
            return -1;
        },
        cloneField: function(f) {
            var t = genField(FIELD_SIZE);
            for (var i = 0; i < FIELD_SIZE; i++)
                for (var j = 0; j < FIELD_SIZE; j++)
                    t[i][j] = f[i][j];
            return t;
        },
        minimax: function(field, who, lv) {
            if (lv > MAX_LEVEL) {
                return "STOP";
            }
            // who == true - cross
            // who == false - circle

            var gameover = this.gameOver(field);

            if (gameover) {
                if (gameover == -1)
                    return {v: 0};
                else
                    return {v: who ? -1 : 1};
            }
            else {
                var move = {
                    v: who ? -1 : 1,
                    "i": -1,
                    "j": -1
                };
                for (var i = 0; i < FIELD_SIZE; i++) {
                    for (var j = 0; j < FIELD_SIZE; j++) {
                        if (field[i][j] == 0) {
                            field[i][j] = who ? 1 : 2;
                            var result = this.minimax(this.cloneField(field), !who, lv+1);
                            if (result == "STOP") {
                                return {
                                    v: who ? 1 : -1,
                                    i: i,
                                    j: j
                                };
                            }
                            if (who) {
                                if (result.v >= move.v) {
                                    move.v = result.v;
                                    move.i = i;
                                    move.j = j;
                                }
                            }
                            else {
                                if (result.v <= move.v) {
                                    move.v = result.v;
                                    move.i = i;
                                    move.j = j;
                                }
                            }

                            field[i][j] = 0;
                        }
                    }
                }
                return move;
            }
        },
        aiMove: function() {
            var move = this.minimax(this.cellData, false, 0);
            this.cellData[move.i][move.j] = 2;
        },
        userClick: function(row, col) {
            if (!this.aiMoves) {
                if (this.cellData[row][col] == 0) {
                    this.cellData[row][col] = 1;

                    var pgo = this.gameOver(this.cellData);
                    console.info(pgo);
                    if (!pgo) {
                        this.aiMoves = true;
                        this.aiMove();
                        this.aiMoves = false;

                        var aigo = this.gameOver(this.cellData);
                        console.info(aigo);
                        if (aigo) {
                            if (aigo == 1)
                                return -1;
                            return 2;
                        }
                    }
                    else {
                        if (pgo == 1)
                            return 1;
                        return 2;
                    }
                }
            }
            return 0;
        }
    };
}

function UI(_offsetX, _offsetY, _cellSize, _cellColor) {
    return {
        offsetX: _offsetX,
        offsetY: _offsetY,
        cellSize: _cellSize,
        cellColor: _cellColor,

        drawGrid: function(ctx, rows, cols, cellSize, color) {
            var x = this.offsetX;
            var y = this.offsetY;
            var horLineLen = this.cellSize * cols;
            var verLineLen = this.cellSize * rows;

            ctx.strokeStyle = this.cellColor;
            ctx.beginPath();
            for (var i = 0; i < cols+1; i++) {
                ctx.moveTo(x, this.offsetY);
                ctx.lineTo(x, this.offsetY + verLineLen);
                x += this.cellSize;
            }
            for (var i = 0; i < rows+1; i++) {
                ctx.moveTo(this.offsetX, y);
                ctx.lineTo(this.offsetX + horLineLen, y);
                y += this.cellSize;
            }
            ctx.stroke();
        },
        drawCellData: function(ctx, data) {
            var drawCross = function(self, x, y) {
                var size = Math.round(self.cellSize * 0.75);
                var cellOffset = (self.cellSize - size) / 2;
                var cellX = self.offsetX + self.cellSize*x;
                var cellY = self.offsetY + self.cellSize*y;

                ctx.beginPath();
                ctx.moveTo(cellX+cellOffset, cellY+cellOffset);
                ctx.lineTo(cellX+cellOffset+size, cellY+cellOffset+size);
                ctx.moveTo(cellX+cellOffset+size, cellY+cellOffset);
                ctx.lineTo(cellX+cellOffset, cellY+cellOffset+size);
                ctx.stroke();
            }

            var drawCircle = function(self, x, y) {
                var radius = Math.round(self.cellSize * 0.75 / 2);
                var x = self.offsetX + (self.cellSize*x) + self.cellSize/2;
                var y = self.offsetY + (self.cellSize*y) + self.cellSize/2;

                ctx.beginPath();
                ctx.arc(x, y, radius, 0, 2*Math.PI);
                ctx.stroke();
            }

            ctx.strokeStyle = "red";
            for (var i = 0; i < data.length; i++) {
                for (var j = 0; j < data[i].length; j++) {
                    if (data[i][j] == 1) {
                        drawCross(this, j, i);
                    }
                    else if (data[i][j] == 2) {
                        drawCircle(this, j, i);
                    }
                }
            }
        },
        text: function(ctx, string) {
            ctx.font = Math.round(this.cellSize*0.7).toString() + 'pt Monospace';
            ctx.textAlign = 'center';
            ctx.fillStyle = 'Black';
            ctx.fillText(string, this.offsetX + this.cellSize*FIELD_SIZE/2, this.offsetY - this.cellSize);
        },
        handleClick: function(x, y) {
            x -= this.offsetX-4;
            y -= this.offsetY-4;

            if (x >= 0 && y >= 0 && x <= this.cellSize*FIELD_SIZE && y <= this.cellSize*FIELD_SIZE) {
                return {
                    "x": Math.floor(x/this.cellSize),
                    "y": Math.floor(y/this.cellSize)
                };
            }

            return false;
        }
    };
}

window.onload = function(event) {
    var width = window.innerWidth,
        height = window.innerHeight,
        canvas = document.getElementById("xo-canvas"),
        ctx = canvas.getContext("2d");

    canvas.width = width;
    canvas.height = height;

    var cellSize = SCALE;
    var ui = new UI(width/2 - cellSize*FIELD_SIZE/2, height/2 - cellSize*FIELD_SIZE/2, cellSize, "black");
    var game = new Game();

    canvas.onmousedown = function(event) {
        var x = event.clientX;
        var y = event.clientY;
        var coord = ui.handleClick(x, y);
        console.info("Clicked", coord);
        if (typeof coord == "object" && !game.finished) {
            var result = game.userClick(coord.y, coord.x);
            console.info("game.userClick", result);
            ui.drawCellData(ctx, game.cellData);
            if (result) {
                game.finished = true;
                if (result == 2) {
                    ui.text(ctx, "Draw!");
                }
                else {
                    if (result == 1)
                        ui.text(ctx, "You won!");
                    else
                        ui.text(ctx, "You lose!");
                    // ui.crossOut(ctx, game.cellData);
                }
            }
        }
    }

    ui.drawGrid(ctx, FIELD_SIZE, FIELD_SIZE);
};
