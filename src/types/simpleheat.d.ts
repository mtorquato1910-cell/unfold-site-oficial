/**
 * Tipos para `simpleheat` (canvas heatmap, ~3kb, sem @types oficial).
 * API mínima usada pelo overlay do mapa de calor.
 */
declare module 'simpleheat' {
  type Point = [number, number, number] // [x, y, value]

  interface SimpleHeat {
    data(points: Point[]): SimpleHeat
    add(point: Point): SimpleHeat
    clear(): SimpleHeat
    max(value: number): SimpleHeat
    radius(r: number, blur?: number): SimpleHeat
    gradient(grad: Record<number, string>): SimpleHeat
    resize(): SimpleHeat
    draw(minOpacity?: number): SimpleHeat
  }

  function simpleheat(canvas: HTMLCanvasElement | string): SimpleHeat

  export = simpleheat
}
