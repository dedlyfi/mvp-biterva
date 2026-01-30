import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Alert, StatusBar } from 'react-native';
import * as NavigationService from '../services/NavigationService';
import { useWalletStore } from '../store/useWalletStore';
import { ArrowLeft, Smartphone, Bitcoin } from 'lucide-react-native';
import { BitervaPageLoader } from '../components/BitervaPageLoader';
import { BitervaModal } from '../components/BitervaModal';

export const WithdrawScreen = ({ navigation }: any) => {
    const { withdrawToNequi, isLoading, balance, btcPrice, fetchPrice } = useWalletStore();
    const [amount, setAmount] = useState('');
    const [phone, setPhone] = useState('');

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

    useEffect(() => {
        fetchPrice();
    }, []);


    const handleWithdraw = async () => {
        if (!amount || !phone) {
            setModalConfig({
                visible: true,
                type: 'error',
                title: 'Datos Incompletos',
                message: 'Por favor ingresa el monto y el número de Nequi para continuar.',
            });
            return;
        }

        const amt = parseInt(amount);
        if (amt > balance) {
            setModalConfig({
                visible: true,
                type: 'insufficient_balance',
                title: 'Saldo Insuficiente',
                message: `Intentas retirar ${amt.toLocaleString()} sats, pero solo tienes ${balance.toLocaleString()} sats disponibles.`,
            });
            return;
        }

        try {
            await withdrawToNequi(amt, phone);
            setModalConfig({
                visible: true,
                type: 'success',
                title: 'Retiro en Proceso',
                message: 'Tu retiro a Nequi ha sido enviado a procesamiento. ✨ Pronto verás los fondos en tu cuenta.',
            });
        } catch (e: any) {
            setModalConfig({
                visible: true,
                type: 'error',
                title: 'Error de Retiro',
                message: e.message || 'No se pudo procesar el retiro. Verifica tu conexión.',
            });
        }
    };

    const btcValue = parseInt(amount || '0') * (btcPrice / 100000000);

    return (
        <View className="flex-1 bg-black">
            <StatusBar barStyle="light-content" />
            <BitervaPageLoader visible={isLoading} message="Enviando a Nequi..." />

            <BitervaModal 
                visible={modalConfig.visible}
                type={modalConfig.type}
                title={modalConfig.title}
                message={modalConfig.message}
                onClose={() => {
                    const wasSuccess = modalConfig.type === 'success';
                    setModalConfig({ ...modalConfig, visible: false });
                    if (wasSuccess) navigation.goBack();
                }}
            />

            {/* HEADER */}
            <View className="flex-row items-center px-6 pt-14 pb-4">
                <TouchableOpacity 
                    onPress={() => navigation.goBack()}
                    className="bg-white/10 p-2 rounded-full"
                >
                    <ArrowLeft color="white" size={24} />
                </TouchableOpacity>
                <Text className="text-white text-xl font-black ml-4">Retirar a Nequi</Text>
            </View>

            <ScrollView className="flex-1 px-6">
                <View className="bg-yellow-500/10 p-6 rounded-[35px] border border-yellow-500/20 my-6">
                    <Text className="text-yellow-500/60 text-xs font-bold uppercase tracking-widest mb-1">Tu Saldo Disponible</Text>
                    <Text className="text-yellow-500 text-3xl font-black">{balance.toLocaleString()} sats</Text>
                </View>

                <View className="mb-6">
                    <Text className="text-gray-400 mb-3 font-bold ml-1">Monto a retirar (sats)</Text>
                    <View className="flex-row items-center bg-white/5 rounded-3xl border border-white/10 p-4">
                        <Bitcoin color="#EAB308" size={24} className="mr-3" />
                        <TextInput 
                            className="flex-1 text-white text-2xl font-black p-0"
                            placeholder="0"
                            placeholderTextColor="rgba(255,255,255,0.2)"
                            value={amount}
                            onChangeText={setAmount}
                            keyboardType="numeric"
                        />
                    </View>
                    {amount !== '' && (
                        <Text className="text-gray-500 mt-2 ml-1 font-bold">
                            ≈ ${btcValue.toLocaleString('es-CO', { maximumFractionDigits: 0 })} COP
                        </Text>
                    )}
                </View>

                <View className="mb-10">
                    <Text className="text-gray-400 mb-3 font-bold ml-1">Número de celular Nequi</Text>
                    <View className="flex-row items-center bg-white/5 rounded-3xl border border-white/10 p-4">
                        <Smartphone color="#4ADE80" size={24} className="mr-3" />
                        <TextInput 
                            className="flex-1 text-white text-2xl font-black p-0"
                            placeholder="300 000 0000"
                            placeholderTextColor="rgba(255,255,255,0.2)"
                            value={phone}
                            onChangeText={setPhone}
                            keyboardType="phone-pad"
                        />
                    </View>
                </View>

                <TouchableOpacity 
                    onPress={handleWithdraw}
                    activeOpacity={0.8}
                    className="bg-yellow-500 p-6 rounded-[35px] items-center mb-10 shadow-xl shadow-yellow-500/20"
                >
                    <Text className="text-black text-xl font-black uppercase tracking-tighter">Confirmar Retiro</Text>
                </TouchableOpacity>

                {/* TRUST SIGNALS */}
                <View className="items-center opacity-40 mb-10">
                    <Text className="text-white text-[10px] font-bold uppercase tracking-widest">Liquidación Segura por Trokera</Text>
                </View>
            </ScrollView>
        </View>
    );
};
