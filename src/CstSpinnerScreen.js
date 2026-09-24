import React, { Component } from 'react'
import { SpinnerXYZ } from 'DWcmn/GCNB'
import { CstScreen } from './CdsScreen'

export default class CstSpinnerScreen extends Component {

  render() {
    return (
      <CstScreen style={{ justifyContent: 'center', alignItems: 'center' }}>
        <SpinnerXYZ />
      </CstScreen>
    );
  } //end render
}// end CstSpinnerScreen



