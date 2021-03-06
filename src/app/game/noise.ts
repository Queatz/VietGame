export class Perlin {

  private gradients: any = {}

  constructor(private rnd: any) {}

  sample(x: number, y: number): number {
    const xf = Math.floor(x)
    const yf = Math.floor(y)

    // interpolate
    const tl = this.dot_prod_grid(x, y, xf,   yf)
    const tr = this.dot_prod_grid(x, y, xf + 1, yf)
    const bl = this.dot_prod_grid(x, y, xf,   yf + 1)
    const br = this.dot_prod_grid(x, y, xf + 1, yf + 1)
    const xt = this.interp(x - xf, tl, tr)
    const xb = this.interp(x - xf, bl, br)
    const v = this.interp(y - yf, xt, xb)

    return v
  }

  private randVect() {
    const theta = this.rnd() * 2 * Math.PI
    return { x: Math.cos(theta), y: Math.sin(theta) }
  }

  private dot_prod_grid(x: number, y: number, vx: number, vy: number): number {
    let gVect
    const dVect = { x: x - vx, y: y - vy }
    if (this.gradients[`${vx},${vy}`]) {
      gVect = this.gradients[`${vx},${vy}`]
    } else {
      gVect = this.randVect()
      this.gradients[`${vx},${vy}`] = gVect
    }

    return dVect.x * gVect.x + dVect.y * gVect.y
  }

  private smootherstep(x: number): number {
    return 6 * x ** 5 - 15 * x ** 4 + 10 * x ** 3
  }

  private interp(x: number, a: number, b: number): number {
    return a + this.smootherstep(x) * (b - a)
  }
}
