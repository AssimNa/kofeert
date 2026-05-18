import { useState, useEffect } from 'react';
import api from '../api';
import { ChevronLeft, ChevronRight, AlertCircle, CheckCircle, Clock, Ban } from 'lucide-react';
import { motion } from 'framer-motion';

const CalendarPage = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarData, setCalendarData] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchCalendar = async (month, year) => {
    setLoading(true);
    try {
      const response = await api.get(`/inspections/calendar?mois=${month + 1}&annee=${year}`);
      setCalendarData(response.data);
    } catch (error) {
      console.error("Error fetching calendar", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCalendar(currentDate.getMonth(), currentDate.getFullYear());
  }, [currentDate]);

  const daysInMonth = (month, year) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (month, year) => new Date(year, month, 1).getDay();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const monthNames = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
  const dayLabels = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];

  const getStatusColor = (status) => {
    switch (status) {
      case 'conforme': return 'bg-kofert-green text-white shadow-lg shadow-kofert-green/30';
      case 'anomalie': return 'bg-kofert-red text-white shadow-lg shadow-kofert-red/30';
      case 'partiel': return 'bg-kofert-orange text-white shadow-lg shadow-kofert-orange/30';
      case 'manquant': return 'bg-kofert-blue text-white shadow-lg shadow-kofert-blue/30';
      default: return 'bg-white text-gray-300 border border-black/5';
    }
  };

  const renderDays = () => {
    const days = [];
    const totalDays = daysInMonth(currentDate.getMonth(), currentDate.getFullYear());
    const startOffset = firstDayOfMonth(currentDate.getMonth(), currentDate.getFullYear());

    // Padding for first week
    for (let i = 0; i < startOffset; i++) {
      days.push(<div key={`pad-${i}`} className="h-24 md:h-32"></div>);
    }

    for (let day = 1; day <= totalDays; day++) {
      const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayInfo = calendarData[dateStr];
      const isToday = new Date().toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();

      days.push(
        <motion.div
          whileHover={{ y: -5 }}
          key={day}
          className={`h-24 md:h-32 p-3 rounded-2xl transition-all flex flex-col justify-between group relative overflow-hidden ${
            dayInfo ? 'card border-none' : 'border border-gray-100'
          } ${isToday ? 'ring-2 ring-kofert-green' : ''}`}
        >
          <div className="flex justify-between items-start">
            <span className={`text-lg font-bold ${isToday ? 'text-kofert-green' : 'text-kofert-dark'}`}>
              {day}
            </span>
            {dayInfo && (
               <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${getStatusColor(dayInfo.statut)}`}>
                  {dayInfo.statut === 'conforme' && <CheckCircle size={14} />}
                  {dayInfo.statut === 'anomalie' && <AlertTriangle size={14} />}
                  {dayInfo.statut === 'partiel' && <Clock size={14} />}
                  {dayInfo.statut === 'manquant' && <Ban size={14} />}
               </div>
            )}
          </div>
          
          {dayInfo && (
            <div className="space-y-1">
              <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-1000 ${
                    dayInfo.statut === 'conforme' ? 'bg-kofert-green' :
                    dayInfo.statut === 'anomalie' ? 'bg-kofert-red' :
                    dayInfo.statut === 'partiel' ? 'bg-kofert-orange' : 'bg-kofert-blue'
                  }`} 
                  style={{ width: `${(dayInfo.fiches_soumises / dayInfo.fiches_total) * 100}%` }}
                />
              </div>
              <p className="text-[10px] font-bold text-gray-400 truncate">
                {dayInfo.fiches_soumises}/{dayInfo.fiches_total} FICHES
              </p>
            </div>
          )}
        </motion.div>
      );
    }
    return days;
  };

  return (
    <div className="space-y-8 pb-10">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold text-kofert-dark">Calendrier</h1>
          <p className="text-gray-500 mt-2 text-lg">Historique et suivi des inspections.</p>
        </div>

        <div className="flex items-center bg-white p-2 rounded-2xl shadow-sm border border-black/5 self-start">
          <button onClick={handlePrevMonth} className="p-2 hover:bg-gray-50 rounded-xl transition-colors">
            <ChevronLeft size={24} />
          </button>
          <span className="px-8 font-bold text-lg min-w-[160px] text-center">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </span>
          <button onClick={handleNextMonth} className="p-2 hover:bg-gray-50 rounded-xl transition-colors">
            <ChevronRight size={24} />
          </button>
        </div>
      </header>

      {/* Legend */}
      <div className="flex flex-wrap gap-6 bg-white/50 backdrop-blur-sm p-4 rounded-2xl border border-black/5">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-kofert-green"></div>
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Conforme</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-kofert-orange"></div>
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Partiel</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-kofert-red"></div>
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Anomalie</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-kofert-blue"></div>
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Manquant</span>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-7 gap-4 animate-pulse">
          {[...Array(35)].map((_, i) => (
            <div key={i} className="h-24 md:h-32 bg-white rounded-2xl border border-black/5"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-7 gap-3 md:gap-4">
          {dayLabels.map(label => (
            <div key={label} className="text-center py-2 text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
              {label}
            </div>
          ))}
          {renderDays()}
        </div>
      )}
    </div>
  );
};

export default CalendarPage;
