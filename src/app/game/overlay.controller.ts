import { AbstractMesh, Scene, DynamicTexture, StandardMaterial, MeshBuilder, Mesh, Vector3, Texture, Engine, Color3, VertexBuffer, Scalar, Angle, FollowCamera } from '@babylonjs/core'

export class OverlayController {
  constructor(private scene: Scene) {
  }

  showInteractions(text: string, options: Array<[string, () => void]>, mesh: AbstractMesh, vanish: boolean): Array<Mesh> {
    return [
      this.text(text, mesh, false, 1),
      ...options.map((x, i) => {
        return this.text(x[0], mesh, false, i + 2, x[1]);
      })
    ];
  }

  text(text: string, mesh: AbstractMesh, vanish: boolean = false, position?: number, callback?: () => void, fontSize = 1, offset: number = 1): Mesh {
    const font_size = 48 * fontSize
    const font = 'normal ' + font_size + 'px Nunito, Arial, sans-serif'
    
    const planeHeight = .25 * fontSize
    const DTHeight = 1.5 * font_size
    const ratio = planeHeight / DTHeight

    const temp = new DynamicTexture('DynamicTexture', 64, this.scene, false)
    const tmpctx = temp.getContext()
    tmpctx.font = font
    const DTWidth = tmpctx.measureText(text).width + 32
    temp.dispose()

    const planeWidth = DTWidth * ratio

    const dynamicTexture = new DynamicTexture('DynamicTexture',
      { width: DTWidth, height: DTHeight },
      this.scene,
      false,
      Texture.LINEAR_LINEAR,
      Engine.TEXTUREFORMAT_ALPHA
    )

    if (vanish || position) {
      dynamicTexture.getContext().fillStyle = '#ffffff'
      this.canvasRoundRect(dynamicTexture.getContext(), 0, 0, DTWidth, DTHeight, 32)
    }

    dynamicTexture.drawText(text, null, null, font, (position || 0) > 1 ? '#B767D2' : vanish || position ? '#000000' : '#ffffff', null as any)
    const mat = new StandardMaterial('mat', this.scene)

    if (vanish || position) {
      mat.emissiveTexture = dynamicTexture
    } else {
      mat.emissiveColor = Color3.White()
    }

    mat.opacityTexture = dynamicTexture
    mat.disableLighting = true
    mat.backFaceCulling = false

    const plane = MeshBuilder.CreatePlane('talk', { width: planeWidth, height: planeHeight, updatable: true }, this.scene)
    plane.material = mat

    if (position) {
      const p = plane.getVerticesData(VertexBuffer.PositionKind)!
      plane.geometry!.updateVerticesData(VertexBuffer.PositionKind, p.map((value: number, index: number) => index % 3 === 0 ? value + (planeWidth / 2) : value))
    }

    plane.billboardMode = Mesh.BILLBOARDMODE_ALL

    const node = new Mesh('pivot', mesh.getScene())
    node.parent = mesh

    if (position) {
      node.position.addInPlace(new Vector3(.75, 0, 0))
      plane.position.addInPlace(new Vector3(0, position * planeHeight * 1.25, 0))

      plane.onBeforeBindObservable.add(() => {
        const camera = this.scene.activeCamera! as FollowCamera
        const final = Math.abs(Scalar.DeltaAngle(
          Angle.FromRadians(camera.rotation.y).degrees(),
          Angle.FromRadians(mesh.absoluteRotationQuaternion.toEulerAngles().y).degrees()
        )) / 180

        plane.visibility = Math.min(1, Math.max(0.01, 1 - Math.pow(1 - (final < .75 ? 0 : ((final - .75)) / .25), 4)))
      })
    } else if (vanish) {
      setTimeout(() => {
        node.dispose(false, true)
      }, 4000)
      node.position.addInPlace(new Vector3(0, .75, 0))
    } else {
      node.position.addInPlace(new Vector3(0, offset, 0))
    }

    plane.parent = node

    plane.metadata = { callback }

    return plane
  }

  private canvasRoundRect(context: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, radius: number) {
    const r = x + w
    const b = y + h
    context.beginPath()
    context.moveTo(x + radius, y)
    context.lineTo(r - radius, y)
    context.quadraticCurveTo(r, y, r, y + radius)
    context.lineTo(r, y + h - radius)
    context.quadraticCurveTo(r, b, r - radius, b)
    context.lineTo(x + radius, b)
    context.quadraticCurveTo(x, b, x, b - radius)
    context.lineTo(x, y + radius)
    context.quadraticCurveTo(x, y, x + radius, y)
    context.fill()
  }
}