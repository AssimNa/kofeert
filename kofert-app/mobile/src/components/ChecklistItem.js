import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import Colors from '../constants/colors';

export default function ChecklistItem({
  item,
  result,
  remarque,
  mesures = {},
  photo,
  onResultChange,
  onRemarqueChange,
  onMesureChange,
  onPhotoChange,
}) {
  const getIcon = () => {
    if (result === 'conforme') return '✓';
    if (result === 'non_conforme') return '✗';
    return '?';
  };

  const getColor = () => {
    if (result === 'conforme') return Colors.green;
    if (result === 'non_conforme') return Colors.red;
    return '#999';
  };

  const hasNumeric = item.mesures && item.mesures.length > 0;

  const handleTakePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      alert('Désolé, nous avons besoin de la permission d\'accéder à la caméra !');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled) {
      onPhotoChange(`data:image/jpeg;base64,${result.assets[0].base64}`);
    }
  };

  const handleDeletePhoto = () => {
    onPhotoChange(null);
  };

  return (
    <View style={[styles.container, { borderLeftColor: getColor() }]}>
      <View style={styles.header}>
        <View style={[styles.icon, { backgroundColor: getColor() }]}>
          <Text style={styles.iconText}>{getIcon()}</Text>
        </View>
        <View style={styles.titleGroup}>
          <Text style={styles.itemName}>{item.equipement_label}</Text>
          <Text style={styles.description}>{item.controle_description}</Text>
        </View>
      </View>

      <View style={styles.buttons}>
        <TouchableOpacity
          style={[
            styles.button, 
            result === 'conforme' ? styles.buttonConforme : styles.unselected
          ]}
          onPress={() => onResultChange(result === 'conforme' ? null : 'conforme')}
        >
          <Text style={[styles.buttonText, result === 'conforme' ? {color: Colors.green} : null]}>Conforme</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.button, 
            result === 'non_conforme' ? styles.buttonNonConforme : styles.unselected
          ]}
          onPress={() => onResultChange(result === 'non_conforme' ? null : 'non_conforme')}
        >
          <Text style={[styles.buttonText, result === 'non_conforme' ? {color: Colors.red} : null]}>Non-conforme</Text>
        </TouchableOpacity>
      </View>

      {hasNumeric && (
        <View style={styles.mesuresGroup}>
          {item.mesures.map((mesure) => (
            <View key={mesure.id} style={styles.mesureRow}>
              <Text style={styles.mesureLabel}>{mesure.label} ({mesure.unite})</Text>
              <TextInput
                style={styles.mesureInput}
                placeholder="0"
                value={mesures[mesure.id] || ''}
                onChangeText={(value) => onMesureChange(mesure.id, value)}
                keyboardType="decimal-pad"
              />
            </View>
          ))}
        </View>
      )}

      <TextInput
        style={styles.remarque}
        placeholder="Remarque optionnelle"
        value={remarque}
        onChangeText={onRemarqueChange}
        multiline
      />

      {result === 'non_conforme' && (
        <View style={styles.photoContainer}>
          {photo ? (
            <View style={styles.photoPreviewContainer}>
              <Image source={{ uri: photo }} style={styles.photoPreview} />
              <View style={styles.photoActions}>
                <TouchableOpacity style={styles.deleteButton} onPress={handleDeletePhoto}>
                  <Ionicons name="trash" size={16} color="#fff" />
                  <Text style={styles.actionText}>Supprimer</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.retakeButton} onPress={handleTakePhoto}>
                  <Ionicons name="camera-reverse" size={16} color="#fff" />
                  <Text style={styles.actionText}>Reprendre</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <>
              <TouchableOpacity style={styles.photoButton} onPress={handleTakePhoto}>
                <Ionicons name="camera" size={20} color={Colors.red} />
                <Text style={styles.photoButtonText}>Prendre une photo</Text>
              </TouchableOpacity>
              <Text style={styles.missingPhotoText}>⚠️ Veuillez prendre une photo pour cet item.</Text>
            </>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderLeftWidth: 4,
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  icon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    marginTop: 2,
  },
  iconText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  titleGroup: {
    flex: 1,
  },
  itemName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  description: {
    fontSize: 12,
    color: '#999',
    lineHeight: 16,
  },
  buttons: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  button: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  buttonConforme: {
    backgroundColor: '#E1F5EE',
    borderWidth: 1,
    borderColor: Colors.green,
  },
  buttonNonConforme: {
    backgroundColor: '#FCEBEB',
    borderWidth: 1,
    borderColor: Colors.red,
  },
  buttonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  unselected: {
    backgroundColor: '#f5f5f5',
    borderColor: '#eee',
    borderWidth: 1,
  },
  mesuresGroup: {
    backgroundColor: '#f5f5f5',
    borderRadius: 6,
    padding: 10,
    marginBottom: 10,
  },
  mesureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    justifyContent: 'space-between',
  },
  mesureLabel: {
    fontSize: 12,
    color: '#333',
    flex: 1,
  },
  mesureInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 6,
    fontSize: 12,
    width: 80,
  },
  remarque: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 8,
    fontSize: 12,
    minHeight: 50,
  },
  photoContainer: {
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 10,
  },
  photoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF5F5',
    borderWidth: 1,
    borderColor: '#FED7D7',
    borderRadius: 8,
    paddingVertical: 10,
    gap: 8,
  },
  photoButtonText: {
    color: Colors.red,
    fontWeight: 'bold',
    fontSize: 13,
  },
  photoPreviewContainer: {
    position: 'relative',
    borderRadius: 8,
    overflow: 'hidden',
  },
  photoPreview: {
    width: '100%',
    height: 150,
    borderRadius: 8,
  },
  photoActions: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    right: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  deleteButton: {
    backgroundColor: 'rgba(220, 53, 69, 0.85)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 4,
  },
  retakeButton: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 4,
  },
  actionText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  missingPhotoText: {
    color: Colors.red,
    fontSize: 11,
    marginTop: 6,
    textAlign: 'center',
    fontWeight: '500',
  },
});
