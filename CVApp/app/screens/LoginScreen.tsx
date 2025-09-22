import React, { useState } from 'react';
import { Layout, Input, Button, Text, Card, Icon, TopNavigation, TopNavigationAction } from '@ui-kitten/components';
import { KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';

interface Props {
  onLoginSuccess: () => void;
  darkMode: boolean;
  setDarkMode: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function LoginScreen({ onLoginSuccess, darkMode, setDarkMode }: Props): React.ReactElement {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = () => {
    if (username === 'admin' && password === '1234') {
      setError('');
      onLoginSuccess();
    } else {
      setError('Usuario o contraseña incorrecta');
    }
  };

  const toggleDarkMode = () => setDarkMode(!darkMode);

  const DarkModeIcon = (props: any) => <Icon {...props} name={darkMode ? 'sun' : 'moon'} />;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Layout style={[styles.container, { backgroundColor: darkMode ? '#222B45' : '#f7f9fc' }]}>
        
        {/* Top bar con modo oscuro */}
        <TopNavigation
          title='Login'
          alignment='center'
          accessoryRight={() => (
            <TopNavigationAction icon={DarkModeIcon} onPress={toggleDarkMode} />
          )}
        />

        <Layout style={styles.content}>
          <Card style={[styles.card, { backgroundColor: darkMode ? '#3B4252' : '#fff' }]}>
            <Text category='h4' style={[styles.title, { color: darkMode ? '#fff' : '#222B45' }]}>
              Bienvenido
            </Text>

            <Input
              placeholder='Usuario'
              value={username}
              onChangeText={setUsername}
              style={styles.input}
              status={error ? 'danger' : 'basic'}
              textStyle={{ color: darkMode ? '#fff' : '#222B45' }}
            />

            <Input
              placeholder='Contraseña'
              value={password}
              secureTextEntry
              onChangeText={setPassword}
              style={styles.input}
              status={error ? 'danger' : 'basic'}
              textStyle={{ color: darkMode ? '#fff' : '#222B45' }}
            />

            <Button onPress={handleLogin} style={styles.button}>
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
    boxShadow: '0px 4px 8px rgba(0,0,0,0.1)',
  },
  title: { textAlign: 'center', marginBottom: 20 },
  input: { marginBottom: 16 },
  button: { marginTop: 8 },
  error: { marginTop: 16, textAlign: 'center' },
});
