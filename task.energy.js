module.exports.roles = ['worker'];

let ENERGY_PER_JOB = 50;

function discover(tasks, room) {
    room.find(FIND_MY_STRUCTURES, {
        filter: (obj) =>
            (obj.structureType == STRUCTURE_SPAWN ||
             obj.structureType == STRUCTURE_EXTENSION ||
             obj.structureType == STRUCTURE_TOWER) && obj.my,
    }).forEach((obj) => {
        if (obj.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
            let priority = tasks.HIGH;
            if (obj.structureType == STRUCTURE_SPAWN)
                priority = tasks.CRITICAL;
            let max = Math.ceil(obj.store.getFreeCapacity(RESOURCE_ENERGY) / ENERGY_PER_JOB);
            tasks.add(room, 'energy', 'transfer', priority, obj.id, obj.structureType, max);
        }
    });
}

function perform(tasks, worker, task, obj) {
    if (worker.store[RESOURCE_ENERGY] == 0)
        return ERR_NOT_ENOUGH_RESOURCES;

    let status = worker.transfer(obj, RESOURCE_ENERGY);
    if (status == ERR_NOT_ENOUGH_RESOURCES)
        return ERR_NOT_ENOUGH_RESOURCES;

    if (status == ERR_NOT_IN_RANGE) {
        worker.moveTo(obj);
    }

    if (obj.store.getFreeCapacity(RESOURCE_ENERGY) == 0)
        tasks.remove(task.key);

    return OK;
}

module.exports.discover = discover;
module.exports.perform = perform;
