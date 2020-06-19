import { Block } from './modules/block.js'
import { game } from './modules/game.js'
import { Input } from './modules/input.js'
import { clock } from './modules/clock.js'
import { DOMDriver } from './modules/dom-driver.js'
import { Commands } from './modules/commands.js'

const size = [10, 20]

const main = () => DOMDriver
    (size)
    (render => Block.init
        (blocks => game
            (size)
            (process => {
                const events = {
                    commands: [],
                    ticks: 0
                }

                let pause

                Input.event(command => {
                    if (command != Commands.pause) events.commands.push(command)
                    else pause = !pause
                })

                clock(() => events.ticks++)

                const frame = blocks => {
                    events.commands.length = 0
                    events.ticks = 0

                    requestAnimationFrame(() => loop(blocks))
                }

                const loop = blocks => (pause ? frame : process(events)(render(frame)))(blocks)

                frame(blocks)
            })
        )
    )

window.addEventListener('DOMContentLoaded', main)