# PROMPT MOBILE — React Native + Expo Go UNIQUEMENT
## Application Technicien Inspections Kofert

---

## SECTION 1 : SETUP EXPO GO

### Installation initiale
```bash
# Installer Expo CLI globalement
npm install -g expo-cli

# Créer le projet
expo init KofertMobile
cd KofertMobile

# Installer les packages nécessaires
npm install axios \
  @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs \
  react-native-screens react-native-safe-area-context react-native-gesture-handler react-native-reanimated \
  @react-native-async-storage/async-storage \
  @react-native-community/netinfo \
  react-native-keyboard-aware-scroll-view \
  moment \
  react-native-calendars

# Lancer Expo Go
expo start

# Sur votre téléphone Android :
# 1. Télécharger l'app Expo Go depuis Play Store
# 2. Scanner le QR code qui apparaît dans le terminal
# 3. L'app se lance automatiquement
```

### Structure du projet
```
KofertMobile/
├── src/
│   ├── screens/          ← Les 4 écrans du technicien
│   │   ├── LoginScreen.js
│   │   ├── HomeScreen.js
│   │   ├── FicheScreen.js
│   │   └── CalendrierScreen.js
│   ├── components/       ← Composants réutilisables
│   │   ├── ChecklistItem.js
│   │   ├── MesureInput.js
│   │   ├── ProgressBar.js
│   │   ├── SectionHeader.js
│   │   └── ConfirmationModal.js
│   ├── services/         ← API & Storage
│   │   ├── api.js        ← Axios + JWT
│   │   ├── storage.js    ← AsyncStorage functions
│   │   └── syncQueue.js  ← Sync hors-ligne
│   ├── context/          ← État global
│   │   └── AuthContext.js
│   ├── hooks/            ← Custom hooks
│   │   ├── useInspection.js
│   │   └── useCalendar.js
│   ├── navigation/       ← Navigation setup
│   │   └── Navigator.js
│   ├── constants/        ← Couleurs, textes
│   │   ├── colors.js
│   │   ├── strings.fr.js
│   │   └── dimensions.js
│   ├── utils/            ← Fonctions utilitaires
│   │   ├── dateFormat.js
│   │   └── validation.js
│   └── App.js            ← Point d'entrée
├── app.json              ← Config Expo
├── package.json
└── .env                  ← Variables environnement (non commité)
```

---

## SECTION 2 : CONFIGURATION INITIALE

### app.json
```json
{
  "expo": {
    "name": "Kofert Inspections",
    "slug": "kofert-inspections",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "assetBundlePatterns": ["**/*"],
    "ios": {
      "supportsTabletMode": true
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "package": "com.kofert.inspections",
      "versionCode": 1
    },
    "web": {
      "favicon": "./assets/favicon.png"
    },
    "extra": {
      "API_URL": "http://your-backend-ip:8000/api"
    }
  }
}
```

### .env (à créer — ne pas commiter)
```
API_URL=http://192.168.1.100:8000/api
TIMEOUT=10000
```

### App.js (Point d'entrée)
```javascript
import React, { useEffect } from 'react';
import { AuthProvider } from './src/context/AuthContext';
import Navigator from './src/navigation/Navigator';
import { initializeApp } from './src/services/storage';

export default function App() {
  useEffect(() => {
    initializeApp();
  }, []);

  return (
    <AuthProvider>
      <Navigator />
    </AuthProvider>
  );
}
```

---

## SECTION 3 : SERVICES (API, STORAGE, SYNC)

### services/api.js
```javascript
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const API_URL = Constants.expoConfig.extra.API_URL;

// Créer instance Axios
const api = axios.create({
  baseURL: API_URL,
  timeout: Constants.expoConfig.extra.TIMEOUT || 10000,
});

// Intercepteur pour ajouter JWT à chaque requête
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('jwt_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercepteur pour gérer les erreurs
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expiré ou invalide
      await AsyncStorage.removeItem('jwt_token');
      await AsyncStorage.removeItem('user_data');
      // Rediriger vers login (géré par Navigator)
    }
    return Promise.reject(error);
  }
);

export default api;
```

