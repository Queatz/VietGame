import { FollowCamera, MeshBuilder, Scene, SolidParticleSystem, StandardMaterial, Texture, Material } from '@babylonjs/core'

export class RainController {

  SPS?: SolidParticleSystem

  constructor(private scene: Scene, private dense = false) {
    this.restart()
  }

  update() {
    this.SPS?.setParticles()
  }

  restart() {
    if (this.SPS) {
      this.SPS.dispose()
      this.SPS = undefined
    }

    if (Math.random() < .667) {
      return
    }

    this.dense = Math.random() < .333

    const rainMesh = MeshBuilder.CreatePlane('rain particle', {
      width: (this.dense ? 1 : 2 / 64),
      height: (this.dense ? 6 : 8 / 32)
    }, this.scene)

    const rainMat = new StandardMaterial('rain material', this.scene)
    rainMat.opacityTexture = new Texture(`assets/${this.dense ? 'dense ' : ''}rain.png`, this.scene)
    rainMat.transparencyMode = Material.MATERIAL_ALPHABLEND
    rainMat.twoSidedLighting = true
    rainMat.emissiveColor = this.scene.fogColor
    rainMat.alpha = .25 * (this.dense ? .5 : 1)
    rainMat.backFaceCulling = false

    rainMesh.material = rainMat

    const SPS = this.SPS = new SolidParticleSystem('Debris', this.scene, {
      useModelMaterial: true,
      updatable: true
    })

    SPS.addShape(rainMesh, (this.dense ? 6 : Math.ceil(Math.random() * 2)) * 1024)
    rainMesh.dispose()
    SPS.buildMesh()

    const rainBoxSize = 60, rainBoxHeight = 20

    SPS.initParticles = () => {
      for (let p = 0; p < SPS.nbParticles; p++) {
        const particle = SPS.particles[p]  
        particle.position.set(
          Math.random() * rainBoxSize,
          Math.random() * rainBoxHeight,
          Math.random() * rainBoxSize
        )

        particle.rotation.x = Math.PI
        particle.rotation.y = Math.PI * Math.random()
      }
    }

    SPS.updateParticle = particle => {
      const s = .012 * this.scene.getEngine().getDeltaTime()
      particle.position.addInPlaceFromFloats(0, s * this.scene.gravity.y * 24, 0)

      if (particle.position.y < 0) {
        const target = (this.scene.activeCamera! as FollowCamera).target

        particle.position.y = rainBoxHeight + particle.position.y
        particle.position.z = target.z + (Math.random() - .5) * rainBoxSize
        particle.position.x = target.x + (Math.random() - .5) * rainBoxSize
      }

      return particle
    }

    SPS.initParticles()
    SPS.setParticles()

    SPS.isAlwaysVisible = true
    // SPS.billboard = true
    SPS.computeParticleRotation = false
    SPS.computeParticleColor = false
    SPS.computeParticleTexture = false
    SPS.computeParticleVertex = false

    SPS.mesh.applyFog = false
    SPS.mesh.alphaIndex = 19

    this.SPS = SPS
  }
}