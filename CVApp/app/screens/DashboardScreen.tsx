import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Layout, Button, Text } from '@ui-kitten/components';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types'; // tipo global de rutas

type Props = NativeStackScreenProps<RootStackParamList, 'Dashboard'> & {
  darkMode: boolean;
  setDarkMode: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function DashboardScreen({ navigation, darkMode }: Props) {
  return (
    <Layout style={[styles.container, { backgroundColor: darkMode ? '#1E1E1E' : '#F3F3F3' }]}>
      <Text category="h4" style={[styles.title, { color: darkMode ? '#fff' : '#222' }]}>
        Dashboard
      </Text>

      <View style={styles.grid}>
        <Button style={styles.btn} onPress={() => navigation.navigate('Cliente')}>
          Clientes
        </Button>
        <Button style={styles.btn} onPress={() => navigation.navigate('Campania')}>
         Campaña
        </Button>
        <Button style={styles.btn}>Botón 3</Button>
        <Button style={styles.btn}>Botón 4</Button>
      </View>
    </Layout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  title: {
    textAlign: 'center',
    marginBottom: 24,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  btn: {
    width: '40%',
    margin: 8,
  },
});
