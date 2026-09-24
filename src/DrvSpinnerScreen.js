import React, { Component } from 'react'
import { SpinnerXYZ } from 'DWcmn/GCNB'
import { DrvScreen } from './CdsScreen';

export default class DrvSpinnerScreen extends Component {

  render() {
    return (
      <DrvScreen style={{ justifyContent: 'center', alignItems: 'center' }}>
        <SpinnerXYZ />
      </DrvScreen>
    );
  } //end render
}// end DrvSpinnerScreen



