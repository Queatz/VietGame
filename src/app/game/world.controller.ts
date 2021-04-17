import { CascadedShadowGenerator, Color3, Color4, CubeTexture, DefaultRenderingPipeline, DirectionalLight, Engine, FollowCamera, FollowCameraMouseWheelInput, FollowCameraPointersInput, FreeCamera, HemisphericLight, Scene, StandardMaterial, Texture, Vector3 } from "@babylonjs/core"
import { InputController } from "./input.controller"
import { MapController } from "./map.controller"
import { PeopleController } from "./people.controller"
import { PlayerController } from "./player.controller"
import { BoxBuilder } from "@babylonjs/core/Meshes/Builders/boxBuilder"
import { OverlayController } from "./overlay.controller"
import { Observable } from "rxjs"
import { LevelController } from "./level.controller"

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

  constructor(private say: Observable<string>, private engine: Engine) {
    this.scene = new Scene(this.engine)
    this.input = new InputController(this.scene)

    const assumedFramesPerSecond = 120
    const earthGravity = -9.81
    this.scene.gravity = new Vector3(0, earthGravity / assumedFramesPerSecond, 0)
    this.scene.fogMode = Scene.FOGMODE_LINEAR
    this.scene.fogStart = 5
    this.scene.fogEnd = 100
    this.scene.fogColor = new Color3(110/255, 158/255, 169/255)
    this.scene.clearColor = new Color4(0, 0, 0)
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
    this.camera.lowerHeightOffsetLimit = 1 / 2
    this.camera.upperHeightOffsetLimit = 20 / 2
    this.camera.lowerRadiusLimit = 5 / 2
    this.camera.upperRadiusLimit = 20 / 2
    this.camera.cameraAcceleration = 0.025
    this.camera.rotationOffset = 180
    this.camera.fov = .6
    this.camera.maxZ = 100
    ;(this.camera.inputs.attached['mousewheel'] as FollowCameraMouseWheelInput).wheelPrecision = 1
    ;(this.camera.inputs.attached['pointers'] as FollowCameraPointersInput).angularSensibilityX = 2
    ;(this.camera.inputs.attached['pointers'] as FollowCameraPointersInput).angularSensibilityY = 8
    this.camera.inputs.remove(this.camera.inputs.attached.keyboard);

    this.light = new DirectionalLight('light', new Vector3(-25, -10, 0).normalize(), this.scene)
    this.light.intensity = 1
    this.light.shadowMinZ = this.camera.minZ
    this.light.shadowMaxZ = this.camera.maxZ
    this.ambientLight = new HemisphericLight('ambientLight', this.light.direction.clone(), this.scene)
    this.ambientLight.intensity = .52

    this.shadowGenerator = new CascadedShadowGenerator(1024, this.light, true)
    this.shadowGenerator.lambda = .667
    this.shadowGenerator.transparencyShadow = true
    this.shadowGenerator.enableSoftTransparentShadow = true
    this.shadowGenerator.bias = .007
    this.shadowGenerator.normalBias = .03
    this.shadowGenerator.setDarkness(0.5)
    this.shadowGenerator.depthClamp = true
    this.shadowGenerator.stabilizeCascades = true
    this.shadowGenerator.splitFrustum()

    this.scene.onNewMeshAddedObservable.add(mesh => {
      if (['person', 'player', 'ground', 'wall', 'tree'].indexOf(mesh.name) !== -1) {
        if (mesh.name !== 'ground') {
          this.shadowGenerator.addShadowCaster(mesh)
        }
        mesh.receiveShadows = true
      }
    })

    this.pipeline = new DefaultRenderingPipeline('defaultPipeline', true, this.scene, [ this.camera ])
    this.pipeline.samples = 4
    this.pipeline.fxaaEnabled = true

    this.map = new MapController(this.scene)

    this.people = new PeopleController(this.overlay, this.scene)

    this.player = new PlayerController(this.say, this.people, this.input, this.overlay, this.scene)

    this.camera.lockedTarget = this.player.playerObject

    const skybox = BoxBuilder.CreateBox('skyBox', { size: 85 }, this.scene)
    const skyboxMaterial = new StandardMaterial('skyBox', this.scene)
    skyboxMaterial.backFaceCulling = false
    skyboxMaterial.reflectionTexture = new CubeTexture('https://playground.babylonjs.com/textures/skybox', this.scene)
    skyboxMaterial.reflectionTexture.coordinatesMode = Texture.SKYBOX_MODE
    skyboxMaterial.diffuseColor = new Color3(0, 0, 0)
    skyboxMaterial.specularColor = new Color3(0, 0, 0)
    skybox.material = skyboxMaterial
    skybox.applyFog = false

    this.level = new LevelController(this.scene)

    this.scene.onBeforeRenderObservable.add(() => {
      this.update();
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