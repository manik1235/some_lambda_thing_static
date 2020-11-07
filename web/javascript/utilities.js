export function dup(object) {
  return JSON.parse(JSON.stringify(object));
}
