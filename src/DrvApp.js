import React, { Component } from 'react'

import { createSwitchNavigator, createAppContainer } from 'react-navigation';

import CdsStackSigninOrMain from './CdsStackSigninOrMain';
import DrvStackSignin from './DrvStackSignin';
import DrvStackMain from './DrvStackMain'

const SwitchNavigator = createSwitchNavigator(
    {
        StackSigninOrMain: { screen: CdsStackSigninOrMain, params: {appType:'drv'}  },
        StackSignin: { screen: DrvStackSignin },
        StackMain: { screen: DrvStackMain },
    },
    {
        initialRouteName: 'StackSigninOrMain',
    });
const AppContainer = createAppContainer(SwitchNavigator);

export default class DrvApp extends Component {

    render() {
        return (<AppContainer />);
    }
}// end DrvApp