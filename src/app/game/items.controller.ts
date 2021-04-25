import { AbstractMesh, BoxBuilder, Color3, DeepImmutable, Mesh, Ray, Scene, StandardMaterial, Vector3 } from "@babylonjs/core"
import { OverlayController } from "./overlay.controller"
import * as seedrandom from 'seedrandom'
import { quiz } from "./quiz"
import { QuizItem, shuffle } from "./models"
import { MapController } from "./map.controller"
import { LevelController } from "./level.controller"

export class ItemsController {

  quizItems = quiz.trim().split('\n').map(item => {
    const x = item.split('\t')
    return {
      answer: x[0].trim(),
      question: x[1].trim()
    } as QuizItem
  })

  itemMeshes: Array<Mesh> = []

  constructor(private overlay: OverlayController, private map: MapController, private level: LevelController, private scene: Scene) {

    const rnd = seedrandom('items')

    for(let i = 0; i < this.quizItems.length; i++) {
      const mesh = BoxBuilder.CreateBox('item', {
        height: .2,
        depth: .2,
        width: .2,
      }, this.scene)

      mesh.ellipsoid.scaleInPlace(.2)

      for (let tries = 0; tries < 20; tries++) {
        mesh.position.copyFrom(new Vector3((rnd() - .5) * 2 * (this.map.mapSize / 2 - 2), .2 / 2, (rnd() - .5) * 2 * (this.map.mapSize / 2 - 2)))
      
        const ray = new Ray(mesh.position.add(new Vector3(0, -2, 0)), Vector3.Up(), 10)
        const hits = ray.intersectsMeshes(this.level.wallMeshes as Array<DeepImmutable<AbstractMesh>>, true)
            
        if (!hits?.[0]?.hit) {
          break
        }
      }

      const material = new StandardMaterial('player', this.scene)
      material.diffuseColor = Color3.FromArray([ rnd(), rnd(), rnd() ])

      mesh.material = material

      const srnd = seedrandom(i.toString())

      mesh.metadata = {
        talkMesh: undefined as unknown as Mesh,
        index: 0,
        items: [ this.quizItems[i] ],
        ask: () => {
          if (!mesh.isVisible) return;

          if (mesh.metadata.talkMesh) {
            mesh.metadata.talkMesh.dispose()
          }

          mesh.isVisible = false

          setTimeout(() => {
            mesh.isVisible = true
          }, 8000)

          mesh.metadata.talkMesh = this.overlay.text(`"${mesh.metadata.items[0].answer}" có nghĩa là "${mesh.metadata.items[0].question}"`, mesh, true)
        },
        say: (text: string) => { }
      }

      this.itemMeshes.push(mesh)
    }
  }
}
