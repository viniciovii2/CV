import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, Platform, Linking } from 'react-native';
import {
  Layout,
  Text,
  Button,
  Icon,
  Select,
  SelectItem,
  IndexPath,
  Card,
  TopNavigationAction,
} from '@ui-kitten/components';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { SvgXml } from 'react-native-svg';

type Props = NativeStackScreenProps<RootStackParamList, 'Cliente'> & {
  darkMode: boolean;
  setDarkMode: React.Dispatch<React.SetStateAction<boolean>>;
};

interface Campaign {
  Codigo: number;
  Nombre: string;
  Mensaje: string;
}

interface Cliente {
  CodigoCampania: number;
  Cedula: string;
  Nombre: string;
  Telefono: string;
  Mail: string;
  Estado: number;
  FechaEnvio: string;
}

const API_BASE = 'http://192.168.6.218:8000';

const whatsappSVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
  <path fill="#fff" d="M380.9 97.1C339-44 208.2-5.3 145 52c-63.3 57.3-63.7 150.5-17.5 
  205.1L32 480l238-95.1c54.5 46.3 147.8 45.8 205.1-17.5 
  57.3-63.2 96-194-22.2-275.3z"/>
</svg>
`;

const WhatsAppIcon = () => (
  <View
    style={{
      backgroundColor: '#25D366',
      borderRadius: 40,
      width: 56,
      height: 56,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#25D366',
      shadowOpacity: 0.4,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 2 },
    }}
  >
    {Platform.OS === 'web' ? (
      <span
        style={{ display: 'inline-block', width: 28, height: 28 }}
        dangerouslySetInnerHTML={{ __html: whatsappSVG }}
      />
    ) : (
      <SvgXml xml={whatsappSVG} width={28} height={28} />
    )}
  </View>
);

export default function ClienteScreen({ navigation, darkMode, setDarkMode }: Props) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaignIndex, setSelectedCampaignIndex] = useState<IndexPath>(new IndexPath(0));
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [filter, setFilter] = useState<'todos' | 'enviado' | 'pendiente'>('todos');
  const [visible, setVisible] = useState(false);
  const [clienteSeleccionado, setClienteSeleccionado] = useState<any>(null);

  const primaryColor = darkMode ? '#8B5CF6' : '#6A1B9A';
  const backgroundColor = darkMode ? '#1E1E1E' : '#F3F3F3';

  const DarkModeIcon = (props: any) => (
    <Icon {...props} name={darkMode ? 'sun-outline' : 'moon-outline'} />
  );
  const BackIcon = (props: any) => <Icon {...props} name="arrow-back-outline" />;

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const fechaHoy = new Date().toISOString().split('T')[0];
        const usuario = 'admin';
        const response = await fetch(`${API_BASE}/consultaCampania/${fechaHoy}/${usuario}`);
        const data = await response.json();
        const dataWithDefault = [
          { Codigo: 0, Nombre: '-Seleccione-', Mensaje: '' },
          ...(Array.isArray(data) ? data : []),
        ];
        setCampaigns(dataWithDefault);
      } catch {
        setCampaigns([{ Codigo: 0, Nombre: '-Seleccione-', Mensaje: '' }]);
      }
    };
    fetchCampaigns();
  }, []);

  const selectedCampaign = campaigns[selectedCampaignIndex.row];

  const fetchClientes = async (codigoCampania: number, signal?: AbortSignal) => {
    try {
      if (!codigoCampania) return setClientes([]);
      const response = await fetch(`${API_BASE}/consultaClienteCampania/${codigoCampania}`, {
        signal,
      });
      const data = await response.json();
      setClientes(Array.isArray(data) ? data : []);
    } catch {
      setClientes([]);
    }
  };

  useEffect(() => {
    if (!selectedCampaign || selectedCampaign.Codigo === 0) return setClientes([]);
    const controller = new AbortController();
    fetchClientes(selectedCampaign.Codigo, controller.signal);
    return () => controller.abort();
  }, [selectedCampaign]);

  const clientesFiltrados =
    filter === 'todos'
      ? clientes
      : clientes.filter((c) => (filter === 'enviado' ? c.Estado === 2 : c.Estado === 1));

  return (
    <Layout style={[styles.container, { backgroundColor }]}>
      {/* 🧭 Cabecera */}
      <View style={styles.header}>
        <TopNavigationAction icon={BackIcon} onPress={() => navigation.goBack()} />
        <View style={styles.headerCenter}>
          <Icon name="people-outline" fill={primaryColor} style={{ width: 36, height: 36 }} />
          <Text category="h5" style={[styles.headerTitle, { color: primaryColor }]}>
            Clientes
          </Text>
        </View>
        <TopNavigationAction icon={DarkModeIcon} onPress={() => setDarkMode(!darkMode)} />
      </View>

      {/* 📋 Selector de campaña */}
      <View style={styles.campaignRow}>
        <Text category="s2" style={{ color: darkMode ? '#ccc' : '#333', marginRight: 8 }}>
          Seleccione campaña:
        </Text>
        {Platform.OS === 'web' ? (
          <select
            value={selectedCampaignIndex.row}
            onChange={(e) =>
              setSelectedCampaignIndex(new IndexPath(parseInt(e.target.value)))
            }
            style={{
              padding: 8,
              borderRadius: 6,
              color: darkMode ? '#fff' : '#222',
              backgroundColor: darkMode ? '#333' : '#fff',
              border: `1px solid ${darkMode ? '#444' : '#ccc'}`,
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
            selectedIndex={selectedCampaignIndex}
            onSelect={(index) => setSelectedCampaignIndex(index as IndexPath)}
            placeholder="Campaña"
            value={selectedCampaign?.Nombre}
            style={styles.select}
          >
            {campaigns.map((c) => (
              <SelectItem key={c.Codigo.toString()} title={c.Nombre} />
            ))}
          </Select>
        )}
      </View>

      {/* 🧩 Filtros */}
      <View style={styles.filters}>
        {['todos', 'enviado', 'pendiente'].map((f) => (
          <Button
            key={f}
            size="small"
            style={[
              styles.filterBtn,
              {
                backgroundColor: filter === f ? primaryColor : '#ccc',
                borderColor: primaryColor,
              },
            ]}
            onPress={() => setFilter(f as any)}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </Button>
        ))}
      </View>

      {/* 📜 Lista de clientes */}
      <ScrollView style={styles.list}>
        {clientesFiltrados.map((c) => (
          <Card
            key={c.Cedula}
            style={[
              styles.card,
              { backgroundColor: darkMode ? '#252526' : '#fff', borderColor: primaryColor },
            ]}
            onPress={() => {
              setClienteSeleccionado(c);
              setVisible(true);
            }}
          >
            <View style={styles.row}>
              <Icon name="person" width={32} height={32} fill={primaryColor} />
              <View style={{ marginLeft: 12 }}>
                <Text category="s1" style={{ color: darkMode ? '#fff' : '#222' }}>
                  {c.Nombre}
                </Text>
                <Text appearance="hint">C.I {c.Cedula}</Text>
                <View
                  style={{
                    backgroundColor: c.Estado === 2 ? '#25D366' : '#F59E0B',
                    borderRadius: 6,
                    paddingHorizontal: 8,
                    paddingVertical: 2,
                    alignSelf: 'flex-start',
                    marginTop: 4,
                  }}
                >
                  <Text style={{ color: '#fff', fontSize: 12 }}>
                    {c.Estado === 2 ? 'Enviado' : 'Pendiente'}
                  </Text>
                </View>
              </View>
            </View>
          </Card>
        ))}
      </ScrollView>

      {/* 🪟 Modal cliente */}
      {visible && clienteSeleccionado && (
        <View style={styles.modalBackdrop}>
          <Card style={[styles.modalCard, { backgroundColor: darkMode ? '#252526' : '#fff' }]}>
            <Text category="h6" style={{ textAlign: 'center', color: darkMode ? '#fff' : '#222' }}>
              Detalles del Cliente
            </Text>
            <View style={styles.modalRow}>
              <Icon
                name="person"
                fill={primaryColor}
                style={{ width: 42, height: 42, marginRight: 12 }}
              />
              <View>
                <Text category="s1" style={{ color: darkMode ? '#fff' : '#222' }}>
                  {clienteSeleccionado.Nombre}
                </Text>
                <Text appearance="hint">C.I {clienteSeleccionado.Cedula}</Text>
                <Text>Teléfono: {clienteSeleccionado.Telefono}</Text>
                <Text>Mail: {clienteSeleccionado.Mail}</Text>
              </View>
            </View>

            {/* WhatsApp */}
            <View style={styles.centerButton}>
              <Button
                appearance="ghost"
                onPress={() => {
                  const phone = clienteSeleccionado.Telefono.replace(/[^0-9]/g, '').replace(/^0/, '593');
                  Linking.openURL(`https://wa.me/${phone}`);
                }}
              >
                <WhatsAppIcon />
              </Button>
            </View>

            <Button appearance="outline" style={styles.closeBtn} onPress={() => setVisible(false)}>
              <Text style={{ color: primaryColor }}>Cerrar</Text>
            </Button>
          </Card>
        </View>
      )}
    </Layout>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    marginTop: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  headerCenter: { flexDirection: 'row', alignItems: 'center' },
  headerTitle: { marginLeft: 8, fontWeight: 'bold' },
  campaignRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 16,
  },
  select: { flex: 1 },
  filters: { flexDirection: 'row', justifyContent: 'center', marginVertical: 8 },
  filterBtn: { marginHorizontal: 4, borderWidth: 1 },
  list: { flex: 1, marginVertical: 8, paddingHorizontal: 16 },
  card: { marginVertical: 6, borderWidth: 1, borderRadius: 10 },
  row: { flexDirection: 'row', alignItems: 'center' },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: { width: '85%', padding: 16, borderRadius: 12 },
  modalRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  centerButton: { alignItems: 'center', marginTop: 12 },
  closeBtn: { marginTop: 12 },
});
