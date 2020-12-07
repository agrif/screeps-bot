let task = require('task');

function run(creep) {
    // do gathering first
    if (creep.memory.gathering) {
        if (creep.memory.gathering != LOOK_SOURCES || creep.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
            let source = Game.getObjectById(creep.memory.source);
            if (source) {
                let status;
                if (creep.memory.gathering == LOOK_SOURCES) {
                    status = creep.harvest(source);
                } else if (creep.memory.gathering == LOOK_STRUCTURES) {
                    status = creep.withdraw(source, RESOURCE_ENERGY);
                } else {
                    status = creep.pickup(source);
                }
                if (status == ERR_NOT_IN_RANGE) {
                    if (creep.moveTo(source) == ERR_NO_PATH) {
                        creep.memory.gathering = false;
                        creep.memory.source = null;
                        task.release(creep);
                    }
                } else if (creep.memory.gathering != LOOK_SOURCES) {
                    creep.memory.gathering = false;
                    creep.memory.source = null;
                    task.release(creep);
                }
                return;
            } else {
                creep.memory.gathering = false;
                creep.memory.source = null;
                task.release(creep);
            }
        } else {
            creep.memory.gathering = false;
            creep.memory.source = null;
            task.release(creep);
        }
    }

    // ok try the task
    if (task.perform(creep) == ERR_NOT_ENOUGH_RESOURCES) {
        let room = Game.rooms[creep.memory.room];

        // try to find a source
        let rs = room.find(FIND_STRUCTURES, {filter: (obj) => obj.structureType == STRUCTURE_CONTAINER && obj.store[RESOURCE_ENERGY] > 0});
        rs = rs.concat(room.find(FIND_DROPPED_RESOURCES, {filter: (obj) => obj.resourceType == RESOURCE_ENERGY}));
        if (rs.length > 0) {
            let r = rs[Math.floor(Math.random() * rs.length)];
            creep.memory.gathering = r.structureType ? LOOK_STRUCTURES : LOOK_RESOURCES;
            creep.memory.source = r.id;
            return;
        }

        // last resort!
        creep.memory.gathering = LOOK_SOURCES;
        let r = room.find(FIND_SOURCES_ACTIVE)[0];
        creep.memory.source = r.id;
    }
}

function garbageCollect(name, memory) {
    console.log('worker died: ' + name);
    task.release({name: name, memory: memory});
}

module.exports.run = run;
module.exports.garbageCollect = garbageCollect;
