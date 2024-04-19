//
// Copyright 2024 DXOS.org
//

import md5 from 'md5';

import { type Space } from '@dxos/client/echo';
import { create, getEchoObjectAnnotation, getSchema } from '@dxos/echo-schema';
import { log } from '@dxos/log';

import { jsonSerializer } from './serializer';
import { serializers } from './serializers';
import { getSpaceProperty } from './space-properties';
import { type SerializedObject, type SerializedSpace, TypeOfExpando } from './types';
import { UniqueNames } from './util';
import { Collection } from '../schema';

export class ObjectSerializer {
  private readonly _uniqueNames = new UniqueNames();

  async serializeSpace(space: Space): Promise<SerializedSpace> {
    const metadata = {
      name: space.properties.name ?? space.key.toHex(),
      version: 1,
      timestamp: new Date().toISOString(),
      spaceKey: space.key.toHex(),
    };

    const objects = await this.serializeObjects(space);

    return {
      metadata,
      objects,
    };
  }

  async serializeObjects(space: Space): Promise<SerializedObject[]> {
    const spaceRoot = getSpaceProperty<Collection>(space, Collection.typename);
    if (!spaceRoot) {
      throw new Error('No root folder.');
    }

    // Skip root collection.
    const objects: SerializedObject[] = [];
    objects.push(...(await this._serializeFolder(spaceRoot)).children);
    return objects;
  }

  async deserializeObjects(space: Space, serializedSpace: SerializedSpace): Promise<Space> {
    const spaceRoot = getSpaceProperty<Collection>(space, Collection.typename);
    if (!spaceRoot) {
      throw new Error('No root folder.');
    }

    await this._deserializeFolder(spaceRoot, serializedSpace.objects);
    await space.db.flush();
    return space;
  }

  private async _serializeFolder(collection: Collection): Promise<SerializedObject & { type: 'folder' }> {
    const files: SerializedObject[] = [];
    for (const child of collection.objects) {
      if (!child) {
        continue;
      }

      if (child instanceof Collection) {
        files.push(await this._serializeFolder(child));
        continue;
      }

      const schema = getSchema(child);
      if (!schema) {
        continue;
      }

      const typename = getEchoObjectAnnotation(schema)?.typename ?? TypeOfExpando;
      const serializer = serializers[typename] ?? jsonSerializer;

      const filename = serializer.filename(child);
      const content = await serializer.serialize(child, serializers);
      files.push({
        type: 'file',
        id: child.id,
        // TODO(burdon): Extension is part of name.
        name: this._uniqueNames.unique(filename.name),
        extension: filename.extension,
        content,
        md5sum: md5(content),
        typename,
      });
    }

    return {
      type: 'folder',
      id: collection.id,
      name: this._uniqueNames.unique(collection.name),
      children: files,
    };
  }

  private async _deserializeFolder(collection: Collection, data: SerializedObject[]): Promise<void> {
    for (const object of data) {
      try {
        let child = collection.objects.find((item) => item?.id === object.id);
        switch (object.type) {
          case 'folder': {
            if (!child) {
              child = create(Collection, { name: object.name, objects: [], views: {} });

              // TODO(dmaretskyi): This won't work.
              // child[base]._id = object.id;
              collection.objects.push(child);
            }

            await this._deserializeFolder(child as Collection, object.children);
            break;
          }

          case 'file': {
            const child = collection.objects.find((item) => item?.id === object.id);
            const serializer = serializers[object.typename] ?? jsonSerializer;
            const deserialized = await serializer.deserialize(object.content!, child, serializers);

            if (!child) {
              // TODO(dmaretskyi): This won't work.
              // deserialized[base]._id = object.id;
              collection.objects.push(deserialized);
            }
            break;
          }
        }
      } catch (err) {
        log.catch(err);
      }
    }
  }
}
