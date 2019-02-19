const childProcess = require('child_process');

const result = childProcess.spawnSync('wget', ['--version']);

if (result.error) {
  console.error(
    'wget not found. You must install wget (https://www.gnu.org/software/wget/) before continuing.'
  );
  process.exit(1);
} else {
  console.log('wget found.');
}
