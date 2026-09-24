import React, { Component } from 'react'

import { createSwitchNavigator, createAppContainer } from 'react-navigation';

import CdsStackSigninOrMain from './CdsStackSigninOrMain';
import ShpStackSignin from './ShpStackSignin';
import ShpStackMain from './ShpStackMain'

const SwitchNavigator = createSwitchNavigator(
    {
        StackSigninOrMain: { screen: CdsStackSigninOrMain,  params: {appType:'shp'}  },
        StackSignin: { screen: ShpStackSignin },
        StackMain: { screen: ShpStackMain },
    },
    {
        initialRouteName: 'StackSigninOrMain',
    });
const AppContainer = createAppContainer(SwitchNavigator);

export default class ShpApp extends Component {

    render() {
        return (<AppContainer />);
    }
}// end ShpApp