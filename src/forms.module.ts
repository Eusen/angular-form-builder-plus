import {ModuleWithProviders, NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
// imports start
import {FormBuilderPlus} from './services/form-builder/form-builder-plus.service';
import {FileUtil} from './services/form-utils/file/file.util';
import {FormUtils} from './services/form-utils/form-utils.service';
import {ImageUtil} from './services/form-utils/image/image.util';
// imports end

const imports = [
  CommonModule,
];
const declarations = [
// declarations start

// declarations end
];
const entryComponents = [
// entryComponents start

// entryComponents end
];
const providers = [
// providers start
FormBuilderPlus,
FileUtil,
FormUtils,
ImageUtil
// providers end
];
const exports = [
  ...declarations,
  ...entryComponents,
];

@NgModule({
  imports: [
    ...imports,
  ],
  declarations: [
    ...declarations,
    ...entryComponents,
  ],
  entryComponents: [
    ...entryComponents,
  ],
  exports: [
    ...exports
  ],
})
export class ArcFormsModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: ArcFormsModule,
      providers: [
        ...providers,
      ]
    };
  }
}