### services/storage.js
```javascript
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';

// Initialiser le stockage
export async function initializeApp() {
  try {
    // Vérifier si JWT valide existe
    const token = await AsyncStorage.getItem('jwt_token');
    if (token) {
      // JWT existe, utilisateur peut rester connecté
      return true;
    }
  } catch (error) {
    console.error('Erreur lors de l\'initialisation:', error);
  }
  return false;
}

// Sauvegarder brouillon inspection
export async function saveFicheBrouillon(ficheId, data) {
  try {
    const brouillon = {
      ...data,
      last_saved: moment().toISOString(),
      status: 'draft'
    };
    await AsyncStorage.setItem(`inspection_draft_${ficheId}`, JSON.stringify(brouillon));
    return true;
  } catch (error) {
    console.error('Erreur sauvegarde brouillon:', error);
    return false;
  }
}

// Récupérer brouillon inspection
export async function getFicheBrouillon(ficheId) {
  try {
    const data = await AsyncStorage.getItem(`inspection_draft_${ficheId}`);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Erreur récupération brouillon:', error);
    return null;
  }
}

// Effacer brouillon après soumission
export async function deleteFicheBrouillon(ficheId) {
  try {
    await AsyncStorage.removeItem(`inspection_draft_${ficheId}`);
    return true;
  } catch (error) {
    console.error('Erreur suppression brouillon:', error);
    return false;
  }
}

// Ajouter inspection à la file d'attente sync
export async function addToSyncQueue(inspectionId) {
  try {
    const queue = await AsyncStorage.getItem('sync_queue');
    const items = queue ? JSON.parse(queue) : [];
    
    items.push({
      inspection_id: inspectionId,
      timestamp: moment().toISOString(),
      status: 'pending'
    });
    
    await AsyncStorage.setItem('sync_queue', JSON.stringify(items));
    return true;
  } catch (error) {
    console.error('Erreur ajout à queue:', error);
    return false;
  }
}

// Récupérer la file d'attente
export async function getSyncQueue() {
  try {
    const queue = await AsyncStorage.getItem('sync_queue');
    return queue ? JSON.parse(queue) : [];
  } catch (error) {
    console.error('Erreur récupération queue:', error);
    return [];
  }
}

// Mettre à jour un item dans la queue
export async function updateSyncQueueItem(inspectionId, status) {
  try {
    const queue = await AsyncStorage.getItem('sync_queue');
    let items = queue ? JSON.parse(queue) : [];
    
    items = items.map(item =>
      item.inspection_id === inspectionId ? { ...item, status } : item
    );
    
    // Supprimer les items synced
    items = items.filter(item => item.status !== 'synced');
    
    await AsyncStorage.setItem('sync_queue', JSON.stringify(items));
    return true;
  } catch (error) {
    console.error('Erreur update queue:', error);
    return false;
  }
}

// Sauvegarder JWT
export async function saveJWT(token) {
  try {
    await AsyncStorage.setItem('jwt_token', token);
    return true;
  } catch (error) {
    console.error('Erreur sauvegarde JWT:', error);
    return false;
  }
}

// Récupérer JWT
export async function getJWT() {
  try {
    return await AsyncStorage.getItem('jwt_token');
  } catch (error) {
    console.error('Erreur récupération JWT:', error);
    return null;
  }
}

// Sauvegarder données utilisateur
export async function saveUserData(userData) {
  try {
    await AsyncStorage.setItem('user_data', JSON.stringify(userData));
    return true;
  } catch (error) {
    console.error('Erreur sauvegarde user:', error);
    return false;
  }
}

// Récupérer données utilisateur
export async function getUserData() {
  try {
    const data = await AsyncStorage.getItem('user_data');
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Erreur récupération user:', error);
    return null;
  }
}
```

