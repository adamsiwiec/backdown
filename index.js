#!/usr/bin/env node

var backdown = require('commander')
var package = require('./package.json')

backdown
    .version(package.version)
    //.option('-r, --reinstall', 'reinstall', reinstall())
    .option('', backup())








function getUserHome() {
    return process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
}

// function reinstall() {
//     const cmd = require('node-cmd')
//     cmd.get('cd '+ getUserHome +'/.backdown', () => {
//         cmd.get('npm run main', () => {
//             console.log('finished')
//         })
//
//     })
// }

function backup() {
    const fs = require('fs');
    // call the npm list command
    const cmd = require('node-cmd')
    // var yarn = false;
    // cmd.get('yarn --version', (data) => {
    //     for (var i = 0; i < 10; i++) {
    //         if data[0] == i {
    //             yarn = true;
    //         }
    //     }
    //
    //     if (yarn) {
    //
    //     }
    // })
    cmd.get('npm list -g --depth=0', (data) => {

        // Make an array from stdin

        let array = data.split(/\r?\n/)

        // cut extraneous lines
        let length = array.length
        array.splice(length - 2, length)
        array.splice(0, 1)


        for (var i = 0; i < array.length; i++) {

            // remove '├── '
            array[i] = array[i].slice(4, array[i].length)

            // remove any extraneous info from linked packages
            if (array[i].indexOf(' ') !== -1) {
                array[i] = 'linked';
            }
        }


        // Remove linked packages and make the script string
        var search_term = 'linked';
        let script = 'npm install -g '

        for (var i = array.length - 1; i >= 0; i--) {
            if (array[i] === search_term) {
                array.splice(i, 1);
            } else {
                var append = array[i] + " "
                script += append
            }
        }

        // Write to ~/.backdown/package.json for backup

        var file = fs.createWriteStream(getUserHome() + '/.backdown/package.json');
        file.on('error', (err) => {
            console.log(err)
        });
        file.write(`{
  "scripts": {
    "main": "${ script }"
  },
  "dependencies": {
`)
        array.forEach((v) => {
            if (v === array[array.length - 1]) {
                file.write('    "' + v.replace('@', '": "') + '"' + '\n');

            } else {
                file.write('    "' + v.replace('@', '": "') + '",' + '\n');
            }
        });
        file.write(`  }
}`)
        file.end();
        console.log('')
        console.log('😀 Success! Your global packages have been backed up to: ' + getUserHome() + '/.backdown/package.json')

    })
}
