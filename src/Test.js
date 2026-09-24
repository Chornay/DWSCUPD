import React, { Component } from 'react'
import { StyleSheet, View, Text, Button, Linking, Spinner, TextInput, Image } from 'react-native'
import { FlatList } from 'react-native'
import { Toast } from 'native-base'
import { strX } from 'DWcmn/I18n';
import { CstScreen } from './CdsScreen'
import { WebView } from 'react-native-webview';
import GestureRecognizer, { swipeDirections } from 'react-native-swipe-gestures';
import firebase from '@react-native-firebase/app';
// import messaging from '@react-native-firebase/messaging';
import functions from '@react-native-firebase/functions';
import firestore from '@react-native-firebase/firestore';
// import DateTimePicker from '@react-native-community/datetimepicker'//NOT IN PROJECT NOW .. BROKEN?
import { Calendar } from 'react-native-calendars'
import { dwdbfsShopGet } from 'DWcmn/dwdbfsShop'
import { Input, Item, Label, Left, InputGroup } from 'native-base'

import moment from 'moment'
// import { add } from 'react-native-reanimated';
import { ThemeColors } from 'react-navigation';
import { getBatteryLevel } from 'react-native-device-info';

export default class Test extends Component {
  constructor() {
    super();
    this.state = {
    };
  }

  render() {
    return (
      // <NullTest></NullTest>
      // this.renderipay88()
      // CA Lat=43.80354 Long=-79.40146 
      // <Web></Web>
      // <TimeTest></TimeTest>
      // <MsgTest></MsgTest>
      // <SchedTest></SchedTest>
      // <HolidayTest
      // holidays = {[
      //   '2021-03-16',
      //   '2021-03-17',
      //   '2021-03-18',
      // '2021-04-19'
      // ]}
      //   ></HolidayTest>
      // <AddRouteTest></AddRouteTest>
      // <ImageTest></ImageTest>

      // <TestDeepLink></TestDeepLink>
      // <TransactionTest></TransactionTest>
      // <View style={{flex:1}}>
      //   <View style={{flexGrow:.8,flexShrink:.6}}><Text>abcd</Text></View>
      //   <View style={{flex:.1,flexGrow:.2}}>
      //   <Text>b</Text>
      //   <Text>b</Text>
      //   <Text>b</Text>
      //   <Text>b</Text>
      //   </View>
      //   <View style={{flex:.1,flexGrow:.2}}>
        <Text>a</Text>
      //   <Text>a</Text>
      //   </View>
      // </View>
      // <Root>{this.tryActionSheet()}</Root> 
      // <TestDeepLink/>
      // <Whatup></Whatup>
    )
  }

  tryActionSheet() {
    return (
      <View>
        <Button title='abc'
          onPress={() => {
            console.log('hullo')
            ActionSheet.show({
              options: ['option1', 'option2', 'cancel'],
              title: 'Testing Actionsheet',
              cancelButtonIndex: 2,
            },
              (index) => { console.log(index) }
            )
          }}

        >
        </Button>
      </View>

    )
  }

  renderSwipe() {
    return (
      <View>
        <Text>this will not swipe</Text>
        <GestureRecognizer
          // onSwipe={(direction, state) => this.onSwipe(direction, state)}
          // onSwipeUp={(state) => this.onSwipeUp(state)}
          // onSwipeDown={(state) => this.onSwipeDown(state)}
          onSwipeLeft={() => this.props.navigation.goBack()}
        // onSwipeRight={(state) => this.onSwipeRight(state)}
        >
          <Text>onSwipe callback received gesture</Text>
        </GestureRecognizer>
      </View>
      // <View>
      //     <Text>This is Test</Text>
      //     {/* <Form>
      //         <Item>
      //             <Input
      //                 placeholder="Enter Kg"
      //                 onChangeText={(numKG) => {
      //                     this.setState({ numKG })
      //                 }} //end onChangeText
      //             // onChangeText={this.validateInteger}
      //             />
      //         </Item>
      //     </Form>
      //     <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
      //         <PrjButton
      //             text="ENTER"
      //             onPress={() => {
      //                 this.validateInteger(this.state.numKG)
      //             }}
      //         ></PrjButton>
      //         <PrjButton
      //             text="CANCEL"
      //             onPress={() => {
      //                 // Do nothing for now 
      //             }}
      //         ></PrjButton>

      //     </View> */}
      // </View>
    )
  } //end render
  // validateInteger(num) {
  //     if (/^\d+$/.test(num)) {
  //         // Not sure what to do here 
  //         console.warn("This is the value" + num)
  //     }
  //     else {
  //         alert("Please enter a valid number")
  //     }
  // }

}// end Test

