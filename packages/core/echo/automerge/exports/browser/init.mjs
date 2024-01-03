
export let isAutomergeWasmInitialized = false;

export async function initAutomergeWasm() {
  const { __tla } = await import('#automerge-wasm');
  await __tla;
  isAutomergeWasmInitialized = true;
}