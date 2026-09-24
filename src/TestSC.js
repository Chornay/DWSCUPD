import React, { Component } from 'react'
import { View, StyleSheet, Linking, TouchableOpacity,ScrollView,Keyboard, Text } from 'react-native'
import { FlatList } from 'react-native'
import { Tabs, Tab } from 'native-base';
import { Toast } from 'native-base'
import { CstScreen } from './CdsScreen'
import { PrjIconButton } from 'DWcmn/Prj';
import { PrjIcon } from 'DWcmn/PrjIconComponents';
import { PrjListTextBold } from 'DWcmn/Prj';
import GCHeader from 'DWcmn/GCHeader'
// import DateTimePicker from '@react-native-community/datetimepicker'//NOT IN PROJECT NOW .. BROKEN?
import { prjTabBarStyles, prjTabStyles } from 'DWcmn/Prj';
import GLOBALS from 'DWcmn/Global';
import {COLORS} from 'DWcmn/Global'
// import { Settings } from 'react-native-fbsdk-next';
import { CredScreen } from './CRED/CredScreen'
// import { TouchableAuthI18n } from 'DWcmn/Prj'
import {XFormInput} from 'DWcmn/PrjFormInput'
import { prjAlert } from 'DWcmn/PrjCmnFunctions'

//20230520 removed AddNewShop


export default class TestSC extends Component {
  constructor() {
    super();
    this.state = {
    };
  }


  render() {
    return (
      // <View style={{ flex: 1, justifyContent: 'center', alignSelf: 'center' }}>
      //   {/* {/* <GcButton style={{ width: 360, borderColor: 'white', borderWidth: 1, shadowColor: 'rgba(139,223,254,255)' }}></GcButton> */}
      //   <View style={{ height: 20 }} />
      //   <GcButton></GcButton>
      //   <View style={{ height: 20 }} />
      //   <GcButton style={{ width: 360, shadowColor: 'rgba(139,223,254,255)', backgroundColor: '#1a75ff' }}></GcButton>
      //   <View style={{ height: 20 }} />
      //   <GcButton style={{ width: 360, borderColor: 'white', borderWidth: 3, shadowColor: 'rgba(139,223,254,255)', backgroundColor: '#3ac589' }}></GcButton>
      //   <View style={{ height: 20 }} />
      //   <GcButton style={{ width: 360, borderColor: 'white', borderWidth: 3, shadowColor: 'rgba(139,223,254,255)', backgroundColor: '#25d4da' }}></GcButton> */}
      //   <SchedTest></SchedTest>
      //   <ShpScheduleTest></ShpScheduleTest>
      //   <TestFont></TestFont>
      //   <WhatsappTest></WhatsappTest>
      //   <PhoneTest></PhoneTest>
      //   <TestFacebookShare></TestFacebookShare>
      //   <AppleLogin></AppleLogin>
      // </View>
        // <AddNewShop></AddNewShop>
        <Text>a</Text>
        )
  }
} //end TestSC



// class AppleLogin extends Component {
//   constructor() {
//     super();
//     this.state = {
//     };
//   }

  
//   render() {
//     return (
//       <View>
//         <AppleButton
//           buttonStyle={AppleButton.Style.WHITE}
//           buttonType={AppleButton.Type.SIGN_IN}
//           style={{
//             width: 160, // You must specify a width
//             height: 45, // You must specify a height
//           }}
//           onPress={() => {this.onAppleButtonPress()}}
//         />
//       </View>
//     )
//   } //end render
//   async onAppleButtonPress() {
//     // performs login request
//     const appleAuthRequestResponse = await appleAuth.performRequest({
//       requestedOperation: appleAuth.Operation.LOGIN,
//       requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
//     });
  
//     // get current authentication state for user
//     // /!\ This method must be tested on a real device. On the iOS simulator it always throws an error.
//     const credentialState = await appleAuth.getCredentialStateForUser(appleAuthRequestResponse.user);
  
//     // use credentialState response to ensure the user is authenticated
//     if (credentialState === appleAuth.State.AUTHORIZED) {
//       // user is authenticated
//     }
//   }
// } //end AppleLogin


// class GcButton extends Component {
//   constructor() {
//     super();
//     this.state = {
//     };
//   }
//   render() {
//     return (
//       <Button
//         style={[styles.gcButton, this.props.style]}
//         onPress={this.props.onPress}><Text style={{ color: 'white', fontFamily: 'sans-serif-medium', fontWeight: 'bold', fontSize: 18 }}>GC BUTTON</Text></Button>
//     );
//   } // end render
// } //GcButton

