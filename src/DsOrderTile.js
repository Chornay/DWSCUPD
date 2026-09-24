import React, { Component } from 'react'
import { View, TouchableOpacity, StyleSheet } from 'react-native'
import { withNavigation } from 'react-navigation';
import { OrderActionEnum } from 'DWcmn/Global'
import { cmnOrderStatusStr, cmnOrderStatusColor } from 'DWcmn/TypeCmnFunctions.js'
import { cmnPaymentSummary } from 'DWcmn/CmnFunctions'
import CmnNotesList from 'DWcmn/CmnNotesList';
import CmnItemsList from 'DWcmn/CmnItemsList';
import { prjRouteName } from 'DWcmn/PrjCmnFunctions'
import { OrderStatusEnum } from "DWcmn/Global";
import { PrjIconForTileAction } from 'DWcmn/PrjIconComponents'
import { GCText, GCI18n } from 'DWcmn/Gc'
import { COLORS } from 'DWcmn/Global'
import { PRJ_STYLES } from 'DWcmn/PrjStyles'
import { APP } from 'DWcmn/APP'
import { dsGenerateOrderTileActions, dsProcessOrderAction, dsProcessOrderActionOnEvent } from './dsOrderActionProcessing'


//20250220 created from CmnOrderTile to be directly useable from shp and drv
//         NOTE readonly removed .. will be determined by context of the order
//TODO create dsProcessOrderAction

//NOTE clicking on the body of the order will navigate to and OrderDetail screen with param 'order' set
//NOTE any action in the input array will be rendered as a button. Pressing the button will call the 
//     processCommand property. processCommand can return JSX or null. It should call the 
//     onDismiss method when it is done. 
//prop order

class DsOrderTile extends Component {

   constructor() {
      super();
      this.state = {
         displayNotesCount: 0,
         displayItemNoteCount: 0, //TODO not used?
         isItemsVisible: false,
         action: OrderActionEnum.noop,
         isComponentInitialized: false,
      };
   }
   componentDidMount() {
      this.setState({ isComponentInitialized: true })
   }

   render() {


      if (!this.state.isComponentInitialized) {
         return null
      }
      const order = this.props.order;
      const appType = APP.getAppType();
      //generate the available actions
      const actions = dsGenerateOrderTileActions(order)

      // this.setState({ noteDisplayCount: order.notes.length })

      return (
         <View>
            {/* the method should handle any action .. then call the third parameter to finish */}
            {(this.state.action != OrderActionEnum.noop) && dsProcessOrderAction(order, this.state.action, () => { this.setState({ action: OrderActionEnum.noop }) })}

            {/* we would usually put in a flex:1 here BUT that seems to break our use at the bottom of maps. Sigh */}
            <View style={PRJ_STYLES.tile}>
               <View style={{ flex: .7 }}>
                  <View style={{ flex: 1, flexDirection: 'row' }}>
                     <View>
                        <TouchableOpacity
                           onPress={() => {
                              //NOTE we go to the right app based on stack.
                              this.props.navigation.navigate('OrderDetail', { 'id': order.id });
                           }}>
                           <View style={{ alignItems: 'flex-start' }}>
                              <GCText details>{order.id}</GCText>
                              <GCText details bold color={cmnOrderStatusColor(appType, order.status)} >
                                 {cmnOrderStatusStr(appType, order.status)}</GCText>
                              <GCText details >{order.name}</GCText>
                              <GCText details >{order.phoneNumber}</GCText>
                              {cmnPaymentSummary(order)}
                              {this.renderAddressAndDate(order)}
                           </View>
                        </TouchableOpacity>
                     </View>
                  </View>
               </View>

               <View style={{ flex: .3 }}>

                  <View style={styles.buttonsView}>
                     {
                        actions.map((action, index) =>
                           <PrjIconForTileAction
                              key={index}
                              action={action}
                              onPress={async () => {//if we don't handle now, we will handle during render
                                 if (!await dsProcessOrderActionOnEvent(this.props.navigation, order, action)) {
                                    this.setState({ action: action })
                                 }
                              }}

                           />
                        )}
                  </View>

               </View>
            </View>
            < CmnNotesList
               notes={order.notes}
               count={this.state.displayNotesCount}
            />
            {this.state.isItemsVisible &&
               <CmnItemsList order={order} />}
         </View>
      ) //end else 
   } //end render

   renderAddressAndDate(order) {
      let output = []
      switch (order.status) {

         //cancelled .. no need to show anything
         case OrderStatusEnum.cancelled:
            break;

         //not yet picked up .. show pickup info
         case OrderStatusEnum.readyForPickup:
         case OrderStatusEnum.assignedForPickup:
         case OrderStatusEnum.outForPickup:
            output.push(<GCText details key={1}>{prjRouteName(order.pickupRouteTime, order.pickupRouteDescrip)}</GCText>)
            output.push(<GCText details key={2}>{order.pickupStop.address}</GCText>)
            order.pickupStop.instructions && output.push(<GCText details key={3}>{order.pickupStop.instructions}</GCText>)
            break;

         // picked up or in shop - no address to show
         case OrderStatusEnum.pickedUp:
         case OrderStatusEnum.atShop:
         case OrderStatusEnum.inShop:
            break;

         // pending delivery show delivery info
         case OrderStatusEnum.readyForDelivery:
         case OrderStatusEnum.assignedForDelivery:
         case OrderStatusEnum.outForDelivery:
            output.push(<GCText details key={1}>{prjRouteName(order.deliveryRouteTime, order.deliveryRouteDescrip)}</GCText>)
            output.push(<GCText details key={2}>{order.deliveryStop.address}</GCText>)
            order.deliveryStop.instructions && output.push(<GCText details key={3}>{order.deliveryStop.instructions}</GCText>)
            break;

         //delivered .. no need to show anything
         case OrderStatusEnum.delivered:
         case OrderStatusEnum.confirmed:
         case OrderStatusEnum.completed:
            break;

         case OrderStatusEnum.invalid:
         default:
            output.push(<GCText details key={1}>Invalid Status</GCText>)
            break;
      }

      return output

   }
}// end DsOrderTile
export default withNavigation(DsOrderTile)

const styles = StyleSheet.create({
   buttonsView: {
      flexDirection:'row',
      // flexDirection: 'column',
      justifyContent: 'space-evenly'
   },

})