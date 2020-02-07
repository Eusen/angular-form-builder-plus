import {FormArrayPlus, FormControlPlus, FormGroupPlus} from './forms';
import {ValidatorFn} from '@angular/forms';


export type ValidatorsRequireParams = 'min' | 'max' | 'minLength' | 'maxLength' | 'pattern' | 'compose' | 'composeAsync';
export type ValidatorsWithoutParams = 'required' | 'requiredTrue' | 'email' | 'nullValidator' | 'disabled';

export interface ValidatorsDef {
  withoutParams?: { key?: ValidatorsWithoutParams, fields?: string[] }[];
  requireParams?: { key?: ValidatorsRequireParams, fields?: string[], params?: any }[];
  validatorFns?: { [key: string]: ValidatorFn };
}

export interface ValidatorsDefForControl {
  withoutParams?: ValidatorsWithoutParams[];
  requireParams?: { key?: ValidatorsRequireParams, params?: any }[];
  validatorFn?: ValidatorFn;
}

export type FormPlusObjects = FormControlPlus | FormGroupPlus | FormArrayPlus;

export interface FromGroupMap {
  [key: string]: FormPlusObjects;
}
