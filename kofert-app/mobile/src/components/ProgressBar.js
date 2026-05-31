import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Colors from '../constants/colors';

export default function ProgressBar({ filled, total }) {
  const percent = total > 0 ? (filled / total) * 100 : 0;

  return (
    <View style={styles.container}>
      <View style={styles.bar}>
        <View
          style={[
            styles.fill,
            {
              width: `${percent}%`,
              backgroundColor: percent === 100 ? Colors.green : Colors.orange,
            },
          ]}
        />
      </View>
      <Text style={styles.text}>
        {filled} / {total} points remplis ({Math.round(percent)}%)
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  bar: {
    height: 8,
    backgroundColor: '#eee',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  fill: {
    height: '100%',
    borderRadius: 4,
  },
  text: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
});
