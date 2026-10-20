/** @requires 2 ≤ n ≤ 24 and integer 0 ≤ k < n. @ensures One orbit, starting at the identity. */
export function additiveOrbit(n: number, k: number): number[] {
  if (!Number.isInteger(n) || n < 2 || n > 24 || !Number.isInteger(k) || k < 0 || k >= n) throw new RangeError("Invalid clock");
  const orbit = [0];
  for (let x = k; x !== 0; x = (x + k) % n) orbit.push(x);
  return orbit;
}
/** @requires Integer 1 ≤ n ≤ 12. @ensures Exact factorial and its binary information bound in this range. */
export function sortingBound(n: number) {
  if (!Number.isInteger(n) || n < 1 || n > 12) throw new RangeError("Invalid size");
  let permutations = 1;
  for (let k = 2; k <= n; k++) permutations *= k;
  return { permutations, comparisons: Math.ceil(Math.log2(permutations)) };
}
/** @requires 0 ≤ delta < 1. @ensures Unnormalized discounted values for the article's 3/5/1 payoffs. */
export function cooperationValues(delta: number) {
  if (!Number.isFinite(delta) || delta < 0 || delta >= 1) throw new RangeError("Invalid discount");
  return { cooperate: 3 / (1 - delta), defect: 5 + delta / (1 - delta) };
}

export function subgroupWitness(elements: number[], n = 8) {
  if (!Number.isInteger(n) || n < 2 || n > 24 || elements.some(x => !Number.isInteger(x) || x < 0 || x >= n)) throw new RangeError("Invalid residues");
  const set = new Set(elements);
  for (const a of set) for (const b of set) { const result = (a - b + n) % n; if (!set.has(result)) return { a, b, result }; }
  return null;
}
export function cyclicCosets(n: number, k: number) {
  const subgroup = additiveOrbit(n, k), seen = new Set<number>(), cosets: number[][] = [];
  for (let a = 0; a < n; a++) if (!seen.has(a)) { const row = subgroup.map(h => (a+h)%n).sort((x,y)=>x-y); row.forEach(x=>seen.add(x)); cosets.push(row); }
  return { subgroup, cosets };
}