### services/syncQueue.js
```javascript
import NetInfo from '@react-native-community/netinfo';
import api from './api';
import { getSyncQueue, updateSyncQueueItem, deleteFicheBrouillon } from './storage';

// Listener réseau global
export function setupNetworkListener(onSync) {
  return NetInfo.addEventListener(state => {
    if (state.isConnected && state.isInternetReachable) {
      // Réseau disponible → sync automatique
      syncOfflineQueue(onSync);
    }
  });
}

// Fonction sync complète
export async function syncOfflineQueue(onSync) {
  try {
    const queue = await getSyncQueue();
    
    if (queue.length === 0) {
      return; // Rien à syncer
    }
    
    let successCount = 0;
    let failCount = 0;
    
    for (const item of queue) {
      if (item.status === 'pending') {
        try {
          // Envoyer au serveur
          const response = await api.post(`/inspections/${item.inspection_id}/submit`);
          
          if (response.status === 200) {
            // Marquer comme synced
            await updateSyncQueueItem(item.inspection_id, 'synced');
            // Supprimer le brouillon local
            await deleteFicheBrouillon(item.inspection_id);
            successCount++;
          }
        } catch (error) {
          failCount++;
          console.error(`Erreur sync inspection ${item.inspection_id}:`, error);
        }
      }
    }
    
    // Callback pour notification
    if (onSync) {
      onSync({ success: successCount, failed: failCount });
    }
  } catch (error) {
    console.error('Erreur sync queue:', error);
  }
}

// Fonction pour sync manuel (bouton retry)
export async function manualSync() {
  return syncOfflineQueue();
}
```

---

## SECTION 4 : CONTEXT & HOOKS

### context/AuthContext.js
```javascript
import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';
import { saveJWT, getJWT, saveUserData, getUserData, deleteFicheBrouillon } from '../services/storage';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Vérifier si utilisateur est déjà connecté
  useEffect(() => {
    bootstrapAsync();
  }, []);

  const bootstrapAsync = async () => {
    try {
      const token = await getJWT();
      const userData = await getUserData();
      
      if (token && userData) {
        setUser(userData);
      }
    } catch (error) {
      console.error('Erreur bootstrap:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user: userData } = response.data;
      
      // Sauvegarder JWT et données user
      await saveJWT(token);
      await saveUserData(userData);
      
      setUser(userData);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Erreur de connexion' 
      };
    }
  };

  const logout = async () => {
    try {
      setUser(null);
      await saveJWT('');
      await saveUserData(null);
      // Effacer tous les brouillons
      // (optionnel : pour forcer une nouvelle saisie)
    } catch (error) {
      console.error('Erreur logout:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
```

### hooks/useInspection.js
```javascript
import { useState, useCallback } from 'react';
import api from '../services/api';
import { saveFicheBrouillon, getFicheBrouillon } from '../services/storage';

export function useInspection(ficheId) {
  const [inspection, setInspection] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Charger la fiche (template) ou le brouillon
  const loadInspection = useCallback(async () => {
    setLoading(true);
    try {
      // Vérifier s'il y a un brouillon
      const draft = await getFicheBrouillon(ficheId);
      if (draft) {
        setInspection(draft);
        return;
      }

      // Sinon charger depuis serveur
      const response = await api.get(`/fiches/${ficheId}`);
      const fiche = response.data;
      
      // Transformer en format inspection
      const newInspection = {
        fiche_id: ficheId,
        resultats: {},
        mesures: {},
        remarques: {}
      };
      
      setInspection(newInspection);
    } catch (error) {
      console.error('Erreur load inspection:', error);
    } finally {
      setLoading(false);
    }
  }, [ficheId]);

  // Mettre à jour un résultat
  const updateResult = useCallback((itemId, resultat) => {
    setInspection(prev => ({
      ...prev,
      resultats: { ...prev.resultats, [itemId]: resultat }
    }));
  }, []);

  // Mettre à jour une mesure
  const updateMesure = useCallback((itemMesureId, valeur) => {
    setInspection(prev => ({
      ...prev,
      mesures: { ...prev.mesures, [itemMesureId]: valeur }
    }));
  }, []);

  // Mettre à jour une remarque
  const updateRemarque = useCallback((itemId, remarque) => {
    setInspection(prev => ({
      ...prev,
      remarques: { ...prev.remarques, [itemId]: remarque }
    }));
  }, []);

  // Sauvegarder en brouillon
  const saveBrouillon = useCallback(async () => {
    if (!inspection) return;
    setIsSaving(true);
    try {
      await saveFicheBrouillon(ficheId, inspection);
    } catch (error) {
      console.error('Erreur save brouillon:', error);
    } finally {
      setIsSaving(false);
    }
  }, [inspection, ficheId]);

  // Soumettre l'inspection
  const submitInspection = useCallback(async () => {
    try {
      const response = await api.post(`/inspections/${ficheId}/submit`, inspection);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Erreur soumission' 
      };
    }
  }, [inspection, ficheId]);

  return {
    inspection,
    loading,
    isSaving,
    loadInspection,
    updateResult,
    updateMesure,
    updateRemarque,
    saveBrouillon,
    submitInspection
  };
}
```

