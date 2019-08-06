import {Injectable} from '@angular/core';
import {FormBuilder} from '@angular/forms';
import {ValidatorsDef, ValidatorsDefForControl} from './interfaces';
import {FormArrayPlus, FormControlPlus, FormGroupPlus, FormPlusBase} from './forms';

@Injectable({
  providedIn: 'root'
})
export class FormBuilderPlus {
  private self = FormBuilderPlus;

  static control<T = any>(defaultValue: T, validators?: ValidatorsDefForControl) {
    return new FormControlPlus(defaultValue, validators);
  }

  static group<T = any>(structure: T, validators?: ValidatorsDef) {
    return new FormGroupPlus<T>(structure, validators);
  }

  static array<T = any>(structure: T[], validators?: ValidatorsDef) {
    return new FormArrayPlus<T>(structure, validators);
  }

  constructor(builder: FormBuilder) {
    FormPlusBase.builder = builder;
  }

  control<T = any>(defaultValue: T, validators?: ValidatorsDefForControl) {
    return this.self.control(defaultValue, validators);
  }

  group<T = any>(structure: T, validators?: ValidatorsDef) {
    return this.self.group(structure, validators);
  }

  array<T = any>(structure: T[], validators?: ValidatorsDef) {
    return this.self.array(structure, validators);
  }
}
