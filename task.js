let tasks = {
    spawn: require('task.spawn'),
    energy: require('task.energy'),
    controller: require('task.controller'),
    harvest: require('task.harvest'),
    build: require('task.build'),
    repair: require('task.repair'),
    heal: require('task.heal'),
    attack: require('task.attack'),
};

module.exports.CRITICAL = 'critical';
module.exports.HIGH = 'high';
module.exports.MEDIUM = 'medium';
module.exports.LOW = 'low';
module.exports.LEVEL = 'level';
let PRIORITIES = [
    module.exports.CRITICAL,
    module.exports.HIGH,
    module.exports.MEDIUM,
    module.exports.LOW,
    module.exports.LEVEL,
];

function discover(room) {
    if (!Memory.tasks)
        Memory.tasks = {};
    if (!Memory.tasksPriority)
        Memory.tasksPriority = {};

    for (let name in tasks) {
        tasks[name].discover(module.exports, room);
    }
}

function add(room, type, subtype, priority, id, desc, max, extras) {
    let key = type + '-' + subtype + '-' + priority + '-' + id;
    if (max == 0) {
        remove(key);
        return;
    }

    if (!Memory.tasks[key]) {
        Memory.tasks[key] = {
            assigned: 0,
        };
    }

    let t = Memory.tasks[key];
    _.assign(t, {
        key: key,
        room: room.name,
        type: type,
        subtype: subtype,
        priority: priority,
        id: id,
        description: desc,
        max: max,
    });

    _.assign(t, extras);

    if (!Memory.tasksPriority[priority]) {
        Memory.tasksPriority[priority] = {};
    }
    Memory.tasksPriority[priority][key] = true;
}

function findSuitableWorker(task, obj) {
    let room = Game.rooms[task.room];
    let worker;

    worker = room.find(FIND_MY_SPAWNS, {
        filter: (worker) => !worker.memory.task &&
            _.includes(tasks[task.type].roles, 'spawner'),
    });
    if (worker.length > 0)
        return worker[0];

    worker = room.find(FIND_MY_STRUCTURES, {
        filter: (worker) => worker.structureType == STRUCTURE_TOWER &&
            !worker.memory.task &&
            _.includes(tasks[task.type].roles, 'tower'),
    });
    if (worker.length > 0)
        return worker[0];

    if (obj) {
        worker = obj.pos.findClosestByPath(FIND_MY_CREEPS, {
            filter: (worker) => !worker.memory.task &&
                worker.memory.room == room.name &&
                _.includes(tasks[task.type].roles, worker.memory.role),
        });
        return worker;
    }
    return null;
}

function assign(room) {
    for (let priorityi in PRIORITIES) {
        let priority = PRIORITIES[priorityi];
        if (!Memory.tasksPriority[priority])
            continue;
        for (let k in Memory.tasksPriority[priority]) {
            let task = Memory.tasks[k];
            let obj = null;
            if (task.id) {
                obj = Game.getObjectById(task.id);
                if (!obj) {
                    remove(k);
                    continue;
                }
            }

            while (task.max < 0 || task.assigned < task.max) {
                let worker = findSuitableWorker(task, obj);
                if (!worker)
                    break;
                console.log('assigning ' + task.type + '.' + task.subtype + ' (' + task.description + ' in ' + task.room + ') to ' + worker.name);
                worker.memory.task = k;
                task.assigned += 1;
            }
        }
    }
}

function remove(key) {
    let task = Memory.tasks[key];
    if (!task)
        return;
    if (Memory.tasksPriority[task.priority]) {
        delete Memory.tasksPriority[task.priority][key];
    }
    delete Memory.tasks[key];
}

function release(worker, reduceMax) {
    let key = worker.memory.task;
    if (!key)
        return;

    let task = Memory.tasks[key];
    if (!task) {
        worker.memory.task = null;
        return;
    }

    worker.memory.task = null;
    task.assigned -= 1;
    if (task.assigned < 0)
        task.assigned = 0;
    if (reduceMax) {
        task.max -= 1;
        if (task.max == 0) {
            remove(key);
        }
    }
}

function perform(worker) {
    if (!worker.memory.task)
        return OK;

    let task = Memory.tasks[worker.memory.task];
    if (!task) {
        worker.memory.task = null;
        return OK;
    }
        
    let obj = null;
    if (task.id) {
        obj = Game.getObjectById(task.id);
        if (!obj) {
            remove(task.key);
            return OK;
        }
    }

    return tasks[task.type].perform(module.exports, worker, task, obj);
}

module.exports.discover = discover;
module.exports.add = add;
module.exports.assign = assign;
module.exports.remove = remove;
module.exports.release = release;
module.exports.perform = perform;
