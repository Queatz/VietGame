import { Color3, Mesh, Scene, StandardMaterial, Vector3 } from "@babylonjs/core"
import { CapsuleBuilder } from "@babylonjs/core/Meshes/Builders/capsuleBuilder"
import { OverlayController } from "./overlay.controller"
import * as seedrandom from 'seedrandom'

const quiz = `
gấp đoi	Twice
nửa tháng	Half a month
một trăm rưởi	One hundred fifty
hai năm rưỡi	Two years and a half
một nửa	Half
mươi	About 10
một vài	2 or 3
dăm	3 to 5
một ít	A few
một số	A number of
nhiều	Many
hơn	More than
trên	Over
chưa đến	Fewer than
dưới	Under
gần	Nearly
đôi	Pair
cặp	Couple
`

export class QuizItem {
  question!: string
  answer!: string
}

export function shuffle(rnd: any, array: Array<QuizItem>): Array<QuizItem> {
  for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(rnd() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]]
  }

  return array
}

export class PeopleController {

  quizItems = quiz.trim().split('\n').map(item => {
    const x = item.split('\t')
    return {
      answer: x[0],
      question: x[1]
    } as QuizItem
  })


  peopleMeshes: Array<Mesh> = []

  constructor(private overlay: OverlayController, private scene: Scene) {
    const rnd = seedrandom('people')

    for(let i = 0; i < 10; i++) {
      const mesh = CapsuleBuilder.CreateCapsule('player', {
        height: 1,
        radius: .2,
        subdivisions: 12,
        capSubdivisions: 12,
        bottomCapSubdivisions: 12,
        tessellation: 12
      }, this.scene)

      mesh.checkCollisions = true

      mesh.ellipsoid.scaleInPlace(.5)

      mesh.position.addInPlace(new Vector3((rnd() - .5) * 2 * 20, .5, (rnd() - .5) * 2 * 20))

      const material = new StandardMaterial('player', this.scene)
      material.diffuseColor = Color3.FromArray([ rnd(), rnd(), rnd() ])

      mesh.material = material

      const srnd = seedrandom(i.toString())

      const nameMesh = this.overlay.text(names[Math.floor(srnd() * names.length)], mesh)

      mesh.metadata = {
        nameMesh,
        index: 0,
        items: shuffle(srnd, [ ...this.quizItems ]),
        ask: () => {
          if (mesh.metadata.index >= mesh.metadata.items.length) {
            this.overlay.text('Đó là tất cả!', mesh, true)
          } else {
            this.overlay.text(`${mesh.metadata.items[mesh.metadata.index].question} [${mesh.metadata.index + 1}/${mesh.metadata.items.length}]`, mesh, true)
          }

        },
        say: (text: string) => {
          if (mesh.metadata.items[mesh.metadata.index].answer === text) {
            mesh.metadata.index++

            if (mesh.metadata.index >= mesh.metadata.items.length) {
              this.overlay.text('Đúng! Đó là tất cả!', mesh, true)
              material.diffuseColor = Color3.White()
            } else {
              this.overlay.text('Đúng!', mesh, true)
            }
          } else {
            this.overlay.text(`Không chính xác! Nó là "${mesh.metadata.items[mesh.metadata.index].answer}".`, mesh, true)
            mesh.metadata.index = 0
          }
        }
      }

      this.peopleMeshes.push(mesh)
    }
  }
}

const names = [
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
]