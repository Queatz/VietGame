import { Color3, Scene, StandardMaterial, Texture, Vector3 } from "@babylonjs/core"
import { BoxBuilder } from "@babylonjs/core/Meshes/Builders/boxBuilder"
import * as seedrandom from 'seedrandom'

export class LevelController {
  constructor(private scene: Scene) {

    const wallMaterial = new StandardMaterial('wall', this.scene)
    const texture = new Texture('/assets/wall.png', this.scene, false, false, Texture.NEAREST_SAMPLINGMODE)
    texture.vScale = 6
    texture.uScale = 6 * (24 * 2 / 6)
    wallMaterial.diffuseTexture = texture

    ;[
      [-1, 0],
      [1, 0],
      [0, -1],
      [0, 1],
    ].forEach(wall => {
      const mesh = BoxBuilder.CreateBox('wall', {
        height: 6,
        width: 24 * 2,
        depth: 1
      }, this.scene)

      mesh.checkCollisions = true
      mesh.material = wallMaterial

      if (wall[1] === 0) {
        mesh.rotate(Vector3.Up(), Math.PI / 2)
      }

      mesh.position.addInPlace(new Vector3(wall[0], 0, wall[1]).scale(24))
    })

    const rnd = seedrandom('trees')
    const rndMat = seedrandom('tree materials')

    for (let i = 0; i < 25; i++) {
      const mesh = BoxBuilder.CreateBox('tree', {
        height: rnd() * 2 + 2,
        width: rnd() * 2 + 2,
        depth: rnd() * 1 + 1
      }, this.scene)

      if (rnd() < .5) {
        mesh.rotate(Vector3.Up(), Math.PI / 2)
      }

      mesh.checkCollisions = true

      mesh.position.addInPlace(new Vector3((rnd() - .5) * 2 * 20, 0, (rnd() - .5) * 2 * 20))

      const material = new StandardMaterial('tree', this.scene)
      material.diffuseColor = Color3.FromArray([.8 + rndMat() * .2, 1 - rndMat() * .4, 0])

      mesh.material = material
    }
  }
}