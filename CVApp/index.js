import { LogBox, Platform } from 'react-native';
import { registerRootComponent } from 'expo';
import App from './app/App';

// 🔇 Ignorar warnings web (no afecta móvil)
if (Platform.OS === 'web') {
  LogBox.ignoreLogs([
    /shadow\*/i,
    /onResponder/i,
    /TouchableMixin/i,
  ]);
}

// ✅ Registrar el componente raíz correctamente
registerRootComponent(App);
