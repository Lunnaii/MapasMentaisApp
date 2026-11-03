import { useEffect, useRef, useState } from 'react';
import { Animated, Modal, Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { auth } from '../services/firebase';
import styles from '../styles/styles';
import PainelConta from './PainelConta';

export default function MainScreen() {
  const insets = useSafeAreaInsets();
  const [painelMontado, setPainelMontado] = useState(false);
  const [painelAberto, setPainelAberto] = useState(false);
  const deslocamento = useRef(new Animated.Value(-1000)).current;

  useEffect(() => {
    if (!painelMontado) return;

    Animated.timing(deslocamento, {
      toValue: painelAberto ? 0 : -1000,
      duration: 240,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished && !painelAberto) setPainelMontado(false);
    });
  }, [deslocamento, painelAberto, painelMontado]);

  function abrirPainel() {
    setPainelMontado(true);
    setPainelAberto(true);
  }

  function fecharPainel() {
    setPainelAberto(false);
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.texto}>Você entrou como {auth.currentUser?.email}.</Text>

      <Pressable
        style={[styles.botaoConta, { bottom: insets.bottom + 16 }]}
        onPress={abrirPainel}
        accessibilityRole="button"
        accessibilityLabel="Abrir informações do usuário"
      >
        <View style={styles.iconeConta}>
          <Ionicons name="person" size={24} color="#608ff4" />
        </View>
        <Text style={styles.textoBotaoConta}>Conta</Text>
      </Pressable>

      <Modal
        visible={painelMontado}
        transparent
        animationType="none"
        onRequestClose={fecharPainel}
      >
        <View style={styles.fundoPainel}>
          <Pressable
            style={styles.sobreposicaoPainel}
            onPress={fecharPainel}
            accessibilityRole="button"
            accessibilityLabel="Fechar informações do usuário"
          />
          <Animated.View
            style={[styles.painelConta, { transform: [{ translateY: deslocamento }] }]}
          >
            <SafeAreaView edges={['top', 'left', 'right']}>
              <PainelConta onClose={fecharPainel} />
            </SafeAreaView>
          </Animated.View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}