import { ActionManager, ExecuteCodeAction, Scene } from '@babylonjs/core'

export class InputController {
  
  private inputMap = new Map<string, boolean>()
  
  isEnabled = true

  constructor(scene: Scene) {
    scene.actionManager = new ActionManager(scene)
    scene.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnKeyDownTrigger, evt => {
        this.inputMap.set(evt.sourceEvent.key, evt.sourceEvent.type === 'keydown')
        console.log(evt.sourceEvent.key)
    }))
    scene.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnKeyUpTrigger, evt => {
      this.inputMap.set(evt.sourceEvent.key, evt.sourceEvent.type === 'keydown')
    }))
  }

  clear(): void {
    this.inputMap.clear()
  }

  pressed(key: string): boolean {
    if (!this.isEnabled) return false

    return this.inputMap.get(key) || false
  }
  
  single(key: string): boolean {
    if (!this.isEnabled) return false

    const pressed = this.inputMap.get(key) || false
    this.inputMap.delete(key)

    return pressed
  }
}
