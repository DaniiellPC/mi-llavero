import { Image } from 'expo-image';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { FlatList, Modal, Pressable, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import ParallaxScrollView from '@/src/components/ParallaxScrollView';
import { SwipeableRow } from '@/src/components/SwipeableRow';
import { ThemedText } from '@/src/components/ThemedText';
import { ThemedView } from '@/src/components/ThemedView';
import { IconSymbol } from '@/src/components/ui/IconSymbol';
import { BankItem, availableBanks } from '@/src/data/bancos';
import { getBankKeysCount, hasBankKeys } from '@/src/data/keysStorage';
import { misLlavesStyles as styles } from '@/src/styles/misLlavesStyles';

export default function MisLlavesScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const [warningModalVisible, setWarningModalVisible] = useState(false);
  const [userBanks, setUserBanks] = useState<BankItem[]>([]);
  const [bankToDelete, setBankToDelete] = useState<BankItem | null>(null);
  const [resetSwipeId, setResetSwipeId] = useState<number | null>(null);
  const insets = useSafeAreaInsets();

  const handleBankItemPress = (item: BankItem) => {
    router.push({
      pathname: '/mis-llaves-details',
      params: {
        bankId: item.id.toString(),
        bankName: item.bankName,
        bankImage: item.logo,
        status: item.status,
        updatedAt: item.updatedAt
      }
    });
  };

  const renderBankItem = ({ item }: { item: BankItem }) => (
    <SwipeableRow 
      onDelete={() => handleDeleteBank(item.id)}
      resetSwipe={resetSwipeId === item.id}
    >
      <TouchableOpacity 
        style={styles.bankItemTouchable}
        onPress={() => handleBankItemPress(item)}
        activeOpacity={0.7}
      >
        <ThemedView style={styles.bankItem}>
          <Image
            source={{ uri: item.logo }}
            style={styles.bankImage}
            placeholder="https://via.placeholder.com/60"
          />
          <View style={styles.bankInfo}>
            <ThemedText type="defaultSemiBold" style={styles.bankName}>
              {item.bankName}
            </ThemedText>
            <ThemedText style={styles.updatedDate}>
              Actualizado: {item.updatedAt}
            </ThemedText>
          </View>
          <IconSymbol
            name="chevron.right"
            size={16}
            color="#D4AF37"
            style={styles.chevronIcon}
          />
        </ThemedView>
      </TouchableOpacity>
    </SwipeableRow>
  );

  const handleAddPress = () => {
    setModalVisible(true);
  };

  const handleBankSelect = (bank: BankItem) => {
    // Crear una nueva instancia del banco con un ID único para la lista del usuario
    const newUserBank: BankItem = {
      ...bank,
      id: Date.now(), // Usar timestamp como ID único
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    };
    
    setUserBanks(prevBanks => [...prevBanks, newUserBank]);
    console.log('Banco agregado:', bank.bankName);
    
    setModalVisible(false);
  };

  const handleDeleteBank = (bankId: number) => {
    // Buscar el banco que se quiere eliminar
    const bankToDelete = userBanks.find(bank => bank.id === bankId);
    if (!bankToDelete) return;

    // Verificar si el banco tiene llaves guardadas
    if (hasBankKeys(bankId.toString())) {
      // Si tiene llaves, mostrar modal de advertencia
      setBankToDelete(bankToDelete);
      setWarningModalVisible(true);
    } else {
      // Si no tiene llaves, eliminar directamente
      performBankDeletion(bankId);
    }
  };

  const performBankDeletion = (bankId: number) => {
    setUserBanks(prevBanks => prevBanks.filter(bank => bank.id !== bankId));
    console.log('Banco eliminado con ID:', bankId);
  };

  const handleWarningModalClose = () => {
    setWarningModalVisible(false);
    // Resetear el swipe del banco que no se pudo eliminar
    if (bankToDelete) {
      setResetSwipeId(bankToDelete.id);
      // Resetear el estado después de un pequeño delay
      setTimeout(() => setResetSwipeId(null), 50);
    }
    setBankToDelete(null);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
  };

  const renderBankOption = ({ item }: { item: BankItem }) => (
    <TouchableOpacity
      style={styles.bankOption}
      onPress={() => handleBankSelect(item)}
      activeOpacity={0.7}
    >
      <ThemedView style={styles.bankOptionContent}>
        <ThemedText type="defaultSemiBold" style={styles.bankOptionText}>
          {item.bankName}
        </ThemedText>
        <IconSymbol
          name="chevron.right"
          size={16}
          color="#D4AF37"
        />
      </ThemedView>
    </TouchableOpacity>
  );

  return (
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
        <ThemedView style={styles.titleContainer}>
          <ThemedText type="title">Mis Llaves</ThemedText>
        </ThemedView>
        <ThemedText style={styles.description}>
          Aquí podrás gestionar todas tus llaves de forma segura.
        </ThemedText>
        {userBanks.length === 0 ? (
          <ThemedView style={styles.emptyState}>
            <IconSymbol
              name="key.horizontal"
              size={80}
              color="#D4AF37"
              style={styles.emptyIcon}
            />
            <ThemedText type="subtitle" style={styles.emptyTitle}>
              No tienes llaves agregadas
            </ThemedText>
            <ThemedText style={styles.emptyDescription}>
              Agrega uno de los bancos de la lista haciendo clic en el botón
            </ThemedText>
            <ThemedView style={styles.emptyButtonHint}>
              <IconSymbol
                name="plus.circle.fill"
                size={24}
                color="#D4AF37"
              />
              <ThemedText style={styles.emptyButtonText}>
                Toca el botón + para comenzar
              </ThemedText>
            </ThemedView>
          </ThemedView>
        ) : (
          <FlatList
            data={userBanks}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderBankItem}
            style={styles.bankList}
            scrollEnabled={false}
          />
        )}
      </ParallaxScrollView>
      
      {/* Botón flotante */}
      <TouchableOpacity 
        style={[styles.floatingButton, { bottom: insets.bottom + 90 }]}
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

      {/* Modal para seleccionar banco */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalOverlay}>
          <Pressable 
            style={styles.modalBackdrop} 
            onPress={handleCloseModal}
          />
          <ThemedView style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <ThemedText type="title" style={styles.modalTitle}>
                Seleccionar Banco
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
            
            {availableBanks.filter(bank => 
              bank.status === 'active' && !userBanks.some(userBank => userBank.bankName === bank.bankName)
            ).length === 0 ? (
              <ThemedView style={styles.noMoreBanksContainer}>
                <IconSymbol
                  name="checkmark.circle.fill"
                  size={32}
                  color="#D4AF37"
                  style={styles.noMoreBanksIcon}
                />
                <ThemedText style={styles.noMoreBanksText}>
                  ¡Has agregado todos los bancos disponibles!
                </ThemedText>
                <ThemedText style={styles.noMoreBanksSubtext}>
                  Puedes gestionar tus llaves desde la pantalla principal
                </ThemedText>
              </ThemedView>
            ) : (
              <FlatList
                data={availableBanks.filter(bank => 
                  bank.status === 'active' && !userBanks.some(userBank => userBank.bankName === bank.bankName)
                )}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderBankOption}
                style={styles.bankOptionsList}
                showsVerticalScrollIndicator={false}
              />
            )}
          </ThemedView>
        </View>
      </Modal>

      {/* Modal de advertencia cuando el banco no está vacío */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={warningModalVisible}
        onRequestClose={handleWarningModalClose}
      >
        <View style={styles.warningModalOverlay}>
          <Pressable 
            style={styles.warningModalBackdrop} 
            onPress={handleWarningModalClose}
          />
          <ThemedView style={styles.warningModalContent}>
            <View style={styles.warningModalHeader}>
              <IconSymbol
                name="exclamationmark.triangle.fill"
                size={48}
                color="#FF6B35"
                style={styles.warningIcon}
              />
              <ThemedText type="title" style={styles.warningTitle}>
                ¡No se puede eliminar!
              </ThemedText>
            </View>
            
            <ThemedText style={styles.warningMessage}>
              El banco <ThemedText style={styles.bankNameHighlight}>
                {bankToDelete?.bankName}
              </ThemedText> contiene <ThemedText style={styles.keysCountHighlight}>
                {bankToDelete ? getBankKeysCount(bankToDelete.id.toString()) : 0} llave(s)
              </ThemedText> guardada(s).
            </ThemedText>
            
            <ThemedText style={styles.warningInstructions}>
              Para eliminar este banco, primero debes entrar y eliminar todas las llaves que contiene.
            </ThemedText>

            <View style={styles.warningModalActions}>
              <TouchableOpacity
                style={styles.warningModalButton}
                onPress={handleWarningModalClose}
                activeOpacity={0.7}
              >
                <ThemedText style={styles.warningModalButtonText}>
                  Entendido
                </ThemedText>
              </TouchableOpacity>
            </View>
          </ThemedView>
        </View>
      </Modal>
    </View>
  );
}

