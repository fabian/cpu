var INSTRUCTIONS = {
    'CLR': {
        regex: '0000([01][01])101.......',
        bits: function (rnr) {
            return '0000' + rnr + '10 10000000';
        },
        optcode: function (rnr) {
            return 'CLR R' + rnr;
        },
        execute: function (rnr) {
            this.register[rnr] = 0;
        }
    },
    'LWDD': {
        regex: '010.([01][01])([01]{10})',
        bits: function (rnr, adr) {
            return '0100' + rnr + adr;
        },
        optcode: function (rnr, adr) {
            return 'LWDD R' + rnr + ', #' + adr;
        },
        execute: function (rnr, adr) {
            this.register[rnr] = bin2dec(this.memory[adr] + this.memory[adr + 1]);
        }
    }
};

function parseBin(memory, input, offset) {
    
    input = input.replace(/[^01]*/g, '');
    
    if (input.length % 16 != 0) {
        return false; // invalid input
    }
    
    for (var i = 0; i < (input.length / 8); i++) {
        memory[i + offset] = input.slice(i*8, (i+1)*8);
    }
    
    return memory;
}

function bin2dec(n) {
    n = parseInt(n, 2);
    if (n > 0x7FFF) { // 0x7FFF = 0b0111 1111 1111 1111
        n -= 0xFFFF + 1;
    }
    return n;
}

function dec2bin(n, padding) {
    
    var bin = (n < 0 ? (0xFFFF + n + 1) : n).toString(2);
    
    padding = typeof (padding) === 'undefined' || padding === null ? padding = 16 : padding;
    
    while (bin.length < padding) {
        bin = '0' + bin;
    }
    
    return bin;
}

var CPU = function () {
    
    this.register = [];
    
    this.memory = [];
    this.memory[003] = '01010101';
    this.memory[004] = '10101010';
    this.memory[100] = '00001110';
    this.memory[101] = '10000000';
    this.memory[102] = '01001100';
    this.memory[103] = '00000011';
    
    this.position = 100;
    
    // main loop
    while (this.position < 104) {
        
        this.decode(this.position).execute();
        
        this.position = this.position + 2;
        
        console.log(JSON.stringify(this.register));
    }
};

CPU.prototype.decode = function (position) {
    
    var bits = this.memory[position] + this.memory[position + 1];
    
    for (name in INSTRUCTIONS) {
        
        var instruction = INSTRUCTIONS[name];
        
        // check if regex matches
        var match = bits.match(instruction.regex);
        if (match != null) {
            
            console.log(name);
            
            // convert to decimal
            var args = match.slice(1);
            for (i in args) {
                args[i] = bin2dec(args[i]);
            }
            
            var that = this;
            return {
                execute: function () {
                    instruction.execute.apply(that, args);
                },
                optcode: function () {
                    return instruction.optcode.apply(that, args);
                }
            };
        }
    }
    
    return {
        execute: function () {
            // do nothing
        },
        optcode: function () {
            return '';
        }
    }
};

CPU.prototype.load = function (empty, converter) {

    var memory = [];
    for (var i = 1; i < 530; i++) {
        memory[i] = '00000000';
    }

    var instructions = prompt('Please paste instructions:', empty);
    memory = converter(memory, instructions, 100);

    if (instructions) {
    
        var input = prompt('Please paste input:', empty);
        memory = converter(memory, input, 500);
        
        if (memory) {
            
            this.memory = memory;
            this.display();
            
        } else {
            alert('Invalid memory!');
        }

    } else {
        alert('Invalid instructions!');
    }
};

CPU.prototype.display = function () {

    // instructions
    $('.instructions .values').empty();
    for (var i = 100; i < 500; i += 2) {
        $('.instructions .values').append('<li><em>' + i + '</em> ' + this.memory[i] + ' ' + this.memory[i+1] + ' <em>' + this.decode(i).optcode() + '</em></li>');
    }

    // instructions
    $('.memory .values').empty();
    for (var i = 500; i < 530; i += 2) {
        $('.memory .values').append('<li><em>' + i + '</em> ' + this.memory[i] + ' ' + this.memory[i+1] + ' <em>' + bin2dec(this.memory[i] + this.memory[i+1]) + '</em></li>');
    }
};

