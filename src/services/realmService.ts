import Realm from "realm";
import { v4 as uuidv4 } from "uuid";
import { Bank, SavedKey, realmSchemas } from "../models";
import { getEncryptionKey } from "../utils/encriptionKey";

type PrimaryKey = string;

type NewBankData = {
  bankName: string;
  logo: string;
  status: string;
  // If schemas switch to string PKs in the future, allow optional string id
  id?: PrimaryKey;
};

type UpdateBankData = Partial<Omit<NewBankData, "id">>;

type NewSavedKeyData = {
  name: string;
  value: string;
  bankId: string;
  id?: PrimaryKey;
};

type UpdateSavedKeyData = Partial<Omit<NewSavedKeyData, "id">>;

class RealmService {
  private realmInstance: Realm | null = null;

  private static shared: RealmService | null = null;

  static getInstance(): RealmService {
    if (!this.shared) this.shared = new RealmService();
    return this.shared;
  }

  // Open a single encrypted Realm instance for the app lifecycle
  async open(): Promise<Realm> {
    if (this.realmInstance && !this.realmInstance.isClosed) {
      return this.realmInstance;
    }

    const encryptionKey = await getEncryptionKey();
    this.realmInstance = new Realm({
      schema: realmSchemas,
      encryptionKey,
      // Bump this if you change schemas to handle migrations properly
      schemaVersion: 2,
    });
    return this.realmInstance;
  }

  close(): void {
    if (this.realmInstance && !this.realmInstance.isClosed) {
      this.realmInstance.close();
    }
    this.realmInstance = null;
  }

  private requireRealm(): Realm {
    if (!this.realmInstance || this.realmInstance.isClosed) {
      throw new Error("Realm is not open. Call open() first.");
    }
    return this.realmInstance;
  }

  // Utilities
  // (No auto-increment needed; we use UUID v4 strings.)

  // ------------- BANK CRUD -------------
  createBank(input: NewBankData) {
    const realm = this.requireRealm();
    const id: PrimaryKey = typeof input.id === "string" ? input.id : uuidv4();

    const now = new Date().toISOString();
    let created: Bank | null = null;
    realm.write(() => {
      created = realm.create(Bank, {
        id,
        bankName: input.bankName,
        logo: input.logo,
        status: input.status,
        createdAt: now,
        updatedAt: now,
      });
    });
    if (!created) throw new Error("Failed to create Bank");
    return created;
  }

  getBankById(id: PrimaryKey) {
    const realm = this.requireRealm();
    return realm.objectForPrimaryKey(Bank, id as any) ?? null;
  }

  getBanks() {
    const realm = this.requireRealm();
    return realm.objects(Bank);
  }

  updateBank(id: PrimaryKey, data: UpdateBankData) {
    const realm = this.requireRealm();
    const bank = realm.objectForPrimaryKey(Bank, id as any);
    if (!bank) return null;
    realm.write(() => {
      if (data.bankName !== undefined) bank.bankName = data.bankName;
      if (data.logo !== undefined) bank.logo = data.logo;
      if (data.status !== undefined) bank.status = data.status;
      bank.updatedAt = new Date().toISOString();
    });
    return bank;
  }

  deleteBank(id: PrimaryKey) {
    const realm = this.requireRealm();
    const bank = realm.objectForPrimaryKey(Bank, id as any);
    if (!bank) return false;
    realm.write(() => {
      realm.delete(bank);
    });
    return true;
  }

  // ----------- SAVED KEY CRUD -----------
  createSavedKey(input: NewSavedKeyData) {
    const realm = this.requireRealm();
    const id: PrimaryKey = typeof input.id === "string" ? input.id : uuidv4();

    const now = new Date().toISOString();
    let created: SavedKey | null = null;
    realm.write(() => {
      created = realm.create(SavedKey, {
        id,
        name: input.name,
        value: input.value,
        bankId: input.bankId,
        createdAt: now,
        updatedAt: now,
      });
    });
    if (!created) throw new Error("Failed to create SavedKey");
    return created;
  }

  getSavedKeyById(id: PrimaryKey) {
    const realm = this.requireRealm();
    return realm.objectForPrimaryKey(SavedKey, id as any) ?? null;
  }

  getSavedKeys() {
    const realm = this.requireRealm();
    return realm.objects(SavedKey);
  }

  updateSavedKey(id: PrimaryKey, data: UpdateSavedKeyData) {
    const realm = this.requireRealm();
    const savedKey = realm.objectForPrimaryKey(SavedKey, id as any);
    if (!savedKey) return null;
    realm.write(() => {
      if (data.name !== undefined) savedKey.name = data.name;
      if (data.value !== undefined) savedKey.value = data.value;
      if (data.bankId !== undefined) savedKey.bankId = data.bankId;
      savedKey.updatedAt = new Date().toISOString();
    });
    return savedKey;
  }

  deleteSavedKey(id: PrimaryKey) {
    const realm = this.requireRealm();
    const savedKey = realm.objectForPrimaryKey(SavedKey, id as any);
    if (!savedKey) return false;
    realm.write(() => {
      realm.delete(savedKey);
    });
    return true;
  }
}

export const realmService = RealmService.getInstance();
