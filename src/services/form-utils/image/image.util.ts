import {Injectable} from '@angular/core';
import {FileUtil} from '../file/file.util';

@Injectable({
  providedIn: 'root'
})
export class ImageUtil {
  constructor(private file: FileUtil) {
  }

  getDataURL() {
    return new Promise<string>(resolve => {
      this.file.getImage().then(fileList => {
        this.file.blobToDataURL(fileList.item(0)).then(resolve);
      });
    });
  }
}
