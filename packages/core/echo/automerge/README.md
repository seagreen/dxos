# @dxos/automerge

Automerge adapter package

- Bundling automerge-repo to CJS
- Bundling automerge-wasm with vite to not require WASM and TLA plugins.
  - Consumers need to await `__tla` promise manually. See TLA plugin docs.
- Both esbuild and vite used to bundle different parts.
- When using automerge-repo plugins, one needs to alias `@automerge/automerge-repo` to `@dxos/automerge/automerge-repo`


## Installation

```bash
pnpm i @dxos/automerge
```

## DXOS Resources

- [Website](https://dxos.org)
- [Developer Documentation](https://docs.dxos.org)
- Talk to us on [Discord](https://discord.gg/eXVfryv3sW)

## Contributions

Your ideas, issues, and code are most welcome. Please take a look at our [community code of conduct](https://github.com/dxos/dxos/blob/main/CODE_OF_CONDUCT.md), the [issue guide](https://github.com/dxos/dxos/blob/main/CONTRIBUTING.md#submitting-issues), and the [PR contribution guide](https://github.com/dxos/dxos/blob/main/CONTRIBUTING.md#submitting-prs).

License: [MIT](./LICENSE) Copyright 2022 © DXOS
