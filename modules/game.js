import { Commands } from './commands.js'
import { Block, Rotation, Blocks } from './block.js'
import { match } from './match.js'

export const game = size => handler => {
    const tryMove = move => current => dropped => {
        const [xLimit, yLimit] = size.map(coord => coord - 1)
        const moved = move(current)
        const bricks = Block.bricks(moved)

        return (
            bricks.some(([x, y]) => x < 0 || x > xLimit || y < 0 || y > yLimit) ||
            dropped
                .reduce((arr, block) => [...arr, ...block], [])
                .some(([x, y]) =>
                    bricks.some(([_x, _y]) => x == _x && y == _y)
                )
        ) ?
            current :
            moved
    }

    const hardDrop = current => dropped => {
        const moved = tryMove
            (Block.shift([0, 1]))
            (current)
            (dropped)

        return (moved != current) ?
            hardDrop(moved)(dropped) :
            current
    }

    const handlers = Object.seal({
        onMove: [],
        onTick: [],
        onInit: [],
        raise: blocks => events => frame => funcs => handler => {
            const callPipeline = i => {
                const next = funcs[i + 1] ?
                    frame => blocks => events => callPipeline(i + 1) :
                    () => () => () => { }

                funcs[i](next)(frame)(blocks)(events)
            }

            callPipeline(0)
            handler()
        }
    })

    let init = true

    const process = events => handler => blocks => {
        const raise = handlers.raise(blocks)(events)(handler)

        const onInit = init ? raise(handlers.onInit) : handler => handler()
        const onMove = events.commands.length ? raise(handlers.onMove) : handler => handler()
        const onTick = events.ticks ? raise(handlers.onTick) : handler => handler()

        onInit(() =>
            onMove(() =>
                onTick(() => handler(blocks))
            )
        )
    }

    process.onMove = handler => handlers.onMove.push(handler)
    process.onTick = handler => handlers.onTick.push(handler)
    process.onInit = handler => handlers.onInit.push(handler)

    process.onShadowChange = handler => {
        process.onInit(handler)

        process.onMove(next => frame => blocks => events =>
            (events.commands.some(command => [
                Commands.moveLeft,
                Commands.moveRight,
                Commands.rotateLeft,
                Commands.rotateRight
            ].includes(command)) ?
                handler(next)(frame) :
                next(frame)
            )
                (blocks)
                (events)
        )
    }

    process.onDroppedBlock = handler => {
        process.onMove(next => frame => blocks => events =>
            (events.commands.some(command => [
                Commands.softDrop,
                Commands.hardDrop
            ].includes(command)) &&
                blocks.current == tryMove
                    (Block.shift([0, 1]))
                    (blocks.current)
                    (blocks.dropped) ?
                handler(next)(frame) :
                next(frame)
            )
                (blocks)
                (events)
        )

        process.onTick(next => frame => blocks => events => {
            (blocks.current == tryMove
                (Block.shift([0, 1]))
                (blocks.current)
                (blocks.dropped) ?
                handler(next)(frame) :
                next(frame)
            )
                (blocks)
                (events)
        })
    }

    process.onNewBlock = process.onDroppedBlock

    process.onRowsCompleted = handler => process.onDroppedBlock(next => frame => blocks => events => {
        const droppedBricks = blocks.dropped.reduce((arr, block) => [...arr, ...Block.bricks(block)], [])

        const completedRows = [...Array(20).keys()]
            .filter(row => [...Array(10).keys()]
                .every(col =>
                    droppedBricks.some(([x, y]) => x == col && y == row)
                )
            );
        
        (completedRows.length ? handler(completedRows)(next)(frame) : next(frame))
            (blocks)
            (events)
    })

    // questo in futuro dovrà contenere anche info sul T-spin
    // ma per ora fa semplicemente quel che fa onRowComplete
    process.onScore = handler => process.onRowsCompleted(rows => next => frame => blocks => events => {
        const score = rows // calculate score
        handler(score)(next)(frame)(blocks)(events)
    })

    process.onInit(next => frame => blocks => events => {
        next(frame)(blocks)(events)
        init = false
    })

    process.onMove(next => frame => blocks => events => {
        events.commands.forEach(command => blocks.current = match
            (command)
            (blocks.current)
            (
                [Commands.moveLeft, () => tryMove
                    (Block.shift([-1, 0]))
                    (blocks.current)
                    (blocks.dropped)
                ],
                [Commands.moveRight, () => tryMove
                    (Block.shift([1, 0]))
                    (blocks.current)
                    (blocks.dropped)
                ],
                [Commands.softDrop, () => tryMove
                    (Block.shift([0, 1]))
                    (blocks.current)
                    (blocks.dropped)
                ],
                [Commands.rotateLeft, () => tryMove
                    (Block.rotate(Rotation.left))
                    (blocks.current)
                    (blocks.dropped)
                ],
                [Commands.rotateRight, () => tryMove
                    (Block.rotate(Rotation.right))
                    (blocks.current)
                    (blocks.dropped)
                ],
                [Commands.hardDrop, () => hardDrop
                    (blocks.current)
                    (blocks.dropped)
                ]
            )
        )

        next(frame)(blocks)(events)
    })

    process.onShadowChange(next => frame => blocks => events => {
        blocks.shadow = hardDrop
            (blocks.current)
            (blocks.dropped)

        next(frame)(blocks)(events)
    })

    process.onTick(next => frame => blocks => events => {
        for (let i = 0; i < events.ticks; i++)
            blocks.current = tryMove
                (Block.shift([0, 1]))
                (blocks.current)
                (blocks.dropped)

        next(frame)(blocks)(events)
    })

    process.onDroppedBlock(next => frame => blocks => events => {
        blocks.dropped.push(Block.bricks(blocks.current))
        blocks.current = Block.new(Blocks.L)

        next(frame)(blocks)(events)
    })

    process.onRowsCompleted(rows => next => frame => blocks => events => {
        console.log({ rows, next, frame })
        // todo
        // siamo arrivati qui:
        // le righe complete devono essere svuotate
        // e tutti i mattoncini che ci stanno sopra devono cadere
        // qui sarebbe bello intromettersi nel loop con un'animazione
        // e poi riprenderlo alla fine
        // basterebbe chiamare autonomamente handler... ma non qui
        // come fare? render deve sapere che deve fare un'animazione.
        // dove dovrebbe stare?
        // io dico in render.
        // processo -> succede una cosa che ferma il processo -> rendering di quella cosa -> ripresa del processo

        next(blocks)(events)
    })

    handler(Object.freeze(process))
}