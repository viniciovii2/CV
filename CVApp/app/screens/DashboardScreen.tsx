import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Animated, Easing, ScrollView, Platform } from 'react-native';
import { Layout, Text, Card, Icon, TopNavigation, TopNavigationAction } from '@ui-kitten/components';
import Svg, { Path } from 'react-native-svg';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Dashboard'> & {
  darkMode: boolean;
  setDarkMode: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function DashboardScreen({ navigation, darkMode, setDarkMode }: Props) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const waveAnim = useRef(new Animated.Value(0)).current;

  const primaryColor = darkMode ? '#8B5CF6' : '#6A1B9A';
  const backgroundColor = darkMode ? '#1E1E1E' : '#F3F3F3';
  const cardColor = darkMode ? '#252526' : '#fff';
  const textColor = darkMode ? '#fff' : '#222';
  const borderColor = darkMode ? '#333' : 'rgba(0,0,0,0.1)';

  const toggleDarkMode = () => setDarkMode(!darkMode);
  const DarkModeIcon = (props: any) => <Icon {...props} name={darkMode ? 'sun-outline' : 'moon-outline'} />;

  useEffect(() => {
    // Animación de entrada
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, easing: Easing.out(Easing.ease), useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, easing: Easing.out(Easing.ease), useNativeDriver: true }),
    ]).start();

    // Animación infinita de la ola
    Animated.loop(
      Animated.sequence([
        Animated.timing(waveAnim, { toValue: 10, duration: 3500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(waveAnim, { toValue: -10, duration: 3500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const renderCard = (title: string, iconName: string, onPress: () => void) => (
    <Card
      style={[
        styles.card,
        { backgroundColor: cardColor, borderColor: borderColor, shadowColor: darkMode ? '#000' : primaryColor },
      ]}
      onPress={onPress}
    >
      <View style={styles.cardContent}>
        <Icon name={iconName} fill={primaryColor} style={styles.icon} />
        <Text style={[styles.cardText, { color: textColor }]}>{title}</Text>
      </View>
    </Card>
  );

  return (
    <Layout style={[styles.container, { backgroundColor }]}>
      <TopNavigation
        title="Panel Principal"
        alignment="center"
        accessoryRight={() => <TopNavigationAction icon={DarkModeIcon} onPress={toggleDarkMode} />}
      />

      {/* 🌊 OLA SUPERIOR */}
      <Animated.View style={[styles.waveWrapperTop, { transform: [{ translateY: waveAnim }] }]}>
        <Svg height="100%" width="100%" viewBox="0 0 1440 320">
          <Path
            fill={primaryColor}
            fillOpacity="0.15"
            d="M0,224L30,197.3C60,171,120,117,180,112C240,107,300,149,360,165.3C420,181,480,171,540,149.3C600,128,660,96,720,90.7C780,85,840,107,900,138.7C960,171,1020,213,1080,197.3C1140,181,1200,107,1260,85.3C1320,64,1380,96,1410,112L1440,128L1440,0L0,0Z"
          />
        </Svg>
      </Animated.View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          {/* 💬 SALUDO */}
          <Text category="h5" style={[styles.welcome, { color: textColor }]}>
            Hola <Text style={{ color: primaryColor, fontWeight: 'bold' }}>1722</Text> 👋
          </Text>
          <Text appearance="hint" style={[styles.mutedText, { color: darkMode ? '#AAA' : '#555' }]}>
            Hoy es{' '}
            {new Date().toLocaleDateString('es-EC', {
              weekday: 'long',
              day: '2-digit',
              month: 'long',
            })}
          </Text>

          {/* 📊 RESUMEN ESTADÍSTICO (no clickeable) */}
          <View style={styles.statsContainer}>
            <View style={[styles.statInfo, { backgroundColor: darkMode ? '#2C2C2C' : '#EEE' }]}>
              <Icon name="flag-outline" fill={primaryColor} style={styles.statIconSmall} />
              <View>
                <Text style={[styles.statLabel, { color: darkMode ? '#AAA' : '#555' }]}>Campañas activas</Text>
                <Text style={[styles.statValue, { color: textColor }]}>5</Text>
              </View>
            </View>

            <View style={[styles.statInfo, { backgroundColor: darkMode ? '#2C2C2C' : '#EEE' }]}>
              <Icon name="people-outline" fill="#4CAF50" style={styles.statIconSmall} />
              <View>
                <Text style={[styles.statLabel, { color: darkMode ? '#AAA' : '#555' }]}>Clientes</Text>
                <Text style={[styles.statValue, { color: textColor }]}>37</Text>
              </View>
            </View>

            <View style={[styles.statInfo, { backgroundColor: darkMode ? '#2C2C2C' : '#EEE' }]}>
              <Icon name="activity-outline" fill="#FFC107" style={styles.statIconSmall} />
              <View>
                <Text style={[styles.statLabel, { color: darkMode ? '#AAA' : '#555' }]}>Pendientes</Text>
                <Text style={[styles.statValue, { color: textColor }]}>12</Text>
              </View>
            </View>
          </View>

          {/* ⚙️ ACCIONES */}
          <Text style={[styles.sectionTitle, { color: primaryColor }]}>Acciones rápidas</Text>
          <View style={{ height: 1, backgroundColor: darkMode ? '#333' : '#DDD', marginBottom: 16 }} />

          <View style={styles.grid}>
            {renderCard('Clientes', 'people-outline', () => navigation.navigate('Cliente'))}
            {renderCard('Campañas', 'flag-outline', () => navigation.navigate('Campania'))}
            {renderCard('Seguimiento', 'activity-outline', () => navigation.navigate('Seguimiento'))}
            {renderCard('Configuración', 'settings-2-outline', () => alert('🚧 En desarrollo'))}
          </View>
        </Animated.View>
      </ScrollView>

      {/* 🌊 OLA INFERIOR */}
      <Animated.View style={[styles.waveWrapperBottom, { transform: [{ translateY: waveAnim }] }]}>
        <Svg height="100%" width="100%" viewBox="0 0 1440 320">
          <Path
            fill={primaryColor}
            fillOpacity="0.15"
            d="M0,64L30,80C60,96,120,128,180,138.7C240,149,300,139,360,122.7C420,107,480,85,540,69.3C600,53,660,43,720,58.7C780,75,840,117,900,117.3C960,117,1020,75,1080,69.3C1140,64,1200,96,1260,112C1320,128,1380,128,1410,128L1440,128L1440,320L0,320Z"
          />
        </Svg>
      </Animated.View>
    </Layout>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 20 },
  waveWrapperTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 150,
    zIndex: -1,
  },
  waveWrapperBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 120,
    zIndex: -1,
  },
  welcome: { textAlign: 'center', marginTop: 16, marginBottom: 4, fontWeight: '600' },
  mutedText: { textAlign: 'center', marginBottom: 24, fontSize: 14 },
  statsContainer: { marginBottom: 24 },
  statInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 10,
    marginVertical: 6,
  },
  statIconSmall: { width: 26, height: 26, marginRight: 10 },
  statValue: { fontWeight: 'bold', fontSize: 16 },
  statLabel: { fontSize: 13 },
  sectionTitle: { fontWeight: '600', marginBottom: 8, textAlign: 'center', marginTop: 8 },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  card: {
    width: Platform.OS === 'web' ? '22%' : '40%',
    margin: 10,
    borderRadius: 16,
    borderWidth: 1,
    elevation: 4,
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  cardContent: { alignItems: 'center', justifyContent: 'center', paddingVertical: 20 },
  icon: { width: 40, height: 40, marginBottom: 8 },
  cardText: { fontWeight: '600', fontSize: 14, textAlign: 'center' },
});
