import { AbstractMesh, BoxBuilder, CascadedShadowGenerator, Color3, Color4, ColorCorrectionPostProcess, CubeTexture, DeepImmutable, DefaultRenderingPipeline, DirectionalLight, Engine, FollowCamera, FollowCameraMouseWheelInput, FollowCameraPointersInput, FreeCamera, GlowLayer, HemisphericLight, InstancedMesh, Ray, Scene, SphereBuilder, SSAO2RenderingPipeline, StandardMaterial, Texture, Vector3 } from "@babylonjs/core"
import { InputController } from "./input.controller"
import { MapController } from "./map.controller"
import { PeopleController } from "./people.controller"
import { PlayerController } from "./player.controller"
import { OverlayController } from "./overlay.controller"
import { Observable } from "rxjs"
import { LevelController } from "./level.controller"
import { ItemsController } from "./items.controller"

export class WorldController {

  camera: FollowCamera
  scene: Scene
  player: PlayerController
  map: MapController
  input: InputController
  pipeline: DefaultRenderingPipeline
  light: DirectionalLight
  ambientLight: HemisphericLight
  people: PeopleController
  overlayScene: Scene
  overlaySceneCamera: FreeCamera
  overlay: OverlayController
  level: LevelController
  shadowGenerator: CascadedShadowGenerator
  items: ItemsController
  lutPostProcess: ColorCorrectionPostProcess