class Web extends Component {
  // render() {
  //   return (
  //     <WebView
  //       originWhitelist={['*']}
  //       // source={{ uri: 'https://google.com' }}
  //       source={{ uri: 'https://www.google.com/maps/dir/?api=1&destination=lat,long&dir_action=navigate' }}
  //     />
  //   )
  // }

}

class MsgTest extends Component {

  constructor() {
    super();
    this.state = {
    };
  }

  async componentDidMount() {
  }

  render() {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center"
        }}
      >
        <Text>Message Test</Text>
        <Button title="Do It" onPress={this.doit} />
      </View>
    );
  } // end render

  // doit = async () => {
  //   try {
  //     // firebase.functions().useFunctionsEmulator('http://localhost:5001');
  //     let enabled = await firebase.messaging().hasPermission()
  //     console.log('enabled')
  //     let token = await firebase.messaging().getToken()
  //     if (token) {
  //       console.log("ok", token)// user has a device token
  //       const { data } = await firebase.functions('asia-southeast2').httpsCallable('sendMsg')({
  //         token: token, title: "listen up", msg: "anything here"
  //       });
  //       console.log(data)
  //     }
  //     else {
  //       console.log("no token")
  //     }
  //   }
  //   catch (error) {
  //     console.log('error', error)
  //   }
  // }
}//end MsgTest


class NullTest extends Component {
  constructor() {
    super();
    this.state = {
    };
  }
  render() {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center"
        }}
      >
        <Text>No Test Program Active</Text>
      </View>
    );
  } // end render

  init = async () => {
  }
}//end NullTest

class TimeTest extends Component {
  constructor() {
    super();
    this.state = {
    };
  }
  render() {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center"
        }}
      >
        <Text>abc</Text>
        <Button title="Test" onPress={this.test} />
      </View>
    );
  } // end render

  test = () => {

    let todayMorn = moment(8, 'hh')
    let todayAfternoon = moment(14, 'hh')
    // console.log(todayMorn.calendar(), todayAfternoon.calendar())
    let tomorrowMorn = moment(8, 'hh').add(1, 'days')
    let tomorrowAfternoon = moment(14, 'hh').add(1, 'days')
    // console.log(tomorrowMorn.calendar(), tomorrowAfternoon.calendar())
    // console.log(foo)
    console.log(todayMorn.toDate())
  }
}


class TransactionTest extends Component {
  constructor() {
    super();
    this.state = {
    };
  }
  render() {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center"
        }}
      >
        <Text>abc</Text>
        <Button title="Try Transaction" onPress={async () => {
          try { await this.test() }
          catch (err) { console.log(err) }
        }} />
      </View>
    );
  } // end render

  test = async () => {
    try {
      // firebase.functions().useFunctionsEmulator('http://localhost:5001');
      const { data } = await firebase.functions('asia-southeast2').httpsCallable('testCustId')()
      console.log(data)
    }
    catch (error) {
      console.log('error', error)
    }
  }

  testXX = async () => {
    try {
      const ctrDocRef = firestore().collection('Counters').doc('CustId')
      await firestore().runTransaction(async trnx => {
        const counterDoc = await trnx.get(ctrDocRef)
        let currId = counterDoc.data().lastAlloc
        if (currId == !0 && !currId) { throw "Unable to access CustId Counter" }
        // do stuff
        console.log(currId)
        trnx.update(ctrDocRef, { lastAlloc: currId + 1 })
      })
    }
    catch (err) {
      console.log(err)
      // handle error
    };
  }

}


