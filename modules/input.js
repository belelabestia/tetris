import { Commands } from "./commands.js"

export const Input = Object.freeze({
    bindings: Object.freeze({
        37: Commands.moveLeft,
        39: Commands.moveRight,
        38: Commands.rotateRight,
        17: Commands.rotateLeft,
        40: Commands.softDrop,
        32: Commands.hardDrop,
        96: Commands.hold,
        27: Commands.pause
    }),
    event: handler => addEventListener('keydown', e => {
        if (e.keyCode in Input.bindings) handler(Input.bindings[e.keyCode])
    })
})