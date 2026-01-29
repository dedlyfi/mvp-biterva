import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, Dimensions, Animated } from 'react-native';
import { CheckCircle2, AlertCircle, XCircle, Zap, Info, TriangleAlert } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export interface BitervaModalProps {
    visible: boolean;
    type: 'success' | 'error' | 'info' | 'insufficient_balance';
    title: string;
    message: string;
    onClose: () => void;
    onAction?: () => void;
    actionLabel?: string;
}

export const BitervaModal: React.FC<BitervaModalProps> = ({ 
    visible, 
    type, 
    title, 
    message, 
    onClose, 
    onAction, 
    actionLabel 
}) => {
    // Icon selection
    const getIcon = () => {
        switch (type) {
            case 'success': return <CheckCircle2 color="#4ADE80" size={60} />;
            case 'error': return <XCircle color="#F87171" size={60} />;
            case 'insufficient_balance': return <TriangleAlert color="#EAB308" size={60} />;
            case 'info': return <Info color="#60A5FA" size={60} />;
            default: return <Zap color="#EAB308" size={60} />;
        }
    };

    const getPrimaryColor = () => {
        switch (type) {
            case 'success': return '#4ADE80';
            case 'error': return '#F87171';
            case 'insufficient_balance': return '#EAB308';
            case 'info': return '#60A5FA';
            default: return '#EAB308';
        }
    };

    return (
        <Modal
            transparent
            visible={visible}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.modalContainer}>
                    {/* Glassmorphism Background layer */}
                    <View style={styles.glassBackground} />
                    
                    {/* Content */}
                    <View style={styles.content}>
                        <View style={[styles.iconContainer, { borderColor: getPrimaryColor() + '20' }]}>
                             {getIcon()}
                        </View>

                        <Text style={styles.title}>{title}</Text>
                        <Text style={styles.message}>{message}</Text>

                        <View style={styles.buttonContainer}>
                            {onAction && actionLabel && (
                                <TouchableOpacity 
                                    onPress={onAction}
                                    style={[styles.primaryButton, { backgroundColor: getPrimaryColor() }]}
                                >
                                    <Text style={styles.primaryButtonText}>{actionLabel}</Text>
                                </TouchableOpacity>
                            )}
                            
                            <TouchableOpacity 
                                onPress={onClose}
                                style={onAction ? styles.secondaryButton : styles.soloButton}
                            >
                                <Text style={styles.buttonText}>
                                    {onAction ? 'Cerrar' : 'Aceptar'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Aura Decoration */}
                    <View style={[styles.aura, { backgroundColor: getPrimaryColor() }]} />
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.85)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    modalContainer: {
        width: '100%',
        maxWidth: 400,
        borderRadius: 40,
        overflow: 'hidden',
        position: 'relative',
        backgroundColor: '#0A0A0A',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
    },
    glassBackground: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255,255,255,0.02)',
    },
    content: {
        padding: 32,
        alignItems: 'center',
        zIndex: 2,
    },
    iconContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
        borderWidth: 1,
    },
    title: {
        color: 'white',
        fontSize: 24,
        fontWeight: '900',
        textAlign: 'center',
        marginBottom: 12,
        letterSpacing: 0.5,
    },
    message: {
        color: '#888',
        fontSize: 15,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 32,
    },
    buttonContainer: {
        width: '100%',
        gap: 12,
    },
    primaryButton: {
        width: '100%',
        paddingVertical: 18,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: 'black',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
    },
    primaryButtonText: {
        color: 'black',
        fontSize: 16,
        fontWeight: '900',
        textTransform: 'uppercase',
    },
    secondaryButton: {
        width: '100%',
        paddingVertical: 18,
        borderRadius: 24,
        backgroundColor: 'rgba(255,255,255,0.05)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    soloButton: {
        width: '100%',
        paddingVertical: 18,
        borderRadius: 24,
        backgroundColor: '#111',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    aura: {
        position: 'absolute',
        top: -100,
        left: '25%',
        width: '50%',
        height: 200,
        borderRadius: 100,
        opacity: 0.1,
        transform: [{ scaleX: 2 }],
        filter: 'blur(60px)', // Note: standard CSS filter doesn't work in RN without extra libs, but we use opacity/colors
    }
});
