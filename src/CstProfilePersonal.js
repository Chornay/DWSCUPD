import React, { useRef, useState } from 'react'

import { View } from 'react-native'
import { CdsScreen } from './CdsScreen';
import GCHeader from 'DWcmn/GCHeader'
import { GCFooterWithTwoIcons } from 'DWcmn/GCFooterForIcons'
import { PrjBusyMask } from 'DWcmn/PrjBusyMask'
import { XFormInput, validateForm } from 'DWcmn/PrjFormInput'
import { dwdbfsCustUpdateProfile } from 'DWcmn/dwdbfsCust'
import { GC_STD_MARGIN } from 'DWcmn/Global'
import { CST } from './CST'
import { useIsMounted } from 'DWcmn/prjUseIsMounted'
import { prjCloudLogError } from 'DWcmn/prjCloudLog'

//20230214 created
//20260919 converted to functional component

//prop onOkay()
//prop onCancel()
export function CstProfilePersonal({ onOkay, onCancel }) {

   const [isCustomerDbInProgress, setIsCustomerDbInProgress] = useState(false)
   const [changed, setChanged] = useState(false)
   const isMountedRef = useIsMounted()

   //the initial values come from the current customer .. after that the refs own the values (the form fields assign to them)
   const user = CST.getCust()
   const idRef = useRef(user.id)
   const nameRef = useRef(user.name)
   const phoneNumberRef = useRef(user.phoneNumber)
   const emailRef = useRef(user.email)

   //the fields are built ONCE (as the constructor did) so the same objects are used for the life of the screen
   const fieldsRef = useRef(null)
   if (fieldsRef.current === null) {
      //CLAUDE: hard-coded English titles - should be i18n keys like the rest of the screen
      fieldsRef.current = [
         {
            key: -1,
            mandatory: true,
            disabled: true,
            title: "Customer Id",
            type: "name",
            assign: (val) => { }, //never changes
            init: () => { return (idRef.current) }
         },
         {
            key: 1,
            mandatory: true,
            title: "Name",
            type: "name",
            assign: (val) => { nameRef.current = val; setChanged(true) },
            init: () => { return (nameRef.current) }
         },
         {
            key: 2,
            mandatory: false,
            title: "Phone Number",
            type: "phoneNumber",
            assign: (val) => { phoneNumberRef.current = val; setChanged(true) },
            init: () => { return (phoneNumberRef.current) }
         },
         {
            key: 3,
            mandatory: true,
            title: "Email",
            type: "email",
            assign: (val) => { emailRef.current = val; setChanged(true) },
            init: () => { return (emailRef.current) }
         },
      ]
   }


async function saveChanges() {
   let valid = validateForm(fieldsRef.current)
   if (valid) {
      setIsCustomerDbInProgress(true)
      try {
         await dwdbfsCustUpdateProfile(idRef.current, nameRef.current, phoneNumberRef.current, emailRef.current)
         onOkay()
      }
      catch (error) {
         prjCloudLogError('CstProfilePersonal', error)
      }
      finally {
         if (isMountedRef.current) { setIsCustomerDbInProgress(false) }
      }
   }
}//end saveChanges

   return (
      <CdsScreen>

         {/* if the caller is doing something lengthy he will set the disabled flag */}
         {/* and we will cover the screen with a modal to prevent clicking         */}
         {isCustomerDbInProgress && <PrjBusyMask />}

         <GCHeader back={!changed && onCancel}
            titleI18n='cmnNEW.PersonalDetails'
         />
         <View style={{ flex: 1, marginHorizontal: GC_STD_MARGIN }}>
            <View>
               {fieldsRef.current.map((field) => {
                  return (
                     <XFormInput key={field.key}
                        options={field} />
                  )
               })}
            </View>
         </View>
         {changed &&
            <GCFooterWithTwoIcons
               onOkayCode='NEXT_IS_SAVE'
               onOkay={saveChanges}
               onCancel={onCancel}

            />}

      </CdsScreen>
   )

}// end CstProfilePersonal