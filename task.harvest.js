module.exports.roles = ['harvester'];

function discover(tasks, room) {
    // FIXME multiple sources, take care about danger!
    room.find(FIND_SOURCES_ACTIVE).forEach((obj) => {
        tasks.add(room, 'harvest', 'energy', tasks.MEDIUM, obj.id, 'source', 1);
    });
}

function perform(tasks, worker, task, obj) {
    if (worker.harvest(obj) == ERR_NOT_IN_RANGE) {
        worker.moveTo(obj);
    }
    return OK;
}

module.exports.discover = discover;
module.exports.perform = perform;