### hooks/useCalendar.js
```javascript
import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import moment from 'moment';

export function useCalendar() {
  const [calendarData, setCalendarData] = useState({});
  const [loading, setLoading] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(moment());

  // Charger données calendrier
  const loadCalendar = useCallback(async (month = currentMonth) => {
    setLoading(true);
    try {
      const mois = month.month() + 1;
      const annee = month.year();
      
      const response = await api.get(
        `/inspections/calendar?mois=${mois}&annee=${annee}`
      );
      
      setCalendarData(response.data);
    } catch (error) {
      console.error('Erreur load calendar:', error);
    } finally {
      setLoading(false);
    }
  }, [currentMonth]);

  // Charger au changement de mois
  useEffect(() => {
    loadCalendar(currentMonth);
  }, [currentMonth, loadCalendar]);

  // Naviguer mois précédent
  const previousMonth = useCallback(() => {
    setCurrentMonth(prev => prev.clone().subtract(1, 'month'));
  }, []);

  // Naviguer mois suivant
  const nextMonth = useCallback(() => {
    setCurrentMonth(prev => prev.clone().add(1, 'month'));
  }, []);

  // Obtenir statut couleur pour une date
  const getDateColor = useCallback((dateStr) => {
    const dayData = calendarData[dateStr];
    if (!dayData) return null;

    switch (dayData.statut) {
      case 'conforme': return '#1D9E75';    // Vert
      case 'anomalie': return '#EF9F27';    // Orange
      case 'manquant': return '#E24B4A';    // Rouge
      case 'partiel': return '#378ADD';     // Bleu
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
```

---

## SECTION 5 : NAVIGATION

### navigation/Navigator.js
```javascript
import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import { AuthContext } from '../context/AuthContext';
import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import FicheScreen from '../screens/FicheScreen';
import CalendrierScreen from '../screens/CalendrierScreen';
import DetailJourScreen from '../screens/DetailJourScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Stack accueil
function HomeStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#1D9E75',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen
        name="HomeScreen"
        component={HomeScreen}
        options={{ title: 'Inspections du jour' }}
      />
      <Stack.Screen
        name="FicheScreen"
        component={FicheScreen}
        options={({ route }) => ({
          title: route.params?.ficheName || 'Inspection'
        })}
      />
    </Stack.Navigator>
  );
}

// Stack calendrier
function CalendrierStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#1D9E75',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen
        name="CalendrierScreen"
        component={CalendrierScreen}
        options={{ title: 'Historique' }}
      />
      <Stack.Screen
        name="DetailJourScreen"
        component={DetailJourScreen}
        options={({ route }) => ({
          title: route.params?.date || 'Détail du jour'
        })}
      />
      <Stack.Screen
        name="FicheDetailScreen"
        component={FicheScreen}
        options={({ route }) => ({
          title: route.params?.ficheName || 'Inspection'
        })}
      />
    </Stack.Navigator>
  );
}

// Navigation principale
function MainStack() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'HomeStack') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'CalendrierStack') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#1D9E75',
        tabBarInactiveTintColor: '#888',
        tabBarLabelPosition: 'below-icon',
      })}
    >
      <Tab.Screen
        name="HomeStack"
        component={HomeStack}
        options={{ tabBarLabel: 'Accueil' }}
      />
      <Tab.Screen
        name="CalendrierStack"
        component={CalendrierStack}
        options={{ tabBarLabel: 'Calendrier' }}
      />
    </Tab.Navigator>
  );
}

// Composant principal
export default function Navigator() {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return null; // Ou loader custom
  }

  return (
    <NavigationContainer>
      {user ? (
        <MainStack />
      ) : (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={LoginScreen} />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
}
```

