import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// Icons are provided by expo vector icons but not installed explicitly? It comes with expo.
import { Ionicons } from '@expo/vector-icons';

import { AuthContext } from '../context/AuthContext';
import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import FicheScreen from '../screens/FicheScreen';
import CalendrierScreen from '../screens/CalendrierScreen';
import CreateTemplateScreen from '../screens/CreateTemplateScreen';
import ProfileScreen from '../screens/ProfileScreen';
import DetailFicheScreen from '../screens/DetailFicheScreen';

import DetailJourScreen from '../screens/DetailJourScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

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
      <Stack.Screen
        name="CreateTemplateScreen"
        component={CreateTemplateScreen}
        options={{ title: 'Configuration de la Check-list' }}
      />
      <Stack.Screen
        name="ProfileScreen"
        component={ProfileScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}

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
        component={DetailFicheScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}

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

export default function Navigator() {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return null;
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
