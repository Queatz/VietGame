import { Color3, FloatArray, Mesh, MultiMaterial, Scene, StandardMaterial, SubMesh, Texture, Vector3, VertexBuffer } from "@babylonjs/core"
import { GroundBuilder } from "@babylonjs/core/Meshes/Builders/groundBuilder"
import * as seedrandom from "seedrandom"
import { Perlin } from "./noise"

export class MapController {
  
  readonly mapSize = 32
  readonly numTiles = this.mapSize / 2
  
  ground!: Mesh
  groundMaterial!: StandardMaterial
  groundTileMaterial!: MultiMaterial

  constructor(private scene: Scene) {
    this.restart()
  }
  
  restart() {
    this.ground?.dispose()

    this.ground = GroundBuilder.CreateTiledGround('ground', {
      xmin: -this.mapSize / 2,
      zmin: -this.mapSize / 2,
      xmax: this.mapSize / 2,
      zmax: this.mapSize / 2,
      subdivisions: {
        w: this.numTiles,
        h: this.numTiles
      },
      updatable: true
    }, this.scene)

    this.ground.checkCollisions = true

    if (!this.groundMaterial) {
      this.groundMaterial = new StandardMaterial('ground', this.scene)
      this.groundMaterial.diffuseTexture = new Texture('/assets/dirt.png', this.scene, false, false, Texture.NEAREST_SAMPLINGMODE)
      this.groundMaterial.specularTexture = this.groundMaterial.diffuseTexture
      this.groundMaterial.diffuseTexture.wrapU = Texture.CLAMP_ADDRESSMODE
      this.groundMaterial.diffuseTexture.wrapV = Texture.CLAMP_ADDRESSMODE
      this.groundMaterial.specularTexture.wrapU = Texture.CLAMP_ADDRESSMODE
      this.groundMaterial.specularTexture.wrapV = Texture.CLAMP_ADDRESSMODE
      this.groundMaterial.specularColor = Color3.FromArray([ .1, .1, .1 ])

      this.groundTileMaterial = new MultiMaterial('ground', this.scene)
      this.groundTileMaterial.subMaterials.push(this.groundMaterial)
    }

    this.ground.material = this.groundTileMaterial

    // const verticesCount = this.ground.getTotalVertices()
    // const tileIndicesLength = this.ground.getIndices()!.length / (this.numTiles * this.numTiles)
    
    // this.ground.subMeshes = []
    // let base = 0

    // for (let row = 0; row < 8; row++) {
    //     for (let col = 0; col < 8; col++) {
    //         this.ground.subMeshes.push(new SubMesh(0, 0, verticesCount, base, tileIndicesLength, this.ground))
    //         base += tileIndicesLength
    //     }
    // }

    const uvs: FloatArray = []

    let dirtTileUVs = this.getTileUVs(0)
    let grassTileUVs = this.getTileUVs(1)
    let waterTileUVs = this.getTileUVs(2)

    let noise = new Perlin(seedrandom())
    let water = new Perlin(seedrandom())

    for (let row = 0; row < this.numTiles; row++) {
      for (let col = 0; col < this.numTiles; col++) {
        if (water.sample(row / this.numTiles * 2, col / this.numTiles * 2) < -.3) {
          uvs.push(...waterTileUVs)
        } else if (noise.sample(row / this.numTiles * 4, col / this.numTiles * 4) < 0) {
          uvs.push(...dirtTileUVs)
        } else {
          uvs.push(...grassTileUVs)
        }
      }
    }

    this.ground.updateVerticesData(VertexBuffer.UVKind, uvs)
  }

  private getTileUVs(index: number) {
    const imageXTileCount = 2

    let s = 1 / imageXTileCount;
    let x = s * (index % imageXTileCount);
    let y = s * (Math.floor(index / imageXTileCount));

    return [x, y, x + s, y, x, y + s, x + s, y + s];
  }
}