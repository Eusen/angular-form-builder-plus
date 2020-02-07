import {Injectable} from '@angular/core';

export type ImageMIMETypes = 'bmp' | 'gif' | 'jpeg' | 'png' | 'ief' | 'pipeg' | 'svg+xml' | 'tiff' | 'x-icon';
export type AudioMIMETypes = 'basic' | 'mid' | 'mpeg' | 'x-aiff' | 'x-mpegurl' | 'x-pn-realaudio' | 'x-wav';
export type VideoMIMETypes = 'mpeg' | 'quicktime' | 'x-la-asf' | 'x-msvideo' | 'x-sgi-movie' | 'vnd.rn-realvideo';

@Injectable({
  providedIn: 'root'
})
export class FileUtil {
  dataURLtoBlob(dataURL: string) {
    const arr = dataURL.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bStr = atob(arr[1]);
    let n = bStr.length;
    const u8arr = new Uint8Array(n);
    while (n--) u8arr[n] = bStr.charCodeAt(n);
    return new Blob([u8arr], {type: mime});
  }

  blobTo(blob: Blob | File, readAs: 'DataURL' | 'ArrayBuffer' | 'BinaryString' | 'Text') {
    return new Promise(resolve => {
      const a = new FileReader();
      a.onload = (e: any) => {
        resolve(e.target.result);
      };
      a[`readAs${readAs}`](blob);
    });
  }

  blobToDataURL(blob: Blob | File) {
    return this.blobTo(blob, 'DataURL');
  }

  blobToText(blob: Blob | File) {
    return this.blobTo(blob, 'Text');
  }

  blobToArrayBuffer(blob: Blob | File) {
    return this.blobTo(blob, 'ArrayBuffer');
  }

  blobToBinaryString(blob: Blob | File) {
    return this.blobTo(blob, 'BinaryString');
  }

  getFiles(accept, multiple = true) {
    return new Promise<FileList>(resolve => {
      const input = document.createElement('input');
      // 设置基本属性
      input.type = 'file';
      input.accept = accept;
      input.multiple = multiple;
      input.setAttribute('capture', 'camera');
      input.onchange = () => {
        if (input.files) resolve(input.files);
      };
      // 点击
      input.click();
    });
  }

  getImage(accept: ImageMIMETypes[] = ['jpeg', 'png'], multiple = false) {
    return this.getFiles(`${accept.map(a => `image/${a}`).join(',')};capture=camera;`, multiple);
  }

  getAudio(accept: AudioMIMETypes[] = ['mpeg', 'x-mpegurl', 'x-wav'], multiple = false) {
    return this.getFiles(accept.map(a => `audio/${a}`).join(','), multiple);
  }

  getVideo(accept: VideoMIMETypes[] = ['mpeg', 'x-msvideo'], multiple = false) {
    return this.getFiles(accept.map(a => `audio/${a}`).join(','), multiple);
  }

  getBin(accept = 'application/octet-stream', multiple = false) {
    return this.getFiles(accept, multiple);
  }

  getDOC(accept = 'application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document', multiple = false) {
    return this.getFiles(accept, multiple);
  }

  getXLS(accept = 'application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', multiple = false) {
    return this.getFiles(accept, multiple);
  }

  getPPT(accept = 'application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation', multiple = false) {
    return this.getFiles(accept, multiple);
  }
}
