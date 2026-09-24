import React, { useState, useEffect } from 'react'
import { View, StyleSheet, TouchableOpacity } from 'react-native'

import { withNavigation } from 'react-navigation';
import moment from 'moment';
import { OrderActionEnum } from 'DWcmn/Global'
import { cmnOrderStatusStr, cmnOrderStatusColor } from 'DWcmn/TypeCmnFunctions.js'
import { cmnPaymentSummary } from 'DWcmn/CmnFunctions'
import CmnItemsList from 'DWcmn/CmnItemsList';
import { OrderStatusEnum } from "DWcmn/Global";
import { PrjSpacer } from 'DWcmn/Prj'
import storage from '@react-native-firebase/storage';
import { dwdbfsOrderUpdateFields } from 'DWcmn/dwdbfsOrder'
import { prjCloudLogError } from 'DWcmn/prjCloudLog'
import { PrjBusyMask } from 'DWcmn/PrjBusyMask'
import { useIsMounted } from 'DWcmn/prjUseIsMounted'

import GLOBALS from 'DWcmn/Global';
import { COLORS } from 'DWcmn/Global'
import { GCText, GCI18n } from 'DWcmn/Gc'
import { GCStopDetails } from 'DWcmn/GCStopDetails'
import { PrjIcon, PrjIconForTileAction } from 'DWcmn/PrjIconComponents'
import { PrjIconForRemark } from 'DWcmn/PrjIconForRemark'
import { strX } from 'DWcmn/I18n';
import { PRJ_STYLES } from 'DWcmn/PrjStyles'

import { cstGenerateTileActions, cstProcessAction, cstProcessActionOnEvent } from './cstActionProcessing'
import { hasBeenPickedUpNEW } from 'DWcmn/PrjCmnFunctions'
import { GC_STD_MARGIN } from 'DWcmn/Global'


//20201023 moved status colour from bar to background of status
//20220918 created by moving code from CstCmnOrderTile and CmnOrderTile
//20230526 removed obsolete commented code
//20250214 action processing re-org
//20260923 converted class -> functional

//prop order
//prop readonly

