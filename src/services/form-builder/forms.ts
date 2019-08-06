import {BehaviorSubject} from 'rxjs';
import {FormBuilder, Validators, FormControl, FormGroup, FormArray} from '@angular/forms';
import {ValidatorsWithoutParams, ValidatorsRequireParams, ValidatorsDefForControl, FromGroupMap, ValidatorsDef, FormPlusObjects} from './interfaces';

export function deepBuild(target: any, validators?: ValidatorsDef, key?: string) {
  if (
    target instanceof FormControlPlus ||
    target instanceof FormGroupPlus ||
    target instanceof FormArrayPlus
  ) {
    return target;
  }

  const isNull = target === null || target === undefined;
  const isObject = typeof target === 'object';
  const isDate = target instanceof Date;

  if (!isNull && isObject && !isDate) {
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

// base
const initValue = {control: null, group: {}, array: []};

export class FormPlusBase<T, R = any> {
  static builder: FormBuilder;
  private self = FormPlusBase;
  private readonly _entry: T;
  changed = new BehaviorSubject<R>(null);

  constructor(type: 'control' | 'group' | 'array') {
    this._entry = this.self.builder[type](initValue[type]) as any;
  }

  get entry() {
    return this._entry;
  }

  touch() {
    deepTouch(this._entry as any);
  }
}

// control
export class FormControlPlus<T = any> extends FormPlusBase<FormControl, T> {
  get value(): T {
    return this.entry.value;
  }

  set value(value: T) {
    this.entry.setValue(value);
  }

  constructor(value: T, private validators?: ValidatorsDefForControl) {
    super('control');
    this.buildValidators();
    this.patch(value);
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
    this.entry.setValidators(Validators[type as any](params));
  }

  clearValidators() {
    this.entry.clearValidators();
    this.entry.clearAsyncValidators();
  }

  hasError() {
    return this.entry.dirty && this.entry.invalid;
  }

  patch(value: T) {
    this.entry.setValue(value);
    this.changed.next(value);
  }
}


// group
export class FormGroupPlus<T = any> extends FormPlusBase<FormGroup, T> {
  protected tree: FromGroupMap = {};

  get value() {
    return this.entry.getRawValue();
  }


  set value(value: T) {
    this.patch(value);
  }

  constructor(value: T, private validators?: ValidatorsDef) {
    super('group');

    Object.keys(value).forEach(key => {
      const form = deepBuild(value[key], this.validators, key);
      this.tree[key] = form;
      this.entry.registerControl(key, form.entry);
    });

    this.changed.next(this.value);
  }

  hasError(key?: string) {
    if (key) {
      const ctrl = this.entry.get(key);
      return ctrl && !!ctrl.dirty && !!ctrl.errors;
    } else {
      this.touch();
      return Object.keys(this.tree).filter(field => this.tree[field].hasError()).length > 0;
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
    this.changed.next(this.value);
  }
}


// array
export class FormArrayPlus<T = any> extends FormPlusBase<FormArray, T[]> {
  protected tree: FormPlusObjects[] = [];

  get value(): T[] {
    return this.entry.getRawValue();
  }

  set value(value: T[]) {
    this.patch(value);
  }

  constructor(value: T[], private validators?: ValidatorsDef) {
    super('array');
    this.patch(value);
  }

  hasError() {
    this.touch();
    return Object.keys(this.tree).filter(key => this.tree[key].hasError()).length > 0;
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

  set(index: number, value: T) {
    const ctrl = this.at(index);
    ctrl.patch(value);
  }

  push(value: T, emitEvent = true) {
    const key = this.value.length.toString();
    const ctrl = deepBuild(value, this.validators, key);
    this.tree.push(ctrl);
    this.entry.push(ctrl.entry);
    emitEvent && this.changed.next(this.value);
  }

  insert(index: number, value: T) {
    const key = index.toString();
    const ctrl = deepBuild(value, this.validators, key);
    this.tree = this.tree.slice(0, index).concat(ctrl, this.tree.slice(index, this.tree.length));
    this.entry.insert(index, ctrl.entry);
    this.changed.next(this.value);
  }

  remove(index: number) {
    this.entry.removeAt(index);
    this.tree.splice(index, 1);
    this.changed.next(this.value);
  }

  clear() {
    this.entry.clear();
    this.changed.next(this.value);
  }

  patch(newArray: T[]) {
    this.entry.clear();
    newArray.forEach(item => this.push(item, false));
    this.changed.next(this.value);
  }

  switch(aIndex: number, bIndex: number) {
    const array = this.value;
    const old = array[aIndex];
    array[aIndex] = array[bIndex];
    array[bIndex] = old;
    this.patch(array);
  }

  moveUp(index: number) {
    if (index >= 1) this.switch(index, index - 1);
    else throw new Error('Index must be greater than or equal to 1, otherwise it will be wrong');
  }

  moveDown(index) {
    if (index < this.value.length - 1) this.switch(index, index + 1);
    else throw new Error('The index must be less than or equal to the total length, otherwise it will be wrong');
  }
}