class SchedTest extends Component {
  constructor() {
    super();
    this.state = {
      showPicker: false,
    };
    //choices is an array of times scheduled for a route
    //each element contains a 'key' property (easier for flatlist)
    //which contains <just> the time portion of a date (start with msec=0)
    this.choices = []
  }
  render() {
    let pickTime = new Date()
    pickTime.setTime(0)
    return (
      <CstScreen>
        {/* show the time picker if selected */}
        {this.state.showPicker &&
          <DateTimePicker
            value={pickTime}
            mode="time"
            is24Hour={true}
            display="default"
            onChange={(event, selectedDate) => {
              if (event.type == "dismissed") {
                //nothing to do .. cancelled
              }
              else if (this.isInChoices(selectedDate)) {//time already in schedule
                Toast.show({
                  text: 'already selected',
                  buttonText: 'okay',
                  duration: 5000,
                  type: 'warning'
                })
              }
              else { //okay, add to array and then resort
                this.choices.push({ "key": selectedDate })
                this.choices.sort(
                  function (a, b) { return a.key - b.key; }
                )
              }
              this.setState({ showPicker: false })
            }}
          />
        }

        <FlatList
          style={{ width: '100%', height: '100%' }}
          data={this.choices}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => {
            return (
              <View style={styles.tileStyle}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <PrjListTextBold style={{ fontSize: 20 }}>{item.key.getHours()}:{item.key.getMinutes()}</PrjListTextBold>
                  <View style={{ flexDirection: 'column', justifyContent: 'space-between' }}>
                    {/* <PrjListText>LIMIT</PrjListText> */}
                    <TouchableOpacity
                      onPress={() => { console.warn("Add limit") }}>
                      <PrjListTextBold style={{ color: GLOBALS.COLOR.TEXT_HILITE, justifyContent: 'center', alignSelf: 'center', textShadowRadius: 2 }}>LIMIT</PrjListTextBold>
                    </TouchableOpacity>
                    <View style={{ height: 24 }} />
                    <PrjIconButton //TODO we want to go to top screen   
                      id="DELETE"
                      onPress={() => { console.warn("Delete item") }}>
                    </PrjIconButton>
                  </View>
                </View>
              </View>
            )
          }}
        ></FlatList>
        {/* <PrjButton text="ADD" onPress={() => { this.setState({ showPicker: true }) }} /> */}
        <View style={{ padding: 10, justifyContent: 'flex-end' }}>
          <AddButton onPress={() => { this.setState({ showPicker: true }) }} />
        </View>
      </CstScreen>
    );
  } // end render

  //see if the newly selected time is already included as a route
  //NOTE that we have to do valueOf() to compare dates
  isInChoices = (newTime) => {
    var i
    for (i in this.choices) {
      console.log(this.choices[i].key, newTime)
      if (this.choices[i].key.valueOf() == newTime.valueOf()) { return true }
    }
    return false
  }
} //end SchedTest


class ShpScheduleTest extends Component {
  constructor() {
    super();
    this.state = {
    };
  }
  render() {
    return (
      <CstScreen>
        {/* HEADER SECTION */}
        <GCHeader titleText="%SET SCHEDULE"/>
        <View style={{ height: 10 }} />
        <View style={{ flex: 1 }}>
          <Tabs {...prjTabBarStyles}
            initialPage={0} //sets default tab
          >
            <Tab heading="MON" {...prjTabStyles} >
              <SchedTest />
            </Tab>
            <Tab heading="TUE" {...prjTabStyles} >
              <SchedTest />
            </Tab>
            <Tab heading="WED" {...prjTabStyles} >
              <SchedTest />
            </Tab>
          </Tabs>
        </View>


      </CstScreen >
    )
  }
}

class AddButton extends Component {
  constructor() {
    super();
    this.state = {
    };
  }
  render() {
    return (
      <TouchableOpacity
        style={{ justifyContent: 'center', alignItems: 'center', alignSelf: 'flex-end', width: 60, height: 60, backgroundColor: 'red', borderRadius: 1000 }}
        onPress={this.props.onPress}>
        <PrjIcon id="ADD" color='white' />
      </TouchableOpacity>
    )
  }
} //end AddButton

