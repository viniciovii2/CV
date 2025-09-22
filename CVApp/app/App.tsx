import React, { useState } from 'react';
import * as eva from '@eva-design/eva';
import { ApplicationProvider, Layout, IconRegistry } from '@ui-kitten/components';
import { EvaIconsPack } from '@ui-kitten/eva-icons';

import LoginScreen from './screens/LoginScreen';
import BuscarCliente from './screens/BuscarCliente';

export default function App(): React.ReactElement {
  const [loggedIn, setLoggedIn] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  return (
    <>
      {/* Registrar iconos de UI Kitten */}
      <IconRegistry icons={EvaIconsPack} />

      {/* Proveedor de tema */}
      <ApplicationProvider {...eva} theme={darkMode ? eva.dark : eva.light}>
        <Layout style={{ flex: 1 }}>
          {loggedIn ? (
            <BuscarCliente />
          ) : (
            <LoginScreen
              darkMode={darkMode}
              setDarkMode={setDarkMode}
              onLoginSuccess={() => setLoggedIn(true)}
            />
          )}
        </Layout>
      </ApplicationProvider>
    </>
  );
}
