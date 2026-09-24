import React, { Component } from 'react'
import { SpinnerXYZ } from 'DWcmn/GCNB'
import { ShpScreen } from './CdsScreen';

export default class ShpSpinnerScreen extends Component {

  render() {
    return (
      <ShpScreen style={{ justifyContent: 'center', alignItems: 'center' }}>
        <SpinnerXYZ />
      </ShpScreen>
    );
  } //end render
}// end ShpSpinnerScreen



