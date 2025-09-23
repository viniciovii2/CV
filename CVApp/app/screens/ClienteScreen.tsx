import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, Platform } from 'react-native';
import {
  Layout,
  Text,
  Input,
  Button,
  Icon,
  Select,
  SelectItem,
  IndexPath,
  Card,
} from '@ui-kitten/components';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Cliente'> & {
  darkMode: boolean;
  setDarkMode: React.Dispatch<React.SetStateAction<boolean>>;
};

const campaigns = ['Campaña 22-09-2025', 'Campaña Prueba'];

const clientes = [
  { id: 1, nombre: 'Pepito Perez', ci: '1710209778', estado: 'Enviado' },
  { id: 2, nombre: 'Juan Gomez', ci: '1104503321', estado: 'Pendiente' },
  { id: 3, nombre: 'Maria Lopez', ci: '1502398475', estado: 'Enviado' },
];

// Componente ClickableCard
const ClickableCard: React.FC<{
  darkMode: boolean;
  cliente: typeof clientes[0];
  onPress: () => void;
}> = ({ darkMode, cliente, onPress }) =>
  Platform.OS === 'web' ? (
    <div
      onClick={onPress}
      style={{
        marginTop: 4,
        marginBottom: 4,
        padding: 12,
        borderRadius: 8,
        backgroundColor: darkMode ? '#333' : '#fff',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        cursor: 'pointer',
      }}
    >
      <View style={styles.avatar}>
        <Icon name="person" width={32} height={32} fill={darkMode ? '#fff' : '#222'} />
      </View>
      <div style={{ marginLeft: 12 }}>
        <span style={{ color: darkMode ? '#fff' : '#222', fontWeight: 500 }}>{cliente.nombre}</span>
        <br />
        <span style={{ color: '#888' }}>C.I {cliente.ci}</span>
        <br />
        <span style={{ color: cliente.estado === 'Enviado' ? 'green' : 'orange' }}>
          Estado: {cliente.estado}
        </span>
      </div>
    </div>
  ) : (
    <Card style={styles.card} onPress={onPress}>
      <View style={styles.row}>
        <View style={styles.avatar}>
          <Icon name="person" width={32} height={32} fill={darkMode ? '#fff' : '#222'} />
        </View>
        <View style={styles.info}>
          <Text category="s1" style={{ color: darkMode ? '#fff' : '#222' }}>
            {cliente.nombre}
          </Text>
          <Text appearance="hint">C.I {cliente.ci}</Text>
          <Text status={cliente.estado === 'Enviado' ? 'success' : 'warning'}>
            Estado: {cliente.estado}
          </Text>
        </View>
      </View>
    </Card>
  );

// Modal Web
const WebModal: React.FC<{ visible: boolean; onClose: () => void; children: React.ReactNode }> = ({
  visible,
  onClose,
  children,
}) => {
  if (!visible) return null;
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
      }}
    >
      <div onClick={(e) => e.stopPropagation()} style={{ backgroundColor: '#fff', padding: 16, borderRadius: 8 }}>
        {children}
      </div>
    </div>
  );
};

