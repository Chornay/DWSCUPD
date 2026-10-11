import 'react-native-gesture-handler' //Claude says put this way up here
import React from 'react'
import { View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import '@react-native-firebase/firestore'; //Claude wanted this 
import firebase from '@react-native-firebase/app';
import { PrjToast } from 'DWcmn/PrjToast'

import CstApp from './CstApp'
import DrvApp from './DrvApp'
import UtilTop from './UtilTop'
import ShpApp from './ShpApp'
import Main from './Main';

const Stack = createStackNavigator()

firebase.firestore().settings({ ignoreUndefinedProperties: true })

export default function MultiApp() {

   return (
      <View style={{ flex: 1 }}>
         <SafeAreaProvider>
            <NavigationContainer>
               <Stack.Navigator
                  initialRouteName="Main"
                  screenOptions={{ headerShown: false }}
               >
                  <Stack.Screen name="Main" component={Main} />
                  <Stack.Screen name="CstApp" component={CstApp} />
                  <Stack.Screen name="DrvApp" component={DrvApp} />
                  <Stack.Screen name="ShpApp" component={ShpApp} />
                  <Stack.Screen name="UtilTop" component={UtilTop} />
               </Stack.Navigator>
            </NavigationContainer>
         </SafeAreaProvider>
         <PrjToast />
      </View>
   );
} //end MultiApp