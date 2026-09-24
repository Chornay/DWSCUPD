import React, { Component } from 'react'
import { View, StyleSheet, ScrollView } from 'react-native'
import { GCText, GCI18n } from 'DWcmn/Gc'
import CdsSpinnerScreen from './CdsSpinnerScreen'
import { DsScreen } from './CdsScreen';
import GCHeader from 'DWcmn/GCHeader'
import { CdsMenuLineDisplay } from './CdsMenuLineDisplay';
import { cdsMenuRenderSummaryBox } from './cdsMenuRenderSummaryBox'
import { COLORS } from 'DWcmn/Global';
import { cdsMenuPricelistUpdateTotals } from './cdsMenuPricelistUpdateTotals'
import { APP } from 'DWcmn/APP'
import { LogBox } from 'react-native'
import GCFooterForIcons, { GCFooterCmdIcon } from 'DWcmn/GCFooterForIcons'




//TODO driver/shop should NOT have write access to remarks/photos
//nav parameter priceList


export default class DsMenuOrderChangeSummary extends Component {

   constructor() {
      super();
      this.state = {
         isComponentInitialized: false,
         toggle: false,
      };
      this.priceList = null
      this.stack = []
      this.stackEZ = []

   }

   async componentDidMount() {

      this.unsubscribeMenuCatFocusListener = await this.props.navigation.addListener('didFocus', this.gotFocus)

      this.priceList = this.props.navigation.getParam('priceList', null);

      //extract all the pricelist entries that have been selected
      //this list will not change even if they decrement an item to zero
      this.stack = []
      this.priceList.top.entries.forEach((category) => {
         this.selectCategory(category, category.type)
      })

      //tunn off warnings because we get a pesky warning when items get removed by decrementing
      LogBox.ignoreAllLogs(true)

      this.setState({ isComponentInitialized: true });

   } //end componentDidMount

   componentWillUnmount() {
      LogBox.ignoreAllLogs(false)
      this.unsubscribeMenuCatFocusListener?.remove();
   } //end componentWillUnmount

   gotFocus = () => {
      this.forceUpdate()
   }

   selectCategory = (category, type) => {
      category.entries.forEach((entry) => {
         if (entry.isCategory) {
            this.selectCategory(entry, type) //NOTICE we used parent's type
         }
         else {
            if (entry.included) {
               if (type == 'EZ') {
                  this.stackEZ.push(entry)
               }
               else {
                  this.stack.push(entry)
               }
            }
         }
      })
   }

   render() {

      if (!this.state.isComponentInitialized) { //not finished our preparation yet
         return (
            <CdsSpinnerScreen />
         );
      }

      return (
         // <View><Text>Fooo</Text></View>
         <DsScreen blah={this.state.toggle}>

            <GCHeader back cancel titleI18n='cmnNEW.ORDER_CHANGE_SUMMARY' />
            <View style={{ flex: 1 }}>
               {/* Stack EZ */}
               {(this.stackEZ.length != 0) && <><View style={styles.titleBanner}>
                  {/* //TODO add traslation */}
                  <GCText large bold>EZ ORDER</GCText>
               </View>
                  <ScrollView style={styles.eZContent}>
                     <View foo={this.state.toggle} />
                     {this.stackEZ.map((item, index) => {
                        return (<CdsMenuLineDisplay
                           onLeftTouch={() => { this.props.navigation.navigate('CdsMenuItemRemarkAndPhotoScreen', { 'line': item }) }}
                           changedSomething={() => {
                              cdsMenuPricelistUpdateTotals(this.priceList);
                              if (this.priceList.count <= 0) {
                                 this.props.navigation.popToTop()
                              }
                              else {
                                 this.toggle()
                              }
                           }}
                           line={item} key={index}
                           useLongName></CdsMenuLineDisplay>)
                     })}
                  </ScrollView>

                  <View style={styles.titleBanner}>
                     {/* //TODO add traslation */}
                     <GCText large bold>CHANGE ORDER</GCText>
                  </View></>}

               <ScrollView style={styles.changeOrderContent}>
                  <View foo={this.state.toggle} />
                  {this.stack.map((item, index) => {
                     return (<CdsMenuLineDisplay
                        changedSomething={() => {
                           cdsMenuPricelistUpdateTotals(this.priceList);
                           if (this.priceList.count <= 0) {
                              this.props.navigation.popToTop()
                           }
                           else {
                              this.toggle()
                           }
                        }}
                        line={item} key={index}
                        useLongName></CdsMenuLineDisplay>)
                  })}
               </ScrollView>
               {cdsMenuRenderSummaryBox(this.priceList)}

               {/* FOOTER SECTION */}
               <GCFooterForIcons>
                  <GCFooterCmdIcon
                     code='SEARCH'
                     //??               hide={this.priceList.count == 0}
                     onPress={() => {
                        this.props.navigation.navigate('CdsMenuSearchScreen', { 'priceList': this.priceList })
                     }}
                  />
                  <GCFooterCmdIcon
                     code='NEXT_IS_ORDER_CHANGE_INVOICE'
                     onPress={() => {
                        this.props.navigation.navigate('DsMenuOrderChangeInvoice', { 'priceList': this.priceList })
                     }}
                  />
               </GCFooterForIcons>
            </View>
         </DsScreen>

      );
   } //end render


   //toggle a state variable to cause a render
   toggle = () => {
      this.setState({ toggle: !this.state.toggle })
   } //toggle 

} //end DsMenuOrderChangeSummary

const styles = StyleSheet.create({
   eZContent: {
      flexBasis: '50%',
      flexShrink: 1,
      flexGrow: 0,
   },
   changeOrderContent: {
      flexBasis: '50%',
      flexGrow: 1,
      flexShrink: 0,
   },
   titleBanner: {
      backgroundColor: COLORS.GC_HIGHLIGHT_IMPORTANT,
      flexDirection: 'row',
      height: 30,
      alignItems: 'center',
      justifyContent: 'center'
   }
})