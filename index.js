#!/usr/bin/env node

const fs = require('fs');
const cmd = require('node-cmd')
const backdown = require('commander')
const package = require('./package.json')

backdown
    .version(package.version)
    //.option('-r, --reinstall', 'reinstall')
    .parse(process.argv);


//if (backdown.nothing) {
//    backup();
//}


if (process.argv.length === 2) {
    backup();
}


function getUserHome() {
    return process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
}

function reinstall() {

        cmd.get("npm --prefix " + getUserHome() + "/.backbone run main", (data) => {
            console.log(data)
            console.log('finished')
        })

}


function getData() {
    return new Promise((resolve, reject) => {
        let npm, yarn;

        getYarnData().then((data) => {
            getNpmData().then((npmdata) => {
                resolve(data[0].concat(npmdata[0]))
            });
        });

    });
}



function getNpmData() {
    return new Promise((resolve, reject) => {
        cmd.get('npm list -g --depth=0', (data) => {
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
            var searchTerm = 'linked';
            let script = ''

            for (var i = array.length - 1; i >= 0; i--) {
                if (array[i] === searchTerm) {
                    array.splice(i, 1);
                } else {
                    var append = array[i] + " "
                    script += append
                }
            }
            resolve([array, script]);
        });
    });
}

function getYarnData() {
    return new Promise((resolve, reject) => {
        cmd.get('yarn global ls', (data) => {
            if (data[0] === "y") {
                let script = ''
                let array = data.split(/\r?\n/);
                for (let i = array.length - 1; i >= 0; i--) {
                    if (array[i].slice(0, 4) !== "info") {
                        array.splice(i, 1);
                    } else {
                        array[i] = array[i].slice(5)
                        array[i] = array[i].slice(0, array[i].indexOf(" "));
                        script += array[i] + " "
                    }
                }


                resolve([array, script]);
            } else {
                resolve('');
            }
        });
    });
}






function backup() {

    getData().then((data) => {

        var array = data;

        var script = "npm install -g ";

        for (let i = 0; i < array.length; i++) {
            script += array[i] + " "
        }
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

    // Write to ~/.backdown/package.json for backup



}
