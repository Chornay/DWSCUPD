import React, { Component } from 'react'
import { View, Text, ScrollView } from 'react-native'
import { ListItemGBC, ListItemBody } from 'DWcmn/PrjNativeBase'
import { PrjRadioButton } from 'DWcmn/PrjRadioButton'

import { COLORS } from 'DWcmn/Global';
import { strX } from 'DWcmn/I18n'
import CmnSettingsModal, { settingsField } from 'DWcmn/CmnSettingsModal'

// Properties
//   isVisible flag to display modal
//   onDone()
//   onSet()
//   style any changes to the default styling of the box
export default class ShpRouteSettingsModal extends Component {

   constructor() {
      super();
      this.state = {
         filterMode: 'all', //all,pickup,delivery
         sortMode: 'name', //name,order,distance
      };
   }


   render() {

      if (!this.props.isVisible) {
         return null
      }

      return (
         <CmnSettingsModal
            onDone={this.props.onDone}
         >

            <View style={{ flex: 1 }}>
               <ScrollView style={{ flex: .7, paddingTop: 10, paddingHorizontal: 10 }}>
                  <Text style={{ paddingLeft: 10, color: 'white', fontSize: 16, fontWeight: 'bold' }}>FILTER BY</Text>

                  {this.filterChoice("pickup")}
                  {this.filterChoice("delivery")}
                  {this.filterChoice("all")}
                  <Text style={{ paddingLeft: 10, color: 'white', fontSize: 16, paddingTop: 10, fontWeight: 'bold' }}>SORT BY</Text>
                  {this.sortChoice("name")}
                  {this.sortChoice("order")}
                  {this.sortChoice("distance")}
                  < View
                     style={{
                        borderBottomColor: 'white',
                        borderBottomWidth: .5,
                        paddingTop: 10,
                        marginLeft: 7
                     }} />
                  {settingsField("Language")}
                  {/* {settingsField("Become a Merchant")} */}
                  {settingsField("Terms Of Use")}
                  {settingsField("Contact Us")}
                  {settingsField("Logout")}
               </ScrollView>
            </View>
         </CmnSettingsModal>
      );
   } //end render

   filterChoice(tag) {
      return (
         <ListItemGBC noBorder>
            <PrjRadioButton
               checked={this.state.filterMode == tag}
               onPress={() => {
                  this.setState({ filterMode: tag })
                  this.props.onSet({ filterOrdersSetting: tag })
               }}
            />
            <ListItemBody style={{ paddingLeft: 20 }}>
               <Text>{strX("cmn.filterModeSelection." + tag)}</Text>
            </ListItemBody>
         </ListItemGBC>
      )
   } //end filterChoice

   sortChoice(tag) {
      return (
         <ListItemGBC noBorder>
            <PrjRadioButton
               checked={this.state.sortMode == tag}
               onPress={() => { this.setState({ sortMode: tag }) }}
            />
            <ListItemBody style={{ paddingLeft: 20 }}>
               <Text>{strX("cmn.sortModeSelection." + tag)}</Text>
            </ListItemBody>
         </ListItemGBC>
      )
   } //end sortChoice

} //end ShpRouteSettingsModal




