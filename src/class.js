
export function getConstructor(ins) {
  return Object.getPrototypeOf(ins).constructor
}
