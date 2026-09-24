import React, { useState, useEffect, useRef } from 'react'
import { CdsScreen } from './CdsScreen'
import { prjAlert } from 'DWcmn/PrjCmnFunctions'
import CdsSpinnerScreen from './CdsSpinnerScreen';
import { CmnAddressInput } from 'DWcmn/CmnAddressInput';
import CdsQuestionScreen from './CdsQuestionScreen'
import { strX } from 'DWcmn/I18n'
import { dwdbfsShopGetAllForThisLocation } from 'DWcmn/dwdbfsShop'
import { prjCloudLogInfo } from 'DWcmn/prjCloudLog'

//20230526 commented out the PERMISSION phase, don't think that it is necessary. Maybe rremove

const MODES = {
   INIT: 0,
   GET_ADDRESS: 20,
   DISPLAY_NO_SHOP_MESSAGE: 30,
   DISPLAY_SHOP_MESSAGE: 40,
}
//prop onOkay()
//prop onCancel()

//CdsSigninCheckIfInArea
//  it will use the whole screen (CdsScreen)
//  it does nothing to 'stop' itself, it will call onCancel or onSelect appropriately
//  and just expects not to be rendered any more.

export default function CdsSigninCheckIfInArea(props) {

   const [mode, setMode] = useState(MODES.INIT);
   const shopsRef = useRef([]);

   useEffect(() => {
      setMode(MODES.GET_ADDRESS);
   }, []);

   switch (mode) {

      case MODES.INIT:
         return (
            <CdsSpinnerScreen />
         );

      //first get their location (by phone location or from map)
      case MODES.GET_ADDRESS:
         return (
            <CdsScreen>
               <CmnAddressInput requestPermission
                  title={strX("cstNEW.PickALocation")}
                  buttonI18n={'cmnNEW.CheckThisAddress'}
                  buttonCode={'CHECK_THIS_LOCATION'}
                  defaultAddress={null}
                  defaultLocation={null}
                  onCancel={props.onCancel}
                  onSelect={async (address, location) => { //
                     shopsRef.current = await dwdbfsShopGetAllForThisLocation(location)
                     //we do this check here because we need location
                     if (shopsRef.current.length == 0) {
                        prjCloudLogInfo('CdsSigninCheckIfInArea',`Not found [${location.latitude}, ${location.longitude}]`)
                        setMode(MODES.DISPLAY_NO_SHOP_MESSAGE)
                     }
                     else {
                        setMode(MODES.DISPLAY_SHOP_MESSAGE)
                     }
                  }} />
            </CdsScreen >
         );

      //too bad, no shops here
      case MODES.DISPLAY_NO_SHOP_MESSAGE:
         return (<>
            <CdsQuestionScreen
               text='cstNEW.MsgNoService'
               onCancelCode='PREV_IS_TRY_ANOTHER'
               onOkayCode='NEXT_IS_DONE'
               onCancel={() => { setMode(MODES.GET_ADDRESS) }} //try another
               onOkay={props.onCancel} //NExt here is the same as cancel 
            />
         </>
         )

      //yay, we have at least one shop
      case MODES.DISPLAY_SHOP_MESSAGE:

         return (
            <CdsQuestionScreen
               text='cstNEW.MsgYouHaveService'
               onOkay={props.onOkay}
               onOkayCode='NEXT_IS_DONE'
            />
         )

      //invalid mode? hard to see how that would happen    
      default:
         prjAlert("Invalid mode in CdsSigninCheckIfInArea")
         props.navigation.goBack()
         return null
   }

}//end CdsSigninCheckIfInArea