class TestDeepLink extends Component {
  constructor() {
    super();
    this.state = {
    };
  }
  render() {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center"
        }}
      >
        <Text>abc</Text>
        <Button title="Try Link" onPress={this.test} />
      </View>
    );
  } // end render

  test = async () => {
    let uri = "xxx:/?api=1&destination=lat,long&dir_action=navigate"
    // let uri="https://www.google.com/maps/dir/?api=1&destination=lat,long&dir_action=navigate"
    try {
      // await Linking.openURL('google.navigation:q=43.80411887083337, -79.40130226240821')
      await Linking.openURL('waze://?ll=43.80411887083337, -79.40130226240821&navigate=yes')


      // await Linking.openURL('geo:43,43/?')//meh
      // await Linking.openURL('google.navigation:query_place_id=RH3X+MJ Markham, Ontario') //NOPE
      // await Linking.openURL('google.navigation:q=place_id:RH3X+MJ Markham, Ontario') //NOPE
      // await Linking.openURL('google.navigation:q=place_id:RH3X+MJ') //NOPE
      // await Linking.openURL('google.navigation:q=RH3X+MJ+Markham,+Ontario') //NOPE
      // await Linking.openURL('google.navigation:q=RJ32%205H,Markham%20Ontario') //NOPE
      // await Linking.openURL('google.navigation:query_place_id=RH3X+MJ Markham, Ontario')//NOPE
      // await AppLink.maybeOpenURL(uri) //no need for react-native-app-link
      // do stuff
    }
    catch (err) {
      console.log(err)
      // handle error
    };
  }
} //endTestDeepLink

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
        <View style={{ flex: 1 }}>
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
              return (<View>
                <Text>{item.key.getHours()}:{item.key.getMinutes()}</Text>
              </View>
              )
            }}
          ></FlatList>
          <Button title="ADD" onPress={() => { this.setState({ showPicker: true }) }} />
        </View>
      </CstScreen>
    );
  } // end render

  //see if the newly selected time is already included as a route
  //NOTE that we have to do valueOf() to compare dates
  isInChoices = (newTime) => {
    var i
    for (i in this.choices) {
      if (this.choices[i].key.valueOf() == newTime.valueOf()) { return true }
    }
    return false
  }

}


//prop holidays an array of date strings of the form "yyyy-mm-dd"
class HolidayTest extends Component {
  constructor() {
    super();
    this.state = {
      isComponentInitialized: false,
      pendingChanges: false,
      markedDates: {}
    }
    this.initMarkings = {}
  };
  //choices is an array of times scheduled for a route
  //each element contains a 'key' property (easier for flatlist)
  //which contains <just> the time portion of a date (start with msec=0)
  // '2018-03-28': {
  //   customStyles: {
  //     container: {
  //       backgroundColor: 'green'
  //     },
  //     text: {
  //       color: 'black',
  //       fontWeight: 'bold'
  //     }
  //   }
  // },

  componentDidMount() {

    if (this.props.holidays) {
      for (let i in this.props.holidays) {
        this.initMarkings[this.props.holidays[i]] = { selected: true }
      }
    }
    console.log(this.initMarkings)
    this.setState({ markedDates: this.initMarkings })
    this.setState({ isComponentInitialized: true })
  }

  //NOTE that we would like to prevent scrolling away from the current month
  // but setting 'hideArrows' does not re-render the calendar so we just warn
  // that we have thrown them away
  render() {

    if (!this.state.isComponentInitialized) {
      //TODO spinner
      return null
    }


    let todayAsMoment = moment()
    let maxDateAsMoment = moment().add(180, "days")
    //minDate will be today
    //maxDate will be 180 days in future
    console.log(todayAsMoment.toDate().getHours())
    return (
      <CstScreen>
        <View style={{ flex: 1 }}>
          <Calendar
            minDate={todayAsMoment.toDate()}
            maxDate={maxDateAsMoment.toDate()}
            markedDates={this.state.markedDates}
            onDayPress={(day) => {
              //add or remove the day from list
              //and set changed flag
              const clone = { ...this.state.markedDates };
              let key = day.dateString
              clone[key] = { selected: !this.isMarked(day) }
              this.setState({ markedDates: clone })
              this.setState({ pendingChanges: true })
            }}
          />
          {this.state.pendingChanges && <Button title="SAVE" onPress={this.saveHolidays} />}
          <Button title="CANCEL" onPress={() => {
            if (this.state.pendingChanges) {
              this.setState({ markedDates: this.initMarkings })
              this.setState({ pendingChanges: false })
            }
            else {
              //TODO go back
            }
          }}
          />
        </View>
      </CstScreen>
    );
  } // end render

