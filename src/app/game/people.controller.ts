import { AbstractMesh, Color3, DeepImmutable, Material, Mesh, PlaneBuilder, Ray, Scene, Sound, StandardMaterial, Texture, Vector3 } from '@babylonjs/core'
import { OverlayController } from './overlay.controller'
import * as seedrandom from 'seedrandom'
import { quiz } from './quiz'
import { QuizItem, shuffle } from './models'
import { MapController } from './map.controller'
import { LevelController } from './level.controller'
import { WorldController } from './world.controller'
import { InventoryController } from './inventory.controller'

export class PeopleController {

  quizItems = [] as Array<QuizItem>

  peopleMeshes: Array<Mesh> = []

  talkSound: Sound
  completeSound: Sound

  numberOfCorrectAnswersPerQuestion!: number
  numberOfPeople!: number

  constructor(
    private world: WorldController,
    private overlay: OverlayController,
    private map: MapController,
    private level: LevelController,
    private inventory: InventoryController,
    private scene: Scene
  ) {
    this.talkSound = new Sound('get', '/assets/threeTone1.mp3', this.scene)
    this.completeSound = new Sound('get', '/assets/highUp.mp3', this.scene)

    this.restart()
  }

  restart() {
    this.quizItems = [ ...quiz ]

    this.numberOfCorrectAnswersPerQuestion = 5
    this.numberOfPeople = Math.ceil(this.numberOfCorrectAnswersPerQuestion * Math.sqrt(this.quizItems.length / this.numberOfCorrectAnswersPerQuestion))

    this.peopleMeshes.forEach(mesh => {
      mesh.dispose()
    })

    this.peopleMeshes = []

    const rnd = seedrandom()

    const makePersonMesh = () => {
      const mesh = PlaneBuilder.CreatePlane('person', {
        height: 1,
        width: .5
      }, this.scene)
      mesh.checkCollisions = true
      mesh.ellipsoid.scaleInPlace(.5)
      mesh.billboardMode = Mesh.BILLBOARDMODE_Y

      return mesh
    }

    const positionMeshSafe = (mesh: Mesh) => {
      for (let tries = 0; tries < 20; tries++) {
        mesh.position.copyFrom(new Vector3((rnd() - .5) * 2 * (this.map.mapSize / 2 - 2), .5, (rnd() - .5) * 2 * (this.map.mapSize / 2 - 2)))

        const ray = new Ray(mesh.position.add(new Vector3(0, -2, 0)), Vector3.Up(), 10)
        const hits = ray.intersectsMeshes(this.level.wallMeshes as Array<DeepImmutable<AbstractMesh>>, true)

        if (!hits?.[0]?.hit) {
          break
        }
      }
    }

    const makeMaterial = (person: string) => {
      const material = new StandardMaterial('player', this.scene)
      material.transparencyMode = Material.MATERIAL_ALPHATEST
      material.diffuseTexture = new Texture(`/assets/person ${person}.png`, this.scene, false, true, Texture.NEAREST_SAMPLINGMODE)
      material.diffuseTexture.hasAlpha = true
      material.useAlphaFromDiffuseTexture = true
      material.backFaceCulling = false
      material.specularColor = Color3.Black()
      return material
    }

    const mats = {
      girl: makeMaterial('1'),
      boy: makeMaterial('2'),
      boss: makeMaterial('3'),
    }

    const srnd = seedrandom()

    for (let i = 0; i < this.numberOfPeople; i++) {
      const mesh = makePersonMesh()

      positionMeshSafe(mesh)
      const sex = Math.floor(srnd() * 2)
      const name = names[sex][Math.floor(srnd() * names[sex].length)]
      const nameMesh = this.overlay.text(name, mesh)
      mesh.material = sex === 0 ? mats.girl : mats.boy
      mesh.metadata = this.genMeta(srnd, mesh, name, nameMesh)

      this.peopleMeshes.push(mesh)
    }

    const mesh = makePersonMesh()

    positionMeshSafe(mesh)

    const name = names[0][Math.floor(srnd() * names[0].length)]
    const nameMesh = this.overlay.text(name, mesh)
    mesh.material = mats.boss
    mesh.metadata = this.genMeta(srnd, mesh, name, nameMesh, true)

    this.peopleMeshes.push(mesh)
  }

