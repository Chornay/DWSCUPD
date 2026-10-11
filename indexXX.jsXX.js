/**
 * @format
 */
import {AppRegistry} from 'react-native';
import App from './src/App';
import {name as appName} from './app.json';
import messaging from '@react-native-firebase/messaging';
// AppRegistry.registerComponent(appName, () => App);
messaging().setBackgroundMessageHandler(async remoteMessage => {
    console.log('Message handled in the background!', remoteMessage);
    // Optional: show local notification or do something with the message
  });
  
  // Register the headless task for Android
  // AppRegistry.registerHeadlessTask(
  //   'ReactNativeFirebaseMessagingHeadlessTask',
  //   () => async (remoteMessage) => {
  //     console.log('Headless message received:', remoteMessage);
  //     // Handle background or quit-state messages
  //   }
  // );
  
AppRegistry.registerComponent('DOBBY_WALLA', () => App);