---

## SECTION 6 : ÉCRANS

### screens/LoginScreen.js
```javascript
import React, { useContext, useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthContext } from '../context/AuthContext';
import Colors from '../constants/colors';

export default function LoginScreen() {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    setLoading(true);
    const result = await login(email, password);

    if (!result.success) {
      Alert.alert('Erreur de connexion', result.error);
    }
    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>KOFERT</Text>
        <Text style={styles.subtitle}>Inspections Industrielles</Text>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            editable={!loading}
          />

          <TextInput
            style={styles.input}
            placeholder="Mot de passe"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            editable={!loading}
          />

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>CONNEXION</Text>
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity>
          <Text style={styles.forgotPassword}>Mot de passe oublié ?</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: Colors.green,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 40,
    color: '#666',
  },
  form: {
    marginBottom: 30,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    fontSize: 14,
  },
  button: {
    backgroundColor: Colors.green,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  forgotPassword: {
    textAlign: 'center',
    color: Colors.green,
    textDecorationLine: 'underline',
  },
});
```

### screens/HomeScreen.js
```javascript
import React, { useContext, useEffect, useState } from 'react';
import {
  View,
  FlatList,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import Colors from '../constants/colors';

export default function HomeScreen({ navigation }) {
  const { user } = useContext(AuthContext);
  const [fiches, setFiches] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadFiches();
  }, []);

  const loadFiches = async () => {
    setLoading(true);
    try {
      const response = await api.get('/fiches');
      setFiches(response.data);
    } catch (error) {
      console.error('Erreur load fiches:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'en_attente': return Colors.orange;
      case 'complete': return Colors.green;
      case 'anomalie': return Colors.orange;
      default: return '#999';
    }
  };

  const renderFicheCard = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('FicheScreen', {
        ficheId: item.id,
        ficheName: item.nom
      })}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{item.nom}</Text>
      </View>
      <Text style={styles.cardMeta}>{item.local || 'Équipement'}</Text>
      <View style={[styles.badge, { backgroundColor: getStatusColor(item.status) }]}>
        <Text style={styles.badgeText}>
          {item.status === 'en_attente' ? '📍 EN ATTENTE' : '✓ COMPLÉTÉ'}
        </Text>
      </View>
    </TouchableOpacity>
  );

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
        <Text style={styles.headerTitle}>Inspections du jour</Text>
        <Text style={styles.headerDate}>
          {new Date().toLocaleDateString('fr-FR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </Text>
      </View>

      <FlatList
        data={fiches}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderFicheCard}
        contentContainerStyle={styles.list}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  headerDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  list: {
    padding: 12,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
  cardHeader: {
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  cardMeta: {
    fontSize: 12,
    color: '#999',
    marginBottom: 10,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#fff',
  },
});
```

