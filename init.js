var fs = require('fs');

function getUserHome() {
  return process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
}

var dir = getUserHome() + '/.backdown';


if (!fs.existsSync(dir)){
    fs.mkdirSync(dir);
    fs.writeFile(dir + '/package.json', "",(err) => {
        console.log(err)
    })
}
