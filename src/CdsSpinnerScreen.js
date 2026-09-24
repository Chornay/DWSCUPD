import React from 'react'
import { SpinnerXYZ } from 'DWcmn/GCNB'
import { CdsScreen } from './CdsScreen'

export default function CdsSpinnerScreen(props) {
  return (
    <CdsScreen style={{ justifyContent: 'center', alignItems: 'center' }}>
      <SpinnerXYZ />
    </CdsScreen>
  );
}// end CdsSpinnerScreen