import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';

export async function initializeApp() {
  try {
    const token = await AsyncStorage.getItem('jwt_token');
    if (token) return true;
  } catch (error) {
    console.error("Erreur lors de l'initialisation:", error);
  }
  return false;
}

export async function saveFicheBrouillon(ficheId, data) {
  // Désactivé à la demande de l'utilisateur : on veut toujours une fiche 100% vierge
  return true;
}

export async function getFicheBrouillon(ficheId) {
  // Désactivé : on ne charge jamais l'ancien brouillon
  return null;
}

export async function deleteFicheBrouillon(ficheId) {
  try {
    await AsyncStorage.removeItem(`inspection_draft_${ficheId}`);
    return true;
  } catch (error) {
    console.error('Erreur suppression brouillon:', error);
    return false;
  }
}

export async function addToSyncQueue(inspectionId) {
  try {
    const queue = await AsyncStorage.getItem('sync_queue');
    const items = queue ? JSON.parse(queue) : [];
    items.push({ inspection_id: inspectionId, timestamp: moment().toISOString(), status: 'pending' });
    await AsyncStorage.setItem('sync_queue', JSON.stringify(items));
    return true;
  } catch (error) {
    console.error('Erreur ajout à queue:', error);
    return false;
  }
}

export async function getSyncQueue() {
  try {
    const queue = await AsyncStorage.getItem('sync_queue');
    return queue ? JSON.parse(queue) : [];
  } catch (error) {
    console.error('Erreur récupération queue:', error);
    return [];
  }
}

export async function updateSyncQueueItem(inspectionId, status) {
  try {
    const queue = await AsyncStorage.getItem('sync_queue');
    let items = queue ? JSON.parse(queue) : [];
    items = items.map(item => item.inspection_id === inspectionId ? { ...item, status } : item);
    items = items.filter(item => item.status !== 'synced');
    await AsyncStorage.setItem('sync_queue', JSON.stringify(items));
    return true;
  } catch (error) {
    console.error('Erreur update queue:', error);
    return false;
  }
}

export async function saveJWT(token) {
  try {
    await AsyncStorage.setItem('jwt_token', token);
    return true;
  } catch (error) {
    console.error('Erreur sauvegarde JWT:', error);
    return false;
  }
}

export async function getJWT() {
  try {
    return await AsyncStorage.getItem('jwt_token');
  } catch (error) {
    console.error('Erreur récupération JWT:', error);
    return null;
  }
}

export async function saveUserData(userData) {
  try {
    await AsyncStorage.setItem('user_data', JSON.stringify(userData));
    return true;
  } catch (error) {
    console.error('Erreur sauvegarde user:', error);
    return false;
  }
}

export async function getUserData() {
  try {
    const data = await AsyncStorage.getItem('user_data');
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Erreur récupération user:', error);
    return null;
  }
}
