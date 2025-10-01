import React, { useState } from 'react';
import * as eva from '@eva-design/eva';
import { ApplicationProvider, IconRegistry } from '@ui-kitten/components';
import { EvaIconsPack } from '@ui-kitten/eva-icons';

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from './screens/LoginScreen';
import DashboardScreen from './screens/DashboardScreen';
import ClienteScreen from './screens/ClienteScreen';
import CampaniaScreen from './screens/CampaniaScreen';

import { RootStackParamList } from './types'; // tu types.ts

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App(): React.ReactElement {
  const [darkMode, setDarkMode] = useState(false);

  return (
    <>
      <IconRegistry icons={EvaIconsPack} />

      <ApplicationProvider {...eva} theme={darkMode ? eva.dark : eva.light}>
        <NavigationContainer>
          <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
            
            <Stack.Screen name="Login">
              {({ navigation, route }) => (
                <LoginScreen
                  navigation={navigation}
                  route={route}
                  darkMode={darkMode}
                  setDarkMode={setDarkMode}
                />
              )}
            </Stack.Screen>

            <Stack.Screen name="Dashboard">
              {({ navigation, route }) => (
                <DashboardScreen
                  navigation={navigation}
                  route={route}
                  darkMode={darkMode}
                  setDarkMode={setDarkMode}
                />
              )}
            </Stack.Screen>

            <Stack.Screen name="Cliente">
              {({ navigation, route }) => (
                <ClienteScreen
                  navigation={navigation}
                  route={route}
                  darkMode={darkMode}
                  setDarkMode={setDarkMode}
                />
              )}
            </Stack.Screen>

            <Stack.Screen name="Campania">
              {({ navigation, route }) => (
                <CampaniaScreen
                  navigation={navigation}
                  route={route}
                  darkMode={darkMode}
                  setDarkMode={setDarkMode}
                />
              )}
            </Stack.Screen>

          </Stack.Navigator>
        </NavigationContainer>
      </ApplicationProvider>
    </>
  );
}
