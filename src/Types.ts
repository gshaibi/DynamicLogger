export type MethodParams = SetLogpointParams | RemoveLogpointParams | RemoveAllLogpointsParams;
export type SessionPostResult = {} | undefined;

export interface MethodType {
  methodName: string;
  params: MethodParams;
}

export interface SetLogpoint extends MethodType {
  methodName: 'Debugger.setBreakpointByUrl';
  params: SetLogpointParams;
}
export interface RemoveLogpoint extends MethodType {
  methodName: 'Debugger.removeBreakpoint';
  params: RemoveLogpointParams;
}
export interface RemoveAllLogpoints extends MethodType {
  methodName: 'Debugger.setSkipAllPauses';
  params: RemoveAllLogpointsParams;
}

interface SetLogpointParams {
  urlRegex: string;
  lineNumber: number;
  condition: string;
}

interface RemoveLogpointParams {
  breakpointId: string;
}

interface RemoveAllLogpointsParams {
  skip: boolean;
}
