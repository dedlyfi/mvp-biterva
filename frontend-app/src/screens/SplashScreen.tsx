import React, { useEffect, useRef } from 'react';
import { View, Image, Animated, Dimensions, StatusBar } from 'react-native';
import { useWalletStore } from '../store/useWalletStore';

const { width, height } = Dimensions.get('window');
const splashImg = require('../assets/images/splash.png');

export const SplashScreen = ({ navigation }: any) => {
    const { boot } = useWalletStore();
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(1.1)).current;

    useEffect(() => {
        // Entrance animation
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
                toValue: 1,
                duration: 3000,
                useNativeDriver: true,
            })
        ]).start();

        // Check wallet and navigate
        const init = async () => {
            const startTime = Date.now();
            await boot();
            const endTime = Date.now();
            const elapsed = endTime - startTime;
            
            // Ensure splash shows for at least 2.5 seconds for branding impact
            const waitTime = Math.max(0, 2500 - elapsed);
            
            setTimeout(() => {
                Animated.timing(fadeAnim, {
                    toValue: 0,
                    duration: 500,
                    useNativeDriver: true,
                }).start(() => {
                    navigation.replace('Home');
                });
            }, waitTime);
        };

        init();
    }, []);

    return (
        <View className="flex-1 bg-black items-center justify-center">
            <StatusBar hidden />
            <Animated.View 
                style={{ 
                    width: width, 
                    height: height,
                    opacity: fadeAnim,
                    transform: [{ scale: scaleAnim }]
                }}
            >
                <Image 
                    source={splashImg} 
                    style={{ width: '100%', height: '100%' }} 
                    resizeMode="cover"
                />
            </Animated.View>
        </View>
    );
};
