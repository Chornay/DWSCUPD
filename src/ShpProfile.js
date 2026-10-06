import React, { useState, useEffect } from 'react'
import { View, TouchableOpacity } from 'react-native'
import { ListItemXYZ } from 'DWcmn/GCNB'

import { ShpScreen } from './CdsScreen';
import { PrjIcon } from 'DWcmn/PrjIconComponents';
import I18n from 'i18n-js';
import { GCText, GCI18n } from 'DWcmn/Gc'
import GCHeader from 'DWcmn/GCHeader'
import { cmnSignout } from 'DWcmn/CmnFunctions'
import { GC_STD_MARGIN } from 'DWcmn/Global'

//20250307 removed ShpDisplayBoundaries while adding superShops

const MODES = {
   MAIN: 0,
}

export function ShpProfile() {

   const [isComponentInitialized, setIsComponentInitialized] = useState(false)
   const [mode, setMode] = useState(MODES.MAIN)

   useEffect(() => {
      setIsComponentInitialized(true)
   }, [])

   if (!isComponentInitialized) return null

   switch (mode) {

      case MODES.MAIN:
         return (

            <ShpScreen>
               <GCHeader back titleI18n='cmnNEW.Profile' />
               <View style={{ flex: 1, marginHorizontal: GC_STD_MARGIN }}>
                  <ProfileField
                     onPress={async () => {
                        await cmnSignout()
                     }}
                     id={"LOGOUT"}
                     i18n='cmnNEW.Logout'
                  />
               </View>
            </ShpScreen>
         )
         break;

      default:
         return null
         break;

   }//end switch
} //end ShpProfile

//prop onPress
//prop id   //icon to display
//prop i18n //followed by text
function ProfileField({ onPress, id, i18n }) {

   return (
      <ListItemXYZ>
         <TouchableOpacity
            onPress={onPress}>
            <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10 }}>
               <PrjIcon style={{}} id={id} />
               <GCText>  </GCText>
               <GCI18n code={i18n} />
            </View>
         </TouchableOpacity>
      </ListItemXYZ>

   )
}//end ProfileField