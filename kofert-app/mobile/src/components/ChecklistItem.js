import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
} from 'react-native';
import Colors from '../constants/colors';

export default function ChecklistItem({
  item,
  result,
  remarque,
  mesures = {},
  onResultChange,
  onRemarqueChange,
  onMesureChange,
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

  const hasNumeric = item.item_mesures && item.item_mesures.length > 0;

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

      {!result && (
        <View style={styles.buttons}>
          <TouchableOpacity
            style={[styles.button, styles.buttonConforme]}
            onPress={() => onResultChange('conforme')}
          >
            <Text style={styles.buttonText}>Conforme</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.buttonNonConforme]}
            onPress={() => onResultChange('non_conforme')}
          >
            <Text style={styles.buttonText}>Non-conforme</Text>
          </TouchableOpacity>
        </View>
      )}

      {hasNumeric && (
        <View style={styles.mesuresGroup}>
          {item.item_mesures.map((mesure) => (
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
});
