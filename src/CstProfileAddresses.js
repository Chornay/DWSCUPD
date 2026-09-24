import React, { useEffect, useRef, useState } from 'react'

import { View } from 'react-native'
import { CdsScreen } from './CdsScreen';
import GCHeader from 'DWcmn/GCHeader'
import { GCFooterWithTwoIcons } from 'DWcmn/GCFooterForIcons'
import { isBlank } from 'DWcmn/PrjCmnFunctions'
import { PrjBusyMask } from 'DWcmn/PrjBusyMask'
import { dwdbfsCustUpdateAltStop, dwdbfsCustUpdateHomeStop } from 'DWcmn/dwdbfsCust'
import { ScTile } from './ScTile'
import { GC_STD_MARGIN } from 'DWcmn/Global'
import { prjToast } from 'DWcmn/PrjToast'
import { cmnAlertPopup } from 'DWcmn/cmnAnnunciationFunctions';
import { prjStopCopy, prjStopUpdate, prjStopAltInit, prjStopAltRemove, prjStopType } from 'DWcmn/prjStopFunctions'
import { useRefresh } from 'DWcmn/prjUseRefresh'
import { useIsMounted } from 'DWcmn/prjUseIsMounted'
import { prjCloudLogError } from 'DWcmn/prjCloudLog'

//20240902 add building service code and change to use the new stop tile component
//20260919 converted to functional component


//CstProfileAddresses allows the user to edit home and add/delete/edit alt stop
//changes can be saved or cancelled. on exit changes are committed to db
//prop shop
//prop user
//prop onChange() user changed something
//prop onCancel() user cancelled changes
//prop onBack() user did not change anything
//realistically onBack and onCancel can be treated the same
export function CstProfileAddresses({ user, onChange, onCancel }) {

   const [isComponentInitialized, setIsComponentInitialized] = useState(false)
   const [isCustomerDbInProgress, setIsCustomerDbInProgress] = useState(false)
   const [changeAlternate, setChangeAlternate] = useState(false)
   const [changeHome, setChangeHome] = useState(false)
   const refresh = useRefresh()
   const isMountedRef = useIsMounted()

   const homeStopRef = useRef(null)
   const altStopRef = useRef(null)


   //one-time setup: make copies of the two stops for our use in here
   useEffect(() => {
      //CLAUDE: a null user throws here - needs protection/logging
      homeStopRef.current = prjStopCopy(user.homeStop)
      altStopRef.current = prjStopCopy(user.altStop)
      setIsComponentInitialized(true)
      // eslint-disable-next-line react-hooks/exhaustive-deps -- mount-only setup, as the class did in its constructor
   }, [])


   if (!isComponentInitialized) return null

   const homeStop = homeStopRef.current
   const altStop = altStopRef.current

   //validate, then commit the changes to the db
   async function saveChanges() {

      //NOTE validation errors do a return (before the mask goes on)
      //db errors throw .. the catch logs them
      //the finally block resets the mask (isCustomerDbInProgress) and leaves the screen however the save went
      //  so when they come back the screen is rebuilt from what is actually in the db

      //make sure that they have not left a blank address
      //ie alternate stop added but no address entered
      //CLAUDE: altStop is accessed with ?. in onCodeSelect below but without it here - throws if prjStopCopy can return null
      if (Boolean(altStop?.code) && !Boolean(altStop.address)) {
         prjToast({ type: 'reminder', i18n: 'cmnNEW.PleaseEnterAlternateAddress' })
         return
      } //WE ARE OUT OF HERE .. NO MORE PROCESSING
      if (prjStopType(homeStop) == 'building' && isBlank(homeStop.unit)) {
         prjToast({ type: 'reminder', i18n: 'cmnNEW.PleaseEnterYourUnit' })
         return
      }

      setIsCustomerDbInProgress(true)

      try {

         //write homestop iff changed
         if (changeHome) {
            await dwdbfsCustUpdateHomeStop(user.id, homeStop)
            prjStopUpdate(user.homeStop, homeStop) //only reached if the write worked
         }

         //write altStop iff changed
         if (changeAlternate) {
            await dwdbfsCustUpdateAltStop(user.id, altStop)
            prjStopUpdate(user.altStop, altStop) //only reached if the write worked
         }
      }
      catch (error) {
         prjCloudLogError('CstProfileAddresses', error)
      }
      finally {
         //runs on success or exception .. either way we are done here
         if (isMountedRef.current) {
            setIsCustomerDbInProgress(false)
            onChange()
         }
      }
   } //saveChanges

   //NOTE if this is one of the special building shops they can NOT have alternate addresses
   return (
      <CdsScreen>

         {/* mask the screen if we are doing lengthy database operations */}
         {isCustomerDbInProgress && <PrjBusyMask />}

         <GCHeader
            back={!(changeHome || changeAlternate) && onCancel}
            titleI18n='cmnNEW.Addresses'
         />
         <View style={{ flex: 1, marginHorizontal: GC_STD_MARGIN }}>
            <View style={{ flex: .5 }}>
               <ScTile
                  stop={homeStop}
                  profileHomeMode
                  onChange={(fields) => {
                     //we ignore fields .. no action, homeStop will have been altered
                     setChangeHome(true)
                     refresh()
                  }}
                  onCodeSelect={() => {
                     //change of code should never be allowed for home profile
                     cmnAlertPopup({ title: 'unexpected keypress in profileHome' })
                  }}
               />
            </View>
            {homeStop.code != 'building' && <View style={{ flex: .5 }}>
               <ScTile
                  stop={altStop}
                  profileAlternateMode
                  onChange={async (fields) => {
                     setChangeAlternate(true)
                     refresh()
                  }}
                  onCodeSelect={() => {
                     if (!Boolean(altStop?.code)) {// was null ... must be adding
                        prjStopAltInit(altStop)
                     }
                     else { //existed .. must be removing .. set code=null 
                        prjStopAltRemove(altStop)
                     }
                     setChangeAlternate(true)
                     refresh()
                  }}

               />

            </View>}
         </View>
         {(changeHome || changeAlternate) &&
            <GCFooterWithTwoIcons
               onOkayCode='NEXT_IS_SAVE'
               onOkay={saveChanges}

               onCancel={onCancel}

            />}
      </CdsScreen>
   )

}// end CstProfileAddresses