module.exports.roles = ['tower', 'worker'];

let WALL_MAX = 10000;

let ENERGY_PER_JOB = 50;
let REPAIR_PER_ENERGY = 100;

function discover(tasks, room) {
    room.find(FIND_MY_STRUCTURES, {
        filter: (obj) => obj.hits < obj.hitsMax,
    }).forEach((obj) => {
        let left = obj.hitsMax - obj.hits;
        let max = Math.ceil(left / (ENERGY_PER_JOB * REPAIR_PER_ENERGY));
        tasks.add(room, 'repair', 'max', tasks.HIGH, obj.id, obj.structureType, max);
    });
    
    if (room.controller.my) {
        room.find(FIND_STRUCTURES, {
            filter: (obj) => obj.structureType == STRUCTURE_WALL && obj.hits < WALL_MAX,
        }).forEach((obj) => {
            let left = WALL_MAX - obj.hits;
            let max = Math.ceil(left / (ENERGY_PER_JOB * REPAIR_PER_ENERGY));
            tasks.add(room, 'repair', 'wall', tasks.LOW, obj.id, obj.structureType, max);
        });
    }
}

function perform(tasks, worker, task, obj) {
    if (worker.store[RESOURCE_ENERGY] == 0)
        return ERR_NOT_ENOUGH_RESOURCES;

    let status = worker.repair(obj);
    if (status == ERR_NOT_ENOUGH_RESOURCES)
        return ERR_NOT_ENOUGH_RESOURCES;

    if (status == ERR_NOT_IN_RANGE) {
        worker.moveTo(obj);
    }

    if (task.subtype == 'wall' && obj.hits >= WALL_MAX) {
        tasks.remove(task.key);
    } else if (obj.hits >= obj.hitsMax) {
        tasks.remove(task.key);
    }

    return OK;
}

module.exports.discover = discover;
module.exports.perform = perform;
