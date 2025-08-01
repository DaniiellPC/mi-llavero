import * as Clipboard from 'expo-clipboard';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { Notifier, NotifierComponents, NotifierWrapper } from 'react-native-notifier';

import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';

// Storage global simple para las llaves (en producción usar AsyncStorage)
const globalKeysStorage: { [bankId: string]: SavedKey[] } = {};

interface SavedKey {
  id: number;
  name: string;
  value: string;
  createdAt: string;
  updatedAt: string;
  bankId: string;
}

export default function MisLlavesDetailsScreen() {
  const params = useLocalSearchParams();
  const bankId = params.bankId as string;
  const bankName = params.bankName as string;
  
  const [modalVisible, setModalVisible] = useState(false);
  const [keyName, setKeyName] = useState('');
  const [keyValue, setKeyValue] = useState('');
  const [savedKeys, setSavedKeys] = useState<SavedKey[]>([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingKey, setEditingKey] = useState<SavedKey | null>(null);
  const keyValueInputRef = React.useRef<TextInput>(null);

  // Cargar las llaves del banco actual al montar el componente
  useEffect(() => {
    if (bankId && globalKeysStorage[bankId]) {
      setSavedKeys(globalKeysStorage[bankId]);
    } else {
      setSavedKeys([]);
    }
  }, [bankId]);

  const handleAddPress = () => {
    setIsEditMode(false);
    setEditingKey(null);
    setKeyName('');
    setKeyValue('');
    setModalVisible(true);
  };

  const handleEditPress = (key: SavedKey) => {
    setIsEditMode(true);
    setEditingKey(key);
    setKeyName(key.name);
    setKeyValue(key.value);
    setModalVisible(true);
  };

  const handleSave = () => {
    // Validar que ambos campos tengan contenido
    if (keyName.trim() === '' || keyValue.trim() === '' || !bankId) {
      return;
    }

    if (isEditMode && editingKey) {
      // Modo edición: actualizar llave existente
      const updatedKey: SavedKey = {
        ...editingKey,
        name: keyName.trim(),
        value: keyValue.trim(),
        updatedAt: new Date().toLocaleDateString(), // Actualizar solo updatedAt
      };

      // Inicializar el array del banco si no existe
      if (!globalKeysStorage[bankId]) {
        globalKeysStorage[bankId] = [];
      }

      // Actualizar en el storage global
      globalKeysStorage[bankId] = globalKeysStorage[bankId].map(key => 
        key.id === editingKey.id ? updatedKey : key
      );

      // Actualizar en el estado local
      setSavedKeys(prev => prev.map(key => 
        key.id === editingKey.id ? updatedKey : key
      ));
      
      console.log('Llave editada para banco', bankName, ':', updatedKey);
    } else {
      // Modo creación: crear nueva llave
      const currentDate = new Date().toLocaleDateString();
      const newKey: SavedKey = {
        id: Date.now(), // ID único basado en timestamp
        name: keyName.trim(),
        value: keyValue.trim(),
        createdAt: currentDate,
        updatedAt: currentDate, // Mismo valor que createdAt para nuevas llaves
        bankId: bankId
      };

      // Inicializar el array del banco si no existe
      if (!globalKeysStorage[bankId]) {
        globalKeysStorage[bankId] = [];
      }

      // Agregar al storage global
      globalKeysStorage[bankId] = [...globalKeysStorage[bankId], newKey];

      // Agregar al array de llaves guardadas del estado local
      setSavedKeys(prev => [...prev, newKey]);
      
      console.log('Nueva llave creada para banco', bankName, ':', newKey);
    }
    
    // Limpiar los campos y cerrar el modal
    setKeyName('');
    setKeyValue('');
    setIsEditMode(false);
    setEditingKey(null);
    setModalVisible(false);
  };

  const handleCloseModal = () => {
    // Limpiar los campos al cerrar
    setKeyName('');
    setKeyValue('');
    setIsEditMode(false);
    setEditingKey(null);
    setModalVisible(false);
  };

  const handleBackPress = () => {
    router.back();
  };

  const handleCopyToClipboard = async (keyValue: string) => {
    try {
      await Clipboard.setStringAsync(keyValue);
      
      // Mostrar notificación flotante de éxito
      Notifier.showNotification({
        title: 'Llave copiada al portapapeles',
        description: 'La llave se ha copiado exitosamente',
        duration: 3000,
        showAnimationDuration: 800,
        hideAnimationDuration: 800,
        swipeEnabled: true, // Habilitar gestos de deslizar para cerrar
        Component: NotifierComponents.Alert,
        componentProps: {
          alertType: 'success',
        },
      });
    } catch (error) {
      console.error('Error al copiar al portapapeles:', error);
      
      // Mostrar notificación de error si falla
      Notifier.showNotification({
        title: 'Error al copiar',
        description: 'No se pudo copiar la llave al portapapeles',
        duration: 3000,
        swipeEnabled: true, // Habilitar gestos de deslizar para cerrar
        Component: NotifierComponents.Alert,
        componentProps: {
          alertType: 'error',
        },
      });
    }
  };

  const renderKeyItem = ({ item }: { item: SavedKey }) => (
    <TouchableOpacity
      style={styles.keyItem}
      onPress={() => handleEditPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.keyItemContent}>
        <View style={styles.keyInfo}>
          <ThemedText type="defaultSemiBold" style={styles.keyName}>
            {item.name}
          </ThemedText>
          <ThemedText style={styles.keyValue} numberOfLines={2}>
            {item.value}
          </ThemedText>
          <ThemedText style={styles.keyDate}>
            Actualizado: {item.updatedAt}
          </ThemedText>
        </View>
        <View style={styles.keyActions}>
          <TouchableOpacity
            style={styles.copyButton}
            onPress={(event) => {
              event.stopPropagation(); // Evitar que se propague al TouchableOpacity padre
              handleCopyToClipboard(item.value);
            }}
            activeOpacity={0.7}
          >
            <IconSymbol
              name="doc.on.clipboard"
              size={20}
              color="#D4AF37"
            />
          </TouchableOpacity>
          <IconSymbol
            name="key.fill"
            size={24}
            color="#D4AF37"
            style={styles.keyIcon}
          />
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <NotifierWrapper>
      <View style={styles.container}>
        <ParallaxScrollView
        headerBackgroundColor={{ light: '#F4D03F', dark: '#7D6608' }}
        headerImage={
          <IconSymbol
            size={310}
            color="#D4AF37"
            name="key.fill"
            style={styles.headerImage}
          />
        }>
        
        {/* Botón de regreso */}
        <TouchableOpacity 
          style={styles.backButton}
          onPress={handleBackPress}
          activeOpacity={0.7}
        >
          <IconSymbol
            name="chevron.right"
            size={20}
            color="#D4AF37"
            style={styles.backIcon}
          />
          <ThemedText style={styles.backText}>Volver</ThemedText>
        </TouchableOpacity>

        <ThemedView style={styles.titleContainer}>
          <ThemedText type="title">Llaves de {bankName}</ThemedText>
        </ThemedView>
        
        <ThemedText style={styles.description}>
          Gestiona las llaves de {bankName} de forma segura
        </ThemedText>

        {/* Lista de llaves guardadas o mensaje vacío */}
        {savedKeys.length > 0 ? (
          <View style={styles.keysList}>
            {savedKeys.map((item) => (
              <View key={item.id.toString()}>
                {renderKeyItem({ item })}
              </View>
            ))}
          </View>
        ) : (
          <ThemedView style={styles.emptyContainer}>
            <IconSymbol
              name="key.fill"
              size={80}
              color="#D4AF37"
              style={styles.emptyIcon}
            />
            <ThemedText type="subtitle" style={styles.emptyTitle}>
              No tienes llaves para {bankName}
            </ThemedText>
            <ThemedText style={styles.emptyDescription}>
              Usa el botón &quot;+&quot; para agregar tu primera llave a {bankName}
            </ThemedText>
          </ThemedView>
        )}
        
      </ParallaxScrollView>
      
      {/* Botón flotante */}
      <TouchableOpacity 
        style={styles.floatingButton}
        onPress={handleAddPress}
        activeOpacity={0.8}
      >
        <ThemedView style={styles.buttonBackground}>
          <IconSymbol
            name="plus"
            size={24}
            color="#FFFFFF"
          />
        </ThemedView>
      </TouchableOpacity>

      {/* Modal para agregar nueva llave */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={handleCloseModal}
      >
        <KeyboardAvoidingView 
          style={styles.keyboardAvoidingView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <View style={styles.modalOverlay}>
            <Pressable 
              style={styles.modalBackdrop} 
              onPress={handleCloseModal}
            />
            <ThemedView style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <ThemedText type="title" style={styles.modalTitle}>
                  {isEditMode ? 'Editar Llave' : 'Agregar Nueva Llave'}
                </ThemedText>
                <TouchableOpacity
                  onPress={handleCloseModal}
                  style={styles.closeButton}
                  activeOpacity={0.7}
                >
                  <IconSymbol
                    name="plus"
                    size={20}
                    color="#666"
                    style={styles.closeIcon}
                  />
                </TouchableOpacity>
              </View>
              
              <ScrollView 
                style={styles.formScrollView}
                contentContainerStyle={styles.formContainer}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >
                {/* Campo Nombre de la llave */}
                <View style={styles.inputContainer}>
                  <ThemedText style={styles.inputLabel}>
                    Nombre de la llave
                  </ThemedText>
                  <TextInput
                    style={styles.textInput}
                    value={keyName}
                    onChangeText={setKeyName}
                    placeholder="Ingresa el nombre de la llave"
                    placeholderTextColor="#999"
                    returnKeyType="next"
                    onSubmitEditing={() => keyValueInputRef.current?.focus()}
                    blurOnSubmit={false}
                  />
                </View>

                {/* Campo Llave */}
                <View style={styles.inputContainer}>
                  <ThemedText style={styles.inputLabel}>
                    Llave
                  </ThemedText>
                  <TextInput
                    ref={keyValueInputRef}
                    style={styles.textInput}
                    value={keyValue}
                    onChangeText={setKeyValue}
                    placeholder="Ingresa la llave"
                    placeholderTextColor="#999"
                    multiline={true}
                    numberOfLines={3}
                    textAlignVertical="top"
                    returnKeyType="done"
                  />
                </View>

                {/* Botón Guardar */}
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={handleSave}
                  activeOpacity={0.8}
                >
                  <ThemedText style={styles.saveButtonText}>
                    Guardar
                  </ThemedText>
                </TouchableOpacity>
              </ScrollView>
            </ThemedView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
      </View>
    </NotifierWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerImage: {
    color: '#D4AF37',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  backIcon: {
    transform: [{ rotate: '180deg' }],
    marginRight: 8,
  },
  backText: {
    color: '#D4AF37',
    fontWeight: '600',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  description: {
    marginBottom: 32,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyIcon: {
    marginBottom: 24,
    opacity: 0.6,
  },
  emptyTitle: {
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyDescription: {
    textAlign: 'center',
    opacity: 0.7,
    lineHeight: 22,
  },
  keysList: {
    marginTop: 10,
  },
  keyItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  keyItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent', // Asegurar que no tenga fondo
  },

  keyInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  keyName: {
    fontSize: 18,
    marginBottom: 6,
    fontWeight: 'bold',
  },
  keyValue: {
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 4,
    lineHeight: 18,
  },
  keyDate: {
    fontSize: 12,
    opacity: 0.6,
  },
  keyIcon: {
    marginLeft: 12,
    opacity: 0.7,
  },
  keyActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  copyButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  floatingButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  buttonBackground: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#D4AF37',
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalBackdrop: {
    flex: 1,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 20,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 15,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C2C2C',
  },
  closeButton: {
    padding: 8,
  },
  closeIcon: {
    transform: [{ rotate: '45deg' }],
  },
  formScrollView: {
    flexGrow: 1,
  },
  formContainer: {
    paddingVertical: 8,
    paddingBottom: 40,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C2C2C',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#F8F4E6',
    borderWidth: 1.5,
    borderColor: '#D4AF37',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#2C2C2C',
    textAlignVertical: 'top',
    minHeight: 48,
  },
  saveButton: {
    backgroundColor: '#D4AF37',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});