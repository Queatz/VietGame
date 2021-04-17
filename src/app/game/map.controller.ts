import { Color3, Mesh, MultiMaterial, Scene, StandardMaterial, SubMesh, Texture, Vector3 } from "@babylonjs/core"
import { GroundBuilder } from "@babylonjs/core/Meshes/Builders/groundBuilder"

export class MapController {
  
  ground: Mesh
  groundMaterial: StandardMaterial
  groundTileMaterial: MultiMaterial

  constructor(private scene: Scene) {
    const mapSize = 24
    const numTiles = 24

    this.ground = GroundBuilder.CreateTiledGround('ground', {
      xmin: -mapSize,
      zmin: -mapSize,
      xmax: mapSize,
      zmax: mapSize,
      subdivisions: {
        w: numTiles,
        h: numTiles
      },
      updatable: true
    }, this.scene)

    this.ground.checkCollisions = true

    this.groundMaterial = new StandardMaterial('ground', this.scene)
    this.groundMaterial.diffuseTexture = new Texture('/assets/dirt.png', this.scene, false, false, Texture.NEAREST_SAMPLINGMODE)
    this.groundMaterial.diffuseTexture.wrapU = Texture.CLAMP_ADDRESSMODE
    this.groundMaterial.diffuseTexture.wrapV = Texture.CLAMP_ADDRESSMODE
    this.groundMaterial.specularColor = Color3.Gray()

    this.groundTileMaterial = new MultiMaterial('ground', this.scene)
    this.groundTileMaterial.subMaterials.push(this.groundMaterial)

    this.ground.material = this.groundTileMaterial

    // const verticesCount = this.ground.getTotalVertices()
    // const tileIndicesLength = this.ground.getIndices()!.length / (numTiles * numTiles)
    
    // this.ground.subMeshes = []
    // let base = 0

    // for (let row = 0; row < 8; row++) {
    //     for (let col = 0; col < 8; col++) {
    //         this.ground.subMeshes.push(new SubMesh(0, 0, verticesCount, base, tileIndicesLength, this.ground))
    //         base += tileIndicesLength
    //     }
    // }
  }
}