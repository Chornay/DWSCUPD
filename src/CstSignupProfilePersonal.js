import React, { Component } from 'react'

import { View, StyleSheet } from 'react-native'
import { Form } from 'native-base'
import { CdsScreen } from './CdsScreen';
import GCHeader from 'DWcmn/GCHeader'
import { GCFooterWithTwoIcons } from 'DWcmn/GCFooterForIcons'
import { XFormInput, validateForm } from 'DWcmn/PrjFormInput'
//20221206 complete re-org
//20221214 use XFormInput

//prop shop ... record (may be null)
//prop details {} containing initializing data
//prop onForward()
//prop onBack()
export default class CstSignupProfilePersonal extends Component {

   constructor(props) {
      super(props);
      this.state = {
         toggle: false
      }

      this.shop = this.props.shop
      this.details = this.props.details || {}
      this.fields = [
         {
            key: 1,
            mandatory: true,
            title: "Name",
            type: "name",
            assign: (val) => { this.details.name = val },
            init: () => { return (this.details.name) }
         },
         {
            key: 2,
            mandatory: true,
            title: "Phone Number",
            type: "phoneNumber",
            assign: (val) => { this.details.phoneNumber = val },
            init: () => { return (this.details.phoneNumber) }
         },
         {
            key: 3,
            mandatory: true,
            title: "Email",
            type: "email",
            assign: (val) => { this.details.email = val },
            init: () => { return (this.details.email) }
         },
      ]
   }
   componentDidMount() {
   }

   render() {

      return (
         <CdsScreen>
            <GCHeader titleI18n='cmnNEW.PersonalDetails' />
            <View style={{ flex: 1, paddingHorizontal: 10 }}>
               <Form>
                  {this.fields.map((field) => {
                     return (
                        <XFormInput key={field.key}
                           options={field}>
                           refresh={() => { this.toggle() }}
                        </XFormInput>
                     )
                  })}
               </Form>
            </View>
            <GCFooterWithTwoIcons
               onOkayCode='NEXT_IS_CREATE_ACCOUNT'
               onCancelCode='PREV_IS_START_AGAIN'
               onOkay={() => {
                  let valid = validateForm(this.fields)
                  if (valid) {
                     this.props.onForward(this.details.name, this.details.phoneNumber, this.details.email)
                  }
                  else { this.toggle() }
               }}
               onCancel={this.props.onBack}
            />
         </CdsScreen >
      )
   }
   //toggle a state variable to cause a render
   toggle = () => {
      this.setState({ toggle: !this.state.toggle })
   } //toggle 


}// end CstSignupProfilePersonal
