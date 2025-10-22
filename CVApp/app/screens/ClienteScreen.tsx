import { SvgXml } from 'react-native-svg';
import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, Platform, Linking} from 'react-native';
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
  <path fill="#25D366" d="M380.9 97.1C339-44 208.2-5.3 145 52c-63.3 57.3-63.7 150.5-17.5 205.1L32 480l238-95.1c54.5 46.3 147.8 45.8 205.1-17.5 57.3-63.2 96-194-22.2-275.3zM224 405c-57.6 0-103.6-18.9-141-57.3l-7-6.9 26-66.4-9.1-5.9c-41.4-26.9-59.2-77.3-42.6-123.8 22.6-59.3 86.3-93.4 147.8-79.4 41.6 9.4 76.8 40.1 93.1 78.5 16.7 39.1 6.3 86.6-25 115.9l-10.6 10.6 3 17.3c4.6 27.2-4.8 55.2-25.7 75.2-17.2 16.8-40.7 26-64.3 26zm54.6-125.1l-8.1-3.7c-4.2-2-24.9-12.2-28.8-13.6-3.9-1.4-6.7-2-9.5 2-2.8 4-11 13.6-13.5 16.3-2.5 2.7-5 3-9.2 1.1-4.2-1.9-17.9-6.6-34.2-21-12.6-11-21-24.6-23.5-28.8-2.5-4.2-.3-6.5 1.5-8.6 1.5-1.5 3.3-3.9 5-5.8 1.7-1.9 2.2-3.3 3.3-5.5 1.1-2.2.5-4.1-.3-5.8-.8-1.7-9.5-22.9-13-31.4-3.4-8.5-6.9-7.4-9.5-7.5-2.5-.1-5.4-.1-8.2-.1s-6-1-9.1 4.1c-3 5.1-11.5 11.2-11.5 27.3s11.8 31.7 13.4 33.9c1.7 2.2 23.2 35.4 56.2 49.7 32.9 14.3 32.9 9.5 38.8 8.9 5.9-.6 24-9.8 27.4-19.2 3.4-9.3 3.4-17.2 2.4-19.2z"/>
