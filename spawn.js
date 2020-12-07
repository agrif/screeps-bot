let task = require('task');

function run(spawn) {
    task.perform(spawn);
}

function garbageCollect(name, memory) {
    console.log('spawn died: ' + name);
    task.release({name: name, memory: memory});
}

module.exports.run = run;
module.exports.garbageCollect = garbageCollect;
