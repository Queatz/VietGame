import { Color3, DeepImmutable, Mesh, PickingInfo, Ray, Scene, StandardMaterial, Vector3 } from "@babylonjs/core"
import { InputController } from "./input.controller"
import { CapsuleBuilder } from "@babylonjs/core/Meshes/Builders/capsuleBuilder"
import { PeopleController } from "./people.controller"
import { OverlayController } from "./overlay.controller"
import { Observable } from "rxjs"
import { ItemsController } from "./items.controller"


export class PlayerController {
  
  playerObject!: Mesh
  playerMaterial: StandardMaterial

  constructor(private say: Observable<string>, private people: PeopleController, private items: ItemsController, private input: InputController, private overlay: OverlayController, private scene: Scene) {
    this.playerObject = CapsuleBuilder.CreateCapsule('player', {
      height: 1,
      radius: .2,
      subdivisions: 12,
      capSubdivisions: 12,
      bottomCapSubdivisions: 12,
      tessellation: 12
    }, this.scene)

    this.playerObject.checkCollisions = true

    this.playerObject.position.addInPlace(new Vector3(0, .5, 0))
    
    this.playerObject.ellipsoid.scaleInPlace(.5)

    this.playerMaterial = new StandardMaterial('player', this.scene)
    this.playerMaterial.diffuseColor = Color3.Purple()

    this.playerObject.material = this.playerMaterial

    this.say.subscribe(text => {
      this.interactWithPerson(person => {
        person.metadata.say(text)
      })
    })

    // this.overlay.text('Bạn', this.playerObject)
  }

  update() {
    const dt = this.scene.getEngine().getDeltaTime()
    const speed = 0.005  * dt

    if (this.input.pressed('ArrowUp')) {
      this.playerObject.moveWithCollisions(this.playerObject.forward.scale(speed))
    }
    
    if (this.input.pressed('ArrowDown')) {
      this.playerObject.moveWithCollisions(this.playerObject.forward.scale(speed).negate())
    }
    
    if (this.input.pressed('ArrowLeft')) {
      this.playerObject.rotate(Vector3.Up(), -speed / 4)
    }
    
    if (this.input.pressed('ArrowRight')) {
      this.playerObject.rotate(Vector3.Up(), speed / 4)
    }

    this.playerObject.moveWithCollisions(this.scene.gravity.scale(dt))

    if (this.input.pressed('Enter')) {
      this.interactWithPerson(person => {
        person.metadata.ask()
      })
    }

    this.interactWithItem(item => {
      item.metadata.ask()
    })
  }

  private interactWithItem(callback: (mesh: Mesh) => void): void {
    const ray = new Ray(this.playerObject.position.add(new Vector3(0, -.5 + .2 / 2, 0)), this.playerObject.forward, .5)
    const hits = ray.intersectsMeshes(this.items.itemMeshes as Array<DeepImmutable<Mesh>>)
        
    hits.filter(x => x.hit).sort((a, b) => a.distance - b.distance).slice(0, 1).forEach(pickingInfo => {
      callback(pickingInfo.pickedMesh as Mesh)
    })
  }

  private interactWithPerson(callback: (mesh: Mesh) => void): void {
    const ray = new Ray(this.playerObject.position, this.playerObject.forward, 3)
    const hits = ray.intersectsMeshes(this.people.peopleMeshes as Array<DeepImmutable<Mesh>>)
        
    hits.filter(x => x.hit).sort((a, b) => a.distance - b.distance).slice(0, 1).forEach(pickingInfo => {
      callback(pickingInfo.pickedMesh as Mesh)
    })
  }
}