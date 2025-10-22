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
} from '@ui-kitten/components';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import MensajeModal from '../components/MensajeModal'; // 👈 importa el modal


type Props = NativeStackScreenProps<RootStackParamList, 'Campania'> & {
  darkMode: boolean;
  setDarkMode: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function ({ navigation, darkMode }: Props) {
  const [nombre, setNombre] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');

  const [provincias, setProvincias] = useState<{ Codigo: string; Provincia: string }[]>([]);
  const [provinciaIndex, setProvinciaIndex] = useState<IndexPath | null>(null);

  const [cantones, setCantones] = useState<{ Codigo: string; Canton: string }[]>([]);
  const [cantonIndex, setCantonIndex] = useState<IndexPath | null>(null);

  const [parroquias, setParroquias] = useState<{ Codigo: string; Parroquia: string }[]>([]);
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
  const [previewMessage, setPreviewMessage] = useState('');

  // Estado del modal de mensaje
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<'success' | 'error' | 'warning' | 'info'>('info');
  const [modalMessage, setModalMessage] = useState('');


  const showModal = (type: 'success' | 'error' | 'warning' | 'info', message: string) => {
    if (Platform.OS === 'web') {
    // En web usamos alert en vez de modal
    alert(message);
  } else {
    // En móvil usamos el modal normal
    setModalType(type);
    setModalMessage(message);
    setModalVisible(true);
  }
  };
  
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

  const handleProvinciaSelect = (index: IndexPath | IndexPath[]) => {
    const i = index as IndexPath;
    setProvinciaIndex(i);
    setCantonIndex(null);
    setParroquiaIndex(null);

    const fetchCantones = async () => {
      const provinciaSeleccionada = provincias[i.row];
      if (provinciaSeleccionada) {
        try {
          const response = await fetch(`${API_BASE}/canton/${provinciaSeleccionada.Codigo}`);
          const data = await response.json();
          setCantones(data);
        } catch (error) {
          console.error('Error cargando cantones:', error);
        }
      }
    };
    fetchCantones();
  };

  const handleCantonSelect = (index: IndexPath | IndexPath[]) => {
    const i = index as IndexPath;
    setCantonIndex(i);
    setParroquiaIndex(null);

    const fetchParroquias = async () => {
      const provinciaSeleccionada = provincias[provinciaIndex?.row ?? 0];
      const cantonSeleccionado = cantones[i.row];
      if (provinciaSeleccionada && cantonSeleccionado) {
        try {
          const response = await fetch(
            `${API_BASE}/parroquias/${provinciaSeleccionada.Codigo}/${cantonSeleccionado.Codigo}`
          );
          const data = await response.json();
          setParroquias(data);
        } catch (error) {
          console.error('Error cargando parroquias:', error);
        }
      }
    };
    fetchParroquias();
  };

  const VistaPrevia = async () => {
    setLoadingPreview(true);
    setPreviewMessage('');

    try {
      const provincia = provincias[provinciaIndex?.row ?? 0]?.Codigo ?? '';
      const canton = cantones[cantonIndex?.row ?? 0]?.Codigo ?? '';
      const parroquia = parroquias[parroquiaIndex?.row ?? 0]?.Codigo ?? '';
      const sueldo = sueldoOptions[sueldoIndex?.row ?? 0]?.Codigo ?? '';

      if (!provincia || !canton || !parroquia || !sueldo) {
        setPreviewMessage('Seleccione todos los campos primero');
        setLoadingPreview(false);
        return;
      }

      const response = await fetch(
        `${API_BASE}/vistaPrevia/${provincia}/${canton}/${parroquia}/${sueldo}`
      );
      const data = await response.json();
      setPreviewMessage(`Se encontraron ${data.count} clientes`);
    } catch (error) {
      console.error(error);
      setPreviewMessage('Error al calcular vista previa');
    } finally {
      setLoadingPreview(false);
    }
  };

// --- Función para Generar Campaña ---
const GenerarCampania = async () => {
  try {
    console.log('GenerarCampania');

    const provincia = provincias[provinciaIndex?.row ?? 0]?.Codigo ?? '';
    const canton = cantones[cantonIndex?.row ?? 0]?.Codigo ?? '';
    const parroquia = parroquias[parroquiaIndex?.row ?? 0]?.Codigo ?? '';
    const sueldo = sueldoOptions[sueldoIndex?.row ?? 0]?.Codigo ?? '';

    if (!nombre || !mensaje|| !fechaInicio || !fechaFin || !provincia || !canton || !parroquia || !sueldo) {
      showModal('warning','Complete todos los campos antes de generar la campaña');
      //alert("warning")
      return;
    }

    // Reemplazamos "/" por "-" si tu API lo necesita
    const inicio = fechaInicio.replaceAll('-', '-');
    const fin = fechaFin.replaceAll('-', '-');

    const usuario = 'admin'; // puedes reemplazar por usuario actual
    const response = await fetch(
      `${API_BASE}/generarCampania/${provincia}/${canton}/${parroquia}/${sueldo}/${inicio}/${fin}/${encodeURIComponent(nombre)}/${encodeURIComponent(mensaje)}/${usuario}`,
      { method: 'POST' }
    );

    const data = await response.json();
    if (data.error) {
      showModal('error',`Error: ${data.error}`);
    } else {
      showModal('success','Campaña generada con éxito!');
    }
  } catch (error) {
    console.error(error);
    showModal('error','Error al generar la campaña');
  }
};

  return (
    <Layout style={styles.container}>
      <ScrollView>
        <Text category="h5" style={styles.title}>Nueva Campaña</Text>

        <Input placeholder="Nombre de la campaña" value={nombre} onChangeText={setNombre} style={styles.input} />
        <Input placeholder="Mensaje" value={mensaje} onChangeText={setMensaje} style={styles.input} />

        {/* Fecha Inicio */}
        <Text category="s1" style={styles.label}>Fecha Inicio</Text>
        {Platform.OS === 'web' ? (
          <input
            type="date"
            value={fechaInicio}
            onChange={(e) => setFechaInicio(e.target.value)}
            style={styles.inputWeb}
          />
        ) : (
          <Input placeholder="Fecha inicio" value={fechaInicio} onChangeText={setFechaInicio} style={styles.input} />
        )}

        {/* Fecha Fin */}
        <Text category="s1" style={styles.label}>Fecha Fin</Text>
        {Platform.OS === 'web' ? (
          <input
            type="date"
            value={fechaFin}
            onChange={(e) => setFechaFin(e.target.value)}
            style={styles.inputWeb}
          />
        ) : (
          <Input placeholder="Fecha fin" value={fechaFin} onChangeText={setFechaFin} style={styles.input} />
        )}

        {/* Provincia */}
        <Text category="s1" style={styles.label}>Provincia</Text>
        {Platform.OS === 'web' ? (
          <select
            value={provinciaIndex?.row ?? ''}
            onChange={(e) => handleProvinciaSelect(new IndexPath(parseInt(e.target.value)))}
            style={styles.inputWeb}
          >
            <option value="">-Seleccione-</option>
            {provincias.map((p, i) => <option key={i} value={i}>{p.Provincia}</option>)}
          </select>
        ) : (
          <Select
            selectedIndex={provinciaIndex || undefined}
            onSelect={(index) => handleProvinciaSelect(index as IndexPath)}
            value={provinciaIndex !== null ? provincias[provinciaIndex.row]?.Provincia : '-Seleccione-'}
            style={styles.input}
          >
            {[{ Codigo: '', Provincia: '-Seleccione-' }, ...provincias].map((p, i) => (
              <SelectItem key={i.toString()} title={p.Provincia} />
            ))}
          </Select>
        )}

        {/* Cantón */}
        <Text category="s1" style={styles.label}>Cantón</Text>
        {Platform.OS === 'web' ? (
          <select
            value={cantonIndex?.row ?? ''}
            onChange={(e) => handleCantonSelect(new IndexPath(parseInt(e.target.value)))}
            disabled={!provinciaIndex}
            style={styles.inputWeb}
          >
            <option value="">-Seleccione-</option>
            {cantones.map((c, i) => <option key={i} value={i}>{c.Canton}</option>)}
          </select>
        ) : (
          <Select
            disabled={!provinciaIndex}
            selectedIndex={cantonIndex || undefined}
            onSelect={(index) => handleCantonSelect(index as IndexPath)}
            value={cantonIndex !== null ? cantones[cantonIndex.row]?.Canton : '-Seleccione-' }
            style={styles.input}
          >
            {[{ Codigo: '', Canton: '-Seleccione-' }, ...cantones].map((c, i) => (
              <SelectItem key={i.toString()} title={c.Canton} />
            ))}
          </Select>
        )}

        {/* Parroquia */}
        <Text category="s1" style={styles.label}>Parroquia</Text>
        {Platform.OS === 'web' ? (
          <select
            value={parroquiaIndex?.row ?? ''}
            onChange={(e) => setParroquiaIndex(new IndexPath(parseInt(e.target.value)))}
            disabled={!cantonIndex}
            style={styles.inputWeb}
          >
            <option value="">-Seleccione-</option>
            {parroquias.map((p, i) => <option key={i} value={i}>{p.Parroquia}</option>)}
          </select>
        ) : (
          <Select
            disabled={!cantonIndex}
            selectedIndex={parroquiaIndex || undefined}
            onSelect={(index) => setParroquiaIndex(index as IndexPath)}
            value={parroquiaIndex !== null ? parroquias[parroquiaIndex.row]?.Parroquia : '-Seleccione-' }
            style={styles.input}
          >
            {[{ Codigo: '', Parroquia: '-Seleccione-' }, ...parroquias].map((p, i) => (
              <SelectItem key={i.toString()} title={p.Parroquia} />
            ))}
          </Select>
        )}

        {/* Sueldo */}
        <Text category="s1" style={styles.label}>Sueldo</Text>
        {Platform.OS === 'web' ? (
          <select
            value={sueldoIndex?.row ?? ''}
            onChange={(e) => setSueldoIndex(new IndexPath(parseInt(e.target.value)))}
            style={styles.inputWeb}
          >
            <option value="">-Seleccione-</option>
            {sueldoOptions.map((s, i) => <option key={i} value={i}>{s.Label}</option>)}
          </select>
        ) : (
          <Select
            selectedIndex={sueldoIndex || undefined}
            onSelect={(index) => setSueldoIndex(index as IndexPath)}
            value={sueldoIndex !== null ? sueldoOptions[sueldoIndex.row].Label : '-Seleccione-' }
            style={styles.input}
          >
            {[{ Codigo: '', Label: '-Seleccione-' }, ...sueldoOptions].map((s, i) => (
              <SelectItem key={i.toString()} title={s.Label} />
            ))}
          </Select>
        )}

        {/* Botones */}
        <Button style={[styles.button, styles.previewBtn]} onPress={VistaPrevia}>
          {loadingPreview ? <ActivityIndicator color="#fff" /> : 'Vista Previa'}
        </Button>
        {previewMessage ? (
          <Text style={[styles.previewMessage, { color: 'green' }]}>{previewMessage}</Text>
        ) : null}
        <Button style={styles.button} onPress= {GenerarCampania}>Generar Campaña</Button>

        {/* Botón Atrás al final */}
        <Button appearance="outline" style={styles.backBtn} onPress={() => navigation.goBack()}>
                Atrás
              </Button>
      </ScrollView>

      <MensajeModal
      visible={modalVisible}
      type={modalType}
      message={modalMessage}
      onClose={() => setModalVisible(false)}
    />

    </Layout>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { marginBottom: 8, textAlign: 'center' },
  input: { marginVertical: 8 },
  inputWeb: {
    marginVertical: 8,
    padding: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fff',
    color: '#222',
  },
  label: { marginTop: 8 },
  button: { marginVertical: 8 },
  previewBtn: { backgroundColor: '#4CAF50' },
  previewMessage: { marginTop: 4, fontWeight: 'bold' },
  backBtn: { marginVertical: 12 },
});
