import React from 'react'
import { View } from 'react-native'
import { CstMenuPriceList } from './CstMenuPriceList'
import { PrjIconForRemark } from 'DWcmn/PrjIconForRemark'

//Displays a question mark icon
//If pressed displays a popup remark
//prop line .. we will look for the extraInfo property
//OR
//prop code .. we will look in the pricelist extraInfo table for the text NOT IMPLEMENTED
//OR
//prop text .. text to display (or link if it starts with http)
//prop size .. icon size passed to PrjIconForRemark
//prop styleIcon NOT USED
//NOTE as a convenience we will accept null text and return null
//prop onPress()
export function CdsMenuInfoIcon({ line, code, text, size }) {

   let lineCode
   let infoText

   //if they specified the menu line look for the extraInfo key
   //CLAUDE: a null line will throw on line.extraInfo - needs protection/logging
   if (line !== undefined) {
      if (!(lineCode = line.extraInfo)) {
         return null
      }
      else {
         if (!(infoText = CstMenuPriceList.getExtraInfo(lineCode))) {
            return null
         }
      }
   }

   else if (code !== undefined) {
      if (!code) {
         return null
      }
      else {
         if (!(infoText = CstMenuPriceList.getExtraInfo(code))) {
            return null
         }
      }
   }

   else { //they will have specified the text to display
      if (!(infoText = text)) {
         return null
      }

   }


   return (
      <View style={{ paddingBottom: 2 }}>
         <PrjIconForRemark text={infoText} size={size} />
      </View>
   )

} //end CdsMenuInfoIcon