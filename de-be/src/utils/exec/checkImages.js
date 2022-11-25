const {exec} = require('child_process');

function checkImages() {
  exec(`yes | docker system prune -a`, (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      return;
    }
    console.log(stdout);
    return null;
  });
}
checkImages();
setInterval(checkImages, 3600000);
