# FormBuilderPlus

## 简介
FormBuilderPlus 是 @angular/forms 下 FormBuilder 的升级版，有着与FormBuilder相同的功能：用来创建 FormObject (包括: FormControl, FormGroup, FormArray)。

所谓升级版，就是在每一个 FormObject 基础上，套了一层壳，用来更方便的使用 FormObject。

- FormControl -> FormContrlPlus
- FormGroup -> FormGroupPlus
- FormArray -> FormArrayPlus

而原本的 FormObject 则被统一放在了 FormPlusObject.entry 中

#### 为什么这么做
相信大部分重度Angular开发者，都会因表单的复杂而感到头大：构建一个表单为何如此复杂？如果再加上有嵌套关系，构建表单的复杂度简直几何倍数上升！

正是因为这一点，我决定写一套使用起来非常方便的工具，用来降低构建表单的难度。


## 用法
https://stackblitz.com/edit/angular-forms-plus

## API
#### FormBuilderPlus
- control<T = any>(defaultValue: T, validators?: ValidatorsDefForControl) 
    - 描述: 构建 FormControl
    - 参数:
        - structure: 可以是任何值
        - validators: 定义检验

- group<T = any>(structure: T, validators?: ValidatorsDef)
    - 描述: 构建 FormGroup
    - 参数: 
        - structure: 初始结构，必须是对象
        - validators: 定义检验

- array<T = any>(structure: T[], validators?: ValidatorsDef)
    - 描述: 构建 FormArray
    - 参数:
        - structure: 初始结构，必须是数组
        - validators: 定义检验

#### FormControlPlus
- changed: BehaviorSubject<T>
    - 描述: 监听值改变的事件

- entry: FormContrl
    - 描述: 原始 FormControl

- value: T
    - 描述: 原始值

- touch()
    - 描述: 触发错误检测

- hasError(): boolean
    - 描述: 返回是否有错误

- patch(value: T)
    - 描述: 用来更新值
    - 参数:
        - value: 新的原始值

- setValidators(...types: ValidatorsWithoutParams[])
    - 描述: 设置无参数验证
    - 参数:
        - types: Validators 不带参数的方法名数组

- setValidator(type: ValidatorsRequireParams, params: any)
    - 描述: 设置有参数验证
    - 参数:
        - type: Validators 带参数的方法名
        - params: 所用参数

- clearValidators()
    - 描述: 清除所有验证

- patch(value: T)
    - 描述: 更新原始值


#### FormGroupPlus
- changed: BehaviorSubject<T>
    - 描述: 监听值改变的事件

- entry: FormGroup
    - 描述: 原始 FormGroup

- value: T
    - 描述: 原始值

- touch()
    - 描述: 触发错误检测

- hasError(path: string): boolean
    - 描述: 返回是否有错误

- getControl(path: string): FormControlPlus
    - 描述: 根据路径获取子属性 -> FormControlPlus

- getGroup(path: string): FormGroupPlus
    - 描述: 根据路径获取子属性 -> FormGroupPlus

- getArray(path: string): FormArrayPlus
    - 描述: 根据路径获取子属性 -> FormArrayPlus

- patch(value: T)
    - 描述: 更新原始值


#### FormArrayPlus
- changed: BehaviorSubject<T[]>
    - 描述: 监听值改变的事件

- entry: FormArray
    - 描述: 原始 FormArray

- value: T[]
    - 描述: 原始值

- touch()
    - 描述: 用来触发检测

- hasError(): boolean
    - 描述: 返回是否有错误

- getControl(index: string): FormControlPlus
    - 描述: 根据索引获取子属性 -> FormControlPlus

- getGroup(index: string): FormGroupPlus
    - 描述: 根据索引获取子属性 -> FormGroupPlus

- getArray(index: string): FormArrayPlus
    - 描述: 根据索引获取子属性 -> FormArrayPlus

- patch(value: T[])
    - 描述: 更新原始值

- push(value: T)
    - 描述: 向原始值里添加一个元素（必须跟初始元素相同）

- insert(index: number, value: T)
    - 描述: 向原始值里插入一个元素

- set(index: number, value: T)
    - 描述: 修改指定位置的原始值

- remove(index: number)
    - 描述: 从原始值里删除一个元素

- clear()
    - 描述: 删除所有元素