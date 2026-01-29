import 'react-native-reanimated';
import React, { useEffect } from 'react';
import './global.css'; // NativeWind
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'react-native';

import { SplashScreen } from './src/screens/SplashScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { SendScreen } from './src/screens/SendScreen';
import { ReceiveScreen } from './src/screens/ReceiveScreen';
import { WithdrawScreen } from './src/screens/WithdrawScreen';
import { HistoryScreen } from './src/screens/HistoryScreen';
import { AnalyticsService } from './src/services/AnalyticsService';
import { navigationRef } from './src/services/NavigationService';

const Stack = createNativeStackNavigator();

function App(): React.JSX.Element {
  useEffect(() => {
    AnalyticsService.logEvent('app_open', { platform: 'os' });
  }, []);

  return (
    <NavigationContainer ref={navigationRef}>
      <SafeAreaProvider>
        <StatusBar barStyle="light-content" backgroundColor="#000" />
        <Stack.Navigator 
          initialRouteName="Splash"
          screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: '#000' }
          }}
        >
          <Stack.Screen name="Splash" component={SplashScreen} />
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Send" component={SendScreen} />
          <Stack.Screen name="Receive" component={ReceiveScreen} />
          <Stack.Screen name="Withdraw" component={WithdrawScreen} />
          <Stack.Screen name="History" component={HistoryScreen} />
        </Stack.Navigator>
      </SafeAreaProvider>
    </NavigationContainer>
  );
}

export default App;
