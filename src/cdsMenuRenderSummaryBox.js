import React from 'react'
import { View } from 'react-native'
import { strX } from 'DWcmn/I18n.js'

import { COLORS } from 'DWcmn/Global';
import { cmnFormatAPrice } from 'DWcmn/cmnFormatFunctions';
import { GCText } from 'DWcmn/Gc'

//20230501 tidy up


export function cdsMenuRenderSummaryBox(priceList) {

   // cdsMenuPricelistUpdateTotals(priceList)//TODO WE SHOULD NOT HAVE TO DO THIS

   if (priceList.count == 0) {
      return null
   }
   return (
      <View style={{ backgroundColor: COLORS.GC_HIGHLIGHT_IMPORTANT, flexDirection: 'row', height: 40, alignItems: 'center', paddingHorizontal: 10 }}>
         <View style={{ flex: .8, alignItems: 'flex-end', paddingVertical: 5 }}>
            {(priceList.count == 1) ?
               <GCText title fit >{priceList.count} {strX('cmnNEW.Selection')}  </GCText> :
               <GCText title fit >{priceList.count} {strX('cmnNEW.Selection')}  </GCText>
            }
         </View>
         <View style={{ flex: .2, alignItems: 'flex-end' }}>
            <GCText title fit >{cmnFormatAPrice(priceList.totalPrice)}</GCText>
         </View>
      </View>
   )
}//end cdsMenuRenderSummaryBox

