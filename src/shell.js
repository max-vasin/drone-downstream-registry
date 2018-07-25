const fs = require('fs');
const path = require('path');
const exec = require('child_process').exec;
const log = require('./logger');
const scriptFile = path.resolve(process.cwd(), 'handler.sh');

module.exports = (commands) => {
  if (!commands) {
    log.info(`Handler has no commands. Nothing to execute.`);
    return;
  }

  log.info(`Building a shell script ${scriptFile}`);

  const script = [];

  commands.forEach((command) => {
    script.push(`echo "> ${command}"`);
    script.push(command);
  });

  fs.writeFileSync(scriptFile, script.join('\n'));

  log.info('Executing the script...');

  exec(`sh ${scriptFile}`, {
    env: process.env
  }, (error, stdout, stderr) => {
    if (stdout) {
      log.info('STDOUT:');
      log.info(stdout);
    }
    if (stderr) {
      log.error('STDERR:');
      log.error(stderr);
    }
    if (error !== null) {
      log.error(`exec error: ${error.message}`);
      process.exit(1);
    }
  });
};