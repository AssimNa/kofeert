import { useState, useEffect } from 'react';
import api from '../api';
import { ChevronLeft, ChevronRight, AlertCircle, CheckCircle, Clock, Ban, AlertTriangle, FileText, ChevronRight as ChevronRightIcon, Calendar as CalendarIcon, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

const CalendarPage = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarData, setCalendarData] = useState({});
  const [loading, setLoading] = useState(true);

  // Clickable Day details state
  const [selectedDate, setSelectedDate] = useState(null);
  const [dayInspections, setDayInspections] = useState([]);
  const [loadingDay, setLoadingDay] = useState(false);

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
    setSelectedDate(null); // Reset day details on month change
  }, [currentDate]);

  const daysInMonth = (month, year) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (month, year) => new Date(year, month, 1).getDay();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const handleDayClick = async (dateStr) => {
    if (selectedDate === dateStr) {
      setSelectedDate(null);
      return;
    }
    
    setSelectedDate(dateStr);
    setLoadingDay(true);
    
    // Auto-scroll to the details section so the user sees the response immediately
    setTimeout(() => {
      document.getElementById('daily-inspections-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);

    try {
      const response = await api.get(`/inspections/jour?date_req=${dateStr}`);
      setDayInspections(response.data);
    } catch (error) {
      console.error("Error fetching daily inspections", error);
    } finally {
      setLoadingDay(false);
    }
  };

  const monthNames = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
  const dayLabels = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];

  const getStatusColor = (status) => {
    switch (status) {
      case 'conforme': return 'bg-kofert-green text-white shadow-lg shadow-kofert-green/40';
      case 'anomalie': return 'bg-kofert-red text-white shadow-lg shadow-kofert-red/40';
      case 'partiel': return 'bg-kofert-orange text-white shadow-lg shadow-kofert-orange/40';
      case 'manquant': return 'bg-kofert-blue text-white shadow-lg shadow-kofert-blue/40';
      default: return 'bg-gray-100 text-gray-400';
    }
  };

  const renderDays = () => {
    const days = [];
    const totalDays = daysInMonth(currentDate.getMonth(), currentDate.getFullYear());
    const startOffset = firstDayOfMonth(currentDate.getMonth(), currentDate.getFullYear());

    // Padding for first week
    for (let i = 0; i < startOffset; i++) {
      days.push(<div key={`pad-${i}`} className="h-28 md:h-36 rounded-3xl border border-gray-200/80 bg-gray-50/50"></div>);
    }

    for (let day = 1; day <= totalDays; day++) {
      const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayInfo = calendarData[dateStr];
      const isToday = new Date().toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();
      const isSelected = selectedDate === dateStr;

      days.push(
        <motion.div
          whileHover={dayInfo ? { y: -4, scale: 1.02 } : {}}
          onClick={() => dayInfo && handleDayClick(dateStr)}
          key={day}
          className={`h-28 md:h-36 p-3 sm:p-4 rounded-3xl transition-all flex flex-col justify-between group relative overflow-hidden ${
            dayInfo ? 'bg-white shadow-sm hover:shadow-lg cursor-pointer border border-gray-100' : 'bg-gray-50/80 border border-gray-200/80'
          } ${isToday ? 'ring-2 ring-kofert-green ring-offset-2' : ''} ${isSelected ? 'ring-2 ring-kofert-dark ring-offset-2 bg-gray-50' : ''}`}
        >
          <div className="flex justify-between items-start">
            <span className={`text-xl font-bold ${isToday ? 'text-kofert-green' : dayInfo ? 'text-kofert-dark' : 'text-gray-400'}`}>
              {day}
            </span>
            {dayInfo && (
               <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${getStatusColor(dayInfo.statut)}`}>
                  {dayInfo.statut === 'conforme' && <CheckCircle size={18} strokeWidth={2.5} />}
                  {dayInfo.statut === 'anomalie' && <AlertTriangle size={18} strokeWidth={2.5} />}
                  {dayInfo.statut === 'partiel' && <Clock size={18} strokeWidth={2.5} />}
                  {dayInfo.statut === 'manquant' && <Ban size={18} strokeWidth={2.5} />}
               </div>
            )}
          </div>
          
          {dayInfo && (
            <div className="space-y-1.5 mt-2">
              <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-1000 ${
                    dayInfo.statut === 'conforme' ? 'bg-kofert-green' :
                    dayInfo.statut === 'anomalie' ? 'bg-kofert-red' :
                    dayInfo.statut === 'partiel' ? 'bg-kofert-orange' : 'bg-kofert-blue'
                  }`} 
                  style={{ width: `${(dayInfo.fiches_soumises / dayInfo.fiches_total) * 100}%` }}
                />
              </div>
              <p className="text-[11px] sm:text-xs font-bold text-gray-500 truncate flex justify-between">
                <span>{dayInfo.fiches_soumises}/{dayInfo.fiches_total}</span>
                <span className="hidden sm:inline">FICHES</span>
              </p>
            </div>
          )}
        </motion.div>
      );
    }
    return days;
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-8 pb-10"
    >
      <header className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-kofert-dark via-[#2a2a2a] to-kofert-dark p-8 sm:p-10 shadow-2xl text-white">
        <div className="absolute top-0 right-0 w-64 h-64 bg-kofert-green/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-kofert-orange/10 rounded-full blur-[60px] translate-y-1/3 -translate-x-1/4 pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <motion.h1 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="text-4xl font-extrabold tracking-tight flex items-center gap-3"
            >
              <CalendarIcon size={36} className="text-kofert-green" />
              <span>Calendrier</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="text-gray-300 mt-2 text-lg max-w-xl"
            >
              Historique et suivi interactif des inspections.
            </motion.p>
          </div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="flex items-center bg-white/10 backdrop-blur-md p-1.5 rounded-2xl border border-white/20 shadow-lg self-start md:self-auto"
          >
            <button onClick={handlePrevMonth} className="p-3 hover:bg-white/20 rounded-xl transition-all group">
              <ChevronLeft size={24} className="text-white group-hover:-translate-x-1 transition-transform" />
            </button>
            <span className="px-6 font-extrabold text-lg min-w-[160px] text-center tracking-wide">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </span>
            <button onClick={handleNextMonth} className="p-3 hover:bg-white/20 rounded-xl transition-all group">
              <ChevronRight size={24} className="text-white group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        </div>
      </header>

      {/* Legend */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 bg-white p-5 rounded-3xl shadow-sm border border-gray-100"
      >
        <div className="flex items-center gap-2.5 px-4 py-2 rounded-xl hover:bg-gray-50 transition-colors">
          <div className="w-3 h-3 rounded-full bg-kofert-green shadow-[0_0_10px_rgba(29,158,117,0.5)]"></div>
          <span className="text-sm font-bold text-gray-600 uppercase tracking-wider">Conforme</span>
        </div>
        <div className="flex items-center gap-2.5 px-4 py-2 rounded-xl hover:bg-gray-50 transition-colors">
          <div className="w-3 h-3 rounded-full bg-kofert-orange shadow-[0_0_10px_rgba(239,159,39,0.5)]"></div>
          <span className="text-sm font-bold text-gray-600 uppercase tracking-wider">Partiel</span>
        </div>
        <div className="flex items-center gap-2.5 px-4 py-2 rounded-xl hover:bg-gray-50 transition-colors">
          <div className="w-3 h-3 rounded-full bg-kofert-red shadow-[0_0_10px_rgba(226,75,74,0.5)]"></div>
          <span className="text-sm font-bold text-gray-600 uppercase tracking-wider">Anomalie</span>
        </div>
        <div className="flex items-center gap-2.5 px-4 py-2 rounded-xl hover:bg-gray-50 transition-colors">
          <div className="w-3 h-3 rounded-full bg-kofert-blue shadow-[0_0_10px_rgba(133,183,235,0.5)]"></div>
          <span className="text-sm font-bold text-gray-600 uppercase tracking-wider">Manquant</span>
        </div>
      </motion.div>

      {loading ? (
        <div className="grid grid-cols-7 gap-3 md:gap-4 animate-pulse">
          {[...Array(35)].map((_, i) => (
            <div key={i} className="h-28 md:h-36 bg-white rounded-3xl border border-gray-100 opacity-60"></div>
          ))}
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-7 gap-3 md:gap-4"
        >
          {dayLabels.map(label => (
            <div key={label} className="text-center py-2 text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
              {label}
            </div>
          ))}
          {renderDays()}
        </motion.div>
      )}

      {/* Daily Inspections Section */}
      <AnimatePresence>
        {selectedDate && (
          <motion.section 
            id="daily-inspections-section"
            initial={{ opacity: 0, height: 0, y: 20 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -20 }}
            className="bg-white rounded-3xl shadow-lg shadow-black/5 border border-kofert-green/20 overflow-hidden scroll-mt-24"
          >
            <div className="p-6 sm:p-8 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-kofert-green/5">
              <div>
                <h2 className="text-2xl font-bold text-kofert-dark flex items-center gap-2">
                  <CalendarIcon className="text-kofert-green" size={24} />
                  Inspections du {new Date(selectedDate).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </h2>
                <p className="text-sm text-gray-500 mt-1">Détails des points contrôlés pour cette journée.</p>
              </div>
              <button 
                onClick={() => setSelectedDate(null)} 
                className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-100 text-gray-600 rounded-xl transition-colors border border-gray-200 self-start sm:self-auto"
              >
                <X size={18} />
                <span className="text-xs font-bold uppercase tracking-widest">Fermer</span>
              </button>
            </div>

            <div className="p-6 sm:p-8">
              {loadingDay ? (
                <div className="flex justify-center py-12">
                  <div className="relative w-12 h-12">
                    <div className="absolute inset-0 rounded-full border-t-4 border-kofert-green animate-spin"></div>
                  </div>
                </div>
              ) : dayInspections.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <FileText size={48} className="text-gray-200 mb-4" />
                  <p className="text-gray-500 font-medium">Aucune inspection soumise ou planifiée pour cette journée.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {dayInspections.map((ins, i) => (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.05 }}
                      key={ins.id} 
                      className="bg-gray-50 border border-gray-100 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between hover:border-kofert-green/30 hover:shadow-md hover:bg-white transition-all group gap-4"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white shadow-sm rounded-xl flex items-center justify-center text-gray-400 group-hover:bg-kofert-green group-hover:text-white transition-colors shrink-0">
                          <FileText size={22} />
                        </div>
                        <div>
                          <h3 className="font-bold text-kofert-dark text-lg group-hover:text-kofert-green transition-colors">{ins.fiche_nom}</h3>
                          <p className="text-sm text-gray-500 font-medium flex items-center gap-1 mt-0.5">
                            Par {ins.technicien}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto">
                        <div className="flex flex-col items-start sm:items-end gap-1.5">
                          <span className={`text-xs font-bold px-3 py-1.5 rounded-xl uppercase tracking-wider ${
                            ins.statut === 'soumise' ? 'bg-kofert-green/10 text-kofert-green border border-kofert-green/20' : 'bg-orange-50 text-orange-500 border border-orange-100'
                          }`}>
                            {ins.statut}
                          </span>
                          {ins.anomalies > 0 && (
                            <span className="text-[11px] font-bold text-kofert-red flex items-center gap-1">
                              <AlertTriangle size={12} />
                              {ins.anomalies} anomalie{ins.anomalies > 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                        <Link 
                          to={`/inspection-detail/${ins.id}`}
                          className="p-3 bg-white border border-gray-200 hover:border-kofert-green hover:bg-kofert-green hover:text-white rounded-xl text-gray-400 shadow-sm transition-all group-hover:translate-x-1"
                        >
                          <ChevronRightIcon size={18} />
                        </Link>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default CalendarPage;
