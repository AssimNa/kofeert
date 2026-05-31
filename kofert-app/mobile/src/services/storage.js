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
  try {
    const brouillon = { ...data, last_saved: moment().toISOString(), status: 'draft' };
    await AsyncStorage.setItem(`inspection_draft_${ficheId}`, JSON.stringify(brouillon));
    return true;
  } catch (error) {
    console.error('Erreur sauvegarde brouillon:', error);
    return false;
  }
}

export async function getFicheBrouillon(ficheId) {
  try {
    const data = await AsyncStorage.getItem(`inspection_draft_${ficheId}`);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Erreur récupération brouillon:', error);
    return null;
  }
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
