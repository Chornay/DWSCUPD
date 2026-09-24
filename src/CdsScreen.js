import React, { Component } from 'react'
import { View, StyleSheet, StatusBar } from 'react-native'
import { Platform } from 'react-native'
import { SafeAreaView, SafeAreaProvider, SafeAreaConsumer } from 'react-native-safe-area-context';
import { StyleProvider, getTheme, Root } from 'native-base'
import material from '../native-base-theme/variables/material';
import { COLORS } from 'DWcmn/Global'
import I18n from 'i18n-js';

//CdsScreen is the outermost component .. it has all the necessary native base stuff
//and project colours. It does a Flex 1
//NOTE we establish a dependency on the I18n locale flag so that if we change language
//we will re-render the page .. NOTE picker still has to do a forceUpdate
//
//prop padding - optional horizontal padding and bottom default 0
//prop bkgColor (default is GC_BACKGROUND)
//prop style
//properties to control status bar styling (default will be light theme on GC_HEADER_BKG)
//  signin .. header will be GC_SIGNIN_BKGG
//  background ... header will be GC_BACKGROUND
//  color= 
//DEFAULT IS
// bkgColor = COLORS.GC_BACKGROUND
// statusBarColor = COLORS.GC_HEADER_BKG
//theme = 'dark','light' default is light

//NOTE that we provide also CstScreen, DrvScreen and ShpScreen which are used
//     in case the basic screens for the individual apps have to differ.

export class CdsScreen extends Component {
  render() { return (renderScreen(this.props)) }
} //end CdsScreen

export class DsScreen extends Component {
  render() { return (renderScreen(this.props)) }
} //end DsScreen

export class CstScreen extends Component {
  render() { return (renderScreen(this.props)) }
} //end CstScreen

export class DrvScreen extends Component {
  render() { return (renderScreen(this.props)) }
} //end DrvScreen

export class ShpScreen extends Component {
  render() { return (renderScreen(this.props)) }
} //end ShpScreen

renderScreen = (props) => {

  let statusBarColor
  let barTextTheme = 'light'
  let bkgColor
  if (props.hasOwnProperty('signin')) {
    bkgColor = COLORS.GC_SIGNIN_BKG
    statusBarColor = COLORS.GC_SIGNIN_BKG
    barTextTheme = 'light'
  }
  else if (props.hasOwnProperty('background')) {
    bkgColor = COLORS.GC_BACKGROUND
    statusBarColor = COLORS.GC_BACKGROUND
    barTextTheme = 'dark'
  }
  else if (props.statusBarColor) {
    bkgColor = props.color
    statusBarColor = props.color
  }
  else {
    bkgColor = COLORS.GC_BACKGROUND
    statusBarColor = COLORS.GC_HEADER_BKG
    barTextTheme = 'dark'
  }
  if (props.theme) { barTextTheme = props.theme }
  if (props.bkgColor) bkgColor = props.bkgColor

  let padding = 0
  if (props.padding != 0) { //prop padding = 0 (false) should give us zero padding
    padding = props.padding || 0
  }

  //NOTE FOR ios we have to color the SafeAreaView to get the desired color
  //for android we use StatusBar background color
  //in both cases the SafeAreaView starts BELOW the status bar (it is padded)
  return (
    <Root>
      <StyleProvider style={getTheme(material)} fooey={I18n.locale}>
        <SafeAreaProvider>
          <View style={{ flex: 1, backgroundColor: statusBarColor }}>
            <SafeAreaConsumer style={{ flex: 1, backgroundColor: statusBarColor }}>
              {insets => <View style={{ flex: 1, marginTop: insets.top }}>
                <View style={[{ flex: 1, backgroundColor: bkgColor, marginHorizontal: padding, marginBottom: padding }, props.style]}>
                  {props.children}
                </View>
                {renderStatusBar(statusBarColor, barTextTheme)}
                {/* </View> */}
              </View>}
            </SafeAreaConsumer>
          </View>
        </SafeAreaProvider>
      </StyleProvider>
    </Root>
  )
} //end render

