import { AbstractMesh, BoxBuilder, CascadedShadowGenerator, Color3, Color4, ColorCorrectionPostProcess, CubeTexture, DeepImmutable, DefaultRenderingPipeline, DirectionalLight, Engine, FollowCamera, FollowCameraMouseWheelInput, FollowCameraPointersInput, FreeCamera, GlowLayer, HemisphericLight, InstancedMesh, Nullable, PrePassRenderer, Ray, Scene, Sound, SphereBuilder, SSAO2RenderingPipeline, StandardMaterial, Texture, Vector3 } from "@babylonjs/core"
import { InputController } from "./input.controller"
import { MapController } from "./map.controller"
import { PeopleController } from "./people.controller"
import { PlayerController } from "./player.controller"
import { OverlayController } from "./overlay.controller"
import { Observable } from "rxjs"
import { LevelController } from "./level.controller"
import { ItemsController } from "./items.controller"
import { restartQuiz } from "./quiz"
import { InventoryController } from "./inventory.controller"
import { GameController } from "./game.controller"
import { RainController } from "./rain.controller"
import { TreeController } from "./tree.controller"

export class WorldController {

  input: InputController
  overlay: OverlayController
  level: LevelController
  items: ItemsController
  people: PeopleController
  player: PlayerController
  map: MapController

  camera: FollowCamera
  scene: Scene
  pipeline: DefaultRenderingPipeline
  light: DirectionalLight
  ambientLight: HemisphericLight
  overlayScene: Scene
  overlaySceneCamera: FreeCamera
  shadowGenerator: CascadedShadowGenerator
  music: Sound
  inventory: InventoryController
  skyboxMaterial: StandardMaterial
  rain: RainController
  tree: TreeController
  sun: any

  constructor(private say: Observable<string>, private engine: Engine, private game: GameController) {
    this.scene = new Scene(this.engine)
    this.input = new InputController(this.scene)

    this.music = new Sound('music', '/assets/Next to You.mp3', this.scene, undefined, {
      autoplay: true,
      loop: true,
      volume: .5
    })

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

    this.camera = new FollowCamera('camera', new Vector3(0, 1, 0), this.scene)
    this.camera.attachControl(true)
    this.camera.radius = 10 / 2
    this.camera.heightOffset = 1
    this.camera.lowerHeightOffsetLimit = 0
    this.camera.upperHeightOffsetLimit = 20
    this.camera.lowerRadiusLimit = 5 / 2
    this.camera.upperRadiusLimit = 20 / 2
    this.camera.cameraAcceleration = 0.025
    this.camera.rotationOffset = 180
    this.camera.fov = .667
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

    this.sun = SphereBuilder.CreateSphere('sun', {
      diameter: 2.5
    })

    const sunMaterial = new StandardMaterial('sun', this.scene)
    sunMaterial.emissiveColor = Color3.White().toLinearSpace().scale(100)
    sunMaterial.specularColor = Color3.Black()
    sunMaterial.diffuseColor = Color3.Black()
    this.sun.material = sunMaterial
    this.sun.applyFog = false

    // const gl = new GlowLayer('glow', this.scene)
    // gl.blurKernelSize = 24
    // gl.intensity = .25

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
    this.pipeline.bloomThreshold = .5
    this.pipeline.bloomWeight = .5
    this.pipeline.bloomKernel = 96 / 2
    this.pipeline.bloomScale = .5

    // const ssao = new SSAO2RenderingPipeline('ssao', this.scene, {
    //   ssaoRatio: .5,
    //   blurRatio: 1
    // }, [ this.camera ], true)
    // ssao.radius = 16
    // ssao.totalStrength = 1
    // ssao.expensiveBlur = true
    // ssao.samples = 24
    // ssao.maxZ = this.camera.maxZ / 2

    new ColorCorrectionPostProcess(
      'color_correction',
      'assets/Fuji XTrans III - Classic Chrome.png',
      1,
      this.camera
    )

    this.map = new MapController(this.scene)
    this.level = new LevelController(this.scene, this.map)
    this.tree = new TreeController(this.scene, this.map, this.level)

    this.inventory = new InventoryController()
    this.people = new PeopleController(this, this.overlay, this.map, this.level, this.inventory, this.scene)
    this.items = new ItemsController(this.overlay, this.map, this.level, this.scene)

    this.player = new PlayerController(this.say, this.people, this.items, this.input, this.overlay, this.scene, this.level, this.inventory)

    this.camera.lockedTarget = this.player.playerObject

    const skybox = BoxBuilder.CreateBox('skyBox', { size: (this.map.mapSize * 2) }, this.scene)
    this.skyboxMaterial = new StandardMaterial('skyBox', this.scene)
    this.skyboxMaterial.backFaceCulling = false
    // skyboxMaterial.reflectionTexture = new CubeTexture('https://playground.babylonjs.com/textures/skybox', this.scene)
    // skyboxMaterial.reflectionTexture.coordinatesMode = Texture.SKYBOX_MODE
    this.skyboxMaterial.emissiveColor = new Color3(1, .1, .1).toLinearSpace().scale(4)
    this.skyboxMaterial.diffuseColor = new Color3(0, 0, 0)
    this.skyboxMaterial.specularColor = new Color3(0, 0, 0)
    this.skyboxMaterial.disableDepthWrite = true
    skybox.alphaIndex = -1
    skybox.material = this.skyboxMaterial
    skybox.applyFog = false

    this.makeSky()

    this.rain = new RainController(this.scene)

    this.scene.onBeforeRenderObservable.add(() => {
       this.update()

      const d = Vector3.Distance(this.camera.position, this.player.playerObject.position)
      const ray = new Ray(this.player.playerObject.position, this.camera.position.subtract(this.player.playerObject.position).normalize(), d)
      const hits = ray.intersectsMeshes(this.level.wallMeshes as Array<DeepImmutable<AbstractMesh>>)
          
      if (hits?.[0]?.hit) {
        this.camera.position.copyFrom(Vector3.Lerp(this.camera.position, hits[0]!.pickedPoint!, .125))
      }
    })
  }

  restart(): void {
    restartQuiz()
    this.makeSky()
    this.map.restart()
    this.level.restart()
    this.rain.restart()
    this.items.restart()
    this.people.restart()
    this.tree.restart()
    this.player.restart()
    this.game.restart()
  }

  makeSky() {

    this.light.direction.copyFrom(new Vector3(-Math.random() * 1, -Math.random() * 2, -Math.random() * 1))
    this.sun.position.copyFrom(this.light.direction.negate().scale(50))

    let sky = new Color3(1, .75, .5).toHSV()
    let v = Math.random() * .65 + .125
    Color3.HSVtoRGBToRef(Math.random() * 360, sky.g, v, sky)
    this.skyboxMaterial.emissiveColor = sky.scale(1.5)
    this.scene.fogColor = sky
    this.light.intensity = v
  }

  update(): void {
    this.camera.update()
    this.player.update()
    this.rain.update()

    this.overlaySceneCamera.position = this.camera.position.clone()
    this.overlaySceneCamera.rotation = this.camera.rotation.clone()
    this.overlaySceneCamera.fov = this.camera.fov
    this.overlaySceneCamera.minZ = this.camera.minZ
    this.overlaySceneCamera.maxZ = this.camera.maxZ

    if (this.input.single('r')) {
      this.restart()
    }
  }

  render(): void {
    this.scene.render()
    this.overlayScene.render()
  }
}