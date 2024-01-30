//
// Copyright 2023 DXOS.org
//

const notAvailable = () => {
  throw new Error('Not available on this platform');
};

export const rename = () => notAvailable();
export const renameSync = () => notAvailable();
export const truncate = () => notAvailable();
export const truncateSync = () => notAvailable();
export const ftruncate = () => notAvailable();
export const ftruncateSync = () => notAvailable();
export const chown = () => notAvailable();
export const chownSync = () => notAvailable();
export const fchown = () => notAvailable();
export const fchownSync = () => notAvailable();
export const lchown = () => notAvailable();
export const lchownSync = () => notAvailable();
export const lutimes = () => notAvailable();
export const lutimesSync = () => notAvailable();
export const chmod = () => notAvailable();
export const chmodSync = () => notAvailable();
export const fchmod = () => notAvailable();
export const fchmodSync = () => notAvailable();
export const lchmod = () => notAvailable();
export const lchmodSync = () => notAvailable();
export const stat = () => notAvailable();
export const fstat = () => notAvailable();
export const fstatSync = () => notAvailable();
export const lstat = () => notAvailable();
export const link = () => notAvailable();
export const linkSync = () => notAvailable();
export const symlink = () => notAvailable();
export const symlinkSync = () => notAvailable();
export const readlink = () => notAvailable();
export const readlinkSync = () => notAvailable();
export const realpath = () => notAvailable();
export const realpathSync = () => notAvailable();
export const unlink = () => notAvailable();
export const unlinkSync = () => notAvailable();
export const rmdir = () => notAvailable();
export const rmdirSync = () => notAvailable();
export const rm = () => notAvailable();
export const mkdir = () => notAvailable();
export const mkdirSync = () => notAvailable();
export const mkdtemp = () => notAvailable();
export const mkdtempSync = () => notAvailable();
export const readdir = () => notAvailable();
export const readdirSync = () => notAvailable();
export const close = () => notAvailable();
export const closeSync = () => notAvailable();
export const open = () => notAvailable();
export const openSync = () => notAvailable();
export const utimes = () => notAvailable();
export const utimesSync = () => notAvailable();
export const futimes = () => notAvailable();
export const futimesSync = () => notAvailable();
export const fsync = () => notAvailable();
export const fsyncSync = () => notAvailable();
export const write = () => notAvailable();
export const writeSync = () => notAvailable();
export const read = () => notAvailable();
export const readSync = () => notAvailable();
export const readFileSync = () => notAvailable();
export const writeFile = () => notAvailable();
export const writeFileSync = () => notAvailable();
export const appendFile = () => notAvailable();
export const appendFileSync = () => notAvailable();
export const watchFile = () => notAvailable();
export const unwatchFile = () => notAvailable();
export const watch = () => notAvailable();
export const exists = () => notAvailable();
export const existsSync = () => notAvailable();
export const access = () => notAvailable();
export const accessSync = () => notAvailable();
export const createReadStream = () => notAvailable();
export const createWriteStream = () => notAvailable();
export const fdatasync = () => notAvailable();
export const fdatasyncSync = () => notAvailable();
export const copyFile = () => notAvailable();
export const copyFileSync = () => notAvailable();
export const writev = () => notAvailable();
export const writevSync = () => notAvailable();
export const readv = () => notAvailable();
export const readvSync = () => notAvailable();
export const opendirSync = () => notAvailable();
export const opendir = () => notAvailable();
export const cp = () => notAvailable();
export const cpSync = () => notAvailable();

export const constants = {
  // todo
};

export * as promises from './fs/promises.js';
