import React, { useState, useEffect } from 'react'
import { View, TouchableOpacity } from 'react-native'
import { ListItemGBC, ListItemRight, ListItemBody, ListItemLeft } from 'DWcmn/PrjNativeBase'

import { DrvScreen } from './CdsScreen';
import { PrjIcon } from 'DWcmn/PrjIconComponents';
import I18n from 'i18n-js';
import { GCText, GCI18n } from 'DWcmn/Gc'
import GCHeader from 'DWcmn/GCHeader'
import { cmnSignout } from 'DWcmn/CmnFunctions'
import { GC_STD_MARGIN } from 'DWcmn/Global'
import { prjCloudLogError } from 'DWcmn/prjCloudLog'

const MODES = {
   MAIN: 0,
}

export function DrvProfile() {

   const [isComponentInitialized, setIsComponentInitialized] = useState(false)
   const [mode, setMode] = useState(MODES.MAIN)

   useEffect(() => {
      setIsComponentInitialized(true)
   }, [])

   if (!isComponentInitialized) return null

   switch (mode) {

      case MODES.MAIN:
         return (

            <DrvScreen>
               <GCHeader back titleI18n='cmnNEW.Profile' />
               <View style={{ flex: 1, marginHorizontal: GC_STD_MARGIN }}>
                  <ProfileField
                     onPress={async () => {
                        try {
                           await cmnSignout()
                        }
                        catch (error) {
                           prjCloudLogError('DrvProfile signout', error)
                        }
                     }}
                     id={"LOGOUT"}
                     i18n='cmnNEW.Logout'
                  />

               </View>
            </DrvScreen>
         )
         break;
      default:
         return null
         break;

   }//end switch
} //end DrvProfile

//prop onPress
//prop id   //icon to display
//prop i18n //followed by text
function ProfileField({ onPress, id, i18n }) {

   return (
      <ListItemGBC button
         onPress={onPress}>
         <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10 }}>
            <PrjIcon style={{}} id={id} />
            <GCText>  </GCText>
            <GCI18n code={i18n} />
         </View>
      </ListItemGBC>

   )
}//end ProfileField