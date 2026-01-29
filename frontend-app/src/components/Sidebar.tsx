import React from 'react';
import { View, Text, TouchableOpacity, Animated, Dimensions, Image, StyleSheet } from 'react-native';
import { 
  X, 
  TrendingUp, 
  Lock, 
  ChevronRight,
  Zap,
  ShieldCheck,
  Cpu,
  ArrowRightLeft,
  Fingerprint
} from 'lucide-react-native';
import { AuthService } from '../services/AuthService';

const { width } = Dimensions.get('window');
const appIcon = require('../assets/images/app_icon.png');
const nequiIcon = require('../assets/images/nequi.png');

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  navigation: any;
}

export const Sidebar = ({ isOpen, onClose, navigation }: SidebarProps) => {
  const slideAnim = React.useRef(new Animated.Value(-width)).current;
  const opacityAnim = React.useRef(new Animated.Value(0)).current;
  const currentId = AuthService.getDeviceIdentity();

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: isOpen ? 0 : -width,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: isOpen ? 1 : 0,
        duration: 300,
        useNativeDriver: true,
      })
    ]).start();
  }, [isOpen]);

  if (!isOpen) return null;

  const DeFiCard = ({ title, icon, color, description }: any) => (
    <TouchableOpacity 
      activeOpacity={0.7}
      style={[styles.defiCard, { borderLeftColor: color }]}
      className="bg-white/5 p-4 rounded-3xl mb-4 border-l-4"
    >
      <View className="flex-row items-center justify-between mb-1">
        <View className="flex-row items-center">
            {icon}
            <Text className="text-white text-lg font-bold ml-3">{title}</Text>
        </View>
        <ChevronRight color="#444" size={18} />
      </View>
      <Text className="text-gray-500 text-xs ml-9">{description}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.overlay}>
      <Animated.View style={[styles.backdrop, { opacity: opacityAnim }]}>
        <TouchableOpacity style={{ flex: 1 }} onPress={onClose} activeOpacity={1} />
      </Animated.View>
      
      <Animated.View 
        style={[
          styles.container,
          { transform: [{ translateX: slideAnim }] }
        ]}
      >
        {/* DISRUPTIVE HEADER: Floating Logo Circle */}
        <View className="items-center mt-8 mb-10">
            <View className="bg-yellow-500/20 p-1 rounded-full border border-yellow-500/30">
                <View className="bg-black p-4 rounded-full border border-yellow-500/50">
                    <Image source={appIcon} style={{ width: 60, height: 60 }} resizeMode="contain" />
                </View>
            </View>
            <View className="mt-4 flex-row items-center">
                <Text className="text-yellow-500 text-3xl font-black tracking-tighter">BITERVA</Text>
                <View className="ml-2 bg-yellow-500 px-2 py-0.5 rounded-md">
                    <Text className="text-black text-[10px] font-bold">NODE</Text>
                </View>
            </View>
        </View>

        <TouchableOpacity 
            onPress={onClose} 
            className="absolute top-12 right-6 bg-white/10 p-2 rounded-full"
        >
            <X color="white" size={20} />
        </TouchableOpacity>

        <View className="px-6 flex-1">             

          {/* Main Action: Nequi with disruptive scale */}
          <Text className="text-gray-600 text-[10px] font-bold uppercase tracking-[4px] mb-4 ml-2">Retiros Fiat</Text>
          <TouchableOpacity 
            onPress={() => { onClose(); navigation.navigate('Withdraw'); }}
            className="bg-yellow-500 flex-row items-center justify-between p-5 rounded-[32px] mb-10 shadow-xl shadow-yellow-500/40"
          >
            <View className="flex-row items-center">
               <View className="bg-white p-1 rounded-2xl mr-4" style={{ width: 45, height: 45, alignItems: 'center', justifyContent: 'center' }}>
                  <Image source={nequiIcon} style={{ width: '85%', height: '85%' }} resizeMode="contain" />
               </View>
               <View>
                 <Text className="text-black text-xl font-black">Retirar a Nequi</Text>
                 <Text className="text-black/60 text-xs font-bold">Liquidación instantánea</Text>
               </View>
            </View>
            <ArrowRightLeft color="black" size={24} />
          </TouchableOpacity>

          {/* DeFi Section: Premium Cards */}
          <Text className="text-yellow-500/80 text-[10px] font-bold uppercase tracking-[4px] mb-4 ml-2">D e F i </Text>
          
          <DeFiCard 
            title="Ahorro DCA" 
            color="#4ADE80"
            icon={<TrendingUp color="#4ADE80" size={24} />}
            description="Acumulación automática de Sats por hora"
          />

          <DeFiCard 
            title="Stake" 
            color="#818CF8"
            icon={<Zap color="#818CF8" size={24} />}
            description="Participa en el consenso y gana rendimientos"
          />

          <DeFiCard 
            title="Colaterales" 
            color="#F87171"
            icon={<Lock color="#F87171" size={24} />}
            description="Préstamos instantáneos sin vender tus BTC"
          />

          {/* Growth Hacking: Dynamic Status Bar */}
          <View className="mt-6 bg-white/5 p-6 rounded-[35px] border border-white/10">
            <View className="flex-row justify-between items-center mb-3">
                <View className="flex-row items-center">
                    <ShieldCheck color="#EAB308" size={16} />
                    <Text className="text-white font-bold ml-2">Security Level</Text>
                </View>
                <Text className="text-yellow-500 font-bold">Ultra</Text>
            </View>
            <View className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <View className="h-full bg-yellow-500 w-[85%]" />
            </View>
            <View className="mt-4 flex-row justify-center">
                <Cpu color="#444" size={12} />
                <Text className="text-gray-600 text-[9px] ml-1 font-bold">Biterva Core v1.4.1 connected</Text>
            </View>
          </View>
        </View>

        <View className="pb-10 pt-4 items-center">
            <Text className="text-gray-700 text-[10px] font-bold uppercase tracking-widest">Powered by Bitcoin ⚡</Text>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.85)',
  },
  container: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: width * 0.85,
    backgroundColor: '#050505',
    borderRightWidth: 1,
    borderRightColor: '#222',
    borderTopRightRadius: 40,
    borderBottomRightRadius: 40,
    shadowColor: '#EAB308',
    shadowOffset: { width: 10, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 50,
  },
  defiCard: {
    // Custom effects can be added here
  }
});
