import React, { Component } from 'react'
import { View, StyleSheet, Linking, TouchableOpacity, Text, Image } from 'react-native'
import AppIntroSlider from 'react-native-app-intro-slider';
import GLOBALS from 'DWcmn/Global';
import { COLORS } from 'DWcmn/Global';
import { PrjIcon } from 'DWcmn/PrjIconComponents'
import { CstScreen } from './CdsScreen'
import { GCText } from 'DWcmn/Gc'


export default class CstSignupSlideIntro extends Component {
   constructor() {
      super();
      this.state = {
      };
   }

   // For dynamic text...translation
   // _renderItem = ({ item }) => {
   //    return (
   //       <CstScreen>
   //          <View style={{ flex: .6, justifyContent: 'center', paddingTop:'10%' }}>
   //             <Image style={{ flex: 1, resizeMode: 'contain', width: '100%' }} source={item.image} />
   //          </View>
   //          <View style={{ flex: .3, justifyContent: 'center', alignItems: 'center', paddingHorizontal: '2%' }}>
   //             <GCText style={{ fontSize: 24, fontWeight: 'bold', color: COLORS.GC_THEME_DARK}}>{item.title}</GCText>
   //             <View style={{ height: 20 }} />
   //             <GCText detail style={{ fontSize: 14, color: GLOBALS.COLOR.SLIDE_INTRO_TEXT, textAlign: 'center', paddingHorizontal: 20 }}>{item.text1}</GCText>
   //          </View>
   //       </CstScreen>
   //    );
   // }
   _renderItem = ({ item }) => {
      return (
         <CstScreen>
            <View style={{ flex: 1, justifyContent: 'center' }}>
               <Image style={{ flex: 1, resizeMode: 'contain', width: '100%' }} source={item.image} />
            </View>
         </CstScreen>
      );
   }
   _renderNextButton = () => {
      return (
         <View style={styles.buttonCircle}>
            <PrjIcon style={{ color: 'white' }} id="ARROW_FORWARD" />
         </View>
      );
   };
   _renderDoneButton = () => {
      return (
         <View style={styles.buttonCircle}>
            <PrjIcon style={{ color: 'white' }} id="CHECK" />
         </View>
      );
   };

   render() {
      return (<AppIntroSlider
         style={{ paddingHorizontal: 5 }}
         renderItem={this._renderItem}
         data={slides}
         renderNextButton={this._renderNextButton}
         renderDoneButton={this._renderDoneButton}
         onDone={this.props.onOkay}
         dotStyle={{ backgroundColor: LIGHT_GREY }}
         activeDotStyle={{ backgroundColor: COLORS.GC_THEME_DARK }}
      />)

   }//end render
}//end CstSignupSlideIntro

const LIGHT_GREY = 'rgba(0, 0, 0, .2)'
const styles = StyleSheet.create({
   buttonCircle: {
      width: 40,
      height: 40,
      backgroundColor: LIGHT_GREY,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
   },
});

const slides = [
   {
      key: '1',
      image: require('../images/intro/slide1.png'),

   },
   {
      key: '2',
      image: require('../images/intro/slide2.png'),

   },
   {
      key: '3',
      image: require('../images/intro/slide3.png'),

   },
   {
      key: '4',
      image: require('../images/intro/slide4.png'),

   },
   {
      key: '5',
      image: require('../images/intro/slide5.png'),

   },
   {
      key: '6',
      image: require('../images/intro/slide6.png'),

   }
];
// For dynamic text...translation
// const slides = [
//    {
//       key: '1',
//       title: 'WELCOME!',
//       text1: '',
//       image: require('../images/intro/slide1.png'),

//    },
//    {
//       key: '2',
//       title: 'CUSTOMIZE ORDER',
//       text1: 'Select how you\nwant your laundry to be done',
//       image: require('../images/intro/slide2.png'),

//    },
//    {
//       key: '3',
//       title: 'SECURE PAYMENT',
//       text1: 'Let’s go cashless with our\nsecure payment gateway provider',
//       image: require('../images/intro/slide3.png'),

//    },
//    {
//       key: '4',
//       title: 'DOORSTEP DELIVERY',
//       text1: 'Get your laundry done and delivered\nto your doorstep with just a few taps',
//       image: require('../images/intro/slide4.png'),

//    },
//    {
//       key: '5',
//       title: 'DOORSTEP DELIVERY',
//       text1: 'Get your laundry done and delivered\nto your doorstep with just a few taps',
//       image: require('../images/intro/slide5.png'),

//    },
//    {
//       key: '6',
//       title: 'DOORSTEP DELIVERY',
//       text1: 'Get your laundry done and delivered\nto your doorstep with just a few taps',
//       image: require('../images/intro/slide6.png'),

//    }
// ];


