import { Block, Blocks } from './block.js'

export const DOMDriver = size => handler => {
    const get = () => document.getElementById('matrix')
    const cell = ([x, y]) => get().childNodes[y].childNodes[x].classList
    const matrix = get()
    const [xLimit, yLimit] = size

    for (let i = 0; i < yLimit; i++) {
        const row = document.createElement('div')
        matrix.appendChild(row)

        for (let j = 0; j < xLimit; j++) {
            const col = document.createElement('div')
            row.appendChild(col)
        }
    }

    const render = handler => blocks => {
        matrix.childNodes.forEach(row =>
            row.childNodes.forEach(col =>
                col.className = ''
            )
        )
        
        if (blocks.shadow != Blocks.none) Block.bricks(blocks.shadow).forEach(coord => cell(coord).add('shadow'))

        Array(
            Block.bricks(blocks.current),
            ...blocks.dropped
        ).forEach(block =>
            block.forEach(coord => cell(coord).add('brick'))
        )

        handler(blocks)
    }

    handler(render)
}
