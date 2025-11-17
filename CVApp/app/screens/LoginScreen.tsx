import React, { useState, useEffect } from 'react';
import {
  Layout,
  Input,
  Button,
  Text,
  Card,
  Icon,
  TopNavigation,
  TopNavigationAction,
  Spinner,
  CheckBox,
} from '@ui-kitten/components';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  View,
  Animated,
  Easing,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { LogBox } from 'react-native';

LogBox.ignoreLogs([
  /onResponder/i,
  /shadow\*/i,
]);

type Props = NativeStackScreenProps<RootStackParamList, 'Login'> & {
  darkMode: boolean;
  setDarkMode: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function LoginScreen({
  navigation,
  darkMode,
  setDarkMode,
}: Props): React.ReactElement {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [welcomeAnim] = useState(new Animated.Value(0));

  const primaryColor = darkMode ? '#8B5CF6' : '#6A1B9A';
  const backgroundColor = darkMode ? '#1E1E1E' : '#F3F3F3';
  const cardColor = darkMode ? '#252526' : '#fff';

  const toggleDarkMode = () => setDarkMode(!darkMode);
  const DarkModeIcon = (props: any) => (
    <Icon {...props} name={darkMode ? 'sun-outline' : 'moon-outline'} />
  );

  useEffect(() => {
    // ✨ Animación inicial
    Animated.timing(welcomeAnim, {
      toValue: 1,
      duration: 600,
      easing: Easing.out(Easing.ease),
      useNativeDriver: Platform.OS !== 'web',
    }).start();

    // Recuperar usuario guardado
    (async () => {
      const savedUser = await AsyncStorage.getItem('savedUser');
      if (savedUser) {
        setUsername(savedUser);
        setRemember(true);
      }
    })();
  }, []);

  // 🔐 Lógica temporal de login
  const handleLogin = async () => {
    setError('');
    setLoading(true);

    setTimeout(async () => {
      setLoading(false);

      if (username === '1722' && password === '123') {
        if (remember) await AsyncStorage.setItem('savedUser', username);
        else await AsyncStorage.removeItem('savedUser');

        navigation.navigate('Dashboard');
      } else {
        setError('Usuario o contraseña incorrecta');
      }
    }, 1200);
  };

  const renderPasswordIcon = (props: any) => (
    <Icon
      {...props}
      name={showPassword ? 'eye-off-outline' : 'eye-outline'}
      onPress={() => setShowPassword(!showPassword)}
    />
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Layout style={[styles.container, { backgroundColor }]}>
        <TopNavigation
          title="Inicio de Sesión"
          alignment="center"
          accessoryRight={() => (
            <TopNavigationAction icon={DarkModeIcon} onPress={toggleDarkMode} />
          )}
        />

        <Animated.View
          style={[
            styles.content,
            {
              opacity: welcomeAnim,
              transform: [
                {
                  translateY: welcomeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [30, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <Card style={[styles.card, { backgroundColor: cardColor }]}>
            <View style={styles.iconWrapper}>
              <Icon
                name="person-outline"
                fill={primaryColor}
                style={{ width: 52, height: 52 }}
              />
            </View>

            <Text category="h4" style={[styles.title, { color: primaryColor }]}>
              👋 ¡Bienvenido!
            </Text>
            <Text
              appearance="hint"
              style={[styles.subtitle, { color: darkMode ? '#AAA' : '#555' }]}
            >
              Ingrese su usuario y contraseña para continuar
            </Text>

            <Input
              placeholder="Usuario"
              value={username}
              onChangeText={setUsername}
              style={styles.input}
              status={error ? 'danger' : 'basic'}
              textStyle={{ color: darkMode ? '#fff' : '#222' }}
              accessoryLeft={
                <Icon
                  name="person"
                  fill={darkMode ? '#fff' : '#333'}
                  style={{ width: 20, height: 20 }}
                />
              }
            />

            <Input
              placeholder="Contraseña"
              value={password}
              secureTextEntry={!showPassword}
              onChangeText={setPassword}
              style={styles.input}
              status={error ? 'danger' : 'basic'}
              textStyle={{ color: darkMode ? '#fff' : '#222' }}
              accessoryLeft={
                <Icon
                  name="lock-outline"
                  fill={darkMode ? '#fff' : '#333'}
                  style={{ width: 20, height: 20 }}
                />
              }
              accessoryRight={renderPasswordIcon}
            />

            <View style={styles.rememberRow}>
              <CheckBox checked={remember} onChange={setRemember}>
                Recordarme
              </CheckBox>
            </View>

            <Button
              onPress={handleLogin}
              disabled={loading}
              style={[
                styles.button,
                {
                  backgroundColor: primaryColor,
                  shadowColor: primaryColor,
                  shadowOpacity: 0.4,
                  shadowRadius: 8,
                  shadowOffset: { width: 0, height: 3 },
                },
              ]}
            >
              {loading ? <Spinner status="control" size="small" /> : 'Ingresar'}
            </Button>

            {error !== '' && (
              <Text status="danger" style={styles.error}>
                {error}
              </Text>
            )}
          </Card>
        </Animated.View>
      </Layout>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, justifyContent: 'center', padding: 24 },
  card: {
    padding: 24,
    borderRadius: 20,
    ...(Platform.OS === 'web'
      ? { boxShadow: '0px 4px 6px rgba(0,0,0,0.3)' }
      : {
          shadowColor: '#000',
          shadowOpacity: 0.3,
          shadowRadius: 6,
          elevation: 4,
        }),
  },
  iconWrapper: { alignItems: 'center', marginBottom: 12 },
  title: { textAlign: 'center', marginBottom: 4, fontWeight: 'bold' },
  subtitle: { textAlign: 'center', marginBottom: 24, fontSize: 14 },
  input: { marginBottom: 16 },
  rememberRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  button: { marginTop: 8 },
  error: { marginTop: 16, textAlign: 'center' },
});
