declare module 'react-input-mask' {
  import * as React from 'react';

  export interface InputState {
    value: string;
    selectionStart: number;
    selectionEnd: number;
  }

  export interface BeforeMaskedStateChangeStates {
    previousState: InputState;
    currentState: InputState;
    nextState: InputState;
  }

  export interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
    mask: string | (string | RegExp)[];
    maskChar?: string | null;
    formatChars?: { [key: string]: string };
    alwaysShowMask?: boolean;
    beforeMaskedStateChange?: (states: BeforeMaskedStateChangeStates) => InputState;
  }

  const ReactInputMask: React.FC<Props>;

  export default ReactInputMask;
}