  saveHolidays = () => {

    //create an array newHolidays for all dates with selected flag
    let marked = this.state.markedDates
    let newHolidays = []
    for (let i in marked) {
      if (marked[i].selected) {
        newHolidays.push(i)
      }
    }

    //sort the array for convenience
    newHolidays.sort()

    //TODO save to DB
    console.log(newHolidays)

    //the current state is now where we will go on a cancel (update initMarkings)
    this.initMarkings = { ...this.state.markedDates }
    this.setState({ pendingChanges: false })

  }

  //see if the newly selected date (string) is marked with {selected:true}
  isMarked = (newDay) => {
    let markedDates = this.state.markedDates
    for (let i in markedDates) {
      if (i == newDay.dateString && markedDates[i].selected) { return true }
    }
    return false
  }

}


class AddRouteTest extends Component {
  constructor() {
    super();
    this.state = {
      selectedDay: null,
      showPicker: false,
      isComponentInitialized: false,
    }
  };


  componentDidMount() {
    this.setState({ isComponentInitialized: true })
  }

  render() {

    if (!this.state.isComponentInitialized) {
      //TODO spinner
      return null
    }


    let todayAsMoment = moment()   //minDate will be today
    let maxDateAsMoment = moment().add(7, "days")    //maxDate will be 7 days in future
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
              else {
                this.setState({ showPicker: false })
              }
            }}
          />
        }


        <View style={{ flex: 1 }}>
          <Calendar
            minDate={todayAsMoment.toDate()}
            maxDate={maxDateAsMoment.toDate()}
            onDayPress={(day) => {
              this.setState({ selectedDay: day })
              this.setState({ showPicker: true })
            }}
          />
          {<Button title="SAVE" onPress={this.saveRoute} />}
          <Button title="CANCEL" onPress={() => { }
          }
          />
        </View>
      </CstScreen>
    );
  } // end render

  saveRoute = () => { }

}



class Whatup extends Component {
  constructor(props) {
    super(props);
    this.state = {
      mobileNo: "715111446",
      message: ""
    };
  }
  openWhatsApp = () => {
    let msg = this.state.message;
    let mobile = this.state.mobileNo;
    if (mobile) {
      if (msg) {
        let url =
          "whatsapp://send?text=" +
          this.state.message +
          "&phone=855" +
          this.state.mobileNo;
        Linking.openURL(url)
          .then(data => {
            console.log("WhatsApp Opened successfully " + data);
          })
          .catch(() => {
            alert("Make sure WhatsApp installed on your device");
          });
      } else {
        alert("Please enter message to send");
      }
    } else {
      alert("Please enter mobile no");
    }
  };
  render() {
    return (
      <View style={styles.container}>
        <Text
          style={{ textAlign: "center", fontSize: 20, paddingVertical: 30 }}
        >
          Open WhatsApp chat box from React-native App
        </Text>

        <TextInput
          value={this.state.message}
          onChangeText={message => this.setState({ message })}
          placeholder={"Enter message"}
          multiline={true}
          style={[styles.input, { height: 90 }]}
        />

        <TextInput
          value={this.state.mobileNo}
          onChangeText={mobileNo => this.setState({ mobileNo })}
          placeholder={"Enter Mobile"}
          style={styles.input}
          keyboardType={"numeric"}
        />
        <View style={{ marginTop: 20 }}>
          <Button onPress={this.openWhatsApp} title="Open WhatsApp message" />
        </View>
      </View>
    );
  }
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    padding: 30,
    backgroundColor: "#ffffff"
  },
  input: {
    width: '90%',
    height: '50%',
    padding: 10,
    margin: 10,
    backgroundColor: "#FFF",
    borderColor: "#000",
    borderRadius: 0.5,
    borderWidth: 0.5
  }
});