  genMeta(srnd: any, mesh: Mesh, name: string, nameMesh: Mesh, isBoss = false) {
    return {
      canAnswer: Math.random() < .5,
      isBoss,
      nameMesh,
      talkMesh: undefined as unknown as Mesh,
      index: 0,
      items: (() => {
        if (isBoss) {
          return shuffle(srnd, [ ...this.quizItems ])
        } else {
          return shuffle(srnd, [ ...this.quizItems ]).slice(0, Math.ceil(this.quizItems.length * (this.numberOfCorrectAnswersPerQuestion / this.numberOfPeople)))
        }
      })(),
      ask: () => {
        this.talkSound.stop()
        this.talkSound.play()

        if (mesh.metadata.talkMesh) {
          mesh.metadata.talkMesh.dispose()
        }

        if (mesh.metadata.isBoss) {
          this.world.items.hide()
        }

        if (mesh.metadata.canAnswer && !mesh.metadata.isBoss && !this.inventory.isEmpty()) {
          mesh.metadata.talkMesh = this.overlay.text(`"${this.inventory.top()!.answer}" ?? ngh??a l?? "${this.inventory.top()!.question}"`, mesh, true)
        } else if (mesh.metadata.index >= mesh.metadata.items.length) {
          mesh.metadata.talkMesh = this.overlay.text('???? l?? t???t c???!', mesh, true)
        } else {
          mesh.metadata.talkMesh = this.overlay.text(mesh.metadata.items[mesh.metadata.index].question, mesh, true)
        }
      },
      say: (text: string) => {
        mesh.metadata.talkMesh?.dispose()

        if (mesh.metadata.canAnswer && !mesh.metadata.isBoss && !this.inventory.isEmpty()) {
          if (this.inventory.top()!.answer === text) {
            mesh.metadata.talkMesh = this.overlay.text('????ng!', mesh, true)
            this.inventory.take()
          } else {
            const hint = true ? ` N?? l?? "${this.inventory.top()!.answer}".` : ''
            mesh.metadata.talkMesh = this.overlay.text(`Kh??ng ch??nh x??c!${hint}`, mesh, true)
          }

          return
        }

        if (mesh.metadata.index >= mesh.metadata.items.length) {
          mesh.metadata.talkMesh = this.overlay.text('???? l?? t???t c???!', mesh, true)
          return
        }

        if (mesh.metadata.items[mesh.metadata.index].answer === text) {
          mesh.metadata.index++
          mesh.metadata.nameMesh.dispose()
          mesh.metadata.nameMesh = this.overlay.text(`${name} (${mesh.metadata.index}/${mesh.metadata.items.length})`, mesh)

          if (mesh.metadata.index >= mesh.metadata.items.length) {
            mesh.metadata.talkMesh = this.overlay.text(mesh.metadata.isBoss ? 'Ch??c m???ng!' : '????ng! ???? l?? t???t c???!', mesh, true)
            this.completeSound.play()

            if (mesh.metadata.isBoss) {
              setTimeout(() => {
                this.world.restart()
              }, 1000)
            }
          } else {
            mesh.metadata.talkMesh = this.overlay.text('????ng!', mesh, true)
          }
        } else {
          const hint = false ? ` N?? l?? "${mesh.metadata.items[mesh.metadata.index].answer}".` : ''
          mesh.metadata.talkMesh = this.overlay.text(`Kh??ng ch??nh x??c!${hint}`, mesh, true)

          if (mesh.metadata.isBoss) {
            mesh.metadata.index = 0 // Math.max(0, mesh.metadata.index - 2)
          }

          mesh.metadata.nameMesh.dispose()
          mesh.metadata.nameMesh = this.overlay.text(`${name} (${mesh.metadata.index}/${mesh.metadata.items.length})`, mesh)
        }
      },
      leave: () => {
        if (mesh.metadata.isBoss) {
          if (mesh.metadata.index >= mesh.metadata.items.length) {
            return
          }

          mesh.metadata.talkMesh?.dispose()
          mesh.metadata.talkMesh = this.overlay.text('T???m bi???t!', mesh, true)
          mesh.metadata.index = 0
          mesh.metadata.nameMesh.dispose()
          mesh.metadata.nameMesh = this.overlay.text(name, mesh)
        }
      }
    }
  }
}

const names = [ [
  'An',
  'Anh',
  '??nh',
  'B??ch',
  'Ch??u',
  'Chi',
  'C??c',
  'D????ng',
  'Dung',
  '????o',
  'H???ng',
  'H??',
  'Hoa',
  'H???ng',
  'H???nh',
  'Hi???n',
  'Huy???n',
  'Hu???',
  'H?????ng',
  'Kim',
  'Lan',
  'Ly',
  'Linh',
  'L??',
  'Li??n',
  'Mai',
  'My',
  'M???',
  'Ng???c',
  'Nguy???t',
  'Nga',
  'Nhung',
  'Ph????ng',
  'Qu??',
  'T??m',
  'Thu???',
  'Thanh',
  'Th???o',
  'Thi',
  'Thu',
  'Tr??c',
  'T??',
  'V??n',
  'Xu??n',
  'Y???n',
  'Y??',
], [
  'An',
  'Anh',
  'B???o',
  'B??nh',
  'C?????ng',
  'Chi???n',
  'Ch??nh',
  '?????i',
  'Danh',
  '?????nh',
  '????ng',
  '?????c',
  'D??ng',
  'D????ng',
  'Duy',
  'Gia',
  'H???i',
  'Hi???u',
  'Ho??ng',
  'H??ng',
  'Huy',
  'L??m',
  'L???p',
  'Long',
  'Minh',
  'Nam',
  'Ngh??a',
  'Phong',
  'Ph??c',
  'Ph?????c',
  'Qu??n',
  'Quang',
  'Qu???c',
  'Qu??',
  'S??n',
  'T??i',
  'T??n',
  'Th??i',
  'Th???ng',
  'Th??nh',
  'Th???nh',
  'Ti???n',
  'To??n',
  'Tr???ng',
  'Trung',
  'Vi???t',
  'Vinh',
] ]
