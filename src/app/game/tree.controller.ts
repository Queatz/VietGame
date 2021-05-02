import { AbstractMesh, Color3, DeepImmutable, DirectionalLight, Light, Material, Mesh, PlaneBuilder, Quaternion, Ray, Scene, StandardMaterial, Texture, Vector3 } from "@babylonjs/core"
import * as seedrandom from 'seedrandom'
import { MapController } from "./map.controller"
import { LevelController } from "./level.controller"

export class TreeController {

  meshes: Array<AbstractMesh> = []

  base: Mesh
  rnd: any

  treeHeight = 8
  shadowBase: Mesh

  constructor(private scene: Scene, private map: MapController, private level: LevelController, private light: DirectionalLight) {
    this.rnd = seedrandom()

    this.base = PlaneBuilder.CreatePlane('tree', {
      height: this.treeHeight,
      width: this.treeHeight / 2,
    }, this.scene)

    this.shadowBase = this.base.clone('shadow')
    this.shadowBase.visibility = 0

    this.base.isVisible = false
    this.shadowBase.isVisible = false

    const material = new StandardMaterial('tree', this.scene)
    material.transparencyMode = Material.MATERIAL_ALPHATEST
    material.emissiveTexture = material.diffuseTexture = new Texture('/assets/pine tree.png', this.scene, false, true, Texture.NEAREST_SAMPLINGMODE)
    material.diffuseTexture.hasAlpha = true
    material.useAlphaFromDiffuseTexture = true
    material.backFaceCulling = false
    material.specularColor = Color3.Black()
    material.linkEmissiveWithDiffuse = true
    this.base.material = material
    this.shadowBase.material = material

    this.restart()
  }
  
  restart() {
    this.meshes.forEach(mesh => {
      mesh.dispose()
    })

    this.meshes = []

    for(let i = 0; i < this.map.mapSize / 2; i++) {
      const mesh = this.base.createInstance('tree mesh')
      const shadow = this.shadowBase.createInstance('tree')

      mesh.billboardMode = Mesh.BILLBOARDMODE_Y

      for (let tries = 0; tries < 20; tries++) {
        mesh.position.copyFrom(new Vector3((this.rnd() - .5) * 2 * (this.map.mapSize / 2 - 2), this.treeHeight / 2, (this.rnd() - .5) * 2 * (this.map.mapSize / 2 - 2)))
      
        const ray = new Ray(mesh.position.add(new Vector3(0, -2, 0)), Vector3.Up(), 10)
        const hits = ray.intersectsMeshes(this.level.wallMeshes as Array<DeepImmutable<AbstractMesh>>, true)
            
        if (!hits?.[0]?.hit) {
          break
        }
      }

      shadow.position.copyFrom(mesh.position.add(new Vector3(0, .25, 0)))

      const q = Quaternion.FromLookDirectionLH(this.light.direction, Vector3.Up()).toEulerAngles().y
      shadow.addRotation(0, q, 0)

      this.meshes.push(mesh)
      this.meshes.push(shadow)
    }
  }
}
