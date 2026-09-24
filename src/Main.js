import React, { Component } from 'react'
import { View, Button } from 'react-native';
import SplashScreen from 'react-native-splash-screen'
import { CdsScreen } from './CdsScreen'

//20250318 removed INITDB/InitTop option

class Main extends Component {

   componentDidMount() {
      SplashScreen.hide()
   }


   render() {

      return (
         <CdsScreen>
            <View style={{ paddingTop: 60 }}>
               <Button
                  onPress={() => { this.props.navigation.navigate('CstApp') }}
                  title="CUSTOMER"
               />
               <View style={{ height: 20 }} />
               <Button
                  onPress={() => { this.props.navigation.navigate('DrvApp') }}
                  title="DRIVER"
               />
               <View style={{ height: 20 }} />
               <Button
                  onPress={() => { this.props.navigation.navigate('ShpApp') }}
                  title="SHOP"
               />
               {/* <View style={{ height: 20 }} />
        <Button
          onPress={() => { this.props.navigation.navigate('CredApp') }}
          title="CREDENTIALS"
        /> */}
               <View style={{ height: 20 }} />
               <Button
                  onPress={() => { this.props.navigation.navigate('UtilTop') }}
                  title="UTIL"
               />
               {/* <View style={{ height: 20 }} />
        <Button
          onPress={() => { this.props.navigation.navigate('Test') }}
          title="Test"
        />
        <View style={{ height: 20 }} />
        <Button
          onPress={() => { this.props.navigation.navigate('TestSC') }}
          title="TestSC"
        /> */}
            </View>
         </CdsScreen>
      )
   } //end render
} //end class App

export default Main;
