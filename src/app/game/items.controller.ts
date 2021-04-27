import { AbstractMesh, Color3, DeepImmutable, Material, Mesh, PlaneBuilder, Ray, Scene, Sound, StandardMaterial, Texture, Vector3 } from "@babylonjs/core"
import { OverlayController } from "./overlay.controller"
import * as seedrandom from 'seedrandom'
import { quiz } from "./quiz"
import { MapController } from "./map.controller"
import { LevelController } from "./level.controller"

export class ItemsController {

  quizItems = [ ...quiz ]

  itemMeshes: Array<AbstractMesh> = []

  getSound: Sound

  constructor(private overlay: OverlayController, private map: MapController, private level: LevelController, private scene: Scene) {
    this.getSound = new Sound('get', '/assets/powerUp5.mp3', this.scene)

    const rnd = seedrandom()

    const base = PlaneBuilder.CreatePlane('item', {
      height: .2,
      width: .2,
    }, this.scene)

    base.isVisible = false

    const material = new StandardMaterial('item', this.scene)
    material.transparencyMode = Material.MATERIAL_ALPHATEST
    material.emissiveTexture = material.diffuseTexture = new Texture('/assets/mystery box.png', this.scene, false, true, Texture.NEAREST_SAMPLINGMODE)
    material.diffuseTexture.hasAlpha = true
    material.useAlphaFromDiffuseTexture = true
    material.backFaceCulling = false
    material.specularColor = Color3.Black()
    material.linkEmissiveWithDiffuse = true
    base.material = material

    for(let i = 0; i < this.quizItems.length; i++) {
      const mesh = base.createInstance('item')

      mesh.billboardMode = Mesh.BILLBOARDMODE_Y

      for (let tries = 0; tries < 20; tries++) {
        mesh.position.copyFrom(new Vector3((rnd() - .5) * 2 * (this.map.mapSize / 2 - 2), .2 / 2, (rnd() - .5) * 2 * (this.map.mapSize / 2 - 2)))
      
        const ray = new Ray(mesh.position.add(new Vector3(0, -2, 0)), Vector3.Up(), 10)
        const hits = ray.intersectsMeshes(this.level.wallMeshes as Array<DeepImmutable<AbstractMesh>>, true)
            
        if (!hits?.[0]?.hit) {
          break
        }
      }

      const item = this.quizItems[i]

      mesh.metadata = {
        nameMesh: undefined as unknown as Mesh,
        talkMesh: undefined as unknown as Mesh,
        index: 0,
        items: [ item ],
        ask: () => {
          if (!mesh.isVisible) return

          mesh.metadata.talkMesh?.dispose()
          mesh.metadata.nameMesh?.dispose()

          mesh.isVisible = false

          this.getSound.play()

          setTimeout(() => {
            mesh.isVisible = true
            mesh.metadata.nameMesh = this.overlay.text(item.question, mesh, undefined, undefined, undefined, .5, .25)
          }, 30000)

          mesh.metadata.talkMesh = this.overlay.text(`"${mesh.metadata.items[0].answer}" có nghĩa là "${mesh.metadata.items[0].question}"`, mesh, true)
        },
        say: (text: string) => { }
      }

      this.itemMeshes.push(mesh)
    }
  }
}
