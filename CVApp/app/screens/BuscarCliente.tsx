// import React, { useState } from 'react';
// import { Layout, Text, Input, Button, Spinner, Card } from '@ui-kitten/components';

// const BuscarCliente: React.FC = () => {
//   const [cedula, setCedula] = useState<string>('');
//   const [cliente, setCliente] = useState<Record<string, any> | null>(null);
//   const [mensaje, setMensaje] = useState<string>('');
//   const [cargando, setCargando] = useState<boolean>(false);

//   const buscarCliente = async (): Promise<void> => {
//     setCargando(true);
//     setMensaje('');
//     setCliente(null);

//     try {
//       const response = await fetch('http://192.168.6.218:8000/cliente/');
//       const data = await response.json();

//       if (data.mensaje) {
//         setMensaje(data.mensaje);
//       } else {
//         setCliente(data);
//       }
//     } catch {
//       setMensaje('Error al conectar con la API');
//     } finally {
//       setCargando(false);
//     }
//   };

//   return (
//     <Layout style={{ flex: 1, padding: 20, paddingTop: 60 }}>
//       <Text category="h4" style={{ textAlign: 'center', marginBottom: 20 }}>
//         Buscar Cliente
//       </Text>

//       <Input
//         placeholder="Ingrese cédula"
//         value={cedula}
//         keyboardType="numeric"
//         onChangeText={setCedula}
//         style={{ marginBottom: 16 }}
//       />

//       <Button onPress={buscarCliente}>Buscar</Button>

//       {cargando && (
//         <Layout style={{ marginTop: 20, alignItems: 'center' }}>
//           <Spinner size="large" />
//         </Layout>
//       )}

//       {mensaje !== '' && (
//         <Text status="danger" style={{ marginTop: 20 }}>
//           {mensaje}
//         </Text>
//       )}

//       {cliente && (
//         <Card style={{ marginTop: 20 }}>
//           <Text category="h6" style={{ marginBottom: 10 }}>
//             Datos del cliente:
//           </Text>
//           {Object.entries(cliente).map(([key, value]) => (
//             <Text key={key}>
//               <Text style={{ fontWeight: 'bold' }}>{key}:</Text> {String(value)}
//             </Text>
//           ))}
//         </Card>
//       )}
//     </Layout>
//   );
// };

// export default BuscarCliente;
