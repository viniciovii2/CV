import React, { useState } from 'react';
import { Layout, Input, Button, Text, Card, Icon, TopNavigation, TopNavigationAction } from '@ui-kitten/components';
import { KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types'; // definimos un tipo global para las rutas

type Props = NativeStackScreenProps<RootStackParamList, 'Login'> & {
  darkMode: boolean;
  setDarkMode: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function LoginScreen({ navigation, darkMode, setDarkMode }: Props): React.ReactElement {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = () => {
    if (username === 'admin' && password === '123') {
      setError('');
      navigation.navigate('Dashboard'); // ✅ Navegación directa
    } else {
      setError('Usuario o contraseña incorrecta');
    }
  };

  const toggleDarkMode = () => setDarkMode(!darkMode);
  const DarkModeIcon = (props: any) => <Icon {...props} name={darkMode ? 'sun' : 'moon'} />;

  const primaryColor = darkMode ? '#7C4DFF' : '#673AB7';

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Layout style={[styles.container, { backgroundColor: darkMode ? '#1E1E1E' : '#F3F3F3' }]}>
        <TopNavigation
          title='Login'
          alignment='center'
          accessoryRight={() => <TopNavigationAction icon={DarkModeIcon} onPress={toggleDarkMode} />}
        />

        <Layout style={styles.content}>
          <Card style={[styles.card, { backgroundColor: darkMode ? '#2C2C2C' : '#fff' }]}>
            <Text category='h4' style={[styles.title, { color: primaryColor }]}>
              Bienvenido
            </Text>

            <Input
              placeholder='Usuario'
              value={username}
              onChangeText={setUsername}
              style={styles.input}
              status={error ? 'danger' : 'basic'}
              textStyle={{ color: darkMode ? '#fff' : '#222' }}
            />

            <Input
              placeholder='Contraseña'
              value={password}
              secureTextEntry
              onChangeText={setPassword}
              style={styles.input}
              status={error ? 'danger' : 'basic'}
              textStyle={{ color: darkMode ? '#fff' : '#222' }}
            />

            <Button onPress={handleLogin} style={[styles.button, { backgroundColor: primaryColor }]}>
              Ingresar
            </Button>

            {error !== '' && (
              <Text status='danger' style={styles.error}>
                {error}
              </Text>
            )}
          </Card>
        </Layout>
      </Layout>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, justifyContent: 'center', padding: 20 },
  card: {
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
  },
  title: { textAlign: 'center', marginBottom: 20 },
  input: { marginBottom: 16 },
  button: { marginTop: 8 },
  error: { marginTop: 16, textAlign: 'center' },
});
