let task = require('task');

function run(tower) {
    task.perform(tower);
}

function garbageCollect(name, memory) {
    console.log('tower died: ' + name);
    task.release({name: name, memory: memory});
}

module.exports.run = run;
module.exports.garbageCollect = garbageCollect;
