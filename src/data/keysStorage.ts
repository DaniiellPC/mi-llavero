// Storage global simple para las llaves (en producción usar AsyncStorage)

export interface SavedKey {
  id: number;
  name: string;
  value: string;
  createdAt: string;
  updatedAt: string;
  bankId: string;
}

// Storage global para las llaves organizadas por bankId
export const globalKeysStorage: { [bankId: string]: SavedKey[] } = {};

// Función para verificar si un banco tiene llaves guardadas
export const hasBankKeys = (bankId: string): boolean => {
  return globalKeysStorage[bankId] && globalKeysStorage[bankId].length > 0;
};

// Función para obtener el número de llaves de un banco
export const getBankKeysCount = (bankId: string): number => {
  return globalKeysStorage[bankId] ? globalKeysStorage[bankId].length : 0;
};

// Función para obtener las llaves de un banco
export const getBankKeys = (bankId: string): SavedKey[] => {
  return globalKeysStorage[bankId] || [];
};

// Función para guardar una llave
export const saveKey = (bankId: string, key: SavedKey): void => {
  if (!globalKeysStorage[bankId]) {
    globalKeysStorage[bankId] = [];
  }
  globalKeysStorage[bankId] = [...globalKeysStorage[bankId], key];
};

// Función para actualizar una llave
export const updateKey = (bankId: string, updatedKey: SavedKey): void => {
  if (!globalKeysStorage[bankId]) {
    return;
  }
  globalKeysStorage[bankId] = globalKeysStorage[bankId].map((key) =>
    key.id === updatedKey.id ? updatedKey : key
  );
};

// Función para eliminar una llave
export const deleteKey = (bankId: string, keyId: number): void => {
  if (!globalKeysStorage[bankId]) {
    return;
  }
  globalKeysStorage[bankId] = globalKeysStorage[bankId].filter(
    (key) => key.id !== keyId
  );
};
