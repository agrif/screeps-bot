module.exports.roles = ['tower', 'healer'];

let ENERGY_PER_JOB = 150;
let HEAL_PER_ENERGY = 12;

function discover(tasks, room) {
    room.find(FIND_MY_CREEPS, {
        filter: (obj) => obj.hits < obj.hitsMax,
    }).forEach((obj) => {
        let left = obj.hitsMax - obj.hits;
        let max = Math.ceil(left / (ENERGY_PER_JOB * HEAL_PER_ENERGY));
        tasks.add(room, 'heal', 'max', tasks.HIGH, obj.id, obj.name, max);
    });
}

function perform(tasks, worker, task, obj) {
    if (worker.store[RESOURCE_ENERGY] == 0)
        return ERR_NOT_ENOUGH_RESOURCES;

    let status = worker.heal(obj);
    if (status == ERR_NOT_ENOUGH_RESOURCES)
        return ERR_NOT_ENOUGH_RESOURCES;

    if (status == ERR_NOT_IN_RANGE) {
        worker.moveTo(obj);
    }

    if (obj.hits >= obj.hitsMax) {
        tasks.remove(task.key);
    }

    return OK;
}

module.exports.discover = discover;
module.exports.perform = perform;
