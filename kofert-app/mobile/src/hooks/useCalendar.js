import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import moment from 'moment';

export function useCalendar() {
  const [calendarData, setCalendarData] = useState({});
  const [loading, setLoading] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(moment());

  const loadCalendar = useCallback(async (month = currentMonth) => {
    setLoading(true);
    try {
      const mois = month.month() + 1;
      const annee = month.year();
      
      const response = await api.get(`/inspections/calendar?mois=${mois}&annee=${annee}`);
      setCalendarData(response.data);
    } catch (error) {
      console.error('Erreur load calendar:', error);
    } finally {
      setLoading(false);
    }
  }, [currentMonth]);

  useEffect(() => {
    loadCalendar(currentMonth);
  }, [currentMonth, loadCalendar]);

  const previousMonth = useCallback(() => {
    setCurrentMonth(prev => prev.clone().subtract(1, 'month'));
  }, []);

  const nextMonth = useCallback(() => {
    setCurrentMonth(prev => prev.clone().add(1, 'month'));
  }, []);

  const getDateColor = useCallback((dateStr) => {
    const dayData = calendarData[dateStr];
    if (!dayData) return null;

    switch (dayData.statut) {
      case 'conforme': return '#1D9E75';
      case 'anomalie': return '#EF9F27';
      case 'manquant': return '#E24B4A';
      case 'partiel': return '#378ADD';
      default: return null;
    }
  }, [calendarData]);

  return {
    calendarData,
    loading,
    currentMonth,
    previousMonth,
    nextMonth,
    getDateColor,
    loadCalendar
  };
}
