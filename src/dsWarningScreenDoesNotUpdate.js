import React from 'react'
import { View } from 'react-native'

import { COLORS } from 'DWcmn/Global';
import { GCI18n } from 'DWcmn/Gc'

//20230525 created


export function dsWarningScreenDoesNotUpdate() {

    return (
      <View style={{ backgroundColor: COLORS.GC_HIGHLIGHT_IMPORTANT, height:40, alignItems:'center',justifyContent:'center', paddingHorizontal:10}}>
                <GCI18n code = 'cmnNEW.SCREEN_DOES_NOT_UPDATE'/>
            </View>
    )
}//end dsWarningScreenDoesNotUpdate

