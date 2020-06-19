export const Commands = Object.freeze({
    moveLeft: Symbol('move_left_cmd'),
    moveRight: Symbol('move_right_cmd'),
    rotateLeft: Symbol('rotate_left_cmd'),
    rotateRight: Symbol('rotate_right_cmd'),
    softDrop: Symbol('soft_drop_cmd'),
    hardDrop: Symbol('hard_drop_cmd'),
    hold: Symbol('hold_cmd'),
    pause: Symbol('pause_cmd')
});
