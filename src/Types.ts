export type MethodParams = SetLogpointParams | RemoveLogpointParams;
export type SessionPostResult = {} | undefined;

export interface SetLogpointParams {
  urlRegex: string;
  lineNumber: number;
  condition: string;
}

export interface RemoveLogpointParams {
  breakpointId: string;
}
