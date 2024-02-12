import { Trigger } from '@dxos/async';
import type { DocHandle } from '@dxos/automerge/src/automerge-repo';

export type AutomergeIndexOptions = {
  dbName: string;
};

export class AutomergeIndex {
  private _open = new Trigger();
  private _db!: IDBDatabase;

  constructor({ dbName }: AutomergeIndexOptions) {
    const request = window.indexedDB.open(dbName, 1);
    request.onerror = (event) => {
      console.error('Error opening indexedDB', event);
    };
    // This event is only implemented in recent browsers
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      db.createObjectStore('heads');
      db.createObjectStore('index');
    };

    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      this._db = db;
      this._open.wake();
    };
  }

  private async _getDb() {
    await this._open.wait();
    return this._db;
  }

  async update(handle: DocHandle<unknown>) {
    const db = await this._getDb();
    const transaction = db.transaction(['heads', 'index'], 'readwrite');
    const heads = transaction.objectStore('heads');
    const index = transaction.objectStore('index');

    // get old heads
    const head = await heads.get(handle.documentId);

    // diff

    // remove old entries

    // add new entries
  }
}
