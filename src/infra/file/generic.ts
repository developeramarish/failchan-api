// tslint:disable-next-line:import-name
import exiftoolBin from 'dist-exiftool';

// tslint:disable-next-line:import-name
import exiftool from 'node-exiftool';
// tslint:disable-next-line:import-name
import { IFileService } from './file.interface';
import { calculateMd5ForFile } from '../md5';
import { FileStorage } from '../storage.service';
import { Inject, Service } from 'typedi';
// tslint:disable-next-line:import-name
import R from 'ramda';

@Service()
export class GenericFileService implements IFileService {
  @Inject()
  storage: FileStorage;

  getExif(path: string): Promise<Object> {
    const ep = new exiftool.ExiftoolProcess(exiftoolBin);
    return ep.open()
      .then(() => ep.readMetadata(path, ['-File:all']))
      .then(result => R.omit(['SourceFile'], result.data[0]))
      .catch(() => ep.close());
  }
  calculateMd5 = calculateMd5ForFile;
  generateThumbnail(path: string, filename: string): Promise<string> {
    return new Promise(r =>
      r('https://s3.eu-central-1.amazonaws.com/failchan.yoba/file-empty.png'));
  }
  upload = async (path: string, key: string): Promise<string> => {
    return this.storage.uploadFile(path, key);
  }
}