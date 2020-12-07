let names = require('names');

module.exports.roles = ['spawner'];

let MAX_HARVESTERS = 2;
let MAX_WORKERS = 8;

function discover(tasks, room) {
    let creeps = room.find(FIND_MY_CREEPS);
    // emergency creep
    tasks.add(room, 'spawn', 'emergency', tasks.CRITICAL, null, 'creep', Math.max(1 - creeps.length, 0));

    creeps = _.filter(Game.creeps, (creep) => creep.memory.role == 'harvester' && creep.memory.room == room.name);
    tasks.add(room, 'spawn', 'harvester', tasks.HIGH, null, 'creep', Math.max(MAX_HARVESTERS - creeps.length, 0));

    creeps = _.filter(Game.creeps, (creep) => creep.memory.role == 'worker' && creep.memory.room == room.name);
    tasks.add(room, 'spawn', 'worker', tasks.MEDIUM, null, 'creep', Math.max(MAX_WORKERS - creeps.length, 0));
}

function perform(tasks, worker, task, obj) {
    let body, role, letters;
    if (task.subtype == 'emergency') {
        body = [WORK, WORK, CARRY, MOVE];
        role = 'worker';
        letters = 'EM';
    } else if (task.subtype == 'harvester') {
        body = [WORK, WORK, WORK, WORK, WORK, WORK, MOVE, MOVE];
        role = 'harvester';
        letters = 'HV';
    } else if (task.subtype == 'worker') {
        body = [WORK, WORK, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE];
        role = 'worker';
        letters = 'WK';
    } else {
        console.log('unknown spawn subtype:', task.subtype);
    }

    let status = worker.spawnCreep(body, role, {dryRun: true});
    if (status != OK) {
        return status;
    }

    let memory = {
        role: role,
        room: task.room,
        task: null,
    };
    let name = names.generate(letters);

    status = worker.spawnCreep(body, name, {memory: memory});
    if (status == OK) {
        console.log(worker.name + ' spawning new ' + role + ': ' + name);
    }
    return status;
}

module.exports.discover = discover;
module.exports.perform = perform;
