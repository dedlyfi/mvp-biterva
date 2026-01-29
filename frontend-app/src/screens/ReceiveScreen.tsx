import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Share, Alert, StatusBar, TextInput, StyleSheet, Animated } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { useWalletStore } from '../store/useWalletStore';
import { X, Copy, Share2, User, CheckCircle2 } from 'lucide-react-native';
import { BitervaPageLoader } from '../components/BitervaPageLoader';

// Definimos un helper seguro para Clipboard para evitar errores de contexto
const setClipboardContent = (text: string) => {
    try {
        const { Clipboard } = require('react-native');
        Clipboard.setString(text);
        return true;
    } catch (e) {
        console.warn("Clipboard not available");
        return false;
    }
};

export const ReceiveScreen = ({ navigation }: any) => {
    const { user: currentUser, generateInvoice, isLoading, boot, btcPrice, fetchPrice, balance, syncBalance } = useWalletStore();
    const initialBalance = useRef(balance);

    useEffect(() => {
        if (!currentUser) boot();
        fetchPrice();
        initialBalance.current = balance;
    }, []);

    const [fontSize, setFontSize] = useState(80);
    const [amountCOP, setAmountCOP] = useState('');
    const [amountSats, setAmountSats] = useState('0');
    const [concepto, setConcepto] = useState('');
    const [invoice, setInvoice] = useState('');
    const [isEditing, setIsEditing] = useState(true);
    const [isCopied, setIsCopied] = useState(false);
    const [isPaid, setIsPaid] = useState(false);

    const lightningAddress = currentUser?.id ? `${currentUser.id.substring(0, 8)}@biterva.com` : 'user@biterva.com';

    // Payment detection polling
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (invoice && !isPaid) {
            interval = setInterval(async () => {
                await syncBalance();
            }, 3000);
        }
        return () => clearInterval(interval);
    }, [invoice, isPaid]);

    // Check if paid
    useEffect(() => {
        if (invoice && balance > initialBalance.current && !isPaid) {
            setIsPaid(true);
            // Wow effect: small delay then go back
            setTimeout(() => {
                navigation.goBack();
            }, 3000);
        }
    }, [balance, invoice]);

    // Helper to format currency
    const formatCOP = (text: string) => {
        const cleanNumber = text.replace(/[^0-9]/g, '');
        if (!cleanNumber) return '';
        return cleanNumber.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    };

    const handleTextChange = (text: string) => {
        const formatted = formatCOP(text);
        setAmountCOP(formatted);
        
        const rawValue = text.replace(/[^0-9]/g, '');
        
        // GrowthHacking UX: Dynamic font size based on length
        if (rawValue.length > 9) setFontSize(35);
        else if (rawValue.length > 6) setFontSize(50);
        else setFontSize(80);

        if (rawValue && btcPrice > 0) {
            const safePrice = btcPrice * 0.995;
            const calculatedSats = Math.ceil((Number(rawValue) / safePrice) * 100000000);
            setAmountSats(calculatedSats.toString());
        } else {
            setAmountSats('0');
        }
    };

    const handleCreate = async () => {
        const amt = Number(amountSats) || 0;
        if (amt <= 0) {
            Alert.alert('Error', 'Ingresa una cantidad válida');
            return;
        }

        try {
            initialBalance.current = balance; // Reset base balance for detection
            const data = await generateInvoice(amt, concepto || "Pago Biterva");
            setInvoice(data.payment_request);
            setIsEditing(false);
        } catch (e: any) {
            console.error('GEN_INV_ERROR:', e);
            Alert.alert('Error', e.message || 'No se pudo generar el cobro. Verifica tu conexión.');
        }
    };

    const copyToClipboard = () => {
        if (invoice) {
            const success = setClipboardContent(invoice);
            if (success) {
                setIsCopied(true);
                setTimeout(() => setIsCopied(false), 2000);
            }
        }
    };

    const shareInvoice = async () => {
        if (invoice) {
            try {
                await Share.share({ message: invoice });
            } catch (error: any) {
                Alert.alert(error.message);
            }
        }
    };

    if (isPaid) {
        return (
            <View style={[styles.container, styles.paidContainer]}>
                <StatusBar barStyle="light-content" />
                <CheckCircle2 color="#4ADE80" size={120} />
                <Text style={styles.paidTitle}>¡PAGO RECIBIDO!</Text>
                <Text style={styles.paidSubtitle}>Tus satoshis ya están en camino</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            
            <BitervaPageLoader visible={isLoading} message="Brillando tu código..." />

            {/* Header */}
            <View style={styles.header}>
                <View style={{ width: 44 }} />
                <Text style={styles.headerTitle}>Recibir Pago</Text>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <X color="white" size={28} />
                </TouchableOpacity>
            </View>

            <View style={styles.content}>
                {isEditing ? (
                    <View style={styles.editorContainer}>
                        <Text style={styles.editorLabel}>
                            Monto a recibir (COP)
                        </Text>
                        <View style={styles.inputWrapper}>
                            <Text style={styles.currencySymbol}>$</Text>
                            <TextInput 
                                style={[styles.textInput, { fontSize }]}
                                keyboardType="numeric"
                                value={amountCOP}
                                onChangeText={handleTextChange}
                                placeholder="0"
                                placeholderTextColor="#222"
                                autoFocus
                                maxLength={12}
                            />
                        </View>
                        <Text style={styles.satsLabel}>
                            {Number(amountSats).toLocaleString('es-CO')} satoshis
                        </Text>

                        <View style={styles.conceptContainer}>
                            <Text style={styles.conceptLabel}>CONCEPTO (OPCIONAL)</Text>
                            <TextInput 
                                style={styles.conceptInput}
                                placeholder="Escribe un motivo..."
                                placeholderTextColor="#444"
                                value={concepto}
                                onChangeText={setConcepto}
                            />
                        </View>
                        
                        <TouchableOpacity 
                            onPress={handleCreate}
                            disabled={isLoading}
                            style={styles.createButton}
                        >
                            <Text style={styles.createButtonText}>
                                Generar Cobro
                            </Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View style={styles.qrContainer}>
                        {/* Concepto Display */}
                        {concepto !== '' && (
                            <View style={styles.memoDisplay}>
                                <Text style={styles.memoText}>{concepto}</Text>
                            </View>
                        )}

                        {/* QR Code Section */}
                        <View style={styles.qrCard}>
                             <QRCode 
                                value={invoice} 
                                size={260} 
                                quietZone={10}
                                color="black"
                                backgroundColor="white"
                            />
                        </View>

                        {/* Lightning Address */}
                        <View style={styles.addressWrapper}>
                            <Text style={styles.addressText}>
                                {lightningAddress}
                            </Text>
                            <User color="#EAB308" size={20} />
                        </View>

                        <Text style={styles.pollingText}>Esperando pago...</Text>

                        {/* Action Buttons */}
                        <View style={styles.actionButtonsRow}>
                            <TouchableOpacity 
                                onPress={copyToClipboard}
                                style={[styles.actionButton, isCopied && styles.copiedButton]}
                            >
                                <Copy color={isCopied ? "#4ADE80" : "white"} size={20} style={{ marginRight: 8 }} />
                                <Text style={[styles.actionButtonText, isCopied && styles.copiedText]}>
                                    {isCopied ? "¡Copiado!" : "Copiar"}
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity 
                                onPress={shareInvoice}
                                style={styles.actionButton}
                            >
                                <Share2 color="white" size={20} style={{ marginRight: 8 }} />
                                <Text style={styles.actionButtonText}>Enviar</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Amount/Note Button */}
                        <TouchableOpacity 
                            onPress={() => setIsEditing(true)}
                            style={styles.editButton}
                        >
                            <Text style={styles.editButtonText}>✏️ Editar monto</Text>
                            {amountCOP !== '' && (
                                <Text style={styles.amountDisplay}>${amountCOP} COP</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'black',
    },
    paidContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    paidTitle: {
        color: '#4ADE80',
        fontSize: 32,
        fontWeight: '900',
        marginTop: 24,
    },
    paidSubtitle: {
        color: '#666',
        fontSize: 18,
        marginTop: 8,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 10,
    },
    backButton: {
        padding: 8,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 16,
    },
    headerTitle: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 2,
    },
    content: {
        flex: 1,
        alignItems: 'center',
        paddingHorizontal: 24,
    },
    editorContainer: {
        width: '100%',
        marginTop: 40,
        alignItems: 'center',
    },
    editorLabel: {
        color: '#888',
        fontSize: 12,
        fontWeight: '900',
        marginBottom: 10,
        textAlign: 'center',
        letterSpacing: 4,
        textTransform: 'uppercase',
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    currencySymbol: {
        color: '#EAB308',
        fontSize: 40,
        marginRight: 10,
        fontWeight: '900',
    },
    textInput: {
        color: 'white',
        fontWeight: '900',
        textAlign: 'center',
    },
    satsLabel: {
        color: '#EAB308',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 40,
        backgroundColor: 'rgba(234, 179, 8, 0.1)',
        paddingHorizontal: 15,
        paddingVertical: 5,
        borderRadius: 10,
    },
    conceptContainer: {
        width: '100%',
        backgroundColor: 'rgba(255,255,255,0.03)',
        padding: 20,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
        marginBottom: 40,
    },
    conceptLabel: {
        color: '#666',
        fontSize: 10,
        fontWeight: '900',
        letterSpacing: 2,
        marginBottom: 10,
    },
    conceptInput: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
        padding: 0,
    },
    createButton: {
        backgroundColor: '#EAB308',
        borderRadius: 24,
        paddingHorizontal: 60,
        paddingVertical: 20,
        minHeight: 64,
        justifyContent: 'center',
        shadowColor: '#EAB308',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    createButtonText: {
        color: 'black',
        fontSize: 20,
        fontWeight: '900',
        textTransform: 'uppercase',
    },
    qrContainer: {
        alignItems: 'center',
        width: '100%',
        marginTop: 20,
    },
    memoDisplay: {
        backgroundColor: 'rgba(234, 179, 8, 0.1)',
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 15,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: 'rgba(234, 179, 8, 0.2)',
    },
    memoText: {
        color: '#EAB308',
        fontWeight: 'bold',
    },
    qrCard: {
        backgroundColor: 'white',
        padding: 24,
        borderRadius: 45,
        shadowColor: 'black',
        shadowOffset: { width: 0, height: 20 },
        shadowOpacity: 0.6,
        shadowRadius: 40,
        elevation: 20,
    },
    addressWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 30,
        backgroundColor: 'rgba(255,255,255,0.05)',
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 15,
    },
    addressText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
        marginRight: 8,
    },
    pollingText: {
        color: '#4ADE80',
        fontSize: 12,
        fontWeight: 'bold',
        marginTop: 15,
        opacity: 0.7,
        letterSpacing: 1,
    },
    actionButtonsRow: {
        flexDirection: 'row',
        marginTop: 40,
        gap: 16,
        width: '100%',
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        borderRadius: 24,
        paddingVertical: 18,
    },
    copiedButton: {
        borderColor: '#4ADE80',
        backgroundColor: 'rgba(74, 222, 128, 0.05)',
    },
    actionButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    copiedText: {
        color: '#4ADE80',
    },
    editButton: {
        marginTop: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 30,
        paddingVertical: 10,
    },
    editButtonText: {
        color: '#666',
        fontSize: 14,
        fontWeight: 'bold',
        marginRight: 8,
    },
    amountDisplay: {
        color: '#999',
        fontSize: 14,
        fontWeight: 'bold',
    },
});