  constructor(private say: Observable<string>, private engine: Engine) {
    this.scene = new Scene(this.engine)
    this.input = new InputController(this.scene)

    const assumedFramesPerSecond = 120
    const earthGravity = -9.81
    this.scene.gravity = new Vector3(0, earthGravity / assumedFramesPerSecond, 0)
    this.scene.fogMode = Scene.FOGMODE_LINEAR
    this.scene.fogStart = 5
    this.scene.fogEnd = 100
    this.scene.fogColor = new Color3(.75, 0, .125)
    this.scene.clearColor = new Color4(.75, 0, .125)
    this.scene.ambientColor = new Color3(0, 0, 0)

    this.overlayScene = new Scene(engine, { virtual: true })
    this.overlayScene.autoClear = false
    this.overlayScene.clearColor = new Color4(1, 1, 1, 0)
    this.overlaySceneCamera = new FreeCamera('overlaySceneCamera', new Vector3(0, 10, 0), this.overlayScene)
    let overlayPipeline = new DefaultRenderingPipeline('overlayPipeline', false, this.scene, [ this.overlaySceneCamera ])
    overlayPipeline.samples = 4
    this.overlay = new OverlayController(this.overlayScene)

    this.camera = new FollowCamera('camera', new Vector3(0, 10, 0), this.scene)
    this.camera.attachControl(true)
    this.camera.radius = 10 / 2
    this.camera.heightOffset = 1.5
    this.camera.lowerHeightOffsetLimit = 0
    this.camera.upperHeightOffsetLimit = 20
    this.camera.lowerRadiusLimit = 5 / 2
    this.camera.upperRadiusLimit = 20 / 2
    this.camera.cameraAcceleration = 0.025
    this.camera.rotationOffset = 180
    this.camera.fov = .5
    this.camera.maxZ = 200
    ;(this.camera.inputs.attached['mousewheel'] as FollowCameraMouseWheelInput).wheelPrecision = 1
    ;(this.camera.inputs.attached['pointers'] as FollowCameraPointersInput).angularSensibilityX = 2
    ;(this.camera.inputs.attached['pointers'] as FollowCameraPointersInput).angularSensibilityY = 8
    this.camera.inputs.remove(this.camera.inputs.attached.keyboard)

    this.light = new DirectionalLight('light', new Vector3(-25, -10, 0).normalize(), this.scene)
    this.light.intensity = 1
    this.light.shadowMinZ = this.camera.minZ
    this.light.shadowMaxZ = this.camera.maxZ
    this.ambientLight = new HemisphericLight('ambientLight', this.light.direction.clone(), this.scene)
    this.ambientLight.intensity = .52

    const sun = SphereBuilder.CreateSphere('sun', {
      diameter: 2.5
    })
    sun.position.copyFrom(this.light.direction.negate().scale(50))

    const sunMaterial = new StandardMaterial('sun', this.scene)
    sunMaterial.emissiveColor = Color3.White().toLinearSpace().scale(100)
    sunMaterial.specularColor = Color3.Black()
    sunMaterial.diffuseColor = Color3.Black()
    sun.material = sunMaterial

    const gl = new GlowLayer('glow', this.scene)
    gl.blurKernelSize = 96
    gl.intensity = 1

    this.shadowGenerator = new CascadedShadowGenerator(1024, this.light, true)
    this.shadowGenerator.lambda = .667
    this.shadowGenerator.transparencyShadow = true
    this.shadowGenerator.enableSoftTransparentShadow = true
    this.shadowGenerator.bias = .0035
    this.shadowGenerator.normalBias = .02
    this.shadowGenerator.setDarkness(0.5)
    this.shadowGenerator.depthClamp = true
    this.shadowGenerator.stabilizeCascades = true
    this.shadowGenerator.splitFrustum()

    this.scene.onNewMeshAddedObservable.add(mesh => {
      if (['person', 'player', 'ground', 'wall', 'tree'].indexOf(mesh.name) !== -1) {
        if (mesh.name !== 'ground') {
          this.shadowGenerator.addShadowCaster(mesh)
        }

        if (!(mesh instanceof InstancedMesh)) {
          mesh.receiveShadows = true
        }
      }
    })

    this.pipeline = new DefaultRenderingPipeline('defaultPipeline', true, this.scene, [ this.camera ])
    this.pipeline.samples = 4
    this.pipeline.fxaaEnabled = true
    this.pipeline.imageProcessingEnabled = true
    this.pipeline.imageProcessing.exposure = 1.5
    this.pipeline.bloomEnabled = true
    this.pipeline.bloomThreshold = .75
    this.pipeline.bloomWeight = 1.5
    this.pipeline.bloomKernel = 96
    this.pipeline.bloomScale = .5

    const ssao = new SSAO2RenderingPipeline('ssao', this.scene, {
      ssaoRatio: .5,
      blurRatio: 1
    })
    ssao.radius = 16
    ssao.totalStrength = 1
    ssao.expensiveBlur = true
    ssao.samples = 24
    ssao.maxZ = this.camera.maxZ / 2
    this.scene.postProcessRenderPipelineManager.attachCamerasToRenderPipeline('ssao', this.camera)


    this.lutPostProcess = new ColorCorrectionPostProcess(
      'color_correction',
      'assets/Fuji XTrans III - Classic Chrome.png',
      1,
      this.camera
    )

    this.map = new MapController(this.scene)
    this.level = new LevelController(this.scene, this.map)

    this.people = new PeopleController(this.overlay, this.map, this.level, this.scene)
    this.items = new ItemsController(this.overlay, this.map, this.level, this.scene)

    this.player = new PlayerController(this.say, this.people, this.items, this.input, this.overlay, this.scene)

    this.camera.lockedTarget = this.player.playerObject

    // const skybox = BoxBuilder.CreateBox('skyBox', { size: (this.map.mapSize * 2) }, this.scene)
    // const skyboxMaterial = new StandardMaterial('skyBox', this.scene)
    // skyboxMaterial.backFaceCulling = false
    // skyboxMaterial.reflectionTexture = new CubeTexture('https://playground.babylonjs.com/textures/skybox', this.scene)
    // skyboxMaterial.reflectionTexture.coordinatesMode = Texture.SKYBOX_MODE
    // skyboxMaterial.diffuseColor = new Color3(0, 0, 0)
    // skyboxMaterial.specularColor = new Color3(0, 0, 0)
    // skybox.material = skyboxMaterial
    // skybox.applyFog = false

    this.scene.onBeforeRenderObservable.add(() => {
      this.update();

      const d = Vector3.Distance(this.camera.position, this.player.playerObject.position)
      const ray = new Ray(this.player.playerObject.position, this.camera.position.subtract(this.player.playerObject.position).normalize(), d)
      const hits = ray.intersectsMeshes(this.level.wallMeshes as Array<DeepImmutable<AbstractMesh>>)
          
      if (hits?.[0]?.hit) {
        this.camera.position.copyFrom(Vector3.Lerp(this.camera.position, hits[0]!.pickedPoint!, .125))
      }
    })
  }

  update(): void {
    this.camera.update()
    this.player.update()

    this.overlaySceneCamera.position = this.camera.position.clone()
    this.overlaySceneCamera.rotation = this.camera.rotation.clone()
    this.overlaySceneCamera.fov = this.camera.fov
    this.overlaySceneCamera.minZ = this.camera.minZ
    this.overlaySceneCamera.maxZ = this.camera.maxZ
  }

  render(): void {
    this.scene.render()
    this.overlayScene.render()
  }
}