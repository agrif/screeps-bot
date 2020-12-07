module.exports.roles = ['worker'];

let DOWNGRADE_MARGIN = 5000;
let MAX_LEVEL = 8;

function discover(tasks, room) {
    let control = room.controller;
    if (control && control.my) {
        if (control.level < MAX_LEVEL) {
            tasks.add(room, 'controller', 'level', tasks.LEVEL, control.id, 'level up', -1);
        }
        if (control.ticksToDowngrade < DOWNGRADE_MARGIN) {
            tasks.add(room, 'controller', 'maintain', tasks.HIGH, control.id, 'maintain', 1);
        }
    }
}

function perform(tasks, worker, task, obj) {
    if (worker.store[RESOURCE_ENERGY] == 0)
        return ERR_NOT_ENOUGH_RESOURCES;

    let status = worker.upgradeController(obj, RESOURCE_ENERGY);
    if (status == ERR_NOT_IN_RANGE) {
        worker.moveTo(obj);
    }

    if (obj.level >= MAX_LEVEL && tasks.subtype == 'level') {
        tasks.remove(task.key);
    }

    if (obj.ticksToDowngrade >= DOWNGRADE_MARGIN && task.subtype == 'maintain') {
        tasks.remove(task.key);
    }

    return OK;
}

module.exports.discover = discover;
module.exports.perform = perform;