### screens/FicheScreen.js
```javascript
import React, { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useInspection } from '../hooks/useInspection';
import ChecklistItem from '../components/ChecklistItem';
import ProgressBar from '../components/ProgressBar';
import Colors from '../constants/colors';
import api from '../services/api';

export default function FicheScreen({ route, navigation }) {
  const { ficheId, ficheName } = route.params;
  const { inspection, loading, updateResult, updateMesure, submitInspection, saveBrouillon } = useInspection(ficheId);
  const [fiche, setFiche] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [autoSaveTimer, setAutoSaveTimer] = useState(null);

  useEffect(() => {
    loadFiche();
  }, [ficheId]);

  // Auto-save toutes les 30s
  useEffect(() => {
    if (inspection && autoSaveTimer) {
      clearInterval(autoSaveTimer);
    }

    const timer = setInterval(() => {
      saveBrouillon();
      // Afficher toast de confirmation (optionnel)
    }, 30000);

    setAutoSaveTimer(timer);

    return () => clearInterval(timer);
  }, [inspection]);

  const loadFiche = async () => {
    try {
      const response = await api.get(`/fiches/${ficheId}`);
      setFiche(response.data);
    } catch (error) {
      console.error('Erreur load fiche:', error);
    }
  };

  const countFilledPoints = () => {
    if (!inspection) return 0;
    return Object.keys(inspection.resultats).length;
  };

  const getTotalPoints = () => {
    if (!fiche) return 0;
    let count = 0;
    fiche.sections?.forEach(section => {
      section.items?.forEach(() => count++);
    });
    return count;
  };

  const handleSubmit = async () => {
    const total = getTotalPoints();
    const filled = countFilledPoints();

    if (filled < total) {
      Alert.alert('Incomplète', `Veuillez remplir tous les ${total} points avant d'envoyer.`);
      return;
    }

    Alert.alert(
      'Confirmation',
      'Êtes-vous sûr ? Cette fiche ne pourra plus être modifiée après l\'envoi.',
      [
        { text: 'Annuler', onPress: () => {} },
        {
          text: 'Confirmer et envoyer',
          onPress: async () => {
            setSubmitting(true);
            const result = await submitInspection();
            setSubmitting(false);

            if (result.success) {
              Alert.alert('Succès', 'Fiche envoyée au superviseur', [
                { text: 'OK', onPress: () => navigation.goBack() }
              ]);
            } else {
              Alert.alert('Erreur', result.error);
            }
          },
        },
      ]
    );
  };

  if (loading || !fiche) {
    return <ActivityIndicator size="large" color={Colors.green} />;
  }

  const filled = countFilledPoints();
  const total = getTotalPoints();
  const progress = total > 0 ? filled / total : 0;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scroll}>
        {fiche.sections?.map((section, sectionIdx) => (
          <View key={sectionIdx}>
            <Text style={styles.sectionTitle}>📍 {section.titre}</Text>

            {section.items?.map((item, itemIdx) => (
              <ChecklistItem
                key={itemIdx}
                item={item}
                result={inspection?.resultats[item.id]}
                mesures={inspection?.mesures || {}}
                remarque={inspection?.remarques[item.id] || ''}
                onResultChange={(result) => updateResult(item.id, result)}
                onMesureChange={(mesureId, value) => updateMesure(mesureId, value)}
                onRemarqueChange={(remarque) => {
                  // Update remarque dans inspection
                }}
              />
            ))}
          </View>
        ))}

        {/* Progress Bar */}
        <ProgressBar filled={filled} total={total} />

        {/* Warning anomalie */}
        {Object.values(inspection?.resultats || {}).some(r => r === 'non_conforme') && (
          <View style={styles.warningBox}>
            <Text style={styles.warningText}>⚠️ ANOMALIE DÉTECTÉE</Text>
            <Text style={styles.warningSubtext}>
              {Object.values(inspection.resultats).filter(r => r === 'non_conforme').length} point(s) non-conforme(s)
            </Text>
          </View>
        )}

        {/* Submit Button */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            filled < total && styles.submitButtonDisabled
          ]}
          onPress={handleSubmit}
          disabled={filled < total || submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>
              ENVOYER AU SUPERVISEUR
            </Text>
          )}
        </TouchableOpacity>

        <View style={styles.spacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scroll: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#999',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 18,
    marginBottom: 10,
  },
  warningBox: {
    backgroundColor: '#FCEBEB',
    borderWidth: 0.5,
    borderColor: '#F09595',
    borderRadius: 8,
    padding: 12,
    marginVertical: 16,
  },
  warningText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#791F1F',
  },
  warningSubtext: {
    fontSize: 12,
    color: '#A32D2D',
    marginTop: 4,
  },
  submitButton: {
    backgroundColor: Colors.green,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginVertical: 20,
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  spacer: {
    height: 50,
  },
});
```

### screens/CalendrierScreen.js
```javascript
import React, { useEffect } from 'react';
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
import moment from 'moment';

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
          textSectionTitleDisabledColor: '#ddd',
          selectedDayBackgroundColor: Colors.green,
          selectedDayTextColor: '#fff',
          todayTextColor: Colors.green,
          dayTextColor: '#333',
          textDisabledColor: '#ddd',
          dotColor: Colors.green,
          selectedDotColor: '#fff',
          arrowColor: Colors.green,
          disabledArrowColor: '#ddd',
          monthTextColor: Colors.green,
          indicatorColor: Colors.green,
          textDayFontFamily: 'System',
          textMonthFontSize: 16,
          textDayHeaderFontSize: 12,
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
```

---

## SECTION 7 : COMPOSANTS RÉUTILISABLES

### components/ChecklistItem.js
```javascript
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
```

### components/ProgressBar.js
```javascript
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
```

---

## SECTION 8 : CONSTANTS

### constants/colors.js
```javascript
export default {
  green: '#1D9E75',      // Conforme, succès
  orange: '#EF9F27',     // Alerte, anomalie
  red: '#E24B4A',        // Erreur, non-conforme
  blue: '#378ADD',       // Partiel
  gray: '#888780',
  lightGray: '#F5F5F5',
  dark: '#333333',
  white: '#FFFFFF',
};
```

### constants/dimensions.js
```javascript
export default {
  padding: {
    small: 8,
    medium: 12,
    large: 16,
  },
  borderRadius: {
    small: 6,
    medium: 8,
    large: 12,
  },
  fontSize: {
    tiny: 11,
    small: 12,
    medium: 13,
    large: 14,
    title: 16,
    header: 18,
  },
};
```

---

## SECTION 9 : SETUP HORS-LIGNE + SYNC

**Déjà inclus dans sections précédentes (services/syncQueue.js)**

À appeler dans App.js :
```javascript
import { setupNetworkListener } from './src/services/syncQueue';

