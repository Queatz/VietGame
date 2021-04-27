import { AbstractMesh, Color3, DeepImmutable, Material, Mesh, PlaneBuilder, Ray, Scene, Sound, StandardMaterial, Texture, Vector3 } from "@babylonjs/core"
import { OverlayController } from "./overlay.controller"
import * as seedrandom from 'seedrandom'
import { quiz } from "./quiz"
import { QuizItem, shuffle } from "./models"
import { MapController } from "./map.controller"
import { LevelController } from "./level.controller"
import { WorldController } from "./world.controller"

export class PeopleController {

  quizItems = [] as Array<QuizItem>

  peopleMeshes: Array<Mesh> = []

  talkSound: Sound
  completeSound: Sound

  numberOfCorrectAnswersPerQuestion: number
  numberOfPeople: number

  constructor(private world: WorldController, private overlay: OverlayController, private map: MapController, private level: LevelController, private scene: Scene) {
    this.talkSound = new Sound('get', '/assets/threeTone1.mp3', this.scene)
    this.completeSound = new Sound('get', '/assets/highUp.mp3', this.scene)

    this.numberOfCorrectAnswersPerQuestion = 5
    this.numberOfPeople = Math.ceil(this.numberOfCorrectAnswersPerQuestion * Math.sqrt(this.quizItems.length / this.numberOfCorrectAnswersPerQuestion))
  
    this.restart()
  }
  
  restart() {
    this.quizItems = [ ...quiz ]

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

    for(let i = 0; i < this.numberOfPeople; i++) {
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

        if (mesh.metadata.index >= mesh.metadata.items.length) {
          mesh.metadata.talkMesh = this.overlay.text('Đó là tất cả!', mesh, true)
        } else {
          mesh.metadata.talkMesh = this.overlay.text(mesh.metadata.items[mesh.metadata.index].question, mesh, true)
        }
      },
      say: (text: string) => {
        mesh.metadata.talkMesh?.dispose()

        if (mesh.metadata.items[mesh.metadata.index].answer.trim() === text) {
          mesh.metadata.index++
          mesh.metadata.nameMesh.dispose()
          mesh.metadata.nameMesh = this.overlay.text(`${name} (${mesh.metadata.index}/${mesh.metadata.items.length})`, mesh)

          if (mesh.metadata.index >= mesh.metadata.items.length) {
            mesh.metadata.talkMesh = this.overlay.text(mesh.metadata.isBoss ? 'Chúc mừng!' : 'Đúng! Đó là tất cả!', mesh, true)
            this.completeSound.play()

            if (mesh.metadata.isBoss) {
              this.world.restart()
            }
          } else {
            mesh.metadata.talkMesh = this.overlay.text('Đúng!', mesh, true)
          }
        } else {
          const hint = false ? ` Nó là "${mesh.metadata.items[mesh.metadata.index].answer}".` : ''
          mesh.metadata.talkMesh = this.overlay.text(`Không chính xác!${hint}`, mesh, true)
          mesh.metadata.index = mesh.metadata.isBoss ? 0 : Math.max(0, mesh.metadata.index - 2)
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
          mesh.metadata.talkMesh = this.overlay.text('Tạm biệt!', mesh, true)
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
  'Ánh',
  'Bích',
  'Châu',
  'Chi',
  'Cúc',
  'Dương',
  'Dung',
  'Đào',
  'Hồng',
  'Hà',
  'Hoa',
  'Hằng',
  'Hạnh',
  'Hiền',
  'Huyền',
  'Huệ',
  'Hường',
  'Kim',
  'Lan',
  'Ly',
  'Linh',
  'Lê',
  'Liên',
  'Mai',
  'My',
  'Mỹ',
  'Ngọc',
  'Nguyệt',
  'Nga',
  'Nhung',
  'Phương',
  'Quý',
  'Tâm',
  'Thuỷ',
  'Thanh',
  'Thảo',
  'Thi',
  'Thu',
  'Trúc',
  'Tú',
  'Vân',
  'Xuân',
  'Yến',
  'Yê',
], [
  'An',
  'Anh',
  'Bảo',
  'Bình',
  'Cường',
  'Chiến',
  'Chính',
  'Đại',
  'Danh',
  'Đỉnh',
  'Đông',
  'Đức',
  'Dũng',
  'Dương',
  'Duy',
  'Gia',
  'Hải',
  'Hiếu',
  'Hoàng',
  'Hùng',
  'Huy',
  'Lâm',
  'Lập',
  'Long',
  'Minh',
  'Nam',
  'Nghĩa',
  'Phong',
  'Phúc',
  'Phước',
  'Quân',
  'Quang',
  'Quốc',
  'Quý',
  'Sơn',
  'Tài',
  'Tân',
  'Thái',
  'Thắng',
  'Thành',
  'Thịnh',
  'Tiến',
  'Toàn',
  'Trọng',
  'Trung',
  'Việt',
  'Vinh',
] ]