import React from 'react'
import { COLORS } from 'DWcmn/Global'

import { View, StyleSheet } from 'react-native'
import { PRJ_STYLES } from 'DWcmn/PrjStyles'
import { CdsScreen } from './CdsScreen';
import { GCFooterWithTwoIcons } from 'DWcmn/GCFooterForIcons'
import { GCI18n, GCText } from 'DWcmn/Gc'

//20241015 created from SigninQuestion...
//         no header, text instead of n1,n2, hide property
//prop text (actually an i18n code)
//prop extra (optional text to be displayed)
//prop onOkayCode (optional text/icon code for OKAY button)
//prop onCancelCode (optional text/icon code for CANCEL button)
//NA prop onBack() optional back arrow
//prop onOkay() action for OKAY button
//prop onCancel() optional action for CANCEL button
//NAprop disabled .. if you want the button disabled while the 'work' is being done.

export default function CdsQuestionScreen(props) {

   return (
      <CdsScreen>
         <View style={styles.spacyBox}>
               <GCI18n title code={props.text} style={{ textAlign: 'center' }}/>
               {props.extra&&<GCText title code={props.text} style={{ textAlign: 'center' }}>{props.extra}</GCText>}
         </View>
         <GCFooterWithTwoIcons
            onOkayCode={props.onOkayCode || 'NEXT_IS_OKAY'}
            onCancelCode={props.onCancelCode || 'PREV_IS_CANCEL'}
            onOkay={props.onOkay}
            onCancel={props.onCancel}
         />
      </CdsScreen >
   )
}

const styles = StyleSheet.create({
   spacyBox:{
      flex:1,
      width:'auto',
      height:'auto',
      padding:10,
      justifyContent:'center', 
      alignItems:'center', 
      margin:10,
      borderWidth:3,
      borderRadius:10,
      borderColor:COLORS.GC_THEME_DARK,
   },
})