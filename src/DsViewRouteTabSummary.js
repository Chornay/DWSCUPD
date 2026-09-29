import React, { Component } from 'react'
import { View, StyleSheet } from 'react-native'
import { ListItemGBC, ListItemRight, ListItemBody, ListItemLeft } from 'DWcmn/PrjNativeBase'
import { COLORS } from 'DWcmn/Global';

import { GCText } from 'DWcmn/Gc'

import { OrderStatusEnum } from 'DWcmn/Global'
import { strX } from 'DWcmn/I18n.js'

//20250218 created to merge shp and drv

//props route .. NOT CURRENTLY USED
//props orders
export default class DsViewRouteTabSummary extends Component {

  constructor() {
    super();
    this.state = {
    }
  } //end constructor

  render() {

    //check properties   
    // assert ((this.props.orders != null) && Array.isArray(this.props.orders)) {

    let numDelivered = 0;
    let numNotDelivered = 0;
    let numPickedup = 0;
    let numNotPickedup = 0;
    let numOthers = 0;

    this.props.orders.forEach((order) => {
      switch (order.status) {
        case OrderStatusEnum.initial:
        case OrderStatusEnum.cancelled:
        case OrderStatusEnum.missedPickup:
        case OrderStatusEnum.missedDelivery:
          ++numOthers; break;
        case OrderStatusEnum.readyForPickup:
        case OrderStatusEnum.assignedForPickup:
        case OrderStatusEnum.outForPickup:
          ++numNotPickedup; break;
        case OrderStatusEnum.pickedUp:
          ++numPickedup; break;
        case OrderStatusEnum.atShop:
        case OrderStatusEnum.inShop:
          ++numOthers; break;
        case OrderStatusEnum.readyForDelivery:
        case OrderStatusEnum.assignedForDelivery:
        case OrderStatusEnum.outForDelivery:
          ++numNotDelivered; break;
        case OrderStatusEnum.delivered:
        case OrderStatusEnum.confirmed:
          ++numDelivered; break;
        case OrderStatusEnum.completed:
        default:
          ++numOther; break;

      } //end switch
    })

    return (
      <View>
        <SummaryTitle title={strX("dsRteSumm.DELIVERIES:")} />
        <SummaryLineItem title={strX("dsRteSumm.Done:")} amount={numDelivered} />
        <SummaryLineItem title={strX("dsRteSumm.Remaining:")} amount={numNotDelivered} />
        <SummaryLineItem title={strX("dsRteSumm.Total:")} amount={numDelivered + numNotDelivered} />
        <SummaryTitle title={strX("dsRteSumm.PICKUPS:")} />
        <SummaryLineItem title={strX("dsRteSumm.Done:")} amount={numPickedup} />
        <SummaryLineItem title={strX("dsRteSumm.Remaining:")} amount={numNotPickedup} />
        <SummaryLineItem title={strX("dsRteSumm.Total:")} amount={numPickedup + numNotPickedup} />

        {/* report errors (if there are any)  
      NOTE can't seem to conditionally render a SummaryLineItem */}
        {numOthers != 0 &&
          <>
            <SummaryTitle title={strX("dsRteSumm.OTHERS:")} />
            <SummaryLineItem title={strX("dsRteSumm.Total:")} amount={numOthers} />
          </>}
      </View >
    )
  } //end render  

} //end DsViewRouteTabSummary

class SummaryLineItem extends Component {
  render() {
    return (
      <ListItemGBC >
        <ListItemBody><GCText list>{this.props.title}</GCText></ListItemBody>
        <ListItemRight><GCText list>{this.props.amount}</GCText></ListItemRight>
      </ListItemGBC>
    )
  } //end render
} //end SummaryLineItem

class SummaryTitle extends Component {
  render() {
    return (
      <>
        <ListItemGBC style={{ backgroundColor: COLORS.GC_LIST_HDR_BKG }}><GCText list bold>{this.props.title}</GCText></ListItemGBC>
      </>
    )
  } //end render
} //end SummaryTitle

const styles = StyleSheet.create({
})
