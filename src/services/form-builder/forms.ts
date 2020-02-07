import {BehaviorSubject} from 'rxjs';
import {
  AbstractControlOptions, AsyncValidatorFn,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ValidatorFn,
  Validators
} from '@angular/forms';
import {
  FormPlusObjects,
  FromGroupMap,
  ValidatorsDef,
  ValidatorsDefForControl,
  ValidatorsRequireParams,
  ValidatorsWithoutParams
} from './interfaces';

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
  const isArray = target instanceof Array;
  const isNormalArray = isArray && typeof target[0] !== 'object';

  if (!isNull && isObject && !isDate && (isArray ? !isNormalArray : true)) {
    return isArray ? new FormArrayPlus(target, validators) : new FormGroupPlus(target, validators);
  } else {
    const validatorsForControl: ValidatorsDefForControl = {};
    if (validators) {
      if (validators.withoutParams) {
        validatorsForControl.withoutParams = validators.withoutParams.filter(def => def.fields && def.fields.includes(key)).map(def => def.key);
      }

      if (validators.requireParams) {
        validatorsForControl.requireParams = validators.requireParams.filter(def => def.fields && def.fields.includes(key));
      }

      if (validators.validatorFns) {
        validatorsForControl.validatorFn = validators.validatorFns[key];
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

// Base value
const initValue = {control: null, group: {}, array: []};

export class FormPlusBase<T, R = any> {
  static builder: FormBuilder;
  private self = FormPlusBase;
  protected readonly _entity: T;
  changed: BehaviorSubject<R>;

  constructor(
    type: 'control' | 'group' | 'array',
    value?: any,
    disabled?: boolean,
    validators?: ValidatorFn | ValidatorFn[] | AbstractControlOptions | null,
    asyncValidators?: AsyncValidatorFn | AsyncValidatorFn[] | null
  ) {
    value = value === undefined || value === null ? initValue[type] : value;

    this.changed = new BehaviorSubject(value);

    const state = disabled ? {value, disabled} : value;

    switch (type) {
      case 'control':
        this._entity = this.self.builder.control(state, validators, asyncValidators) as any;
        break;
      case 'group':
        this._entity = this.self.builder.group(state, {validators, asyncValidators}) as any;
        break;
      case 'array':
        this._entity = this.self.builder.array(state, validators, asyncValidators) as any;
        break;
    }

    (this._entity as any).valueChanges.subscribe(v => this.changed.next(v));
  }

  get entity() {
    return this._entity;
  }

  touch() {
    deepTouch(this._entity as any);
  }
}

// control
export class FormControlPlus<T = any> extends FormPlusBase<FormControl, T> {
  get value(): T {
    return this.entity.value;
  }

  set value(value: T) {
    this.entity.setValue(value);
  }

  constructor(value: T, private validators?: ValidatorsDefForControl) {
    super(
      'control',
      value,
      validators && validators.withoutParams && validators.withoutParams.includes('disabled'),
      validators ? [
        ...(validators.withoutParams ? validators.withoutParams.map(type => Validators[type]) : []),
        ...(validators.requireParams ? validators.requireParams.map(def => {
          return Validators[def.key] ? Validators[def.key](def.params) : null;
        }) : [])
      ].filter(v => !!v) : null,
    );
  }

  setValidators(...types: ValidatorsWithoutParams[]) {
    this.entity.setValidators(types.map(type => Validators[type]).filter(v => !!v));
  }

  setValidator(type: ValidatorsRequireParams, params: any) {
    this.entity.setValidators(Validators[type as any](params));
  }

  clearValidators() {
    this.entity.clearValidators();
    this.entity.clearAsyncValidators();
  }

  hasError(disableTouch?: boolean) {
    if (!disableTouch) {
      this.entity.markAsDirty();
      this.entity.updateValueAndValidity();
    }
    return this.entity.dirty && this.entity.invalid;
  }

  patch(value: T) {
    this.entity.setValue(value);
  }
}

// Group
export class FormGroupPlus<T = any> extends FormPlusBase<FormGroup, T> {
  protected tree: FromGroupMap = {};

  get value() {
    return this.entity.getRawValue();
  }

  set value(value: T) {
    this.patch(value);
  }

  constructor(value: T, private validators?: ValidatorsDef) {
    super('group');

    Object.keys(value).forEach(key => {
      const form = deepBuild(value[key], this.validators, key);
      this.tree[key] = form;
      this.entity.registerControl(key, form.entity);
    });
  }

  getMatErrorState(key: string) {
    return {'mat-form-field-invalid': this.hasError(key)}
  }

  hasError(key?: string, touch?: boolean) {
    if (key) {
      const ctrl = this.entity.get(key);
      if (touch) {
        ctrl.markAsDirty();
        ctrl.updateValueAndValidity();
      }
      return ctrl.dirty && ctrl.invalid;
    } else {
      // 这里的 touch 取反操作，意思是，当没有key的时候，第二个参数的含义为：是否禁用touch，而不是是否允许touch
      // 因为这样做就可以在不传参数的情况下同时满足两种条件：
      // 1. 当有key值时，默认应该不允许被touch，因为页面上只是用来判断
      // 2. 当没有key值时，默认应该允许被touch，因为逻辑里需要一步到位地校验所有字段
      !touch && this.touch();
      return Object.keys(this.tree).filter(field => {
        const node = this.tree[field];
        if (node instanceof FormGroupPlus) {
          // 第二个参数为是否禁用touch，因为根方法已经校验过了，所以不需要重复校验
          return node.hasError(null, true);
        } else {
          // 参数为是否禁用touch，因为根方法已经校验过了，所以不需要重复校验
          return node.hasError(true);
        }
      }).length > 0;
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
    this.entity.patchValue(value);
  }
}


// Array
export class FormArrayPlus<T = any> extends FormPlusBase<FormArray, T[]> {
  protected tree: FormPlusObjects[] = [];

  get value(): T[] {
    return this.entity.getRawValue();
  }

  set value(value: T[]) {
    this.patch(value);
  }

  constructor(value: T[], private validators?: ValidatorsDef) {
    super('array');
    this.patch(value);
  }

  hasError(disableTouch?: boolean) {
    !disableTouch && this.touch();
    return this.tree.filter((node) => {
      if (node instanceof FormGroupPlus) {
        // 第二个参数为是否禁用touch，因为根方法已经校验过了，所以不需要重复校验
        return node.hasError(null, true);
      } else {
        // 参数为是否禁用touch，因为根方法已经校验过了，所以不需要重复校验
        return node.hasError(true);
      }
    }).length > 0;
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

  push(value: T) {
    const key = this.value.length.toString();
    const ctrl = deepBuild(value, this.validators, key);
    this.tree.push(ctrl);
    this.entity.push(ctrl.entity);
  }

  insert(index: number, value: T) {
    const key = index.toString();
    const ctrl = deepBuild(value, this.validators, key);
    this.tree = this.tree.slice(0, index).concat(ctrl, this.tree.slice(index, this.tree.length));
    this.entity.insert(index, ctrl.entity);
  }

  remove(index: number) {
    this.entity.removeAt(index);
    this.tree.splice(index, 1);
  }

  clear() {
    this.entity.clear();
  }

  patch(newArray: T[]) {
    this.entity.clear();
    newArray.forEach(item => this.push(item));
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

  new() {
    const value: any = {};
    const tmpl = this.getGroup(0);
    Object.keys(tmpl.value).forEach(key => {
      value[key] = null;
    });
    this.push(value);
  }
}
