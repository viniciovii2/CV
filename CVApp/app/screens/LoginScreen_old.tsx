import React, { useState } from 'react';
import { Layout, Input, Button, Text, Card } from '@ui-kitten/components';
import { KeyboardAvoidingView, Platform } from 'react-native';

interface Props {
  onLoginSuccess: () => void;
}

export default function LoginScreen({ onLoginSuccess }: Props): React.ReactElement {
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

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Layout style={{ flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#f7f9fc' }}>
        <Card style={{ padding: 20, borderRadius: 12 }}>
          <Text category='h4' style={{ textAlign: 'center', marginBottom: 20 }}>
            Bienvenido
          </Text>

          <Input
            placeholder='Usuario'
            value={username}
            onChangeText={setUsername}
            style={{ marginBottom: 16 }}
          />

          <Input
            placeholder='Contraseña'
            value={password}
            secureTextEntry
            onChangeText={setPassword}
            style={{ marginBottom: 16 }}
          />

          <Button onPress={handleLogin}>Ingresar</Button>

          {error !== '' && (
            <Text status='danger' style={{ marginTop: 16, textAlign: 'center' }}>
              {error}
            </Text>
          )}
        </Card>
      </Layout>
    </KeyboardAvoidingView>
  );
}
