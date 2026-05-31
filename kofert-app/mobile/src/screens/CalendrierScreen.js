import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar } from 'react-native-calendars';
import { useCalendar } from '../hooks/useCalendar';
import Colors from '../constants/colors';

export default function CalendrierScreen({ navigation }) {
  const { calendarData, loading, currentMonth, previousMonth, nextMonth, getDateColor } = useCalendar();

  const getMarkedDates = () => {
    const marked = {};
    Object.keys(calendarData).forEach(dateStr => {
      const color = getDateColor(dateStr);
      if (color) {
        marked[dateStr] = {
          marked: true,
          dotColor: color,
          activeOpacity: 0,
        };
      }
    });
    return marked;
  };

  const handleDayPress = (day) => {
    navigation.navigate('DetailJourScreen', {
      date: day.dateString,
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color={Colors.green} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={previousMonth}>
          <Text style={styles.navButton}>◀️</Text>
        </TouchableOpacity>
        <Text style={styles.monthLabel}>
          {currentMonth.format('MMMM YYYY').toUpperCase()}
        </Text>
        <TouchableOpacity onPress={nextMonth}>
          <Text style={styles.navButton}>▶️</Text>
        </TouchableOpacity>
      </View>

      <Calendar
        current={currentMonth.format('YYYY-MM-DD')}
        markedDates={getMarkedDates()}
        onDayPress={handleDayPress}
        monthFormat={''}
        hideArrows={true}
        theme={{
          backgroundColor: '#fff',
          calendarBackground: '#fff',
          textSectionTitleColor: '#999',
          selectedDayBackgroundColor: Colors.green,
          selectedDayTextColor: '#fff',
          todayTextColor: Colors.green,
          dayTextColor: '#333',
          textDisabledColor: '#ddd',
          dotColor: Colors.green,
          selectedDotColor: '#fff',
          arrowColor: Colors.green,
          monthTextColor: Colors.green,
          indicatorColor: Colors.green,
        }}
      />

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: Colors.green }]} />
          <Text style={styles.legendText}>Conforme</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: Colors.orange }]} />
          <Text style={styles.legendText}>Anomalie</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: Colors.red }]} />
          <Text style={styles.legendText}>Manquant</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: Colors.blue }]} />
          <Text style={styles.legendText}>Partiel</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  navButton: {
    fontSize: 20,
    padding: 8,
  },
  monthLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f9f9f9',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '50%',
    marginVertical: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  legendText: {
    fontSize: 12,
    color: '#666',
  },
});
