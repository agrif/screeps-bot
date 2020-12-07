module.exports.roles = ['tower', 'attacker'];

let ENERGY_PER_JOB = 150;
let ATTACK_PER_ENERGY = 30;

function discover(tasks, room) {
    room.find(FIND_HOSTILE_CREEPS).forEach((obj) => {
        let left = obj.hits;
        let max = Math.ceil(left / (ENERGY_PER_JOB * ATTACK_PER_ENERGY));
        tasks.add(room, 'attack', 'max', tasks.HIGH, obj.id, obj.name, max);
    });
}

function perform(tasks, worker, task, obj) {
    if (worker.store[RESOURCE_ENERGY] == 0)
        return ERR_NOT_ENOUGH_RESOURCES;

    let status = worker.attack(obj);
    if (status == ERR_NOT_ENOUGH_RESOURCES)
        return ERR_NOT_ENOUGH_RESOURCES;

    if (status == ERR_NOT_IN_RANGE) {
        worker.moveTo(obj);
    }

    return OK;
}

module.exports.discover = discover;
module.exports.perform = perform;
