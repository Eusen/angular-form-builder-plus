import {FormBuilder, Validators, FormControl, FormGroup, FormArray} from '@angular/forms';
import {ValidatorsWithoutParams, ValidatorsRequireParams, ValidatorsDefForControl, FromProductTree, ValidatorsDef} from './interfaces';

export function deepBuild(target: any, validators?: ValidatorsDef, key?: string) {
  if (
    target instanceof FormControlPlus ||
    target instanceof FormGroupPlus ||
    target instanceof FormArrayPlus
  ) {
    return target;
  }

  if (target !== null && target !== undefined && typeof target === 'object') {
    return (target instanceof Array) ? new FormArrayPlus(target, validators) : new FormGroupPlus(target, validators);
  } else {
    const validatorsForControl: ValidatorsDefForControl = {};
    if (validators) {
      if (validators.withoutParams) {
        validatorsForControl.withoutParams = validators.withoutParams.filter(def => def.fields.includes(key)).map(def => def.key);
      }

      if (validators.requireParams) {
        validatorsForControl.requireParams = validators.requireParams.filter(def => def.fields.includes(key));
      }
    }
    return new FormControlPlus(target, validatorsForControl);
  }
}

export function deepTouch(ctrl: FormControl | FormGroup | FormArray) {
  if (ctrl instanceof FormControl) {
    ctrl.markAsDirty();
    ctrl.updateValueAndValidity();
  } else if (ctrl instanceof FormGroup) {
    Object.keys(ctrl.controls).forEach(key => {
      const subCtrl = ctrl.controls[key];
      deepTouch(subCtrl as any);
    });
  } else if (ctrl instanceof FormArray) {
    ctrl.controls.forEach(subCtrl => {
      deepTouch(subCtrl as any);
    });
  }
}

// control
export class FormControlPlus<T = any> {
  static builder: FormBuilder;
  private self = FormControlPlus;
  private readonly _control: FormControl;

  get entry() {
    return this._control;
  }

  get value(): T {
    return this.entry.value;
  }

  set value(value: T) {
    this.entry.setValue(value);
  }

  constructor(value: T, private validators?: ValidatorsDefForControl) {
    this._control = this.self.builder.control(value);
    this.buildValidators();
  }

  private buildValidators() {
    if (this.validators) {
      if (this.validators.withoutParams) {
        this.setValidators(...this.validators.withoutParams);
      }

      if (this.validators.requireParams) {
        this.validators.requireParams.forEach(def => {
          this.setValidator(def.key, def.params);
        });
      }
    }
  }

  setValidators(...types: ValidatorsWithoutParams[]) {
    this.entry.setValidators(types.map(type => Validators[type]));
  }

  setValidator(type: ValidatorsRequireParams, params: any) {
    this.entry.setValidators(Validators[type](params));
  }

  clearValidators() {
    this.entry.clearValidators();
    this.entry.clearAsyncValidators();
  }

  touch() {
    deepTouch(this.entry);
  }

  hasError() {
    return this.entry.dirty && this.entry.errors;
  }

  patch(value: T) {
    this.entry.setValue(value);
  }
}


// group
export class FormGroupPlus<T = any> {
  static builder: FormBuilder;
  private self = FormGroupPlus;
  private readonly _group: FormGroup;
  private tree: FromProductTree = {};

  get entry() {
    return this._group;
  }

  get value() {
    return this.entry.getRawValue();
  }

  set value(value: T) {
    this.patch(value);
  }

  constructor(value: T, private validators?: ValidatorsDef) {
    this._group = this.self.builder.group([]);

    Object.keys(value).forEach(key => {
      const form = deepBuild(value[key], this.validators, key);
      this.tree[key] = form;
      this.entry.registerControl(key, form.entry);
    });
  }

  touch() {
    deepTouch(this.entry);
  }

  hasError(key?: string) {
    if (key) {
      const ctrl = this.entry.get(key);
      return ctrl && !!ctrl.dirty && !!ctrl.errors;
    } else {
      this.touch();
      return Object.keys(this.value).map(field => this.hasError(field)).filter(err => err).length > 0;
    }
  }

  private get<R = any>(path: string): R {
    const paths = path.replace(/\[/g, '.').replace(/\]/g, '').split('.');
    let current: any = this;
    while (paths.length > 0) {
      current = current.tree[paths.shift()];
    }
    return current as any;
  }

  getControl(path: string) {
    return this.get<FormControlPlus>(path);
  }

  getGroup(path: string) {
    return this.get<FormGroupPlus>(path);
  }

  getArray(path: string) {
    return this.get<FormArrayPlus>(path);
  }

  patch(value: T) {
    this.entry.patchValue(value);
  }
}


// array
export class FormArrayPlus<T = any> {
  static builder: FormBuilder;
  private self = FormArrayPlus;
  private readonly _array: FormArray;
  private tree: FromProductTree = {};

  get entry() {
    return this._array;
  }

  get value(): T[] {
    return this.entry.getRawValue();
  }

  set value(value: T[]) {
    this.patch(value);
  }

  constructor(value: T[], private validators?: ValidatorsDef) {
    this._array = this.self.builder.array([]);
    this.patch(value);
  }

  touch() {
    deepTouch(this.entry);
  }

  hasError() {
    return this.entry.controls.filter(ctrl => ctrl.dirty && ctrl.errors).length > 0;
  }

  private at<R = any>(index: number): R {
    return this.tree[index] as any;
  }

  getControl(index: number) {
    return this.at<FormControlPlus>(index);
  }

  getGroup(index: number) {
    return this.at<FormGroupPlus>(index);
  }

  getArray(index: number) {
    return this.at<FormArrayPlus>(index);
  }

  push(value: T) {
    const key = this.value.length.toString();
    const ctrl = deepBuild(value, this.validators, key);
    this.tree[key] = ctrl;
    this.entry.push(ctrl.entry);
  }

  insert(index: number, value: T) {
    const key = index.toString();
    const ctrl = deepBuild(value, this.validators, key);
    this.tree[key] = ctrl;
    this.entry.insert(index, ctrl.entry);
  }

  set(index: number, value: T) {
    const ctrl = this.at(index);
    ctrl.patch(value);
  }

  remove(index) {
    this.entry.removeAt(index);
  }

  clear() {
    this.entry.clear();
  }

  patch(newArray: T[]) {
    this.entry.clear();
    newArray.forEach(item => this.push(item));
  }
}
