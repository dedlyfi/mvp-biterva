import React from 'react';
import { View, StyleSheet, Dimensions, Animated, Text } from 'react-native';
import { BitervaLoader } from './BitervaLoader';

const { width, height } = Dimensions.get('window');

interface BitervaPageLoaderProps {
  visible: boolean;
  message?: string;
}

export const BitervaPageLoader = ({ visible, message = "Procesando cobro..." }: BitervaPageLoaderProps) => {
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
      <View style={styles.blurContainer}>
        <BitervaLoader size={100} />
        <Text style={styles.message}>{message}</Text>
        <Text style={styles.subMessage}>Asegurando la red Bitcoin...</Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    zIndex: 9999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  blurContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  message: {
    color: '#EAB308',
    fontSize: 24,
    fontWeight: '900',
    marginTop: 40,
    letterSpacing: -0.5,
  },
  subMessage: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 10,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
});
