let names = require('names');
let spawn = require('spawn');
let creep = require('creep');
let task = require('task');
let tower = require('tower');

function loop() {
    // set up towers
    // to look more like spawns and creeps
    Game.towers = {};
    if (!Memory.towers)
        Memory.towers = {};
    for (let name in Game.rooms) {
        let room = Game.rooms[name];
        room.find(FIND_MY_STRUCTURES, {filter: function(obj) {
            return obj.structureType == STRUCTURE_TOWER && obj.my;
        }}).forEach((tow) => {
            Game.towers[tow.id] = tow;
            if (!Memory.towers[tow.id])
                Memory.towers[tow.id] = {
                    role: 'tower',
                    name: names.generate('TW'),
                };
            tow.memory = Memory.towers[tow.id];
            tow.name = tow.memory.name;
        });
    }

    garbageCollect();

    for (let name in Game.rooms) {
        task.discover(Game.rooms[name]);
        task.assign(Game.rooms[name]);
    }

    for (let name in Game.spawns) {
        spawn.run(Game.spawns[name]);
    }

    for (let name in Game.towers) {
        tower.run(Game.towers[name]);
    }

    for (let name in Game.creeps) {
        creep.run(Game.creeps[name]);
    }
}

function garbageCollect() {
    for (let name in Memory.spawns) {
        if (!Game.spawns[name]) {
            let mem = Memory.spawns[name];
            spawn.garbageCollect(name, mem);
            delete Memory.spawns[name];
        }
    }

    for (let name in Memory.towers) {
        if (!Game.towers[name]) {
            let mem = Memory.towers[name];
            tower.garbageCollect(mem.name, mem);
            delete Memory.towers[name];
        }
    }

    for (let name in Memory.creeps) {
        if (!Game.creeps[name]) {
            let mem = Memory.creeps[name];
            creep.garbageCollect(name, mem);
            delete Memory.creeps[name];
        }
    }
}

module.exports.loop = loop;
