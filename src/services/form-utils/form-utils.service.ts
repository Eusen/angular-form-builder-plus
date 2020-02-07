import {Injectable} from '@angular/core';
import {ImageUtil} from './image/image.util';
import {FileUtil} from './file/file.util';

@Injectable({
  providedIn: 'root'
})
export class FormUtils {
  constructor(
    public file: FileUtil,
    public image: ImageUtil,
  ) {
  }
}
