import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Image, StatusBar, ScrollView, RefreshControl } from 'react-native';
import { useWalletStore } from '../store/useWalletStore';
import { Scan, Menu, ArrowDownLeft, ArrowUpRight, Clock } from 'lucide-react-native';
import { Sidebar } from '../components/Sidebar';
import clsx from 'clsx';

const appIcon = require('../assets/images/app_icon.png');

export const HomeScreen = ({ navigation }: any) => {
  const { balance, transactions, syncBalance, isLoading, btcPrice, fetchPrice, nodeOnline } = useWalletStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    // Initial fetch
    syncBalance();
  }, []);

  const onRefresh = React.useCallback(() => {
    syncBalance();
    fetchPrice();
  }, []);

  // Conversión escalable usando el precio del API
  const copBalance = btcPrice > 0 
    ? Math.floor(balance * (btcPrice / 100000000))
    : Math.floor(balance * 4);

  const satsPerCop = btcPrice > 0 ? (100000000 / btcPrice).toFixed(1) : "0.2";

  // Feed de transacciones reales (excluyendo expiradas)
  const activeTransactions = transactions.filter(tx => tx.status !== 'expired');

  const getCopValue = (tx: any) => {
    if (tx.fiatAmount) return tx.fiatAmount;
    if (!btcPrice || btcPrice === 0) return 0;
    return (tx.amount / 100000000) * btcPrice;
  };

  return (
    <View className="flex-1 bg-black">
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} navigation={navigation} />

      {/* Header */}
      <View className="flex-row justify-between items-center px-6 pt-12 pb-2">
        <TouchableOpacity 
          onPress={() => setSidebarOpen(true)}
          className="bg-white/5 p-3 rounded-2xl border border-white/10"
        >
          <Menu color="#EAB308" size={28} />
        </TouchableOpacity>
        
        {nodeOnline ? (
            <View className="bg-emerald-500/10 px-4 py-2 rounded-full border border-emerald-500/20">
                <Text className="text-emerald-500 font-black text-xs uppercase tracking-widest">LNBits network</Text>
            </View>
        ) : (
            <View className="bg-orange-500/10 px-4 py-2 rounded-full border border-orange-500/20">
                <Text className="text-orange-500 font-black text-xs uppercase tracking-widest">Demo Mode</Text>
            </View>
        )}
      </View>

      <ScrollView 
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={onRefresh} tintColor="#EAB308" />}
      >
        {/* Hero Section: Balance - THE WOW FACTOR */}
        <View className="justify-center items-center py-16 mt-4">
            <Text className="text-gray-500 font-bold uppercase tracking-[6px] text-xs mb-4">Saldo Total</Text>
            
            <View className="flex-row items-center mb-2">
                <Text className="text-white text-6xl font-black tracking-tighter">
                   ${copBalance.toLocaleString('es-CO')}
                </Text>
                <Text className="text-gray-500 text-3xl font-bold ml-2">COP</Text>
            </View>

            <View className="flex-row items-center bg-white/5 px-6 py-2 rounded-full border border-white/5">
                <Text className="text-yellow-500 text-xl font-black">
                    {balance.toLocaleString()} sats
                </Text>
                <Text className="text-gray-600 text-xs font-bold ml-3">
                    (1 COP ≈ {satsPerCop} sats)
                </Text>
            </View>
        </View>

        {/* Transactions List Area */}
        <View className="px-5 mt-4 w-full">
            <View className="flex-row items-center justify-between mb-4">
                <Text className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Actividad Reciente</Text>
                <TouchableOpacity onPress={() => navigation.navigate('History')}>
                    <Text className="text-yellow-500 font-bold text-[10px] uppercase tracking-wider">Ver Todo</Text>
                </TouchableOpacity>
            </View>

            {activeTransactions.length === 0 ? (
                <View className="items-center mt-4 bg-white/5 py-10 rounded-[30px] border border-dashed border-white/10">
                    <Text className="text-gray-600 font-medium text-sm">📜 No hay transacciones aún</Text>
                </View>
            ) : (
                <View>
                    {activeTransactions.slice(0, 3).map((tx) => (
                        <View key={tx.id} className="flex-row justify-between items-center py-4 border-b border-white/5">
                            <View className="flex-row items-center">
                                <View className={clsx(
                                    "w-10 h-10 rounded-2xl items-center justify-center mr-3",
                                    tx.status === 'pending' ? "bg-gray-800" :
                                    tx.type === "incoming" ? "bg-emerald-500/10" : "bg-orange-500/10"
                                )}>
                                    {tx.status === 'pending' ? <Clock color="#666" size={18} /> :
                                     tx.type === "incoming" ? <ArrowDownLeft color="#10B981" size={18} /> : 
                                     <ArrowUpRight color="#F97316" size={18} />}
                                </View>
                                <View>
                                    <Text className="text-white font-bold text-base">
                                        {tx.type === "incoming" ? "Recibido" : "Enviado"}
                                    </Text>
                                    <Text className="text-gray-500 text-[10px] uppercase font-bold tracking-tighter">
                                        {new Date(tx.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })} • {new Date(tx.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </Text>
                                </View>
                            </View>
                            <View className="items-end">
                                 <Text className={clsx(
                                     "font-bold text-base",
                                     tx.type === "incoming" ? "text-emerald-500" : "text-red-500"
                                 )}>
                                     {tx.type === "incoming" ? "+" : "-"} ${getCopValue(tx).toLocaleString('es-CO', { maximumFractionDigits: 0 })}
                                 </Text>
                                 <Text className="text-gray-500 text-[11px] font-mono">
                                     {tx.amount.toLocaleString()} sats
                                 </Text>
                            </View>
                        </View>
                    ))}
                    {activeTransactions.length > 3 && (
                        <TouchableOpacity 
                            onPress={() => navigation.navigate('History')}
                            className="items-center py-4 mt-2 bg-white/5 rounded-2xl border border-white/5"
                        >
                            <Text className="text-gray-400 font-bold text-xs uppercase tracking-widest">📜 Historial completo</Text>
                        </TouchableOpacity>
                    )}
                </View>
            )
            }
        </View>
      </ScrollView>

      {/* Footer Actions */}
      <View className="absolute bottom-10 left-0 right-0 px-6 flex-row justify-between gap-6">
        {/* Receive Button */}
        <TouchableOpacity 
            className="flex-1 border-2 border-yellow-500 rounded-full py-4 items-center justify-center"
            onPress={() => navigation.navigate('Receive')}
        >
            <Text className="text-yellow-500 text-xl font-bold">Recibir</Text>
        </TouchableOpacity>

        {/* Send Button */}
        <TouchableOpacity 
            className="flex-1 bg-yellow-500 rounded-full py-4 items-center justify-center flex-row"
            onPress={() => navigation.navigate('Send')}
        >
            <Scan color="#000" size={24} strokeWidth={2.5} style={{ marginRight: 8 }} />
            <Text className="text-black text-xl font-bold">Enviar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
