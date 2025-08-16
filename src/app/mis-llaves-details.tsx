import * as Clipboard from 'expo-clipboard';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, TextInput, TouchableOpacity, View } from 'react-native';
import { Notifier, NotifierComponents, NotifierWrapper } from 'react-native-notifier';

import ParallaxScrollView from '@/src/components/ParallaxScrollView';
import { SwipeableRow } from '@/src/components/SwipeableRow';
import { ThemedText } from '@/src/components/ThemedText';
import { ThemedView } from '@/src/components/ThemedView';
import { IconSymbol } from '@/src/components/ui/IconSymbol';
import { SavedKey, deleteKey, getBankKeys, saveKey, updateKey } from '@/src/data/keysStorage';
import { misLlavesDetailsStyles as styles } from '@/src/styles/misLlavesDetailsStyles';

export default function MisLlavesDetailsScreen() {
  const params = useLocalSearchParams();
  const bankId = params.bankId as string;
  const bankName = params.bankName as string;
  
  const [modalVisible, setModalVisible] = useState(false);
  const [confirmDeleteModalVisible, setConfirmDeleteModalVisible] = useState(false);
  const [keyName, setKeyName] = useState('');
  const [keyValue, setKeyValue] = useState('');
  const [savedKeys, setSavedKeys] = useState<SavedKey[]>([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingKey, setEditingKey] = useState<SavedKey | null>(null);
  const [keyToDelete, setKeyToDelete] = useState<SavedKey | null>(null);
  const [resetSwipeId, setResetSwipeId] = useState<number | null>(null);
  const keyValueInputRef = React.useRef<TextInput>(null);

  // Cargar las llaves del banco actual al montar el componente
  useEffect(() => {
    if (bankId) {
      setSavedKeys(getBankKeys(bankId));
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

      // Actualizar en el storage global
      updateKey(bankId, updatedKey);

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

      // Agregar al storage global
      saveKey(bankId, newKey);

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

  const handleDeleteKey = (key: SavedKey) => {
    setKeyToDelete(key);
    setConfirmDeleteModalVisible(true);
  };

  const confirmDeleteKey = () => {
    if (keyToDelete && bankId) {
      // Eliminar del storage global
      deleteKey(bankId, keyToDelete.id);
      
      // Actualizar el estado local
      setSavedKeys(prev => prev.filter(key => key.id !== keyToDelete.id));
      
      console.log('Llave eliminada:', keyToDelete.name);
      
      // Mostrar notificación de éxito
      Notifier.showNotification({
        title: 'Llave eliminada',
        description: `La llave "${keyToDelete.name}" se ha eliminado exitosamente`,
        duration: 3000,
        showAnimationDuration: 800,
        hideAnimationDuration: 800,
        swipeEnabled: true,
        Component: NotifierComponents.Alert,
        componentProps: {
          alertType: 'success',
        },
      });
    }
    
    setConfirmDeleteModalVisible(false);
    setKeyToDelete(null);
  };

  const cancelDeleteKey = () => {
    setConfirmDeleteModalVisible(false);
    
    // Resetear el swipe de la llave que no se eliminó
    if (keyToDelete) {
      setResetSwipeId(keyToDelete.id);
      setTimeout(() => setResetSwipeId(null), 50);
    }
    
    setKeyToDelete(null);
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
    <SwipeableRow 
      onDelete={() => handleDeleteKey(item)}
      resetSwipe={resetSwipeId === item.id}
    >
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
    </SwipeableRow>
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

      {/* Modal de confirmación para eliminar llave */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={confirmDeleteModalVisible}
        onRequestClose={cancelDeleteKey}
      >
        <View style={styles.confirmModalOverlay}>
          <Pressable 
            style={styles.confirmModalBackdrop} 
            onPress={cancelDeleteKey}
          />
          <ThemedView style={styles.confirmModalContent}>
            <View style={styles.confirmModalHeader}>
              <IconSymbol
                name="trash.fill"
                size={48}
                color="#FF3B30"
                style={styles.confirmDeleteIcon}
              />
              <ThemedText type="title" style={styles.confirmTitle}>
                ¿Eliminar llave?
              </ThemedText>
            </View>
            
            <ThemedText style={styles.confirmMessage}>
              ¿Estás seguro de que quieres eliminar la llave{' '}
              <ThemedText style={styles.keyNameHighlight}>
                &quot;{keyToDelete?.name}&quot;
              </ThemedText>?
            </ThemedText>
            
            <ThemedText style={styles.confirmWarning}>
              Esta acción no se puede deshacer.
            </ThemedText>

            <View style={styles.confirmModalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={cancelDeleteKey}
                activeOpacity={0.7}
              >
                <ThemedText style={styles.cancelButtonText}>
                  Cancelar
                </ThemedText>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={confirmDeleteKey}
                activeOpacity={0.7}
              >
                <ThemedText style={styles.deleteButtonText}>
                  Eliminar
                </ThemedText>
              </TouchableOpacity>
            </View>
          </ThemedView>
        </View>
      </Modal>
      </View>
    </NotifierWrapper>
  );
}
