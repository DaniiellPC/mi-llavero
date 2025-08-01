import { Image } from 'expo-image';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, TouchableOpacity, View } from 'react-native';

import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';

// Datos de ejemplo para los bancos
const bancosData = [
  {
    "id": 1,
    "name": "Llave 1",
    "bank": "Banco de Chile",
    "image": "https://via.placeholder.com/150",
    "createdAt": "2021-01-01",
    "updatedAt": "2021-01-01"
  },
  {
    "id": 2,
    "name": "Llave 2",
    "bank": "Banco de Colombia",
    "image": "https://via.placeholder.com/151",
    "createdAt": "2021-01-01",
    "updatedAt": "2021-01-01"
  }
];

// Lista de bancos disponibles para el dropdown
const availableBanks = [
  "Banco de Chile",
  "Banco Santander",
  "BancoEstado"
];

interface BankItem {
  id: number;
  name: string;
  bank: string;
  image: string;
  createdAt: string;
  updatedAt: string;
}

export default function MisLlavesScreen() {
  const [modalVisible, setModalVisible] = useState(false);

  const handleBankItemPress = (item: BankItem) => {
    router.push({
      pathname: '/mis-llaves-details',
      params: {
        bankId: item.id.toString(),
        bankName: item.bank,
        bankImage: item.image,
        updatedAt: item.updatedAt
      }
    });
  };

  const renderBankItem = ({ item }: { item: BankItem }) => (
    <TouchableOpacity 
      style={styles.bankItemTouchable}
      onPress={() => handleBankItemPress(item)}
      activeOpacity={0.7}
    >
      <ThemedView style={styles.bankItem}>
        <Image
          source={{ uri: item.image }}
          style={styles.bankImage}
          placeholder="https://via.placeholder.com/60"
        />
        <View style={styles.bankInfo}>
          <ThemedText type="defaultSemiBold" style={styles.bankName}>
            {item.bank}
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
  );

  const handleAddPress = () => {
    setModalVisible(true);
  };

  const handleBankSelect = (bank: string) => {
    setModalVisible(false);
    // Aquí se puede agregar la lógica para crear una nueva llave con el banco seleccionado
    console.log('Banco seleccionado:', bank);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
  };

  const renderBankOption = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={styles.bankOption}
      onPress={() => handleBankSelect(item)}
      activeOpacity={0.7}
    >
      <ThemedView style={styles.bankOptionContent}>
        <ThemedText type="defaultSemiBold" style={styles.bankOptionText}>
          {item}
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
        
        <FlatList
          data={bancosData}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderBankItem}
          style={styles.bankList}
          scrollEnabled={false}
        />
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
            
            <FlatList
              data={availableBanks}
              keyExtractor={(item, index) => index.toString()}
              renderItem={renderBankOption}
              style={styles.bankOptionsList}
              showsVerticalScrollIndicator={false}
            />
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
    marginBottom: 12,
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
}); 