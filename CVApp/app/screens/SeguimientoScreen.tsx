import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Platform, ScrollView, Dimensions } from 'react-native';
import {
  Layout,
  Text,
  Button,
  Select,
  SelectItem,
  IndexPath,
  Spinner,
  Icon,
  TopNavigationAction,
} from '@ui-kitten/components';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { ProgressChart } from 'react-native-chart-kit';

const API_BASE = 'http://192.168.6.218:8000';

type Props = NativeStackScreenProps<RootStackParamList, 'Seguimiento'> & {
  darkMode: boolean;
  setDarkMode: React.Dispatch<React.SetStateAction<boolean>>;
};

interface Campania {
  Codigo: number;
  Nombre: string;
}

interface Estadistica {
  Total: number;
  Gestionados: number;
  Pendientes: number;
}

export default function SeguimientoScreen({ navigation, darkMode, setDarkMode }: Props) {
  const [campaigns, setCampaigns] = useState<Campania[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<IndexPath>(new IndexPath(0));
  const [estadistica, setEstadistica] = useState<Estadistica | null>(null);
  const [loading, setLoading] = useState(false);

  const selectedCampaign = campaigns[selectedIndex.row];
  const primaryColor = darkMode ? '#8B5CF6' : '#6A1B9A';
  const backgroundColor = darkMode ? '#1E1E1E' : '#F3F3F3';
  const textColor = darkMode ? '#FFFFFF' : '#222';

  useEffect(() => {
    const fetchCampanias = async () => {
      try {
        const fechaHoy = new Date().toISOString().split('T')[0];
        const usuario = 'admin';
        const res = await fetch(`${API_BASE}/consultaCampania/${fechaHoy}/${usuario}`);
        const data = await res.json();
        if (Array.isArray(data)) {
          setCampaigns([{ Codigo: 0, Nombre: '-Seleccione-' }, ...data]);
        } else {
          setCampaigns([{ Codigo: 0, Nombre: '-Seleccione-' }]);
        }
      } catch (err) {
        console.error('Error cargando campañas', err);
        setCampaigns([{ Codigo: 0, Nombre: '-Seleccione-' }]);
      }
    };
    fetchCampanias();
  }, []);

  const cargarEstadistica = async () => {
    if (!selectedCampaign || selectedCampaign.Codigo === 0) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/estadisticaCampania/${selectedCampaign.Codigo}`);
      const data = await res.json();
      setEstadistica(data);
    } catch (err) {
      console.error('Error al cargar estadística', err);
      setEstadistica(null);
    } finally {
      setLoading(false);
    }
  };

  const renderChart = () => {
    if (!estadistica) return null;

    const total = estadistica.Total || 0;
    const gestionados = estadistica.Gestionados || 0;
    const pendientes = estadistica.Pendientes || (total - gestionados);

    if (total === 0) {
      return (
        <Text style={[styles.noData, { color: darkMode ? '#aaa' : '#444' }]}>
          No hay datos para mostrar
        </Text>
      );
    }

    // 📊 Móvil: Gráfico circular
    if (Platform.OS !== 'web') {
      const screenWidth = Dimensions.get('window').width - 60;
      const porcentaje = total > 0 ? gestionados / total : 0;

      const chartConfig = {
        backgroundGradientFrom: backgroundColor,
        backgroundGradientTo: backgroundColor,
        color: (opacity = 1) =>
          darkMode
            ? `rgba(139, 92, 246, ${opacity})`
            : `rgba(106, 27, 154, ${opacity})`,
        strokeWidth: 10,
      };

      return (
        <View style={{ alignItems: 'center', marginTop: 20 }}>
          <ProgressChart
            data={{
              labels: ['Gestionados'],
              data: [porcentaje],
            }}
            width={screenWidth}
            height={220}
            strokeWidth={10}
            radius={100}
            chartConfig={chartConfig}
            hideLegend={true}
          />
          <Text
            category="h4"
            style={{
              position: 'absolute',
              color: textColor,
              top: 110,
              textAlign: 'center',
            }}
          >
            {Math.round(porcentaje * 100)}%
          </Text>

          <Text style={[styles.total, { color: textColor }]}>
            Total clientes: {total}
          </Text>
          <Text style={[styles.sub, { color: '#4CAF50' }]}>
            Gestionados: {gestionados}
          </Text>
          <Text style={[styles.sub, { color: darkMode ? '#bbb' : '#555' }]}>
            Pendientes: {pendientes}
          </Text>
        </View>
      );
    }

    // 💻 Web: Equivalente con Recharts
    const { PieChart, Pie, Cell, Tooltip, Legend } = require('recharts');
    const data = [
      { name: 'Gestionados', value: gestionados },
      { name: 'Pendientes', value: pendientes },
    ];
    const COLORS = [primaryColor, darkMode ? '#555' : '#BDBDBD'];

    return (
      <View style={{ alignItems: 'center', marginTop: 20 }}>
        <PieChart width={350} height={250}>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={4}
            label
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
        <Text style={[styles.total, { color: textColor }]}>
          Total clientes: {total}
        </Text>
        <Text style={[styles.sub, { color: '#4CAF50' }]}>
          Gestionados: {gestionados}
        </Text>
        <Text style={[styles.sub, { color: darkMode ? '#bbb' : '#555' }]}>
          Pendientes: {pendientes}
        </Text>
      </View>
    );
  };

  return (
    <Layout style={[styles.container, { backgroundColor }]}>
      {/* 🧭 CABECERA */}
<View style={styles.header}>
  <TopNavigationAction
    icon={(props) => <Icon {...props} name="arrow-back-outline" />}
    onPress={() => navigation.goBack()}
  />

  <View style={styles.headerCenter}>
    <Icon
      name="bar-chart-2-outline"
      fill={primaryColor}
      style={{ width: 28, height: 28, marginRight: 8 }}
    />
    <Text category="h5" style={[styles.headerTitle, { color: primaryColor }]}>
      Seguimiento
    </Text>
  </View>

  <TopNavigationAction
    icon={(props) => <Icon {...props} name={darkMode ? 'sun-outline' : 'moon-outline'} />}
    onPress={() => setDarkMode(!darkMode)}
  />
</View>


      <ScrollView>
        <Text category="s1" style={[styles.label, { color: textColor }]}>
          Campaña
        </Text>

        {Platform.OS === 'web' ? (
          <select
            value={selectedIndex.row}
            onChange={(e) => setSelectedIndex(new IndexPath(parseInt(e.target.value)))}
            style={{
              ...styles.inputWeb,
              backgroundColor: darkMode ? '#333' : '#fff',
              color: textColor,
              borderColor: darkMode ? '#555' : '#ccc',
            }}
          >
            {campaigns.map((c, i) => (
              <option key={c.Codigo} value={i}>
                {c.Nombre}
              </option>
            ))}
          </select>
        ) : (
          <Select
            selectedIndex={selectedIndex}
            onSelect={(index) => setSelectedIndex(index as IndexPath)}
            value={campaigns[selectedIndex.row]?.Nombre}
            style={styles.input}
          >
            {campaigns.map((c) => (
              <SelectItem key={c.Codigo.toString()} title={c.Nombre} />
            ))}
          </Select>
        )}

        <Button
          style={[styles.button, { backgroundColor: primaryColor }]}
          onPress={cargarEstadistica}
          disabled={loading}
          accessoryLeft={(props) => (
            loading ? <Spinner {...props} size="tiny" /> : <Icon {...props} name="bar-chart-outline" />
          )}
        >
          {loading ? 'Cargando...' : 'Ver Seguimiento'}
        </Button>

        {renderChart()}
      </ScrollView>
    </Layout>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  header: {
    marginTop: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: { fontWeight: 'bold' },
  label: { marginTop: 12, marginBottom: 4, fontWeight: '600' },
  input: { marginVertical: 8 },
  inputWeb: {
    marginVertical: 8,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    width: '100%',
    fontSize: 15,
    ...(Platform.OS === 'web'
      ? {
          outline: 'none',
          appearance: 'none',
          cursor: 'pointer',
          transition: 'all 0.2s ease-in-out',
        } as any
      : {}),
  },
  button: { marginVertical: 10, borderRadius: 10 },
  total: { marginTop: 12, fontWeight: 'bold', textAlign: 'center', fontSize: 16 },
  sub: { textAlign: 'center', fontSize: 14 },
  noData: { textAlign: 'center', marginTop: 20 },
});
