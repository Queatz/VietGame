import { AbstractMesh, Mesh, Scene, StandardMaterial, Texture, Vector3 } from "@babylonjs/core"
import { BoxBuilder } from "@babylonjs/core/Meshes/Builders/boxBuilder"
import * as seedrandom from 'seedrandom'
import { MapController } from "./map.controller"
import { Perlin } from "./noise"

export class LevelController {
  
  walls = new Perlin(seedrandom('Vietnam'))

  wallMeshes = [] as Array<AbstractMesh>

  constructor(private scene: Scene, private map: MapController) {

    const wallMaterial = new StandardMaterial('wall', this.scene)
    const texture = new Texture('/assets/wall.png', this.scene, false, false, Texture.NEAREST_SAMPLINGMODE)
    texture.vScale = 6
    texture.uScale = 6 * (this.map.mapSize * 2 / 6)
    wallMaterial.diffuseTexture = texture
    wallMaterial.specularPower = 512

    const ts = this.map.mapSize / this.map.numTiles

    ;[
      [-1, 0],
      [1, 0],
      [0, -1],
      [0, 1],
    ].forEach(wall => {
      const mesh = BoxBuilder.CreateBox('wall', {
        height: 6,
        width: this.map.mapSize,
        depth: 1
      }, this.scene)

      mesh.checkCollisions = true
      mesh.material = wallMaterial

      if (wall[1] === 0) {
        mesh.rotate(Vector3.Up(), Math.PI / 2)
      }

      mesh.position.addInPlace(new Vector3(wall[0], 0, wall[1]).scale(this.map.mapSize / 2 + .5))
  
      this.wallMeshes.push(mesh)
    })

    const opts = {
      height: 2,
      width: ts,
      depth: ts
    }

    const treeMaterial = new StandardMaterial('wall', this.scene)
    const treeTexture = new Texture('/assets/wall.png', this.scene, false, false, Texture.NEAREST_SAMPLINGMODE)
    treeTexture.vScale = 3
    treeTexture.uScale = 1
    wallMaterial.diffuseTexture = treeTexture
    wallMaterial.specularPower = 512

    for (let x = -this.map.numTiles / 2; x < this.map.numTiles / 2; x++) {
      for (let y = -this.map.numTiles / 2; y < this.map.numTiles / 2; y++) {
        const w = this.sampleWall(x, y)

        if (w <= .2) {
          continue
        }

        let mesh: AbstractMesh

        mesh = BoxBuilder.CreateBox('tree', opts, this.scene)
        mesh.material = treeMaterial

        const s = 3 * ((w - .2) / .8)

        mesh.position.copyFrom(new Vector3(x * ts + ts / 2, opts.height / 2 + (s * opts.height / 2), y * ts + ts / 2))
        mesh.scaling.copyFrom(new Vector3(1, 1 + s, 1))

        this.wallMeshes.push(mesh)
      }
    }

    const merged = Mesh.MergeMeshes(this.wallMeshes as Array<Mesh>)!
    merged.checkCollisions = true
    
    this.wallMeshes = [ merged ]
  }
 
  isWall(x: number, y: number): boolean {
    return this.sampleWall(x, y) > .2
  }
 
  sampleWall(x: number, y: number): number {
    return Math.abs(this.walls.sample(x / this.map.numTiles * 8, y / this.map.numTiles * 8))
  }
}