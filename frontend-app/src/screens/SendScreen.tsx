import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, StatusBar, StyleSheet, Dimensions, PermissionsAndroid, Platform, Alert } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming } from 'react-native-reanimated';
import { Camera, useCameraDevice, useCodeScanner } from 'react-native-vision-camera';
import { useWalletStore } from '../store/useWalletStore';
import { X, Keyboard, Scan, Zap, AlertTriangle } from 'lucide-react-native';
import { BitervaPageLoader } from '../components/BitervaPageLoader';
import { BitervaModal } from '../components/BitervaModal';

const { width } = Dimensions.get('window');

export const SendScreen = ({ navigation }: any) => {
    const { sendPayment, isLoading } = useWalletStore();
    const [invoice, setInvoice] = useState('');
    const [showManual, setShowManual] = useState(false);
    const [hasPermission, setHasPermission] = useState(false);
    
    // Modal state
    const [modalConfig, setModalConfig] = useState<{
        visible: boolean;
        type: 'success' | 'error' | 'info' | 'insufficient_balance';
        title: string;
        message: string;
    }>({
        visible: false,
        type: 'info',
        title: '',
        message: '',
    });

    const device = useCameraDevice('back');
    const [isScanning, setIsScanning] = useState(true);
    const scanLineAnim = useSharedValue(0);

    const codeScanner = useCodeScanner({
        codeTypes: ['qr'],
        onCodeScanned: (codes) => {
            if (isScanning && codes.length > 0 && codes[0].value) {
                const scannedValue = codes[0].value;
                console.log('🔍 [SendScreen] Code scanned:', scannedValue);
                setIsScanning(false);
                setInvoice(scannedValue);
                handleSend(scannedValue);
                
                // Reactive scanning after a delay
                setTimeout(() => setIsScanning(true), 5000);
            }
        }
    });

    useEffect(() => {
        const init = async () => {
            await checkCameraPermission();
            scanLineAnim.value = withRepeat(
                withTiming(1, { duration: 2500 }),
                -1,
                true
            );
        };
        init();
    }, []);

    const animatedLineStyle = useAnimatedStyle(() => ({
        top: `${scanLineAnim.value * 100}%`,
    }));

    const checkCameraPermission = async () => {
        const status = Camera.getCameraPermissionStatus();
        if (status === 'granted') {
            setHasPermission(true);
        } else if (Platform.OS === 'android') {
            const granted = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.CAMERA);
            setHasPermission(granted);
        }
    };

    const requestPermission = async () => {
        console.log('📸 [SendScreen] Requesting camera permission...');
        const newPermission = await Camera.requestCameraPermission();
        if (newPermission === 'granted') {
            setHasPermission(true);
        } else if (Platform.OS === 'android') {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.CAMERA,
                {
                    title: "Permiso de Cámara Biterva",
                    message: "Biterva necesita acceso a tu cámara para escanear códigos QR.",
                    buttonNeutral: "Luego",
                    buttonNegative: "No",
                    buttonPositive: "Sí"
                }
            );
            if (granted === PermissionsAndroid.RESULTS.GRANTED) setHasPermission(true);
        }
    };

    const handleSend = async (code?: string) => {
        let payload = (code || invoice).trim();
        
        // Sanitize: REMOVE 'lightning:' prefix if exists (Case Insensitive)
        if (payload.toLowerCase().startsWith('lightning:')) {
            payload = payload.substring(10);
            console.log('🧹 [SendScreen] Sanitized invoice:', payload);
        }

        if (!payload) {
            setModalConfig({
                visible: true,
                type: 'error',
                title: 'Código Vacío',
                message: 'Por favor ingresa o escanea un código para continuar.',
            });
            return;
        }

        try {
            await sendPayment(payload);
            setModalConfig({
                visible: true,
                type: 'success',
                title: '¡Pago Enviado!',
                message: 'Tus satoshis han sido transmitidos exitosamente.',
            });
        } catch (e: any) {
            const errorMsg = e.response?.data?.message || e.message || "Error en el pago";
            setModalConfig({
                visible: true,
                type: errorMsg.includes('insuficiente') ? 'insufficient_balance' : 'error',
                title: errorMsg.includes('insuficiente') ? 'Saldo Insuficiente' : 'Error',
                message: errorMsg,
            });
        }
    };

    const renderScanner = () => (
        <View style={styles.overlay}>
            {device ? (
                <Camera
                    style={StyleSheet.absoluteFill}
                    device={device}
                    isActive={!modalConfig.visible && !isLoading && !showManual}
                    codeScanner={codeScanner}
                />
            ) : (
                <View style={styles.noDevice}>
                    <Text style={styles.noDeviceText}>No se detectó cámara física</Text>
                </View>
            )}
            
            <View style={styles.cameraOverlay}>
                <View style={styles.scannerFrame}>
                    <View style={styles.cornerTopLeft} />
                    <View style={styles.cornerTopRight} />
                    <View style={styles.cornerBottomLeft} />
                    <View style={styles.cornerBottomRight} />
                    <Animated.View style={[styles.scanLine, animatedLineStyle]} />
                    <Zap color="rgba(234, 179, 8, 0.4)" size={80} strokeWidth={1} />
                </View>
                <View style={styles.hintContainer}>
                    <Text style={styles.scanHint}>Escaneando código QR...</Text>
                    <Text style={styles.scanSubtitle}>Paga al instante con Lightning</Text>
                </View>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
            <BitervaPageLoader visible={isLoading} />
            <BitervaModal {...modalConfig} onClose={() => {
                const wasSuccess = modalConfig.type === 'success';
                setModalConfig({ ...modalConfig, visible: false });
                if (wasSuccess) navigation.goBack();
            }} />

            <View style={styles.cameraContainer}>
                {!hasPermission ? (
                    <View style={styles.permissionDenied}>
                        <View style={styles.warningCircle}>
                            <AlertTriangle color="#EAB308" size={32} />
                        </View>
                        <Text style={styles.permissionTitle}>Permiso de Cámara</Text>
                        <Text style={styles.permissionDesc}>Escanea códigos Lightning habilitando la cámara.</Text>
                        <TouchableOpacity onPress={requestPermission} style={styles.permissionBtn}>
                            <Text style={styles.permissionBtnText}>Habilitar</Text>
                        </TouchableOpacity>
                    </View>
                ) : renderScanner()}
            </View>

            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
                <X color="white" size={24} />
            </TouchableOpacity>

            <View style={styles.bottomBar}>
                {showManual ? (
                    <View>
                        <View style={styles.inputBox}>
                            <TextInput 
                                style={styles.textInput}
                                placeholder="lnbc1..."
                                placeholderTextColor="#444"
                                value={invoice}
                                onChangeText={setInvoice}
                                multiline
                                autoFocus
                            />
                        </View>
                        <View style={styles.actionRow}>
                             <TouchableOpacity onPress={() => setShowManual(false)} style={styles.iconBtn}>
                                <Scan color="white" size={20} />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => handleSend()} style={styles.payBtn}>
                                <Text style={styles.payBtnText}>Confirmar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ) : (
                    <TouchableOpacity style={styles.keyboardToggle} onPress={() => setShowManual(true)}>
                        <Keyboard color="#EAB308" size={20} style={{ marginRight: 15 }} />
                        <Text style={styles.keyboardToggleText}>Ingresar manualmente</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: 'black' },
    cameraContainer: { flex: 1, backgroundColor: '#000' },
    permissionDenied: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
    warningCircle: { width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(234, 179, 8, 0.1)', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
    permissionTitle: { color: 'white', fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
    permissionDesc: { color: '#666', textAlign: 'center', fontSize: 14, marginBottom: 30 },
    permissionBtn: { backgroundColor: '#EAB308', paddingHorizontal: 40, paddingVertical: 15, borderRadius: 20 },
    permissionBtnText: { color: 'black', fontWeight: 'bold' },
    overlay: { ...StyleSheet.absoluteFillObject },
    noDevice: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    noDeviceText: { color: '#333', fontSize: 16, fontWeight: 'bold' },
    cameraOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)' },
    scannerFrame: { width: width * 0.7, height: width * 0.7, justifyContent: 'center', alignItems: 'center' },
    scanLine: { position: 'absolute', left: 0, right: 0, height: 2, backgroundColor: '#EAB308', zIndex: 5, shadowColor: '#EAB308', shadowOpacity: 1, shadowRadius: 5 },
    cornerTopLeft: { position: 'absolute', top: 0, left: 0, width: 30, height: 30, borderTopWidth: 4, borderLeftWidth: 4, borderColor: '#EAB308', borderTopLeftRadius: 15 },
    cornerTopRight: { position: 'absolute', top: 0, right: 0, width: 30, height: 30, borderTopWidth: 4, borderRightWidth: 4, borderColor: '#EAB308', borderTopRightRadius: 15 },
    cornerBottomLeft: { position: 'absolute', bottom: 0, left: 0, width: 30, height: 30, borderBottomWidth: 4, borderLeftWidth: 4, borderColor: '#EAB308', borderBottomLeftRadius: 15 },
    cornerBottomRight: { position: 'absolute', bottom: 0, right: 0, width: 30, height: 30, borderBottomWidth: 4, borderRightWidth: 4, borderColor: '#EAB308', borderBottomRightRadius: 15 },
    hintContainer: { marginTop: 40, alignItems: 'center' },
    scanHint: { color: 'white', fontSize: 14, fontWeight: 'bold' },
    scanSubtitle: { color: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: 'bold', marginTop: 5, textTransform: 'uppercase' },
    closeButton: { position: 'absolute', top: 50, right: 20, zIndex: 10, backgroundColor: 'rgba(0,0,0,0.5)', padding: 10, borderRadius: 20 },
    bottomBar: { position: 'absolute', bottom: 0, width: '100%', backgroundColor: '#080808', borderTopLeftRadius: 30, borderTopRightRadius: 30, paddingHorizontal: 25, paddingTop: 25, paddingBottom: 40, borderTopWidth: 1, borderTopColor: '#111' },
    keyboardToggle: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 15, backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 20 },
    keyboardToggleText: { color: '#EAB308', fontSize: 15, fontWeight: 'bold' },
    inputBox: { backgroundColor: '#111', borderRadius: 20, padding: 15, minHeight: 80, marginBottom: 15, borderWidth: 1, borderColor: '#222' },
    textInput: { color: 'white', fontSize: 14 },
    actionRow: { flexDirection: 'row', gap: 10 },
    iconBtn: { width: 54, height: 54, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center' },
    payBtn: { flex: 1, backgroundColor: '#EAB308', borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
    payBtnText: { color: 'black', fontSize: 16, fontWeight: '900' },
});
