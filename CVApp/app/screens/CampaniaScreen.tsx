import React, { useEffect, useState } from 'react';
import { StyleSheet, ScrollView, Platform, View, ActivityIndicator } from 'react-native';
import {
  Layout,
  Text,
  Input,
  Select,
  SelectItem,
  IndexPath,
  Button,
  Icon,
  TopNavigationAction,
  Spinner,
  Card,
} from '@ui-kitten/components';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import MensajeModal from '../components/MensajeModal';

// Tipo unificado para división política
type DivisionItem = { Codigo: string } & (
  | { Provincia: string }
  | { Canton: string }
  | { Parroquia: string }
);

type Props = NativeStackScreenProps<RootStackParamList, 'Campania'> & {
  darkMode: boolean;
  setDarkMode: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function CampaniaScreen({ navigation, darkMode, setDarkMode }: Props) {
  const [nombre, setNombre] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [step, setStep] = useState(1);

  const [loadingCantones, setLoadingCantones] = useState(false);
  const [loadingParroquias, setLoadingParroquias] = useState(false);

  const [provincias, setProvincias] = useState<DivisionItem[]>([]);
  const [provinciaIndex, setProvinciaIndex] = useState<IndexPath | null>(null);
  const [cantones, setCantones] = useState<DivisionItem[]>([]);
  const [cantonIndex, setCantonIndex] = useState<IndexPath | null>(null);
  const [parroquias, setParroquias] = useState<DivisionItem[]>([]);
  const [parroquiaIndex, setParroquiaIndex] = useState<IndexPath | null>(null);

  const sueldoOptions = [
    { Codigo: '1', Label: '>500' },
    { Codigo: '2', Label: '501-1000' },
    { Codigo: '3', Label: '1001-1500' },
    { Codigo: '4', Label: '>1500' },
  ];
  const [sueldoIndex, setSueldoIndex] = useState<IndexPath | null>(null);

  const API_BASE = 'http://192.168.6.218:8000';
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [preview, setPreview] = useState<{ count: number; provincia?: string; canton?: string; parroquia?: string; sueldo?: string } | null>(null);

  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<'success' | 'error' | 'warning' | 'info'>('info');
  const [modalMessage, setModalMessage] = useState('');

  // Colores (mismos que Dashboard)
  const primaryColor = darkMode ? '#8B5CF6' : '#6A1B9A';
  const backgroundColor = darkMode ? '#1E1E1E' : '#F9F9F9';
  const textColor = darkMode ? '#FFFFFF' : '#222';

  const showModal = (type: 'success' | 'error' | 'warning' | 'info', message: string) => {
    if (Platform.OS === 'web') alert(message);
    else {
      setModalType(type);
      setModalMessage(message);
      setModalVisible(true);
    }
  };

  // Cargar provincias
  useEffect(() => {
    const fetchProvincias = async () => {
      try {
        const response = await fetch(`${API_BASE}/provincia`);
        const data = await response.json();
        setProvincias(data);
      } catch (error) {
        console.error('Error cargando provincias:', error);
      }
    };
    fetchProvincias();
  }, []);

  const handleProvinciaSelect = async (index: IndexPath | IndexPath[]) => {
    setStep(2);
    const i = index as IndexPath;
    setProvinciaIndex(i);
    setCantonIndex(null);
    setParroquiaIndex(null);
    setCantones([]);
    setParroquias([]);
    setLoadingCantones(true);

    try {
      const provinciaSeleccionada = provincias[i.row];
      const response = await fetch(`${API_BASE}/canton/${provinciaSeleccionada.Codigo}`);
      const data = await response.json();
      setCantones(data);
    } catch (error) {
      console.error('Error cargando cantones:', error);
    } finally {
      setLoadingCantones(false);
    }
  };

  const handleCantonSelect = async (index: IndexPath | IndexPath[]) => {
    setStep(3);
    const i = index as IndexPath;
    setCantonIndex(i);
    setParroquiaIndex(null);
    setParroquias([]);
    setLoadingParroquias(true);

    try {
      const provinciaSeleccionada = provincias[provinciaIndex?.row ?? 0];
      const cantonSeleccionado = cantones[i.row];
      const response = await fetch(`${API_BASE}/parroquias/${provinciaSeleccionada.Codigo}/${cantonSeleccionado.Codigo}`);
      const data = await response.json();
      setParroquias(data);
    } catch (error) {
      console.error('Error cargando parroquias:', error);
    } finally {
      setLoadingParroquias(false);
    }
  };

  const VistaPrevia = async () => {
    setStep(4);
    setLoadingPreview(true);
    setPreview(null);

    try {
      const provincia = provincias[provinciaIndex?.row ?? 0]?.Codigo ?? '';
      const canton = cantones[cantonIndex?.row ?? 0]?.Codigo ?? '';
      const parroquia = parroquias[parroquiaIndex?.row ?? 0]?.Codigo ?? '';
      const sueldo = sueldoOptions[sueldoIndex?.row ?? 0]?.Codigo ?? '';

      if (!provincia || !canton || !parroquia || !sueldo) {
        showModal('warning', 'Seleccione todos los campos primero');
        setLoadingPreview(false);
        return;
      }

      const response = await fetch(`${API_BASE}/vistaPrevia/${provincia}/${canton}/${parroquia}/${sueldo}`);
      const data = await response.json();

      setPreview({
        count: data.count,
        provincia:
          provinciaIndex && 'Provincia' in provincias[provinciaIndex.row]
            ? (provincias[provinciaIndex.row] as any).Provincia
            : '',
        canton:
          cantonIndex && 'Canton' in cantones[cantonIndex.row]
            ? (cantones[cantonIndex.row] as any).Canton
            : '',
        parroquia:
          parroquiaIndex && 'Parroquia' in parroquias[parroquiaIndex.row]
            ? (parroquias[parroquiaIndex.row] as any).Parroquia
            : '',
        sueldo: sueldoOptions[sueldoIndex?.row ?? 0]?.Label,
      });
    } catch {
      showModal('error', 'Error al calcular vista previa');
    } finally {
      setLoadingPreview(false);
    }
  };

  const GenerarCampania = async () => {
    setStep(5);
    if (new Date(fechaInicio) > new Date(fechaFin)) {
      showModal('warning', 'La fecha de inicio no puede ser posterior a la fecha de fin.');
      return;
    }

    const provincia = provincias[provinciaIndex?.row ?? 0]?.Codigo ?? '';
    const canton = cantones[cantonIndex?.row ?? 0]?.Codigo ?? '';
    const parroquia = parroquias[parroquiaIndex?.row ?? 0]?.Codigo ?? '';
    const sueldo = sueldoOptions[sueldoIndex?.row ?? 0]?.Codigo ?? '';

    if (!nombre || !mensaje || !fechaInicio || !fechaFin || !provincia || !canton || !parroquia || !sueldo) {
      showModal('warning', 'Complete todos los campos antes de generar la campaña');
      return;
    }

    const usuario = 'admin';
    try {
      const response = await fetch(
        `${API_BASE}/generarCampania/${provincia}/${canton}/${parroquia}/${sueldo}/${fechaInicio}/${fechaFin}/${encodeURIComponent(
          nombre
        )}/${encodeURIComponent(mensaje)}/${usuario}`,
        { method: 'POST' }
      );

      const data = await response.json();
      if (data.error) showModal('error', `Error: ${data.error}`);
      else showModal('success', '¡Campaña generada con éxito!');
    } catch {
      showModal('error', 'Error al generar la campaña');
    }
  };

  const Limpiar = () => {
    setNombre('');
    setMensaje('');
    setFechaInicio('');
    setFechaFin('');
    setProvinciaIndex(null);
    setCantonIndex(null);
    setParroquiaIndex(null);
    setSueldoIndex(null);
    setPreview(null);
    setStep(1);
  };

  return (
    <Layout style={[styles.container, { backgroundColor }]}>
      {/* Cabecera */}
      <View style={styles.header}>
        <TopNavigationAction
          icon={(props) => <Icon {...props} name="arrow-back-outline" />}
          onPress={() => navigation.goBack()}
        />
        <View style={styles.headerCenter}>
          <Icon name="flag-outline" fill={primaryColor} style={{ width: 32, height: 32, marginRight: 8 }} />
          <Text category="h5" style={[styles.headerTitle, { color: primaryColor }]}>
            Campañas
          </Text>
        </View>
        <TopNavigationAction
          icon={(props) => <Icon {...props} name={darkMode ? 'sun-outline' : 'moon-outline'} />}
          onPress={() => setDarkMode(!darkMode)}
        />
      </View>

      {/* Contenido */}
      <ScrollView>
        <Text style={[styles.stepText, { color: '#aaa' }]}>Paso {step} de 5</Text>

        <Input placeholder="Nombre de la campaña" value={nombre} onChangeText={setNombre} style={styles.input} />
        <Input placeholder="Mensaje" value={mensaje} onChangeText={setMensaje} style={styles.input} />

        {/* Fechas */}
        {[{ label: 'Fecha Inicio', value: fechaInicio, setter: setFechaInicio },
          { label: 'Fecha Fin', value: fechaFin, setter: setFechaFin }].map((f, i) => (
          <View key={i}>
            <Text category="s1" style={[styles.label, { color: textColor }]}>{f.label}</Text>
            {Platform.OS === 'web' ? (
              <input
                type="date"
                value={f.value}
                onChange={(e) => f.setter(e.target.value)}
                style={styles.inputWeb}
                onFocus={(e) => (e.target.style.boxShadow = '0 0 6px rgba(139, 92, 246, 0.4)')}
                onBlur={(e) => (e.target.style.boxShadow = 'none')}
              />
            ) : (
              <Input value={f.value} onChangeText={f.setter} style={styles.input} />
            )}
          </View>
        ))}

        {/* Selectores */}
        {loadingCantones && <Spinner size="small" style={{ marginTop: 4 }} />}
        {loadingParroquias && <Spinner size="small" style={{ marginTop: 4 }} />}

        {[{ label: 'Provincia', data: provincias, idx: provinciaIndex, on: handleProvinciaSelect },
          { label: 'Cantón', data: cantones, idx: cantonIndex, on: handleCantonSelect },
          { label: 'Parroquia', data: parroquias, idx: parroquiaIndex, on: setParroquiaIndex }].map((s, i) => (
          <View key={i}>
            <Text category="s1" style={[styles.label, { color: textColor }]}>{s.label}</Text>
            {Platform.OS === 'web' ? (
              <select
                value={s.idx?.row ?? ''}
                onChange={(e) => s.on(new IndexPath(parseInt(e.target.value)))}
                style={styles.inputWeb}
                onFocus={(e) => (e.target.style.boxShadow = '0 0 6px rgba(139, 92, 246, 0.4)')}
                onBlur={(e) => (e.target.style.boxShadow = 'none')}
              >
                <option value="">-Seleccione-</option>
                {s.data.map((v: any, j) => (
                  <option key={j} value={j}>
                    {'Provincia' in v ? v.Provincia : 'Canton' in v ? v.Canton : v.Parroquia}
                  </option>
                ))}
              </select>
            ) : (
              <Select selectedIndex={s.idx || undefined} onSelect={(index) => s.on(index as IndexPath)} style={styles.input}>
                {s.data.map((v: any, j) => (
                  <SelectItem key={j} title={'Provincia' in v ? v.Provincia : 'Canton' in v ? v.Canton : v.Parroquia} />
                ))}
              </Select>
            )}
          </View>
        ))}

        {/* Sueldo */}
        <Text category="s1" style={[styles.label, { color: textColor }]}>Sueldo</Text>
        {Platform.OS === 'web' ? (
          <select
            value={sueldoIndex?.row ?? ''}
            onChange={(e) => setSueldoIndex(new IndexPath(parseInt(e.target.value)))}
            style={styles.inputWeb}
            onFocus={(e) => (e.target.style.boxShadow = '0 0 6px rgba(139, 92, 246, 0.4)')}
            onBlur={(e) => (e.target.style.boxShadow = 'none')}
          >
            <option value="">-Seleccione-</option>
            {sueldoOptions.map((s, i) => <option key={i} value={i}>{s.Label}</option>)}
          </select>
        ) : (
          <Select selectedIndex={sueldoIndex || undefined} onSelect={(index) => setSueldoIndex(index as IndexPath)} style={styles.input}>
            {sueldoOptions.map((s, i) => <SelectItem key={i} title={s.Label} />)}
          </Select>
        )}

        {/* Vista previa */}
        <Button
          accessoryLeft={(props) => <Icon {...props} name="search-outline" />}
          style={[styles.button, { backgroundColor: primaryColor }]}
          onPress={VistaPrevia}>
          {loadingPreview ? <ActivityIndicator color="#fff" /> : 'Vista Previa'}
        </Button>

        {preview && (
          <Card style={[styles.previewCard, { backgroundColor: darkMode ? '#252526' : '#fff' }]}>
            <Text style={{ color: textColor }}>
              Clientes encontrados: <Text style={{ color: '#25D366' }}>{preview.count}</Text>
            </Text>
            <Text style={{ color: textColor }}>Provincia: {preview.provincia}</Text>
            <Text style={{ color: textColor }}>Cantón: {preview.canton}</Text>
            <Text style={{ color: textColor }}>Parroquia: {preview.parroquia}</Text>
            <Text style={{ color: textColor }}>Rango salarial: {preview.sueldo}</Text>
          </Card>
        )}

        {/* Generar */}
        <Button
          accessoryLeft={(props) => <Icon {...props} name="paper-plane-outline" />}
          style={[styles.button, { backgroundColor: '#25D366' }]}
          onPress={GenerarCampania}>
          Generar Campaña
        </Button>

        {/* Limpiar selección */}
        <Button
          appearance="ghost"
          status="basic"
          size="small"
          accessoryLeft={(props) => <Icon {...props} name="refresh-outline" fill={primaryColor} />}
          onPress={Limpiar}
          style={{ alignSelf: 'center', marginVertical: 8 }}>
          Limpiar selección
        </Button>
      </ScrollView>

      <MensajeModal visible={modalVisible} type={modalType} message={modalMessage} onClose={() => setModalVisible(false)} />
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
  headerCenter: { flexDirection: 'row', alignItems: 'center' },
  headerTitle: { marginLeft: 8, fontWeight: 'bold' },
  stepText: { textAlign: 'center', marginVertical: 6 },
  input: { marginVertical: 8 },
  inputWeb: {
  marginVertical: 8,
  padding: 10,
  borderRadius: 10,
  borderWidth: 1,
  borderColor: '#6B21A8',
  backgroundColor: '#2B2B2B',
  color: '#FFF',
  fontSize: 15,
  width: '100%',
  position: 'relative',
  zIndex: 10, // 👈 asegura que esté sobre los labels y cards
  ...(Platform.OS === 'web'
    ? {
        outline: 'none',
        appearance: 'none',
        cursor: 'pointer',
        transition: 'all 0.2s ease-in-out',
      } as any
    : {}),
},

  label: { marginTop: 12, marginBottom: 4, fontWeight: '600' },
  button: { marginVertical: 10, borderRadius: 10 },
  previewCard: { marginVertical: 8, borderRadius: 10, padding: 12 },
});
