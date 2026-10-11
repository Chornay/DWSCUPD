import React, { useState, useEffect, useRef } from 'react'
import { Platform, StyleSheet, View, ScrollView } from 'react-native'
import { COLORS } from 'DWcmn/Global'
import { DsScreen } from './CdsScreen';
import CdsSpinnerScreen from './CdsSpinnerScreen';
import CmnItemsList from 'DWcmn/CmnItemsList'
import { PrjSpacer } from 'DWcmn/Prj';
import { dwdbfsOrderAddNew, dwdbfsOrderGetByIdThrows } from 'DWcmn/DWDBfs'
import { dwdbfsOrderChange } from 'DWcmn/dwdbfsOrder'
import { cmnAlertPopup } from 'DWcmn/cmnAnnunciationFunctions'
import { prjUpdateOrderPricing } from 'DWcmn/prjUpdateOrderPricing'
import { CmnTouchableEdit } from 'DWcmn/CmnTouchableEdit'
import { GCText, GCI18n } from 'DWcmn/Gc'
import { strX } from 'DWcmn/I18n';
import GCHeader from 'DWcmn/GCHeader' //NOTE doing the default import
import { GC_STD_MARGIN } from 'DWcmn/Global'
import { PrjButtonWithConfirm } from 'DWcmn/PrjButtonWithConfirm'
import { PrjBusyMask } from 'DWcmn/PrjBusyMask'
import { prjIconEditableBox } from 'DWcmn/PrjIconComponents'
import { prjCloudLogError } from 'DWcmn/prjCloudLog'
import { useRefresh } from 'DWcmn/prjUseRefresh'
import { useNavigation, useRoute } from 'DWcmn/PrjNav5Wrapper'
// import DateTimePicker from '@react-native-community/datetimepicker';

//20250210 added reschedule functionality
//20260206 moved processCategory to be local

//This screen gives the customer a last look at the order before committing it to the db
//NOTE if the reschedule flag is set we are just reviewing a change in pickup and

// TODO we think that this color looks good '#0e9af1'

