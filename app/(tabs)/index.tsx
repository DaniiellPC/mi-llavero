import { Image } from 'expo-image';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import ParallaxScrollView from '@/components/ParallaxScrollView';
import { SwipeableRow } from '@/components/SwipeableRow';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { BankItem, availableBanks } from '@/data/bancos';
import { getBankKeysCount, hasBankKeys } from '@/data/keysStorage';

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
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  description: {
    marginBottom: 20,
  },
  bankList: {
    marginTop: 10,
  },
  bankItemTouchable: {
    marginBottom: 0,
  },
  bankItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  bankImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 16,
  },
  bankInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  bankName: {
    fontSize: 18,
    marginBottom: 4,
  },
  updatedDate: {
    fontSize: 14,
    opacity: 0.7,
  },
  chevronIcon: {
    marginLeft: 12,
    opacity: 0.6,
  },
  floatingButton: {
    position: 'absolute',
    right: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
    zIndex: 1000,
  },
  buttonBackground: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#D4AF37',
    justifyContent: 'center',
    alignItems: 'center',
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
    paddingBottom: 40,
    maxHeight: '50%',
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
  bankOptionsList: {
    flexGrow: 0,
  },
  bankOption: {
    marginBottom: 8,
  },
  bankOptionContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8F4E6',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#D4AF37',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  bankOptionText: {
    fontSize: 16,
    flex: 1,
    color: '#2C2C2C',
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyIcon: {
    marginBottom: 20,
    opacity: 0.6,
  },
  emptyTitle: {
    fontSize: 22,
    marginBottom: 12,
    textAlign: 'center',
    color: '#2C2C2C',
  },
  emptyDescription: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    opacity: 0.7,
    lineHeight: 22,
  },
  emptyButtonHint: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  emptyButtonText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#D4AF37',
    fontWeight: '500',
  },
  noMoreBanksContainer: {
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderRadius: 12,
    marginVertical: 10,
  },
  noMoreBanksIcon: {
    marginBottom: 12,
    opacity: 0.9,
  },
  noMoreBanksText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#8B7355',
    fontWeight: '600',
    lineHeight: 22,
    marginBottom: 8,
  },
  noMoreBanksSubtext: {
    fontSize: 14,
    textAlign: 'center',
    color: '#8B7355',
    opacity: 0.7,
    lineHeight: 20,
  },
  // Estilos para el modal de advertencia
  warningModalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  warningModalBackdrop: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  warningModalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    margin: 20,
    maxWidth: 350,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 15,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  warningModalHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  warningIcon: {
    marginBottom: 12,
  },
  warningTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FF6B35',
    textAlign: 'center',
  },
  warningMessage: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 16,
    color: '#2C2C2C',
  },
  bankNameHighlight: {
    fontWeight: 'bold',
    color: '#D4AF37',
  },
  keysCountHighlight: {
    fontWeight: 'bold',
    color: '#FF6B35',
  },
  warningInstructions: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 24,
    color: '#666',
  },
  warningModalActions: {
    alignItems: 'center',
  },
  warningModalButton: {
    backgroundColor: '#D4AF37',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  warningModalButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});