//remember ... in ios this just changes the color of the text in status bar
//  ... in that case the color is changed in SafeAreaView
renderStatusBar = (color, theme) => {

  const useTheme = (theme !== 'dark') ? 'light-content' : 'dark-content'
  // const useTheme = 'light-content'

  if (Platform.OS == 'android') {
    return (
      <StatusBar backgroundColor={color} barStyle={useTheme} />
    )
  }
  else { //ios .. color has no effect
    return (
      <StatusBar barStyle={useTheme} />
    )
  }
}//end renderStatusBar


// import React, { Component } from 'react'
// import { View, StyleSheet, SafeAreaView, StatusBar } from 'react-native'
// import { StyleProvider, getTheme, Root } from 'native-base'
// import material from '../native-base-theme/variables/material';
// import { COLORS } from 'DWcmn/Global'
// import I18n from 'i18n-js';

// //CdsScreen is the outermost component .. it has all the necessary native base stuff
// //and project colours. It does a Flex 1
// //NOTE we establish a dependency on the I18n locale flag so that if we change language
// //we will re-render the page .. NOTE picker still has to do a forceUpdate
// //
// //prop padding - optional horizontal padding and bottom default 0
// //prop bkgColor (default is GC_BACKGROUND)
// //prop style
// //properties to control status bar styling (default will be light theme on GC_HEADER_BKG)
// //  signin .. header will be GC_SIGNIN_BKGG
// //  background ... header will be GC_BACKGROUND
// //  color=
// //DEFAULT IS
// // bkgColor = COLORS.GC_BACKGROUND
// // statusBarColor = COLORS.GC_HEADER_BKG
// //theme = 'dark','light' default is light
// export class CdsScreen extends Component {
//   render() {


//     let statusBarColor
//     let barTextTheme = 'light'
//     let bkgColor
//     if (this.props.hasOwnProperty('signin')) {
//       bkgColor = COLORS.GC_SIGNIN_BKG
//       statusBarColor = COLORS.GC_SIGNIN_BKG
//       barTextTheme = 'light'
//     }
//     else if (this.props.hasOwnProperty('background')) {
//       bkgColor = COLORS.GC_BACKGROUND
//       statusBarColor = COLORS.GC_BACKGROUND
//       barTextTheme = 'dark'
//     }
//     else if (this.props.statusBarColor) {
//       bkgColor = this.props.color
//       statusBarColor = this.props.color
//     }
//     else {
//       bkgColor = COLORS.GC_BACKGROUND
//       statusBarColor = COLORS.GC_HEADER_BKG
//       barTextTheme = 'light'
//     }
//     if (this.props.theme) { barTextTheme = this.props.theme }
//     if (this.props.bkgColor) bkgColor = this.props.bkgColor

//     let padding = 0
//     if (this.props.padding != 0) { //prop padding = 0 (false) should give us zero padding
//       padding = this.props.padding || 0
//     }

//     //NOTE FOR ios we have to color the SafeAreaView to get the desired color
//     //for android we use StatusBar background color
//     //in both cases the SafeAreaView starts BELOW the status bar (it is padded)
//     return (
//       <Root>
//         <StyleProvider style={getTheme(material)} fooey={I18n.locale}>
//           <SafeAreaView style={{ flex: 1, backgroundColor: statusBarColor }}>
//             <View style={ [{ flex:1, backgroundColor: bkgColor, marginHorizontal: padding, marginBottom: padding }, this.props.style]}>
//               {this.props.children}
//             </View>
//             {this.renderStatusBar(statusBarColor, barTextTheme)}
//           </SafeAreaView>

//         </StyleProvider>
//       </Root>
//     )
//   } //end render


//   //remember ... in ios this just changes the color of the text in status bar
//   //  ... in that case the color is changed in SafeAreaView
//   renderStatusBar = (color, theme) => {

//     const useTheme = (theme!=='dark')?'light-content':'dark-content'

//     if (Platform.OS == 'android') {
//       return (
//         <StatusBar backgroundColor={color} barStyle={useTheme} />
//       )
//     }
//     else { //ios .. color has no effect
//       return (
//         <StatusBar barStyle={useTheme} />
//       )
//     }
//   }//end renderStatusBar

// } //end CdsScreen
