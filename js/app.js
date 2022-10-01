"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
var player_1 = require("./player");
var constants_1 = require("./constants");
exports.app = new (function () {
    function App() {
        this.playerpool = player_1.players;
    }
    App.prototype.add = function (socket, data) {
        var _this = this;
        this.host.getData(function (global) {
            var player = _this.playerpool.add(socket, JSON.stringify(global), data);
            if (player !== undefined) {
                player.socket.on('close', function () {
                    _this.leave(player);
                });
                player.socket.on('data', function (data) {
                    _this.broadcast(data, player);
                });
            }
            else {
                socket.end();
            }
        });
    };
    App.prototype.leave = function (player) {
        this.playerpool.splice(this.playerpool.findIndex(function (value) { return value === player; }), 1);
        if (player == this.host) {
            this.realloc_host();
        }
        this.broadcast({
            type: 'leave',
        });
    };
    App.prototype.realloc_host = function () {
        if (this.playerpool.length > 0) {
            this.playerpool[0].socket.write(JSON.stringify({
                type: 'host'
            }));
        }
    };
    App.prototype.broadcast = function (data, sender) {
        this.playerpool.forEach(function (player) {
            if (player !== sender) {
                player.socket.write(typeof data === "string" ? data : JSON.stringify(data), constants_1.encoding);
            }
        });
    };
    return App;
}());
