// anche qui si potrebbe fare del refactoring pesante
// in chiave più dichiarativa

export const Blocks = Object.freeze({
    I: Object.freeze([
        [[0, 1], [1, 1], [2, 1], [3, 1]],
        [[2, 0], [2, 1], [2, 2], [2, 3]],
        [[0, 2], [1, 2], [2, 2], [3, 2]],
        [[1, 0], [1, 1], [1, 2], [1, 3]]
    ]),
    J: Object.freeze([
        [[0, 0], [0, 1], [1, 1], [2, 1]],
        [[1, 0], [2, 0], [1, 1], [1, 2]],
        [[0, 1], [1, 1], [2, 1], [2, 2]],
        [[1, 0], [1, 1], [0, 2], [1, 2]]
    ]),
    L: Object.freeze([
        [[2, 0], [0, 1], [1, 1], [2, 1]],
        [[1, 0], [1, 1], [1, 2], [2, 2]],
        [[0, 1], [1, 1], [2, 1], [0, 2]],
        [[0, 0], [1, 0], [1, 1], [1, 2]]
    ]),
    O: Object.freeze([
        [[0, 0], [1, 0], [0, 1], [1, 1]],
        [[0, 0], [1, 0], [0, 1], [1, 1]],
        [[0, 0], [1, 0], [0, 1], [1, 1]],
        [[0, 0], [1, 0], [0, 1], [1, 1]]
    ]),
    S: Object.freeze([
        [[1, 0], [2, 0], [0, 1], [1, 1]],
        [[1, 0], [1, 1], [2, 1], [2, 2]],
        [[1, 1], [2, 1], [0, 2], [1, 2]],
        [[0, 0], [0, 1], [1, 1], [1, 2]],
    ]),
    T: Object.freeze([
        [[1, 0], [0, 1], [1, 1], [2, 1]],
        [[1, 0], [1, 1], [2, 1], [1, 2]],
        [[0, 1], [1, 1], [2, 1], [1, 2]],
        [[1, 0], [0, 1], [1, 1], [1, 2]]
    ]),
    Z: Object.freeze([
        [[0, 0], [1, 0], [1, 1], [2, 1]],
        [[2, 0], [1, 1], [2, 1], [1, 2]],
        [[0, 1], [1, 1], [1, 2], [2, 2]],
        [[1, 0], [0, 1], [1, 1], [0, 2]]
    ]),
    none: Symbol('none_blk')
})

export const Rotation = Object.freeze({
    right: 1,
    left: -1
})

export const Block = Object.freeze({
    new: type => Object.seal({ type, rotation: 0, offset: [0, 0] }),

    bricks: block => block.type[block.rotation]
        .map(([x, y]) => [x + block.offset[0], y + block.offset[1]]),

    shift: ([xShift, yShift]) => block => ({
        ...block,
        offset: [block.offset[0] + xShift, block.offset[1] + yShift]
    }),
    
    rotate: rot => block => ({
        ...block,
        rotation: (block.rotation + rot + 4) % 4
    }),

    init: handler => {
        const _blocks = {
            queue: [Block.new(Blocks.I), Block.new(Block.J)],
            current: Block.new(Blocks.L),
            dropped: [],
            shadow: Blocks.none,
            hold: Blocks.none
        }

        handler(_blocks)
    }
})