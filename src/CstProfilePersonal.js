import React, { Component } from 'react'

import { StyleSheet, View } from 'react-native'
import { Form } from 'native-base'
import { CdsScreen } from './CdsScreen';
import GCHeader from 'DWcmn/GCHeader'
import { GCFooterWithTwoIcons } from 'DWcmn/GCFooterForIcons'
import { PrjBusyMask } from 'DWcmn/PrjBusyMask'
import { XFormInput, validateForm } from 'DWcmn/PrjFormInput'
import { dwdbfsCustUpdateProfile } from 'DWcmn/dwdbfsCust'
import { GC_STD_MARGIN } from 'DWcmn/Global'
import { CST } from './CST'

//20230214 created

//prop onOkay()
//prop onCancel()
export class CstProfilePersonal extends Component {

   constructor(props) {
      super(props);
      this.state = {
         isCustomerDbInProgress: false,
         changed: false,
      }

      this.shop = CST.getShop()
      this.user = CST.getCust()

      this.name = this.user.name
      this.phoneNumber = this.user.phoneNumber
      this.email = this.user.email
      this.id = this.user.id


      this.fields = [
         {
            key: -1,
            mandatory: true,
            disabled: true,
            title: "Customer Id",
            type: "name",
            assign: (val) => { }, //never changes
            init: () => { return (this.id) }
         },
         {
            key: 1,
            mandatory: true,
            title: "Name",
            type: "name",
            assign: (val) => { this.name = val; this.setState({ changed: true }) },
            init: () => { return (this.name) }
         },
         {
            key: 2,
            mandatory: false,
            title: "Phone Number",
            type: "phoneNumber",
            assign: (val) => { this.phoneNumber = val; this.setState({ changed: true }) },
            init: () => { return (this.phoneNumber) }
         },
         {
            key: 3,
            mandatory: true,
            title: "Email",
            type: "email",
            assign: (val) => { this.email = val; this.setState({ changed: true }) },
            init: () => { return (this.email) }
         },
      ]
   }
   componentDidMount() {
   }

   render() {

      return (
         <CdsScreen>

            {/* if the caller is doing something lengthy he will set the disabled flag */}
            {/* and we will cover the screen with a modal to prevent clicking         */}
            {this.state.isCustomerDbInProgress && <PrjBusyMask />}

            <GCHeader back={!this.state.changed && this.props.onCancel}
               titleI18n='cmnNEW.PersonalDetails'
            />
            <View style={{ flex: 1, marginHorizontal: GC_STD_MARGIN }}>
               <Form>
                  {this.fields.map((field) => {
                     return (
                        <XFormInput key={field.key}
                           options={field}></XFormInput>
                     )
                  })}
               </Form>
            </View>
            {this.state.changed &&
               <GCFooterWithTwoIcons
                  onOkayCode='NEXT_IS_SAVE'
                  onOkay={async () => {
                     let valid = validateForm(this.fields)
                     if (valid) {
                        this.setState({ isCustomerDbInProgress: true })
                        if (await dwdbfsCustUpdateProfile(this.user.id, this.name, this.phoneNumber, this.email)) {
                           this.setState({ isCustomerDbInProgress: false })
                           this.props.onOkay()
                        }
                        else {
                           this.setState({ isCustomerDbInProgress: false })
                        }
                     }
                  }
                  }
                  onCancel={this.props.onCancel}

               />}

         </CdsScreen >
      )
   }


}// end CstProfilePersonal