export default function ClienteScreen({ navigation, darkMode }: Props) {
  const [selectedCampaignIndex, setSelectedCampaignIndex] = useState<IndexPath>(new IndexPath(0));
  const [filter, setFilter] = useState<'todos' | 'enviado' | 'pendiente'>('todos');
  const [visible, setVisible] = useState(false);
  const [clienteSeleccionado, setClienteSeleccionado] = useState<any>(null);

  const clientesFiltrados =
    filter === 'todos' ? clientes : clientes.filter((c) => c.estado.toLowerCase() === filter);

  return (
    <Layout style={[styles.container, { backgroundColor: darkMode ? '#1E1E1E' : '#F3F3F3' }]}>
      <Text category="h5" style={[styles.title, { color: darkMode ? '#fff' : '#222' }]}>
        Clientes o Campaña
      </Text>

      <Input
        placeholder="Nombre o Cédula"
        accessoryLeft={<Icon name="search-outline" />}
        style={styles.input}
        textStyle={{ color: darkMode ? '#fff' : '#222' }}
      />

      {Platform.OS === 'web' ? (
        <select
          value={selectedCampaignIndex.row}
          onChange={(e) => setSelectedCampaignIndex(new IndexPath(parseInt(e.target.value)))}
          style={{
            marginTop: 8,
            marginBottom: 8,
            padding: 8,
            borderRadius: 4,
            color: darkMode ? '#fff' : '#222',
            backgroundColor: darkMode ? '#333' : '#fff',
          }}
        >
          {campaigns.map((c, i) => (
            <option key={i} value={i}>
              {c}
            </option>
          ))}
        </select>
      ) : (
        <Select
          selectedIndex={selectedCampaignIndex}
          onSelect={(index) => setSelectedCampaignIndex(index as IndexPath)}
          placeholder="Seleccionar campaña"
          value={selectedCampaignIndex ? campaigns[selectedCampaignIndex.row] : undefined}
          style={styles.select}
        >
          {campaigns.map((c, i) => (
            <SelectItem key={i.toString()} title={c} />
          ))}
        </Select>
      )}

      <View style={styles.filters}>
        <Button
          size="small"
          style={styles.filterBtn}
          status={filter === 'todos' ? 'primary' : 'basic'}
          onPress={() => setFilter('todos')}
        >
          Todos
        </Button>
        <Button
          size="small"
          style={styles.filterBtn}
          status={filter === 'enviado' ? 'primary' : 'basic'}
          onPress={() => setFilter('enviado')}
        >
          Enviado
        </Button>
        <Button
          size="small"
          style={styles.filterBtn}
          status={filter === 'pendiente' ? 'primary' : 'basic'}
          onPress={() => setFilter('pendiente')}
        >
          Pendiente
        </Button>
      </View>

      <ScrollView style={styles.list}>
        {clientesFiltrados.map((c) => (
          <ClickableCard
            key={c.id}
            darkMode={darkMode}
            cliente={c}
            onPress={() => {
              setClienteSeleccionado(c);
              setVisible(true);
            }}
          />
        ))}
      </ScrollView>

      <Button appearance="outline" style={styles.backBtn} onPress={() => navigation.goBack()}>
        Atrás
      </Button>

      {Platform.OS === 'web' ? (
        <WebModal visible={visible} onClose={() => setVisible(false)}>
          {clienteSeleccionado && (
            <>
              <Text category="h6" style={{ textAlign: 'center', marginBottom: 8 }}>
                Detalles del Cliente
              </Text>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: '#ccc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name="person" width={32} height={32} fill={darkMode ? '#fff' : '#222'} />
                </div>
                <div style={{ marginLeft: 12 }}>
                  <div>{clienteSeleccionado.nombre}</div>
                  <div style={{ color: '#888' }}>C.I {clienteSeleccionado.ci}</div>
                  <div style={{ color: clienteSeleccionado.estado === 'Enviado' ? 'green' : 'orange' }}>
                    Estado: {clienteSeleccionado.estado}
                  </div>
                </div>
              </div>
              <Button style={{ marginTop: 12 }} onPress={() => setVisible(false)}>
                Cerrar
              </Button>
            </>
          )}
        </WebModal>
      ) : (
        <Card disabled={true} style={styles.modalCard}>
          {clienteSeleccionado && (
            <>
              <Text category="h6" style={{ textAlign: 'center', marginBottom: 8 }}>
                Detalles del Cliente
              </Text>
              <View style={styles.modalRow}>
                <View style={styles.avatar}>
                  <Icon name="person" width={32} height={32} fill={darkMode ? '#fff' : '#222'} />
                </View>
                <View style={{ marginLeft: 12 }}>
                  <Text category="s1">{clienteSeleccionado.nombre}</Text>
                  <Text appearance="hint">C.I {clienteSeleccionado.ci}</Text>
                  <Text status={clienteSeleccionado.estado === 'Enviado' ? 'success' : 'warning'}>
                    Estado: {clienteSeleccionado.estado}
                  </Text>
                </View>
              </View>
              <Button style={{ marginTop: 12 }} onPress={() => setVisible(false)}>
                Cerrar
              </Button>
            </>
          )}
        </Card>
      )}
    </Layout>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { marginBottom: 8, textAlign: 'center' },
  input: { marginVertical: 8 },
  select: { marginVertical: 8 },
  filters: { flexDirection: 'row', justifyContent: 'center', marginVertical: 8 },
  filterBtn: { marginHorizontal: 4 },
  list: { flex: 1, marginVertical: 8 },
  card: { marginVertical: 4 },
  row: { flexDirection: 'row', alignItems: 'center' },
  info: { marginLeft: 12 },
  backBtn: { marginTop: 8 },
  modalCard: { width: 300, padding: 16 },
  modalRow: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center' },
});
