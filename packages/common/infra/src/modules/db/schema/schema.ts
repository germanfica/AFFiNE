import { nanoid } from 'nanoid';

import { type DBSchemaBuilder, f, type UpdateEntityInput } from '../../../orm';

export const AFFiNE_WORKSPACE_DB_SCHEMA = {
  folders: {
    id: f.string().primaryKey().optional().default(nanoid),
    parentId: f.string().optional(),
    data: f.string(),
    type: f.string(),
    index: f.string(),
  },
  docConfiguration: {
    id: f.string().primaryKey(),
    primaryMode: f.string().optional(),
    edgelessColorTheme: f.string().optional(),
  },
} as const satisfies DBSchemaBuilder;
export type AFFiNE_WORKSPACE_DB_SCHEMA = typeof AFFiNE_WORKSPACE_DB_SCHEMA;

export type DocConfiguration = UpdateEntityInput<
  AFFiNE_WORKSPACE_DB_SCHEMA['docConfiguration']
>;

export const AFFiNE_WORKSPACE_USERDATA_DB_SCHEMA = {
  favorite: {
    key: f.string().primaryKey(),
    index: f.string(),
  },
} as const satisfies DBSchemaBuilder;
export type AFFiNE_WORKSPACE_USERDATA_DB_SCHEMA =
  typeof AFFiNE_WORKSPACE_USERDATA_DB_SCHEMA;
