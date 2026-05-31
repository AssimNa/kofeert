import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { AuthProvider } from './src/context/AuthContext';
import Navigator from './src/navigation/Navigator';
import { initializeApp } from './src/services/storage';
import { setupNetworkListener } from './src/services/syncQueue';

import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function App() {
  useEffect(() => {
    initializeApp();
    
    const unsubscribe = setupNetworkListener((syncResult) => {
      if (syncResult && syncResult.success > 0) {
        console.log(`✓ ${syncResult.success} fiche(s) synchronisée(s)`);
      }
    });
    
    return unsubscribe;
  }, []);

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <Navigator />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
