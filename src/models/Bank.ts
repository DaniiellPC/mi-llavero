import Realm from "realm";

export class Bank extends Realm.Object<Bank> {
  id!: string;
  bankName!: string;
  logo!: string;
  status!: string;
  createdAt!: string;
  updatedAt!: string;

  static schema: Realm.ObjectSchema = {
    name: "Bank",
    primaryKey: "id",
    properties: {
      id: "string",
      bankName: "string",
      logo: "string",
      status: "string",
      createdAt: "string",
      updatedAt: "string",
    },
  };
}

export type BankModel = Bank;