</svg>
`;
export const WhatsAppIcon = (props?: any) => {
  if (Platform.OS === 'web') {
    return (
      <span
        style={{
          display: 'inline-block',
          width: props?.width || 24,
          height: props?.height || 24,
          lineHeight: 0,        // evita que el span agregue espacio vertical
        }}
        dangerouslySetInnerHTML={{
          __html: whatsappSVG.replace(
            /width="[^"]*"|height="[^"]*"/g,
            `width="${props?.width || 24}" height="${props?.height || 24}"`
          ),
        }}
      />
    );
  } else {
    return <SvgXml xml={whatsappSVG} width={props?.width || 24} height={props?.height || 24} {...props} />;
  }
};


const MailIcon = (props: any) => <Icon {...props} name="email-outline" />;

// Componente ClickableCard
const ClickableCard: React.FC<{
  darkMode: boolean;
  cliente: Cliente;
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
        <span style={{ color: darkMode ? '#fff' : '#222', fontWeight: 500 }}>{cliente.Nombre}</span>
        <br />
        <span style={{ color: '#888' }}>C.I {cliente.Cedula}</span>
        <br />
        <span style={{ color: cliente.Estado === 2 ? 'green' : 'orange' }}>
          Estado: {cliente.Estado}
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
            {cliente.Nombre}
          </Text>
          <Text appearance="hint">C.I {cliente.Cedula}</Text>
          <Text status={cliente.Estado === 2 ? 'success' : 'warning'}>
            Estado: {cliente.Estado}
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
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaignIndex, setSelectedCampaignIndex] = useState<IndexPath>(new IndexPath(0));
  const [filter, setFilter] = useState<'todos' | 'enviado' | 'pendiente'>('todos');
  const [visible, setVisible] = useState(false);
  const [clienteSeleccionado, setClienteSeleccionado] = useState<any>(null);
  
  const [clientes, setClientes] = useState<Cliente[]>([]);

  // Filtrado de clientes
  const clientesFiltrados = filter === 'todos' 
  ? clientes 
  : clientes.filter((c) => {
      if (filter === 'enviado') return c.Estado === 2;
      if (filter === 'pendiente') return c.Estado === 1;
      return true;
    });

const fetchClientes = async (codigoCampania: number, signal?: AbortSignal) => {
  try {
    if (!codigoCampania) {
      console.warn("⚠️ Código de campaña no válido:", codigoCampania);
      setClientes([]);
      return;
    }

    const response = await fetch(`${API_BASE}/consultaClienteCampania/${codigoCampania}`, { signal });
    const data = await response.json();

    if (!Array.isArray(data)) {
      console.error("La API de clientes no devolvió un array:", data);
      setClientes([]);
      return;
    }
    setClientes(data);
    console.log("✅ Clientes cargados:", data.length);
  } catch (error:any) {
    if (error.name === 'AbortError') {
      console.log('⚠️ Fetch cancelado por cambio de campaña');
    } else {
      console.error("Error al cargar clientes:", error);
      setClientes([]);
    }
  }
};

    useEffect(() => {
  // 1️⃣ Traer campañas solo al montar el componente
  const fetchCampaigns = async () => {
    try {
      const fechaHoy = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      const usuario = 'admin'; // cambiar por usuario real
      const response = await fetch(`${API_BASE}/consultaCampania/${fechaHoy}/${usuario}`);
      const data = await response.json();

      if (!Array.isArray(data)) {
        console.error("La API no devolvió un array:", data);
        setCampaigns([{ Codigo: 0, Nombre: "-Seleccione-",Mensaje: ""}]);
        return;
      }

      // Agregar la opción por defecto
      const dataWithDefault = [{ Codigo: 0, Nombre: "-Seleccione-" }, ...data];
      setCampaigns(dataWithDefault);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      setCampaigns([{ Codigo: 0, Nombre: "-Seleccione-",Mensaje: ""}]);
    }
  };

  fetchCampaigns();
}, []);

// 2️⃣ Declaras selectedCampaign después de tener campaigns cargadas
const selectedCampaign = campaigns[selectedCampaignIndex.row];

// 3️⃣ Nuevo useEffect que escucha los cambios de campaña seleccionada
useEffect(() => {
  if (!selectedCampaign || selectedCampaign.Codigo === 0) {
    setClientes([]);
    return;
  }

  const controller = new AbortController(); // Creamos un controlador
  fetchClientes(selectedCampaign.Codigo, controller.signal);

  // Cleanup: se ejecuta si selectedCampaign cambia antes de que termine el fetch
  return () => controller.abort();
}, [selectedCampaign]);

const obtenerMensajeTipo = async (Tipo: string) => {
  try {
    const response = await fetch(`${API_BASE}/consultaSaludo/${Tipo}`);
    const data = await response.json();

    return data.Descripcion || '';

  } catch (err) {
    console.error('Error al obtener mensaje tipo', Tipo, err);
    return '';
  }
};

const generarMensajeWhatsApp = async (cliente: Cliente, campaña: Campaign) => {
  if (!cliente || !campaña) return '';

  // Limpiar teléfono
  const partesNombre = cliente.Nombre?.trim().split(' ') || [];
  const nombreMensaje = partesNombre[2] || partesNombre[0] || 'Estimado';
  
  // Mensaje de la Campaña
  const mensajeCampania = campaña.Mensaje || '';

  // Obtener saludo y despedida desde API
  const saludo = await obtenerMensajeTipo('Saludo');
  const saludoNombre = saludo.replace('{nombre}', nombreMensaje); // Reemplazar {nombre} en el saludo de la campaña
  const despedida = await obtenerMensajeTipo('Despedida');

  // Mensaje final
  return `${saludoNombre} ${mensajeCampania} ${despedida}`.trim();
};

const actualizarEstadoCliente = async (codigoCampania: number, cedula: string) => {
  try {
    await fetch(`${API_BASE}/actualizarEstadoCliente`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        CodigoCampania: codigoCampania,
        Cedula: cedula,
        Estado: 2, // enviado
      }),
    });
  } catch (err) {
    console.error('Error al actualizar estado:', err);
  }
};

// COMPONENTES

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

      {/* Combo de campañas */}
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
            <option key={c.Codigo} value={i}>
              {c.Nombre}
            </option>
          ))}
        </select>
      ) : (
        <Select
          selectedIndex={selectedCampaignIndex}
          onSelect={(index) => setSelectedCampaignIndex(index as IndexPath)}
          placeholder="Seleccionar campaña"
          value={selectedCampaign?.Nombre}
          style={styles.select}
        >
          {campaigns.map((c) => (
            <SelectItem key={c.Codigo.toString()} title={c.Nombre} />
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
            key={c.Cedula}
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

      {/* Modal detalles cliente */}
      {Platform.OS === 'web' ? (
        <WebModal visible={visible} onClose={() => setVisible(false)}>
          {clienteSeleccionado && (
            <>
              <Text category="h6" style={{ textAlign: 'center', marginBottom: 8 }}>
                Detalles del Cliente
              </Text>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 32,
                    backgroundColor: '#ccc',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon name="person" width={32} height={32} fill={darkMode ? '#fff' : '#222'} />
                </div>
                <div style={{ marginLeft: 12 }}>
                  <div>{clienteSeleccionado.Nombre}</div>
                  <div style={{ color: '#888' }}>C.I {clienteSeleccionado.Cedula}</div>
                  <div>Teléfono: {clienteSeleccionado.Telefono}</div>
                  <div>Mail: {clienteSeleccionado.Mail}</div>
                  <div>Fecha Envío: {clienteSeleccionado.FechaEnvio || 'No disponible'}</div>
                  <div style={{ color: clienteSeleccionado.Estado === 2 ? 'green' : 'orange' }}>
                      Estado: {clienteSeleccionado.Estado === 2 ? 'Enviado' : 'Pendiente'}
                </div>
                </div>
              </div>
              {/* Aquí van los botones de WhatsApp y Mail */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16 }}>
        <Button
          accessoryLeft={WhatsAppIcon}
          style={{ flex: 1, marginRight: 8 }}
          onPress={async () => {
            
           const phone = clienteSeleccionado.Telefono.replace(/[^0-9]/g, '').replace(/^0/, '593');
           const mensaje = await generarMensajeWhatsApp(clienteSeleccionado, selectedCampaign);

            // Abrir WhatsApp Web con el mensaje
            const url = `https://web.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(mensaje)}`;
            window.open(url, '_blank');

            // Actualizar estado y fecha de envío
            actualizarEstadoCliente(clienteSeleccionado.CodigoCampania, clienteSeleccionado.Cedula);

            // Actualizar estado en la UI
            const fecha = new Date().toISOString();
            setClienteSeleccionado({ ...clienteSeleccionado, Estado: 2, FechaEnvio: fecha });
            setClientes((prev) =>
              prev.map((c) =>
                c.Cedula === clienteSeleccionado.Cedula && c.CodigoCampania === clienteSeleccionado.CodigoCampania
                  ? { ...c, Estado: 2, FechaEnvio: fecha }
                  : c
              )
            );
          }}
        >
          WhatsApp
        </Button>
        {/* <Button
          accessoryLeft={MailIcon}
          style={{ flex: 1 }}
          onPress={() => {
            window.location.href = `mailto:${clienteSeleccionado.Mail}`;
          }}
        >
          Mail
        </Button> */}
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
                  <Text category="s1">{clienteSeleccionado.Nombre}</Text>
                  <Text appearance="hint">C.I {clienteSeleccionado.Cedula}</Text>
                  <Text>Teléfono: {clienteSeleccionado.Telefono}</Text>
                  <Text>Mail: {clienteSeleccionado.Mail}</Text>
                  <Text>Fecha Envío: {clienteSeleccionado.FechaEnvio || 'No disponible'}</Text>
                  <Text status={clienteSeleccionado.Estado === 2 ? 'success' : 'warning'}>
                    Estado: {clienteSeleccionado.Estado === 2 ? 'Enviado': 'Pendiente'}
                  </Text>
                </View>
              </View>
{/* Botones WhatsApp y Mail */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 }}>
        <Button
          accessoryLeft={WhatsAppIcon}
          style={{ flex: 1, marginRight: 8 }}
          onPress={async() => {
           const phone = clienteSeleccionado.Telefono.replace(/[^0-9]/g, '').replace(/^0/, '593');
           const mensaje = await generarMensajeWhatsApp(clienteSeleccionado, selectedCampaign);
           
           Linking.openURL(`https://wa.me/${phone}?text=${encodeURIComponent(mensaje)}`).catch(err => console.error(err));

           // Actualizar estado y fecha de envío
            actualizarEstadoCliente(clienteSeleccionado.CodigoCampania, clienteSeleccionado.Cedula);

            // Actualizar estado en la UI
            const fecha = new Date().toISOString();
            setClienteSeleccionado({ ...clienteSeleccionado, Estado: 2, FechaEnvio: fecha });
            setClientes((prev) =>
              prev.map((c) =>
                c.Cedula === clienteSeleccionado.Cedula && c.CodigoCampania === clienteSeleccionado.CodigoCampania
                  ? { ...c, Estado: 2, FechaEnvio: fecha }
                  : c
              )
            );

          }}
        >
          WhatsApp
        </Button>
        {/* <Button
          accessoryLeft={MailIcon}
          style={{ flex: 1 }}
          onPress={() => {
            const url = `mailto:${clienteSeleccionado.Mail}`;
            Linking.openURL(url).catch(err => console.error('Error opening mail', err));
          }}
        >
          Mail
        </Button> */}
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
