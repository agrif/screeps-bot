module.exports.roles = ['worker'];

let ENERGY_PER_JOB = 50;
let CONSTRUCTION_PER_ENERGY = 1;

function discover(tasks, room) {
    room.find(FIND_MY_CONSTRUCTION_SITES).forEach((obj) => {
        let left = obj.progressTotal - obj.progress;
        let max = Math.ceil(left / (ENERGY_PER_JOB * CONSTRUCTION_PER_ENERGY));
        tasks.add(room, 'build', 'site', tasks.MEDIUM, obj.id, obj.structureType, max);
    });
}

function perform(tasks, worker, task, obj) {
    if (worker.store[RESOURCE_ENERGY] == 0)
        return ERR_NOT_ENOUGH_RESOURCES;

    let status = worker.build(obj);
    if (status == ERR_NOT_ENOUGH_RESOURCES)
        return ERR_NOT_ENOUGH_RESOURCES;

    if (status == ERR_NOT_IN_RANGE) {
        worker.moveTo(obj);
    }

    return OK;
}

module.exports.discover = discover;
module.exports.perform = perform;
