import { Engine } from "@babylonjs/core"
import { Observable } from "rxjs"
import { WorldController } from "./world.controller"

export class GameController {

  engine!: Engine
  world!: WorldController

  private clearInputFlag = false

  constructor(say: Observable<string>, canvas: HTMLCanvasElement, private onRestart: () => void, private onList: () => void) {
    this.engine = new Engine(canvas, false)

    this.world = new WorldController(say, this.engine, this)

    this.engine.runRenderLoop(() => {
      this.world.render()

      if (this.clearInputFlag) {
        this.clearInputFlag = false
        this.world.input.clear()
      }
    })
  }

  showList() {
    this.onList()
  }

  restart() {
    this.onRestart()
  }

  clearInput() {
    this.clearInputFlag = true
  }

  resize() {
    this.engine.resize()
  }
}