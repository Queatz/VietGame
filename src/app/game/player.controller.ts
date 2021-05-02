import { AbstractMesh, Color3, DeepImmutable, Material, Mesh, PlaneBuilder, Ray, Scene, StandardMaterial, Texture, Vector3 } from "@babylonjs/core"
import { InputController } from "./input.controller"
import { PeopleController } from "./people.controller"
import { OverlayController } from "./overlay.controller"
import { Observable } from "rxjs"
import { ItemsController } from "./items.controller"
import { LevelController } from "./level.controller"
import { InventoryController } from "./inventory.controller"


export class PlayerController {
  
  playerObject!: Mesh
  playerMaterial: StandardMaterial

  personInteractLeaveCallback?: () => void
  personInteract?: Mesh
  playerSayMesh?: Mesh

  constructor(
    private say: Observable<string>,
    private people: PeopleController,
    private items: ItemsController,
    private input: InputController,
    private overlay: OverlayController,
    private scene: Scene,
    private level: LevelController,
    private inventory: InventoryController
  ) {
    this.playerObject = PlaneBuilder.CreatePlane('player', {
      height: 1,
      width: .5,
    }, this.scene)

    this.playerObject.checkCollisions = true

    this.restart()

    this.playerObject.ellipsoid.scaleInPlace(.5)

    this.playerMaterial = new StandardMaterial('player', this.scene)
    this.playerMaterial.transparencyMode = Material.MATERIAL_ALPHATEST
    this.playerMaterial.diffuseTexture = new Texture('/assets/player.png', this.scene, false, true, Texture.NEAREST_SAMPLINGMODE)
    this.playerMaterial.diffuseTexture.hasAlpha = true
    this.playerMaterial.useAlphaFromDiffuseTexture = true
    this.playerMaterial.backFaceCulling = false
    this.playerMaterial.specularColor = Color3.Black()

    this.playerObject.material = this.playerMaterial

    this.say.subscribe(text => {
      this.interactWithPerson(person => {
        person.metadata.say(text)
      })
    })

    this.items.itemGetCallback = item => {
      this.inventory.add(item)
      this.playerSayMesh?.dispose()
      this.playerSayMesh = this.overlay.text(`${item.answer}`, this.playerObject, undefined, undefined, undefined, .75, .75)
    }
  }

  update() {
    const dt = this.scene.getEngine().getDeltaTime()
    const speed = 0.00333  * dt

    if (this.input.pressed('ArrowUp')) {
      this.playerObject.moveWithCollisions(this.playerObject.forward.scale(speed))
    }
    
    if (this.input.pressed('ArrowDown')) {
      this.playerObject.moveWithCollisions(this.playerObject.forward.scale(speed).negate())
    }
    
    if (this.input.pressed('ArrowLeft')) {
      this.playerObject.rotate(Vector3.Up(), -speed / 2)
    }
    
    if (this.input.pressed('ArrowRight')) {
      this.playerObject.rotate(Vector3.Up(), speed / 2)
    }
    
    const ray = new Ray(this.playerObject.position.add(new Vector3(0, -.45, 0)), this.playerObject.forward, .5)
    const hits = ray.intersectsMeshes(this.level.wallMeshes as Array<DeepImmutable<AbstractMesh>>)
        
    if (hits.filter(x => x.hit).length) {
      if (this.input.pressed(' ')) {
        this.playerObject.moveWithCollisions(this.playerObject.up.scale(speed / 4))
      }
    } else {
      this.playerObject.moveWithCollisions(this.scene.gravity.scale(dt / 10))
    }

    if (this.input.pressed('Enter')) {
      this.interactWithPerson(person => {
        this.playerSayMesh?.dispose()
        person.metadata.ask()
      }, person => {
        person.metadata.leave?.()
      })
    }

    this.interactWithItem(item => {
      item.metadata.ask()
    })

    if (this.personInteractLeaveCallback) {
      const ray = new Ray(this.playerObject.position, this.playerObject.forward, 3)
      const hit = ray.intersectsMesh(this.personInteract as DeepImmutable<AbstractMesh>)

      if (!hit.hit) {
        this.personInteractLeaveCallback?.()
        this.personInteractLeaveCallback = undefined
        this.personInteract = undefined
      }
    }
  }
  
  restart() {
    this.playerObject.position.copyFrom(this.level.bestStartingPos())
    this.playerObject.position.addInPlace(new Vector3(0, .5, 0))
  }

  private interactWithItem(callback: (mesh: Mesh) => void): void {
    const ray = new Ray(this.playerObject.position.add(new Vector3(0, -.5 + .2 / 2, 0)), this.playerObject.forward, 1)
    const hits = ray.intersectsMeshes(this.items.itemMeshes as Array<DeepImmutable<AbstractMesh>>)
        
    hits.filter(x => x.hit).sort((a, b) => a.distance - b.distance).slice(0, 1).forEach(pickingInfo => {
      callback(pickingInfo.pickedMesh as Mesh)
    })
  }

  private interactWithPerson(callback: (mesh: Mesh) => void, leaveCallback?: (mesh: Mesh) => void): void {
    const ray = new Ray(this.playerObject.position, this.playerObject.forward, 3)
    const hits = ray.intersectsMeshes(this.people.peopleMeshes as Array<DeepImmutable<AbstractMesh>>)
        
    hits.filter(x => x.hit).sort((a, b) => a.distance - b.distance).slice(0, 1).forEach(pickingInfo => {
      if (leaveCallback) {
        this.personInteract = pickingInfo.pickedMesh as Mesh
        this.personInteractLeaveCallback = () => {
          leaveCallback?.(pickingInfo.pickedMesh as Mesh)
        }
      }

      callback(pickingInfo.pickedMesh as Mesh)
    })
  }
}