import fs from 'fs';
import path from 'path';

const basename = path.basename(module.filename);

const filePath =
  'C:\\Users\\USER\\Desktop\\REACT\\music-player\\music-player-backend\\models';

describe('MODEL INDEX FILE TEST SUITE', () => {
  describe('READING FILES FROM DIRECTORY', () => {
    // eslint-disable-next-line array-callback-return
    fs.readdirSync(filePath).filter(file => {
      it('should not read file that doesnt not have a js extension', () => {
        expect(file.indexOf('.')).not.toBe(0);
        expect(file.slice(-3)).toBe('.js');
        expect(file).not.toBe(basename);
      });
    });
  });
});
