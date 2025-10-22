import React from 'react';
import { Modal, Card, Text, Button, Icon } from '@ui-kitten/components';

type CustomModalProps = {
  visible: boolean;
  type?: 'success' | 'error' | 'warning' | 'info';
  message: string;
  onClose: () => void;
};

const iconConfig = {
  success: { name: 'checkmark-circle-2', color: '#4CAF50', status: 'success', buttonText: 'Aceptar' },
  error: { name: 'alert-triangle-outline', color: '#E53935', status: 'danger', buttonText: 'Cerrar' },
  warning: { name: 'alert-circle-outline', color: '#FFC107', status: 'warning', buttonText: 'Entendido' },
  info: { name: 'info-outline', color: '#2196F3', status: 'info', buttonText: 'OK' },
};

export default function CustomModal({ visible, type = 'info', message, onClose }: CustomModalProps) {
  const config = iconConfig[type] || iconConfig.info;

  return (
    <Modal
      visible={visible}
      backdropStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      onBackdropPress={onClose}
    >
      <Card disabled={true} style={{ alignItems: 'center', padding: 20, minWidth: 280 }}>
        <Icon
          name={config.name}
          fill={config.color}
          style={{ width: 50, height: 50, marginBottom: 10 }}
        />
        <Text category="h6" style={{ marginBottom: 10, textAlign: 'center', color: config.color }}>
          {message}
        </Text>
        <Button appearance="filled" status={config.status} onPress={onClose}>
          {config.buttonText}
        </Button>
      </Card>
    </Modal>
  );
}