function CstOrderTile({ order, readonly, navigation }) {

   const [isItemsVisible, setIsItemsVisible] = useState(false)
   const [action, setAction] = useState(OrderActionEnum.noop)
   const [isComponentInitialized, setIsComponentInitialized] = useState(false)
   const [applyMask, setApplyMask] = useState(false)
   const isMountedRef = useIsMounted()

   // single independent effect -> its own useEffect, mirrors old componentDidMount
   useEffect(() => {
      setIsComponentInitialized(true)
   }, [])

   //CLAUDE PrjBusyMask is a screen-level masking convention, but this component is a single
   //tile inside a list. Masking here blocks interaction with every other tile while this
   //tile's photo uploads, not just this one. Confirm that's the intent vs. some local/inline
   //busy indicator on just this tile.
   const savePhoto = async (orderId, uri) => {
      setApplyMask(true)
      try {
         //store the picture in the cloud
         const path = `/orders/${orderId.toString()}.imageForPickup.png`
         let reference = storage().ref(path)
         await reference.putFile(uri);
         //and update customer with the uri of the picture
         await dwdbfsOrderUpdateFields(orderId, { imageForPickup: path })
      }
      catch (error) {
         prjCloudLogError('CstOrderTile', error)
      }
      finally {
         if (isMountedRef.current) {
            setApplyMask(false)
         }
      }
   } //end savePhoto

   const renderPhotoInvitation = (order) => {

      if (hasBeenPickedUpNEW(order) || order.imageForPickup) { return null }
      return (
         <TouchableOpacity
            onPress={() => {
               navigation.navigate('CdsCamera', { onSave: (uri) => savePhoto(order.id, uri) })
            }}>
            <View style={styles.photoInvitation}>
               <PrjIcon id="CAMERA" />
               <GCI18n title code='cmnNEW.TakePhoto' />
               <PrjIconForRemark size={25} text={strX("cmnNEW.TakePhotoRemark")}></PrjIconForRemark>
            </View>
         </TouchableOpacity>
      )

   } //end renderPhotoInvitation

   const renderAddressAndDate = (order) => {
      let output = []
      switch (order.status) {

         //cancelled .. no need to show anything
         case OrderStatusEnum.cancelled:
            break;

         //not yet picked up .. show pickup info
         case OrderStatusEnum.readyForPickup:
         case OrderStatusEnum.assignedForPickup:
         case OrderStatusEnum.outForPickup:
            return (<GCStopDetails routeTime={order.pickupRouteTime} routeDescrip={order.pickupRouteDescrip} stop={order.pickupStop} />)

         // picked up or in shop - no address to show
         case OrderStatusEnum.missedPickup:
         case OrderStatusEnum.pickedUp:
         case OrderStatusEnum.atShop:
         case OrderStatusEnum.inShop:
            break;

         // pending delivery show delivery info
         case OrderStatusEnum.readyForDelivery:
         case OrderStatusEnum.assignedForDelivery:
         case OrderStatusEnum.outForDelivery:
            return (<GCStopDetails routeTime={order.deliveryRouteTime} routeDescrip={order.deliveryRouteDescrip} stop={order.deliveryStop} />)

         //delivered (or missed) .. no need to show anything
         case OrderStatusEnum.missedDelivery:
         case OrderStatusEnum.delivered:
         case OrderStatusEnum.confirmed:
         case OrderStatusEnum.completed:
            break;

         case OrderStatusEnum.invalid:
         default:
            output.push(<GCText>Invalid Status</GCText>)
            break;
      }

      return output

   } //end renderAddressAndDate

   if (!isComponentInitialized) {
      return null
   }

   let actions = cstGenerateTileActions(order)

   return (
      <View>
         {applyMask && <PrjBusyMask />}
         {/* the method should handle any action .. then call the third parameter to finish */}
         {(action != OrderActionEnum.noop) && cstProcessAction(navigation, order, action, () => { setAction(OrderActionEnum.noop) })}
         {/* we would usually put in a flex:1 here BUT that seems to break our use at the bottom of maps. Sigh */}
         <View style={PRJ_STYLES.tile}>
            <View style={{ flex: 1, flexDirection: 'column' }}>

               <PrjSpacer size={10} />
               <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <View style={{ flexDirection: 'column' }}>
                     <GCI18n title code='cmnNEW.ORDER_ID' />
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                     <GCText details color={COLORS.GC_TEXT_GREY}  >{order.id}</GCText>
                  </View>
               </View>
               <View style={styles.horizontalLine} />
               <PrjSpacer size={20} />
               <GCText details bold color={cmnOrderStatusColor('cst', order.status)} >{cmnOrderStatusStr('cst', order.status)}</GCText>
               {renderAddressAndDate(order)}
               <PrjSpacer size={10} />
               {cmnPaymentSummary(order)}
               <PrjSpacer size={20} />
               {renderPhotoInvitation(order)}
               <PrjSpacer size={10} />
               <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
                  {readonly ? null :
                     actions.map((actionItem, index) =>
                        <PrjIconForTileAction
                           key={index}
                           action={actionItem}
                           onPress={() => {
                              if (!cstProcessActionOnEvent(navigation, order, actionItem)) {
                                 setAction(actionItem)
                              }
                           }}
                        />
                     )}
               </View>
            </View>
         </View>
         {isItemsVisible &&
            <CmnItemsList order={order} readonly={readonly} />}
      </View>
   )

} // end CstOrderTile


const styles = StyleSheet.create({
   // orderTile: {
   //    alignSelf: 'center',
   //    justifyContent: 'space-between',
   //    width: '100%',
   //    height: 'auto',
   //    paddingVertical: 10,
   //    borderRadius: 10,
   //    marginBottom: 10,
   //    backgroundColor: '#f7f7f7'
   // },
   tileContent: {
      // paddingHorizontal: 20,
   },
   title: {
      letterSpacing: 1,
      fontSize: 16,
      alignSelf: 'flex-start'
   },
   photoInvitation: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      height: 40,
      borderRadius: 10,
      borderWidth: 2,
      borderColor: COLORS.GC_THEME_DARK,
      paddingHorizontal: 10,
      marginHorizontal: GC_STD_MARGIN
   },
   horizontalLine: {
      borderBottomColor: COLORS.GC_HORIZONTAL_LINE,
      borderBottomWidth: 0.5,
      width: '100%',
   },
   //TODO put this to PrjStyle 


})
export default withNavigation(CstOrderTile)