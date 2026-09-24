import React, { Component } from 'react'
import { StyleSheet, View, FlatList } from 'react-native'
import moment from 'moment';
import firestore from '@react-native-firebase/firestore';
import { CstScreen } from './CdsScreen';
import GCHeader from 'DWcmn/GCHeader'
import CstSpinnerScreen from './CstSpinnerScreen'
import CmnCouponTile from 'DWcmn/CmnCouponTile.js'


//prop coupons
//prop onSelect(coupon) [optional] defined iff parent wants to know the currently selected coupon
//prop readonly
export class CstCouponList extends Component {
   constructor() {
      super();
      this.state = {
         isComponentInitialized: false,
         selIndex: -1,
      };
   }

   componentDidMount() {
      this.coupons = this.props.coupons
      this.setState({ isComponentInitialized: true })
   }

   render() {

      const readonly = this.props.readonly

      if (!this.state.isComponentInitialized) { //not finished our preparation yet
         return (
            <CstSpinnerScreen />
         );
      } //end if 

      return (
         <View>
            <FlatList
               data={this.props.coupons}
               keyExtractor={(item, index) => index.toString()}
               renderItem={({ item, index }) => {
                  return (
                     <CmnCouponTile
                        coupon={item}
                        isSelected={!readonly && index == this.state.selIndex}
                        onPress={() => {
                           console.log('hullo')
                           if (this.state.selIndex != index) {//select a coupon
                              this.setState({ selIndex: index })
                              this.props.onSelect?.(item)
                           }
                           else { //deselect current
                              this.setState({ selIndex: -1 })
                              this.props.onSelect?.(null)
                           }
                        }} //end onPress
                     />
                  )
               }} //end renderItem 
            >
            </FlatList>
         </View>
      )

   } //end render

} //end CstCouponList

const styles = StyleSheet.create({
});


