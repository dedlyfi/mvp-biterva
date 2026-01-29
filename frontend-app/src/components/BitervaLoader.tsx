import React, { useEffect, useRef } from 'react';
import { Animated, View, Image, StyleSheet, Easing } from 'react-native';

const appIcon = require('../assets/images/app_icon.png');

interface BitervaLoaderProps {
  size?: number;
}

export const BitervaLoader = ({ size = 30 }: BitervaLoaderProps) => {
  const pulseAnim = useRef(new Animated.Value(0.8)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease)
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.8,
          duration: 1000,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease)
        }),
      ])
    ).start();

    // Subtle rotation animation
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 3000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.iconContainer,
          {
            width: size,
            height: size,
            transform: [
                { scale: pulseAnim },
                { rotate: spin }
            ],
            opacity: pulseAnim.interpolate({
                inputRange: [0.8, 1.1],
                outputRange: [0.7, 1]
            })
          },
        ]}
      >
        <Image 
          source={appIcon} 
          style={{ width: '100%', height: '100%' }} 
          resizeMode="contain" 
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
