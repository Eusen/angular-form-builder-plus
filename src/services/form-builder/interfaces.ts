import {FormArrayPlus, FormControlPlus, FormGroupPlus} from './forms';


export type ValidatorsRequireParams = 'min' | 'max' | 'minLength' | 'maxLength' | 'pattern' | 'compose' | 'composeAsync';
export type ValidatorsWithoutParams = 'required' | 'requiredTrue' | 'email' | 'nullValidator';

export interface ValidatorsDef {
  withoutParams?: { key?: ValidatorsWithoutParams, fields?: string[] }[];
  requireParams?: { key?: ValidatorsRequireParams, fields?: string[], params?: any }[];
}

export interface ValidatorsDefForControl {
  withoutParams?: ValidatorsWithoutParams[];
  requireParams?: { key?: ValidatorsRequireParams, params?: any }[];
}

export type FormPlusObjects = FormControlPlus | FormGroupPlus | FormArrayPlus;

export interface FromGroupMap {
  [key: string]: FormPlusObjects;
}
