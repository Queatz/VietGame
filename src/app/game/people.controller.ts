import { AbstractMesh, Color3, DeepImmutable, Material, Mesh, PlaneBuilder, Ray, Scene, Sound, StandardMaterial, Texture, Vector3 } from "@babylonjs/core"
import { OverlayController } from "./overlay.controller"
import * as seedrandom from 'seedrandom'
import { quiz } from "./quiz"
import { shuffle } from "./models"
import { MapController } from "./map.controller"
import { LevelController } from "./level.controller"

export class PeopleController {

  quizItems = [ ...quiz ]

  peopleMeshes: Array<Mesh> = []

  talkSound: Sound
  completeSound: Sound

  constructor(private overlay: OverlayController, private map: MapController, private level: LevelController, private scene: Scene) {
    this.talkSound = new Sound('get', '/assets/threeTone1.mp3', this.scene)
    this.completeSound = new Sound('get', '/assets/highUp.mp3', this.scene)

    const numberOfCorrectAnswersPerQuestion = 5
    const numberOfPeople = Math.ceil(numberOfCorrectAnswersPerQuestion * Math.sqrt(this.quizItems.length / numberOfCorrectAnswersPerQuestion))

    const rnd = seedrandom()

    for(let i = 0; i < numberOfPeople; i++) {
      const mesh = PlaneBuilder.CreatePlane('person', {
        height: 1,
        width: .5
      }, this.scene)
      mesh.checkCollisions = true
      mesh.ellipsoid.scaleInPlace(.5)
      mesh.billboardMode = Mesh.BILLBOARDMODE_Y

      for (let tries = 0; tries < 20; tries++) {
        mesh.position.copyFrom(new Vector3((rnd() - .5) * 2 * (this.map.mapSize / 2 - 2), .5, (rnd() - .5) * 2 * (this.map.mapSize / 2 - 2)))

        const ray = new Ray(mesh.position.add(new Vector3(0, -2, 0)), Vector3.Up(), 10)
        const hits = ray.intersectsMeshes(this.level.wallMeshes as Array<DeepImmutable<AbstractMesh>>, true)

        if (!hits?.[0]?.hit) {
          break
        }
      }

      const srnd = seedrandom() // i.toString()
      const sex = Math.floor(srnd() * 2)
      const name = names[sex][Math.floor(srnd() * names[sex].length)]
      const nameMesh = this.overlay.text(name, mesh)

      const material = new StandardMaterial('player', this.scene)
      material.transparencyMode = Material.MATERIAL_ALPHATEST
      material.diffuseTexture = new Texture(`/assets/person ${sex ? '1' : '2'}.png`, this.scene, false, true, Texture.NEAREST_SAMPLINGMODE)
      material.diffuseTexture.hasAlpha = true
      material.useAlphaFromDiffuseTexture = true
      material.backFaceCulling = false
      material.specularColor = Color3.Black()
      mesh.material = material

      mesh.metadata = {
        nameMesh,
        talkMesh: undefined as unknown as Mesh,
        index: 0,
        items: shuffle(srnd, [ ...this.quizItems ]).slice(0, Math.ceil(this.quizItems.length * (numberOfCorrectAnswersPerQuestion / numberOfPeople))),
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
          if (mesh.metadata.talkMesh) {
            mesh.metadata.talkMesh.dispose()
          }

          if (mesh.metadata.items[mesh.metadata.index].answer.trim() === text) {
            mesh.metadata.index++
            mesh.metadata.nameMesh.dispose()
            mesh.metadata.nameMesh = this.overlay.text(`${name} (${mesh.metadata.index}/${mesh.metadata.items.length})`, mesh)

            if (mesh.metadata.index >= mesh.metadata.items.length) {
              mesh.metadata.talkMesh = this.overlay.text('Đúng! Đó là tất cả!', mesh, true)
              this.completeSound.play()
              material.diffuseColor = Color3.White()
            } else {
              mesh.metadata.talkMesh = this.overlay.text('Đúng!', mesh, true)
            }
          } else {
            const hint = false ? ` Nó là "${mesh.metadata.items[mesh.metadata.index].answer}".` : ''
            mesh.metadata.talkMesh = this.overlay.text(`Không chính xác!${hint}`, mesh, true)
            mesh.metadata.index = Math.max(0, mesh.metadata.index - 2)
            mesh.metadata.nameMesh.dispose()
            mesh.metadata.nameMesh = this.overlay.text(`${name} (${mesh.metadata.index}/${mesh.metadata.items.length})`, mesh)
          }
        }
      }

      this.peopleMeshes.push(mesh)
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