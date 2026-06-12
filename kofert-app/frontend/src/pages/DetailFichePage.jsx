import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { ChevronLeft, FileText, Download, CheckCircle, AlertTriangle, Info, Loader2, Calendar, User } from 'lucide-react';
import { motion } from 'framer-motion';

const DetailFichePage = () => {
  const { inspectionId } = useParams();
  const navigate = useNavigate();
  const [inspection, setInspection] = useState(null);
  const [fiche, setFiche] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [activeSection, setActiveSection] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const insRes = await api.get(`/inspections/${inspectionId}`);
        setInspection(insRes.data);
        const ficheRes = await api.get(`/fiches/${insRes.data.fiche_template_id}`);
        setFiche(ficheRes.data);
      } catch (error) {
        console.error("Error fetching detail data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [inspectionId]);

  const handleExportPDF = async () => {
    if (!inspection) return;
    setExporting(true);
    try {
      const response = await api.get(`/inspections/${inspection.id}/pdf`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `rapport_${inspection.id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert("Erreur lors de l'exportation du PDF");
    } finally {
      setExporting(false);
    }
  };

  if (loading || !inspection || !fiche) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="animate-spin text-kofert-green" size={40} />
      </div>
    );
  }

  const currentSection = fiche.sections[activeSection];
  const isGlobalConforme = inspection.resultats.every(r => r.resultat === 'conforme');

  // Helper to find result for an item
  const getItemResult = (itemId) => {
    return inspection.resultats.find(r => r.item_id === itemId);
  };

  return (
    <div className="max-w-4xl mx-auto pb-20 space-y-8">
      {/* Back & Export Header */}
      <header className="flex items-center justify-between sticky top-[65px] md:top-0 bg-kofert-gray/80 backdrop-blur-md z-10 py-4">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-white rounded-full transition-colors">
            <ChevronLeft size={24} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-kofert-dark">{fiche.nom}</h1>
            <p className="text-sm text-gray-500 font-medium">{fiche.reference} • Lecture seule</p>
          </div>
        </div>
        <button 
          onClick={handleExportPDF} 
          disabled={exporting}
          className="btn-primary flex items-center gap-2 !px-4 !py-2 text-sm"
        >
          {exporting ? <Loader2 className="animate-spin" size={16} /> : <Download size={16} />}
          <span>PDF</span>
        </button>
      </header>

      {/* Global Status Banner */}
      <div className={`p-6 rounded-3xl flex items-center gap-5 border shadow-sm ${
        isGlobalConforme 
          ? 'bg-kofert-green/10 border-kofert-green/20' 
          : 'bg-kofert-red/10 border-kofert-red/20'
      }`}>
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-sm ${
          isGlobalConforme ? 'bg-kofert-green' : 'bg-kofert-red'
        }`}>
          {isGlobalConforme ? <CheckCircle size={28} /> : <AlertTriangle size={28} />}
        </div>
        <div>
          <h2 className={`text-xl font-bold ${isGlobalConforme ? 'text-kofert-green' : 'text-kofert-red'}`}>
            Inspection {isGlobalConforme ? 'Conforme' : 'Non Conforme'}
          </h2>
          <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-gray-400 mt-1 uppercase tracking-wider">
            <span className="flex items-center gap-1"><Calendar size={14} /> Soumise le {new Date(inspection.soumis_le || inspection.date_inspection).toLocaleDateString('fr-FR')}</span>
            <span>•</span>
            <span className="flex items-center gap-1"><User size={14} /> Technicien : {inspection.technicien_id ? 'Complété' : 'N/A'}</span>
          </div>
        </div>
      </div>

      {/* Section Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar border-b border-black/5">
        {fiche.sections.map((section, i) => {
          // Check if section contains any anomaly
          const hasAnomaly = section.items.some(item => {
            const res = getItemResult(item.id);
            return res && res.resultat === 'non_conforme';
          });

          return (
            <button
              key={section.id}
              onClick={() => setActiveSection(i)}
              className={`whitespace-nowrap px-6 py-3 rounded-2xl font-bold text-sm transition-all border flex items-center gap-2 ${
                activeSection === i 
                  ? 'bg-kofert-dark text-white border-kofert-dark shadow-lg shadow-kofert-dark/25' 
                  : 'bg-white text-gray-500 border-black/5 hover:border-gray-300'
              }`}
            >
              <span>{i + 1}. {section.titre}</span>
              {hasAnomaly && (
                <span className="w-2 h-2 rounded-full bg-kofert-red" />
              )}
            </button>
          );
        })}
      </div>

      {/* Items List */}
      <motion.div
        key={activeSection}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <h3 className="text-xl font-bold text-kofert-dark px-2">{currentSection.titre}</h3>
        
        {currentSection.items.map((item) => {
          const res = getItemResult(item.id);
          const isConforme = res?.resultat === 'conforme';

          return (
            <div key={item.id} className="card !p-0 overflow-hidden border border-black/5 bg-white">
              <div className="p-6 space-y-5">
                {/* Header */}
                <div className="flex gap-4 justify-between items-start">
                  <div className="flex gap-4">
                    <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center text-xs font-bold text-gray-400 shrink-0 mt-1">
                      {item.ordre}
                    </div>
                    <div>
                      <h4 className="font-bold text-lg text-kofert-dark leading-snug">{item.equipement_label}</h4>
                      <p className="text-gray-500 text-sm mt-1 leading-relaxed">{item.controle_description}</p>
                    </div>
                  </div>
                  
                  {/* Status Badge */}
                  {res ? (
                    <span className={`text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 shrink-0 select-none ${
                      isConforme 
                        ? 'bg-kofert-green/10 text-kofert-green' 
                        : 'bg-kofert-red/10 text-kofert-red'
                    }`}>
                      {isConforme ? <CheckCircle size={14} /> : <AlertTriangle size={14} />}
                      {isConforme ? 'Conforme' : 'Anomalie'}
                    </span>
                  ) : (
                    <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-gray-50 text-gray-400">Non renseigné</span>
                  )}
                </div>

                {/* Measurements Value Render */}
                {item.type === 'numerique' && item.mesures?.length > 0 && (
                  <div className="pt-4 border-t border-gray-50 space-y-3">
                    <p className="text-xs font-bold text-kofert-green flex items-center gap-2">
                      <Info size={14} />
                      MESURES ENREGISTRÉES
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {item.mesures.map((mes) => {
                        const mVal = res?.mesures_valeurs?.find(mv => mv.item_mesure_id === mes.id);
                        return (
                          <div key={mes.id} className="bg-gray-50 border border-black/5 rounded-xl p-3 flex justify-between items-center">
                            <span className="text-xs font-semibold text-gray-500">{mes.label}</span>
                            <span className="text-sm font-bold text-kofert-dark bg-white border border-black/5 px-3 py-1 rounded-lg">
                              {mVal ? `${mVal.valeur} ${mes.unite}` : 'N/A'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Remark Render */}
                {res?.remarque && (
                  <div className="p-4 bg-orange-50 border border-orange-200/50 rounded-2xl flex gap-3 text-sm text-orange-800">
                    <Info size={18} className="shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-xs uppercase tracking-wider block mb-0.5">Remarque du technicien</span>
                      <p className="leading-relaxed">{res.remarque}</p>
                    </div>
                  </div>
                )}

                {/* Photo Render */}
                {res?.photo_url && (
                  <div className="p-4 bg-gray-50 border border-black/5 rounded-2xl flex flex-col gap-2">
                    <span className="font-bold text-xs text-gray-500 uppercase tracking-wider flex items-center gap-2">
                      <FileText size={14} /> Photo de l'anomalie
                    </span>
                    <img 
                      src={`${(import.meta.env.VITE_API_URL || 'http://localhost:8000/api').replace('/api', '')}${res.photo_url}`} 
                      alt="Anomalie" 
                      className="max-w-full h-auto rounded-lg shadow-sm max-h-64 object-contain border border-black/5 bg-white" 
                    />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </motion.div>

      {/* Navigation Footer */}
      <div className="fixed bottom-0 inset-x-0 md:left-72 bg-white/80 backdrop-blur-md border-t border-black/5 p-4 flex justify-between items-center z-10 shadow-2xl">
        <button
          disabled={activeSection === 0}
          onClick={() => setActiveSection(prev => prev - 1)}
          className="px-6 py-2.5 rounded-xl font-bold text-sm text-gray-500 hover:bg-gray-50 disabled:opacity-30 transition-all"
        >
          Précédent
        </button>
        <span className="text-xs font-bold text-gray-400">Section {activeSection + 1} sur {fiche.sections.length}</span>
        <button
          disabled={activeSection === fiche.sections.length - 1}
          onClick={() => setActiveSection(prev => prev + 1)}
          className="px-6 py-2.5 rounded-xl font-bold text-sm text-kofert-dark hover:bg-gray-50 disabled:opacity-30 transition-all"
        >
          Suivant
        </button>
      </div>
    </div>
  );
};

export default DetailFichePage;
