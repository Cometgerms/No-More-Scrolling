export type Point = { x: number; y: number };
export type View = { zoom: number; pan: Point };
const distance = (a: Point, b: Point) => Math.hypot(a.x-b.x, a.y-b.y);
const midpoint = (a: Point, b: Point) => ({ x: (a.x+b.x)/2, y: (a.y+b.y)/2 });
export function zoomAt(view: View, zoom: number, anchor: Point): View {
  zoom = Math.max(.6, Math.min(3, zoom));
  const ratio = zoom/view.zoom;
  return { zoom, pan: { x: anchor.x-(anchor.x-view.pan.x)*ratio, y: anchor.y-(anchor.y-view.pan.y)*ratio } };
}
/** @requires Points in SVG coordinates. @ensures Pinch keeps the touched content under its midpoint. */
export function gestureView(view: View, start: Point[], current: Point[]): View {
  if (!start.length || start.length !== current.length) return view;
  if (start.length === 1) return { ...view, pan: { x: view.pan.x+current[0].x-start[0].x, y: view.pan.y+current[0].y-start[0].y } };
  const a = midpoint(start[0],start[1]), b = midpoint(current[0],current[1]);
  const next = zoomAt(view, view.zoom*distance(current[0],current[1])/Math.max(1,distance(start[0],start[1])), a);
  return { ...next, pan: { x: next.pan.x+b.x-a.x, y: next.pan.y+b.y-a.y } };
}
export const edgeKey = (from: string, to: string) => [from,to].sort().join("|");
