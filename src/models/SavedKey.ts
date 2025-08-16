import Realm from "realm";

export class SavedKey extends Realm.Object<SavedKey> {
  id!: string;
  name!: string;
  value!: string;
  createdAt!: string;
  updatedAt!: string;
  bankId!: string;

  static schema: Realm.ObjectSchema = {
    name: "SavedKey",
    primaryKey: "id",
    properties: {
      id: "string",
      name: "string",
      value: "string",
      createdAt: "string",
      updatedAt: "string",
      bankId: "string",
    },
  };
}

export type SavedKeyModel = SavedKey;
