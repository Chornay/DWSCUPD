import React from 'react'
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { GCText, GCI18n } from 'DWcmn/Gc'
import { PrjIcon } from 'DWcmn/PrjIconComponents'
import { COLORS } from 'DWcmn/Global'

//CdsSigninButton
//to style the few buttons on the signin screens
//prop i18n
//prop icon
//prop onPress()
//prop style
//prop hide 
export function CdsSigninButton(props) {

   if (props.hide) {return null}
   return (
      <TouchableOpacity
         style={[styles.button, props.style]}
         onPress={() => { props.onPress() }}
      >
         <PrjIcon style={{color:COLORS.GC_SIGNIN_BUTTON_TEXT}} id={props.icon} />
         <GCText> </GCText>
         <GCI18n title style={{color:COLORS.GC_SIGNIN_BUTTON_TEXT}} bold light code={props.i18n} />
      </TouchableOpacity>

   )
}//end CdsSigninButton


//CdsSigninNotation
//to style the simple centered text on the signin screens (that are usually clickable)
//prop i18n
//prop size (default 20)
//prop onPress()
//prop style
export function CdsSigninNotation(props) {
   return (
      <TouchableOpacity style={[{ alignItems: 'center' }, props.style]}
         onPress={props.onPress}
         disabled={!props.onPress}>
         <GCI18n fit color={COLORS.GC_SIGNIN_TEXT} bold size={props.size || 20} code={props.i18n} />
      </TouchableOpacity>
   )
}//end CdsSigninNotation

const styles = StyleSheet.create({

   button: {
      width: '80%',
      flexDirection: 'row',
      paddingVertical: 10,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: COLORS.GC_SIGNIN_BUTTON_BKG,
      borderRadius: 10,
      paddingTop:10,
      paddingBottom:10,
      // Took out shadow...doesn't look clean on iOS
   }
})