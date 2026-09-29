import React from 'react'
import { View, StyleSheet, StatusBar } from 'react-native'
import { Platform } from 'react-native'
import { SafeAreaProvider, SafeAreaConsumer } from 'react-native-safe-area-context';
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
//DEFAULT IS
// bkgColor = COLORS.GC_BACKGROUND
// statusBarColor = COLORS.GC_HEADER_BKG
//theme = 'dark','light' default is light
//TODO what is the default anyhow?? Pretty sure default theme is dark

//NOTE that we provide also CstScreen, DrvScreen and ShpScreen which are used
//     in case the basic screens for the individual apps have to differ.

export const CdsScreen = (props) => renderScreen(props)

export const DsScreen = (props) => renderScreen(props)

export const CstScreen = (props) => renderScreen(props)

export const DrvScreen = (props) => renderScreen(props)

export const ShpScreen = (props) => renderScreen(props)

const renderScreen = (props) => {

  let statusBarColor
  let barTextTheme = 'light'
  let bkgColor
  if (props.signin) {
    bkgColor = COLORS.GC_SIGNIN_BKG
    statusBarColor = COLORS.GC_SIGNIN_BKG
    barTextTheme = 'light'
  }
  else if (props.background) {
    bkgColor = COLORS.GC_BACKGROUND
    statusBarColor = COLORS.GC_BACKGROUND
    barTextTheme = 'dark'
  }
  else {
    bkgColor = COLORS.GC_BACKGROUND
    statusBarColor = COLORS.GC_HEADER_BKG
    barTextTheme = 'dark'
  }
  if (props.theme) { barTextTheme = props.theme }
  if (props.bkgColor) bkgColor = props.bkgColor

  const padding = props.padding || 0 //padding is a number, absent or 0 gives zero padding

  //NOTE FOR ios we have to color the SafeAreaView to get the desired color
  //for android we use StatusBar background color
  //in both cases the SafeAreaView starts BELOW the status bar (it is padded)
  return (
        <SafeAreaProvider>
          <View style={{ flex: 1, backgroundColor: statusBarColor }}>
            {/* CLAUDE SafeAreaConsumer doesn't take a style prop, so the style below is ignored */}
            <SafeAreaConsumer style={{ flex: 1, backgroundColor: statusBarColor }}>
              {insets => <View style={{ flex: 1, marginTop: insets.top }}>
                <View style={[{ flex: 1, backgroundColor: bkgColor, marginHorizontal: padding, marginBottom: padding }, props.style]}>
                  {props.children}
                </View>
                {renderStatusBar(statusBarColor, barTextTheme)}
              </View>}
            </SafeAreaConsumer>
          </View>
        </SafeAreaProvider>
  )
} //end renderScreen

//remember ... in ios this just changes the color of the text in status bar
//  ... in that case the color is changed in SafeAreaView
const renderStatusBar = (color, theme) => {

  const useTheme = (theme !== 'dark') ? 'light-content' : 'dark-content'

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