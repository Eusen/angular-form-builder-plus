import {ModuleWithProviders, NgModule} from '@angular/core';
// imports start
import {FormBuilderPlus} from './services/form-builder/form-builder-plus.service';
// imports end

const $imports = [];
const $declarations = [
// declarations start

// declarations end
];
const $entryComponents = [
// entryComponents start

// entryComponents end
];
const $providers = [
// providers start
FormBuilderPlus
// providers end
];
const $exports = [
  ...$declarations,
  ...$entryComponents,
];

@NgModule({
  imports: [
    ...$imports,
  ],
  declarations: [
    ...$declarations,
    ...$entryComponents,
  ],
  entryComponents: [
    ...$entryComponents,
  ],
  exports: [
    ...$exports
  ],
})
export class ArcFormsModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: ArcFormsModule,
      providers: [
        ...$providers,
      ]
    };
  }
}