//nav param priceList
export function DsMenuOrderChangeInvoice() {

   const navigation = useNavigation()
   const { priceList = null } = useRoute().params ?? {}
   const refresh = useRefresh()

   const [isComponentInitialized, setIsComponentInitialized] = useState(false)
   const [applyMask, setApplyMask] = useState(false)

   const orderRef = useRef(null)

   //NOTE this pattern is like that in cstCheckoutOrderInit but we are not initializing any fields
   //CLAUDE: bug fixed by this conversion - the original class version called the bare `processCategory(entry)`
   //for recursion instead of `this.processCategory(entry)`. Since processCategory was a class-property arrow
   //function (not a true method), that bare call referenced an undefined free variable rather than recursing -
   //so any nested category more than one level deep would have thrown or silently failed to collect its items.
   //As a local function declaration here, the bare recursive call is now correct automatically.
   function processCategory(category) {
      category.entries.forEach((entry) => {
         if (entry.isCategory) {
            processCategory(entry)
         }
         else {
            if (entry.included) {
               // console.log('before',entry)
               const item={...entry}
               // console.log('after',item)
               //NOTE we could exclude items if we want eg const { password, token, ...safeCopy } = original;
               orderRef.current.items.push(item)
            }
         }
      })
   }//end processCategory

   //TODO not sure where to go on db read error (or order not existing)
   useEffect(() => {
      (async () => {
         try {
            orderRef.current = await dwdbfsOrderGetByIdThrows(priceList?.orderId)

            //throw away all the order items and then move ours from the pricelist
            orderRef.current.items = []
            priceList.top.entries.forEach((category) => {
               processCategory(category)
            })
            prjUpdateOrderPricing(orderRef.current) //TODO check do we need first time flag set??

            setIsComponentInitialized(true)
         }
         catch (error) {
            prjCloudLogError('DsMenuOrderChangeInvoice setup', error, { toastI18n: "cmnNEW.MsgDbReadError" })
         }
      })()
      // eslint-disable-next-line react-hooks/exhaustive-deps -- mount-only effect, mirrors original componentDidMount
   }, [])

   const submitChanges = async () => {
      setApplyMask(true)
      try {
         let newId = await dwdbfsOrderChange(orderRef.current)
         //NOTE both driver and shop use this screen name
         // goBackToScreen(navigation,'OrderDetail')
         navigation.navigate('OrderDetail')
      }
      catch (error) {
         prjCloudLogError('DsMenuOrderChangeInvoice submitChanges', error, { toastI18n: 'cmnNEW.ERRORModifyingOrder' })
      }
      finally {
         setApplyMask(false)
      }
   }

   if (!isComponentInitialized) {
      return (
         <CdsSpinnerScreen />
      );
   }

   //   const cancelConfirmI18n = reschedule ? "cmnNEW.DiscardTheseChanges_" : null
   //TODO replace EDITABLE BOX with method

   return (

      <DsScreen>
         {(applyMask) && <PrjBusyMask />}
         {/* <GCHeader back cancel cancelConfirmI18n={reschedule ? "cmnNEW.DiscardTheseChanges_" : null}
            titleI18n='cmnNEW.ORDER_CHANGE_INVOICE'
            noBottomPadding /> */}
         <GCHeader back cancel
            titleI18n='cmnNEW.ORDER_CHANGE_INVOICE'
            noBottomPadding />
         <View style={{ flex: 1, marginHorizontal: GC_STD_MARGIN }}>
            <ScrollView style={{ flex: .85 }}>
               <CmnItemsList order={orderRef.current} readonly></CmnItemsList>
               <PrjSpacer size={10} />
               <View style={styles.tile}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                     <GCText title>{strX('cmnNEW.REMARKS')}</GCText>
                     <CmnTouchableEdit
                        specialEditBox
                        titleI18n='cmnNEW.RemarksForOrder'
                        initial={orderRef.current.remarks}
                        onOkay={(newValue) => { orderRef.current.remarks = newValue; refresh() }}
                        onCancel={() => { }}
                        onDelete={() => { orderRef.current.remarks = null; refresh() }}>
                        {prjIconEditableBox()}

                     </CmnTouchableEdit>
                  </View>
                  <GCText detail light>{orderRef.current.remarks}</GCText>
               </View>
               <View style={{ height: 10 }} />
            </ScrollView>
            <View style={{ flex: .15, alignItems: 'center', justifyContent: 'center' }}>
               <PrjButtonWithConfirm
                  // buttonStyle={{ color: COLORS.GC_THEME_DARK, fontWeight: 'bold'}}
                  buttonStyle={styles.orderButton}
                  i18n="cmnNEW.SUBMIT_CHANGES"
                  confirmI18n="cmnNEW.OrderChangesConfirm_"
                  onConfirm={async () => { await submitChanges() }}
               />

            </View>
         </View>
      </DsScreen >
   );
}// end DsMenuOrderChangeInvoice

const styles = StyleSheet.create({
   tile: {
      justifyContent: 'center',
      width: '100%',
      height: 'auto',
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 6,
      marginBottom: 10,
      borderColor: COLORS.GC_TILE_BORDER,
      borderWidth: 1.5,
      backgroundColor: COLORS.GC_ABS_WHITE
   },

   orderButton: {
      justifyContent: 'center',
      alignItems: 'center',
      // borderRadius: 40,
      borderRadius: Platform.OS == 'ios' ? 20 : 40,
      borderStyle: 'solid',
      paddingTop: 10,
      paddingBottom: 10,
      paddingLeft: 30,
      paddingRight: 30,
      width: 'auto',
      shadowColor: 'rgba(0, 0, 0, 0.1)',
      shadowOpacity: 2,
      shadowRadius: 5,
      shadowOffset: { height: 4 }, // SC added shadowOffset for iOS
      elevation: 5,
      backgroundColor: COLORS.GC_BUTTON_BKG,
      color: 'white',
      overflow: 'hidden', //add to show borderRadius on iOS
   }

})