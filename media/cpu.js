var INSTRUCTIONS = {
    'CLR': {
        regex: '0000([01][01])101.......',
        optcode: function (rnr) {
            return 'CLR R' + rnr;
        },
        execute: function (rnr) {
            this.register[rnr] = 0;
        }
    },
    'ADD': {
        regex: '0000([01][01])111.......',
        optcode: function (rnr) {
            return 'ADD R' + rnr;
        },
        execute: function (rnr) {
            this.register[0] += this.register[rnr];
        }
    },
    'ADDD': {
        regex: '1([01]{15})',
        optcode: function (zahl) {
            return 'ADDD #' + zahl;
        },
        execute: function (zahl) {
            this.register[0] += zahl;
        }
    },
    'INC': {
        regex: '0{7}1.{8}',
        optcode: function () {
            return 'INC';
        },
        execute: function () {
            this.register[0] += 1;
        }
    },
    'DEC': {
        regex: '0{5}100.{8}',
        optcode: function () {
            return 'DEC';
        },
        execute: function () {
            this.register[0] -= 1;
        }
    },
    'LWDD': {
        regex: '010.([01][01])([01]{10})',
        optcode: function (rnr, adr) {
            return 'LWDD R' + rnr + ', #' + adr;
        },
        execute: function (rnr, adr) {
            this.register[rnr] = bin2dec(this.memory[adr] + this.memory[adr + 1]);
        }
    },
    'SWDD': {
        regex: '011.([01][01])([01]{10})',
        optcode: function (rnr, adr) {
            return 'SWDD R' + rnr + ', #' + adr;
        },
        execute: function (rnr, adr) {
            var bits = dec2bin(this.register[rnr]);
            this.memory[adr] = bits.slice(0, 8);
            this.memory[adr + 1] = bits.slice(8, 16);
        }
    },
    'SRA': {
        regex: '0{5}101.{8}',
        optcode: function () {
            return 'SRA';
        },
        execute: function () {
            var bits = dec2bin(this.register[0]);
            this.carry = parseInt(bits.slice(15, 16));
            this.register[0] = bin2dec(bits.slice(0, 15));
        }
    },
    'SLA': {
        regex: '0{4}1000.{8}',
        optcode: function () {
            return 'SLA';
        },
        execute: function () {
            var bits = dec2bin(this.register[0]);
            this.carry = parseInt(bits.slice(1, 2));
            this.register[0] = this.register[0] * 2;
        }
    },
    'SRL': {
        regex: '0{4}1001.{8}',
        optcode: function () {
            return 'SRL';
        },
        execute: function () {
            var bits = dec2bin(this.register[0]);
            this.carry = parseInt(bits.slice(15, 16));
            this.register[0] = bin2dec('0' + bits.slice(0, 15));
        }
    },
    'SLL': {
        regex: '0{4}1100.{8}',
        optcode: function () {
            return 'SLL';
        },
        execute: function () {
            var bits = dec2bin(this.register[0]);
            this.carry = parseInt(bits.slice(0, 1));
            this.register[0] = bin2dec(bits.slice(1, 16) + '0');
        }
    },
    'AND': {
        regex: '0000([01][01])100.......',
        optcode: function (rnr) {
            return 'AND R' + rnr;
        },
        execute: function (rnr) {
            
            var accu = dec2bin(this.register[0]);
            var register = dec2bin(this.register[rnr]);
            var bits = '';
            
            for (var i = 0; i < accu.length; i++) {
                if (accu[i] == '1' && register[i] == '1') {
                    bits += '1';
                } else {
                    bits += '0';
                }
            }
            
            this.register[0] = bin2dec(bits);
        }
    },
    'OR': {
        regex: '0000([01][01])110.......',
        optcode: function (rnr) {
            return 'OR R' + rnr;
        },
        execute: function (rnr) {
            
            var accu = dec2bin(this.register[0]);
            var register = dec2bin(this.register[rnr]);
            var bits = '';
            
            for (var i = 0; i < accu.length; i++) {
                if (accu[i] == '1' || register[i] == '1') {
                    bits += '1';
                } else {
                    bits += '0';
                }
            }
            
            this.register[0] = bin2dec(bits);
        }
    },
    'NOT': {
        regex: '0{8}1.{7}',
        optcode: function () {
            return 'NOT';
        },
        execute: function () {
            
            var accu = dec2bin(this.register[0]);
            var bits = '';
            
            for (var i = 0; i < accu.length; i++) {
                if (accu[i] == '1') {
                    bits += '0';
                } else {
                    bits += '1';
                }
            }
            
            this.register[0] = bin2dec(bits);
        }
    },
    'BZ': {
        regex: '0001([01][01])10.{8}',
        optcode: function (rnr) {
            return 'BZ R' + rnr;
        },
        execute: function (rnr) {
            if (this.register[0] == 0) {
                this.position = this.register[rnr];
            }
        }
    },
    'BNZ': {
        regex: '0001([01][01])01.{8}',
        optcode: function (rnr) {
            return 'BNZ R' + rnr;
        },
        execute: function (rnr) {
            if (this.register[0] != 0) {
                this.position = this.register[rnr];
            }
        }
    },
    'BC': {
        regex: '0001([01][01])11.{8}',
        optcode: function (rnr) {
            return 'BC R' + rnr;
        },
        execute: function (rnr) {
            if (this.carry == 1) {
                this.position = this.register[rnr];
            }
        }
    },
    'B': {
        regex: '0001([01][01])00.{8}',
        optcode: function (rnr) {
            return 'B R' + rnr;
        },
        execute: function (rnr) {
            this.position = this.register[rnr];
        }
    },
    'BZD': {
        regex: '00110.([01]{10})',
        optcode: function (addr) {
            return 'BZD #' + addr;
        },
        execute: function (addr) {
            if (this.register[0] == 0) {
                this.position = addr;
            }
        }
    },
    'BNZD': {
        regex: '00101.([01]{10})',
        optcode: function (addr) {
            return 'BNZD #' + addr;
        },
        execute: function (addr) {
            if (this.register[0] != 0) {
                this.position = addr;
            }
        }
    },
    'BCD': {
        regex: '00111.([01]{10})',
        optcode: function (addr) {
            return 'BCD #' + addr;
        },
        execute: function (addr) {
            if (this.carry == 1) {
                this.position = addr;
            }
        }
    },
    'BD': {
        regex: '00100.([01]{10})',
        optcode: function (addr) {
            return 'BD #' + addr;
        },
        execute: function (addr) {
            this.position = addr;
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

function parseHex(memory, input, offset) {
    
    input = input.replace(/[^0-9A-F]*/g, '');
    
    if (input.length % 4 != 0) {
        return false; // invalid input
    }
    
    for (var i = 0; i < (input.length / 2); i++) {
        memory[i + offset] = hex2bin(input.slice(i*2, (i+1)*2), 8);
    }
    
    return memory;
}

function parseDec(memory, input, offset) {
    
    input = input.split(/[^0-9-]/g);
    
    var n = 0;
    var bits = '';
    
    for (var i = 0; i < input.length; i++) {
        
        n = parseInt(input[i]);
        bits = dec2bin(n);
        
        memory[i*2 + offset] = bits.slice(0, 8);
        memory[i*2 + offset + 1] = bits.slice(8, 16);
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

function hex2bin(n, padding) {
    
    n = parseInt(n, 16);
    
    return dec2bin(n, padding);
}

var CPU = function () {
    
    this.reset();
    
    var i = 100;
    this.memory = this.empty();
    
    // 100 add extended sign into #508
    this.memory[i++] = '01000001';
    this.memory[i++] = '11110100'; // LWDD R0, #500
    
    // 102
    this.memory[i++] = '00001100';
    this.memory[i++] = '00000000'; // SLL
    
    // 104
    this.memory[i++] = '00111000';
    this.memory[i++] = '01101100'; // BCD #106
    
    // 106
    this.memory[i++] = '00100000';
    this.memory[i++] = '01110010'; // BD #114
    
    // 108
    this.memory[i++] = '00000010';
    this.memory[i++] = '10000000'; // CLR R0
    
    // 110
    this.memory[i++] = '00000001';
    this.memory[i++] = '00000000'; // INC
    
    // 112
    this.memory[i++] = '01100001';
    this.memory[i++] = '11111100'; // SWDD R0, #508
    
    // 114 add particial product
    this.memory[i++] = '01000001';
    this.memory[i++] = '11110110'; // LWDD R0 #502
    
    
    
    // 116
    this.memory[i++] = '01000001';
    this.memory[i++] = '11111000'; // LWDD R1 #500
    
    var i = 500;
    
     /*this.memory[i++] = '00010000';
    this.memory[i++] = '11100001';//4321
    
    this.memory[i++] = '11111011';
    this.memory[i++] = '00101110';//-1234*/
    
    this.memory[i++] = '00000000';
    this.memory[i++] = '00001100';//12
    
    this.memory[i++] = '00000000';
    this.memory[i++] = '00001101';//13
    
    /*this.memory[i++] = '11111111';
    this.memory[i++] = '11111110';//-2*/
    
    this.display();
};

CPU.prototype.fast = function () {
    
    var stop = false;
    
    // main loop
    while (!stop) {
        
        // run instruction
        stop = this.step();
    }
    
    this.display();
};

CPU.prototype.slow = function () {
    
    // run instruction
    var stop = this.step();
    
    this.display();
    
    if (!stop) {
        var that = this;
        setTimeout(function (that) {
        	that.slow();
        }, 500, this);
    }
};

CPU.prototype.step = function () {
    
    var position = this.position;
    this.position = this.position + 2;
    
    var stop = this.decode(position).execute();
    
    this.count++;
    
    return stop;
};

CPU.prototype.decode = function (position) {
    
    var bits = this.memory[position] + this.memory[position + 1];
    
    for (name in INSTRUCTIONS) {
        
        var instruction = INSTRUCTIONS[name];
        
        // check if regex matches
        var match = bits.match(instruction.regex);
        if (match != null) {
            
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
    
    // STOP
    return {
        execute: function () {
            return true;
        },
        optcode: function () {
            return '';
        }
    }
};

CPU.prototype.reset = function () {

    this.position = 100;
    this.count = 0;
    this.carry = 0;

    this.register = [];
    for (var i = 0; i < 4; i++) {
        this.register[i] = 0;
    }
};

CPU.prototype.empty = function () {

    var memory = [];
    for (var i = 1; i < 530; i++) {
        memory[i] = '00000000';
    }
    
    return memory;
};

CPU.prototype.load = function (empty, converter) {

    var memory = this.empty();

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

    // Info
    $('.info .ip').text(this.position);
    $('.info .carry').text(this.carry);
    $('.info .count').text(this.count);

    // Register
    $('.register .values').empty();
    for (var i = 0; i < this.register.length; i++) {
        $('.register .values').append('<li><em>R0' + i + '</em> ' + dec2bin(this.register[i]) + ' <em>' + this.register[i] + '</em></li>');
    }

    // instructions
    $('.instructions .values').empty();
    for (var i = 100; i < 500; i += 2) {
        
        var li = $('<li><em>' + i + '</em> ' + this.memory[i] + ' ' + this.memory[i+1] + ' <em>' + this.decode(i).optcode() + '</em></li>');
        
        if (i == this.position) {
            li.addClass('active');
        }
        
        $('.instructions .values').append(li);
    }

    // instructions
    $('.memory .values').empty();
    for (var i = 500; i < 530; i += 2) {
        $('.memory .values').append('<li><em>' + i + '</em> ' + this.memory[i] + ' ' + this.memory[i+1] + ' <em>' + bin2dec(this.memory[i] + this.memory[i+1]) + '</em></li>');
    }
};

