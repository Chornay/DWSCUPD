import React, { useState, useRef, useEffect } from 'react'
import auth from '@react-native-firebase/auth';
import { View, TouchableOpacity, Platform, StyleSheet, ImageBackground, Image, Linking } from 'react-native'
import { appleAuth, AppleButton } from '@invertase/react-native-apple-authentication';
import { navigateForAuthorizedCust } from './CdsSigninFunctions'
import { useNavigation } from 'DWcmn/PrjNav5Wrapper'

export function signinApple(signinAppType) {
  console.log('-------------->', signinAppType)
  const navigation = useNavigation()
  return (
    <TouchableOpacity
      style={styles.button}
      onPress={async () => {       // prjToast({ text: "IOS login not enabled in this version" })
        // return (null) //TODO apple on
        // Start the sign-in request
        const appleAuthRequestResponse = await appleAuth.performRequest({
          requestedOperation: appleAuth.Operation.LOGIN,
          requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
        });
        // Ensure Apple returned a user identityToken
        if (!appleAuthRequestResponse.identityToken) {
          throw new Error('Apple Sign-In failed - no identify token returned');
        }
        // Create a Firebase credential from the response
        const { identityToken, nonce } = appleAuthRequestResponse;
        const appleCredential = auth.AppleAuthProvider.credential(identityToken, nonce);
        // Sign the user in with the credential
        await auth().signInWithCredential(appleCredential);
        navigateForAuthorizedCust(navigation, signinAppType, { 'authType': 'apple' })

      }
      }
    // disabled={isLoginInProgress}
    >
      <Image source={require('../images/login/apple.png')} style={styles.thumbNail} />

    </TouchableOpacity>
  )
}//end signinApple

const styles = StyleSheet.create({
  thumbNail: {
    width: 25,
    height: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'white'
  }
})