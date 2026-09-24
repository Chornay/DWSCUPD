import React from 'react'
import { View } from 'react-native'
import { strX } from 'DWcmn/I18n.js'

import { GCI18n, GCText, } from 'DWcmn/Gc'
import { COLORS } from 'DWcmn/Global'
import { GC_MIN_MARGIN } from 'DWcmn/Global'
import { PrjIcon } from 'DWcmn/PrjIconComponents';
//20230501 tidy up



//the note has padding 10 above and below
export function cdsMenuRenderNoteAboutItemInfo() {
   return (
      <View style={{
         alignSelf: 'flex-start', //makes the view just wide enough for the text 
         paddingVertical: 10, paddingLeft: GC_MIN_MARGIN,
         backgroundColor: COLORS.GC_SHADE_SELECTED,
         borderWidth: 1, borderColor: 'black',
         marginBottom: 5
      }} >
         {/* <GCText color={COLORS.GC_INSTRUCTIONS} > */}
         {/* <GCI18n code='cmnNEW.InstructionsNote' /> */}
         {/* //TODO add translatoin */}
         <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <GCText detail >Press selected items with </GCText>
            <PrjIcon style={{ fontSize: 20 }} id="CAMERA" />
            <GCText detail > to add remarks/photo  </GCText>
         </View>
      </View>
   )
}//end cdsMenuRenderNoteAboutItemInfo