class TestFont extends Component {
  constructor() {
    super();
    this.state = {
    };
  }
  render() {
    return (
      <View style={{ justifyContent: 'center', alignItems: 'center' }} >
        <Text style={{ fontFamily: 'notoserif', fontWeight: '800', }}>This is notoserif</Text>
        <Text style={{ fontFamily: 'sans-serif', fontWeight: 'bold' }}>This is sans-serif</Text>
        <Text style={{ fontFamily: 'sans-serif-light' }}>This is sans-serif-light</Text>
        <Text style={{ fontFamily: 'sans-serif-thin' }}>This is sans-serif-thin</Text>
        <Text style={{ fontFamily: 'sans-serif-condensed' }}>This is sans-serif-condensed</Text>
        <Text style={{ fontFamily: 'sans-serif-medium' }}>This is sans-serif-medium</Text>
        <Text style={{ fontFamily: 'sans-serif-condensed' }}>This is sans-serif-condensed</Text>
        <Text style={{ fontFamily: 'serif' }}>This is serif</Text>
        <Text style={{ fontFamily: 'Roboto' }}>This is Roboto</Text>
        <Text style={{ fontFamily: 'monospace' }}>This is monospace</Text>
        <View style={{ height: 50 }} />
        <Text style={{ fontFamily: 'notoserif', fontWeight: 'bold' }}>This is notoserif</Text>
        <Text style={{ fontFamily: 'sans-serif', fontWeight: 'bold' }}>This is sans-serif</Text>
        <Text style={{ fontFamily: 'sans-serif-light', fontWeight: 'bold' }}>This is sans-serif-light</Text>
        <Text style={{ fontFamily: 'sans-serif-thin', fontWeight: 'bold' }}>This is sans-serif-thin</Text>
        <Text style={{ fontFamily: 'sans-serif-condensed', fontWeight: 'bold' }}>This is sans-serif-condensed</Text>
        <Text style={{ fontFamily: 'sans-serif-medium', fontWeight: 'bold' }}>This is sans-serif-medium</Text>
        <Text style={{ fontFamily: 'sans-serif-condensed', fontWeight: 'bold' }}>This is sans-serif-condensed</Text>
        <Text style={{ fontFamily: 'serif', fontWeight: 'bold' }}>This is serif</Text>
        <Text style={{ fontFamily: 'Roboto', fontWeight: 'bold' }}>This is Roboto</Text>
        <Text style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>This is monospace</Text>

      </View>
    )
  }
} //end TestFont


class PhoneTest extends Component {
  constructor() {
    super();
    this.state = {
      mobileNo: "+85515805991"
    };
  }
  render() {
    return (
      <View style={styles.container}>
        <Text
          style={{ textAlign: "center", fontSize: 20, paddingVertical: 30 }}
        >
          Make phone call from React-native App
        </Text>
        {/* <TextInput
          value={this.state.mobileNo}
          onChangeText={mobileNo => this.setState({ mobileNo })}
          placeholder={"Enter Mobile"}
          style={styles.input}
          keyboardType={"numeric"}
        /> */}
        <GcButton onPress={() => { this.call() }}></GcButton>
      </View>)
  }
  call() {
    // console.log("+++++++++callNumber ", this.state.mobileNo);
    let phoneNumber = this.state.mobileNo;
    if (Platform.OS !== "android") {
      phoneNumber = `telprompt:${this.state.mobileNo}`;
    } else {
      phoneNumber = `tel:${this.state.mobileNo}`;
    }
    Linking.canOpenURL(phoneNumber)
      .then(supported => {
        if (!supported) {
          Alert.alert("Number is not available");
        } else {
          return Linking.openURL(phoneNumber);
        }
      })
      .catch(err => console.log(err));
  };

} //end PhoneTest

// class TestFacebookShare extends Component {
//   constructor() {
//     super();
//     this.state = {
//     };
//   }
//   render() {
//     return (
//       <View>
//         <TouchableHighlight onPress={this.facebookShare}>
//           <View style={{alignItems: 'center',justifyContent:'center', width: 150, height: 50,backgroundColor:'#3b5998'}}>
//            <Text style={{color:'#ffffff',fontWeight:'800',}}>Share on Facebook</Text>
//           </View>
//         </TouchableHighlight>
//       </View>
//     )
//   }
//   facebookShare () {
//     shareOnFacebook({
//         'text':'Global democratized marketplace for art',
//         'link':'https://artboost.com/',
//         'imagelink':'https://artboost.com/apple-touch-icon-144x144.png',
//         //or use image
//         'image': 'artboost-icon',
//       },
//       (results) => {
//         console.log(results);
//       }
//     );
//   }
// } //end TestFacebookShare




const styles = StyleSheet.create({
  gcButton: {
    backgroundColor: '#1ec4ff',
    width: 300,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    shadowRadius: .5,
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOpacity: .8, elevation: 5,
    borderStyle: 'solid'
  },

  tileStyle: {
    flex: 1,
    // flexDirection: 'column',
    // justifyContent: 'center',
    // alignItems: 'center',
    marginTop: 5,
    marginBottom: 5,
    marginLeft: 8,
    marginRight: 8,
    paddingLeft: 10,
    paddingRight: 20,
    paddingTop: 12,
    paddingBottom: 12,
    borderColor: GLOBALS.COLOR.BTN_BORDER,
    backgroundColor: COLORS.GC_BACKGROUND,
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOpacity: .8,
    elevation: 5,
    shadowRadius: .5,
    borderStyle: 'solid',
    borderRadius: 2,
    borderBottomWidth: 0,
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderRightWidth: 0,
    borderRadius: 15,
    borderWidth: 1,
  },

  container: {
    flex: 1,
    backgroundColor: 'white',
    padding: 10,
  },
  titleText: {
    fontSize: 22,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  titleTextsmall: {
    marginVertical: 8,
    fontSize: 16,
  },
  buttonStyle: {
    justifyContent: 'center',
    marginTop: 15,
    padding: 10,
    backgroundColor: '#8ad24e',
  },
  buttonTextStyle: {
    color: '#fff',
    textAlign: 'center',
  },
  textInput: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    width: '100%',
    paddingHorizontal: 10,
  },

})