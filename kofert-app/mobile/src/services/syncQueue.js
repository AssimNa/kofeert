import NetInfo from '@react-native-community/netinfo';
import api from './api';
import { getSyncQueue, updateSyncQueueItem, deleteFicheBrouillon } from './storage';

export function setupNetworkListener(onSync) {
  return NetInfo.addEventListener(state => {
    if (state.isConnected && state.isInternetReachable) {
      syncOfflineQueue(onSync);
    }
  });
}

export async function syncOfflineQueue(onSync) {
  try {
    const queue = await getSyncQueue();
    if (queue.length === 0) return;
    
    let successCount = 0;
    let failCount = 0;
    
    for (const item of queue) {
      if (item.status === 'pending') {
        try {
          const response = await api.post(`/inspections/${item.inspection_id}/submit`);
          if (response.status === 200 || response.status === 201) {
            await updateSyncQueueItem(item.inspection_id, 'synced');
            await deleteFicheBrouillon(item.inspection_id);
            successCount++;
          }
        } catch (error) {
          failCount++;
          console.error(`Erreur sync inspection ${item.inspection_id}:`, error);
        }
      }
    }
    
    if (onSync && (successCount > 0 || failCount > 0)) {
      onSync({ success: successCount, failed: failCount });
    }
  } catch (error) {
    console.error('Erreur sync queue:', error);
  }
}

export async function manualSync() {
  return syncOfflineQueue();
}