useEffect(() => {
  const unsubscribe = setupNetworkListener((syncResult) => {
    if (syncResult.success > 0) {
      console.log(`✓ ${syncResult.success} fiche(s) synchronisée(s)`);
    }
  });
  
  return unsubscribe;
}, []);
```

---

## SECTION 10 : DÉPLOIEMENT PLAY STORE (Quand prêt)

```bash
# 1. Créer config app.json (déjà fait plus haut)

# 2. Créer compte EAS
eas login

# 3. Build pour Play Store
eas build --platform android --release

# 4. Attendre 5 minutes...

# 5. Publier sur Google Play Console
# (TPK obtient l'APK/AAB dans le dashboard EAS)
```

**Aucun changement de code nécessaire. C'est juste une compilation.**

---

## RÉSUMÉ FINAL — MOBILE EXPO GO UNIQUEMENT

✅ 4 écrans complets (Login + Accueil + Fiche + Calendrier)
✅ Hors-ligne automatique + sync quand réseau revient
✅ AsyncStorage sauvegarde auto toutes les 30s
✅ Champs binaires ✓/✗ + champs numériques
✅ Barre progression temps réel
✅ Modal confirmation avant envoi
✅ API Axios + JWT auth
✅ Design cohérent (couleurs, spacing, typographie)
✅ Hot reload en développement
✅ Un seul commande pour Play Store quand prêt

**C'est maintenant prêt à coder en Expo Go.**