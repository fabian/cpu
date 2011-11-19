var INSTRUCTIONS = {
    'CLR': {
        regex: '0000([01][01])101.......',
        optcode: function (rnr) {
            return 'CLR R' + rnr;
        },
        execute: function (rnr) {
            this.register[rnr] = 0;
        },
        assembly: 'CLR R([0-3])',
        compile: function (rnr) {
            return '0000' + dec2bin(rnr, 2) + '1010000000';
        }
    },
    'ADD': {
        regex: '0000([01][01])111.......',
        optcode: function (rnr) {
            return 'ADD R' + rnr;
        },
        execute: function (rnr) {
            var bits1 = dec2bin(this.register[0]);
            var bits2 = dec2bin(this.register[rnr]);
            
            var r = '';
            var carry = '0';
            var into = '0';
            var result = '';
            for (var i = bits1.length; i > 0; i--) {
                
                var a = bits1.slice(i - 1, i);
                var b = bits2.slice(i - 1, i);
                into = carry;
                
                switch (true) {
                    case a == '1' && b == '1' && carry == '0':
                        r = '0';
                        carry = '1';
                        break;
                    case a == '1' && b == '1' && carry == '1':
                        r = '1';
                        carry = '1';
                        break;
                    case (a == '1' || b == '1') && carry == '1':
                        r = '0';
                        carry = '1';
                        break;
                    case (a == '1' || b == '1') && carry == '0':
                        r = '1';
                        carry = '0';
                        break;
                    case carry == '1':
                        r = '1';
                        carry = '0';
                        break;
                    default:
                        r = '0';
                        carry = '0';
                        break;
                }
                
                result = r + result;
            }
            
            // detect overflow
            if (carry != into) {
                this.carry = 1;
            } else {
                this.carry = 0;
            }
            
            this.register[0] = bin2dec(result);
        },
        assembly: 'ADD R([0-3])',
        compile: function (rnr) {
            return '0000' + dec2bin(rnr, 2) + '1110000000';
        }
    },
    'ADDD': {
        regex: '1([01]{15})',
        optcode: function (zahl) {
            return 'ADDD #' + zahl;
        },
        execute: function (zahl) {
            this.register[0] += zahl;
        },
        assembly: 'ADDD #([0-9]{1,5})',
        compile: function (rnr) {
            return '1' + dec2bin(rnr, 15);
        }
    },
    'INC': {
        regex: '0{7}1.{8}',
        optcode: function () {
            return 'INC';
        },
        execute: function () {
            this.register[0] += 1;
        },
        assembly: 'INC',
        compile: function () {
            return '0000000100000000';
        }
    },
    'DEC': {
        regex: '0{5}100.{8}',
        optcode: function () {
            return 'DEC';
        },
        execute: function () {
            this.register[0] -= 1;
        },
        assembly: 'DEC',
        compile: function () {
            return '0000010000000000';
        }
    },
    'LWDD': {
        regex: '010.([01][01])([01]{10})',
        optcode: function (rnr, adr) {
            return 'LWDD R' + rnr + ', #' + adr;
        },
        execute: function (rnr, adr) {
            this.register[rnr] = bin2dec(this.memory[adr] + this.memory[adr + 1]);
        },
        assembly: 'LWDD R([0-3]), #([0-9]{1,4})',
        compile: function (rnr, adr) {
            return '0100' + dec2bin(rnr, 2) + dec2bin(adr, 10);
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
        },
        assembly: 'SWDD R([0-3]), #([0-9]{1,4})',
        compile: function (rnr, adr) {
            return '0110' + dec2bin(rnr, 2) + dec2bin(adr, 10);
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
        },
        assembly: 'SRA',
        compile: function () {
            return '0000010100000000';
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
        },
        assembly: 'SLA',
        compile: function () {
            return '0000100000000000';
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
        },
        assembly: 'SRL',
        compile: function () {
            return '0000100100000000';
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
        },
        assembly: 'SLL',
        compile: function () {
            return '0000110000000000';
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
        },
        assembly: 'AND R([0-3])',
        compile: function (rnr) {
            return '0000' + dec2bin(rnr, 2) + '1000000000';
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
        },
        assembly: 'OR R([0-3])',
        compile: function (rnr) {
            return '0000' + dec2bin(rnr, 2) + '1100000000';
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
        },
        assembly: 'NOT',
        compile: function () {
            return '0000000010000000';
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
        },
        assembly: 'BZ R([0-3])',
        compile: function (rnr) {
            return '0001' + dec2bin(rnr, 2) + '1000000000';
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
        },
        assembly: 'BNZ R([0-3])',
        compile: function (rnr) {
            return '0001' + dec2bin(rnr, 2) + '0100000000';
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
        },
        assembly: 'BC R([0-3])',
        compile: function (rnr) {
            return '0001' + dec2bin(rnr, 2) + '1100000000';
        }
    },
    'B': {
        regex: '0001([01][01])00.{8}',
        optcode: function (rnr) {
            return 'B R' + rnr;
        },
        execute: function (rnr) {
            this.position = this.register[rnr];
        },
        assembly: 'B R([0-3])',
        compile: function (rnr) {
            return '0001' + dec2bin(rnr, 2) + '0000000000';
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
        },
        assembly: 'BZD #([0-9]{1,4})',
        compile: function (addr) {
            return '001100' + dec2bin(addr, 10);
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
        },
        assembly: 'BNZD #([0-9]{1,4})',
        compile: function (addr) {
            return '001010' + dec2bin(addr, 10);
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
        },
        assembly: 'BCD #([0-9]{1,4})',
        compile: function (addr) {
            return '001110' + dec2bin(addr, 10);
        }
    },
    'BD': {
        regex: '00100.([01]{10})',
        optcode: function (addr) {
            return 'BD #' + addr;
        },
        execute: function (addr) {
            this.position = addr;
        },
        assembly: 'BD #([0-9]{1,4})',
        compile: function (addr) {
            return '001000' + dec2bin(addr, 10);
        }
    }
};

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

function trim(string) {
    return string.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
}

var CPU = function () {

    this.reset();
    
//    var string = '';
//    for (var name in INSTRUCTIONS) {
//        
//        var instruction = INSTRUCTIONS[name];
//
//        string += instruction.optcode.call(this, 2, 974) + '\n';
//    }
//    this.parseAssembly(string, 100);
    
    this.display();
};

CPU.prototype.compile = function (code) {
        
    for (var name in INSTRUCTIONS) {
        
        var instruction = INSTRUCTIONS[name];
        
        // check if regex matches
        var match = code.match(instruction.assembly);
        if (match != null) {
        
            var args = match.slice(1);
            for (var i in args) {
                args[i] = parseInt(args[i]);
            }
            
            return instruction.compile.apply(null, args);
        }
    }
    
    // STOP
    return '0000000000000000';
};

CPU.prototype.parseAssembly = function (input, offset) {
    
    input = trim(input).split('\n');
    
    for (var i in input) {
        
        var line = trim(input[i]);
        var match = line.match('([0-9]{1,3})? *(.*)');
        if (match) {
            var bits = this.compile(match[2]);
            var position = match[1] ? parseInt(match[1]) : parseInt(i) * 2 + offset;
            this.memory[position] = bits.slice(0, 8);
            this.memory[position + 1] = bits.slice(8, 16);
        }
    }
};

CPU.prototype.parseBin = function (input, offset) {
    
    input = input.replace(/[^01]*/g, '');
    
    if (input.length % 16 != 0) {
        return false; // invalid input
    }
    
    for (var i = 0; i < (input.length / 8); i++) {
        this.memory[i + offset] = input.slice(i*8, (i+1)*8);
    }
};

CPU.prototype.parseHex = function (input, offset) {
    
    input = input.replace(/[^0-9A-F]*/g, '');
    
    if (input.length % 4 != 0) {
        return false; // invalid input
    }
    
    for (var i = 0; i < (input.length / 2); i++) {
        this.memory[i + offset] = hex2bin(input.slice(i*2, (i+1)*2), 8);
    }
};

CPU.prototype.parseDec = function (input, offset) {
    
    input = input.split(/[^0-9-]/g);
    
    var n = 0;
    var bits = '';
    
    for (var i = 0; i < input.length; i++) {
        
        n = parseInt(input[i]);
        bits = dec2bin(n);
        
        this.memory[i*2 + offset] = bits.slice(0, 8);
        this.memory[i*2 + offset + 1] = bits.slice(8, 16);
    }
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
        }, 100, this);
    }
};

CPU.prototype.step = function () {
    
    var position = this.position;
    this.position = this.position + 2;
    
    var instruction = this.decode(position);
    var stop = instruction.execute();
    
    if (stop) {
        
        this.position = position;
        
    } else {
        
        console.log(position + ': ' + instruction.optcode() + ' (Carry: ' + this.carry + ')');
        this.count++;
    }
    
    return stop;
};

CPU.prototype.decode = function (position) {
    
    var bits = this.memory[position] + this.memory[position + 1];
    
    for (var name in INSTRUCTIONS) {
        
        var instruction = INSTRUCTIONS[name];
        
        // check if regex matches
        var match = bits.match(instruction.regex);
        if (match != null) {
            
            // convert to decimal
            var args = match.slice(1);
            for (var i in args) {
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
    
    this.memory = this.empty();
};

CPU.prototype.empty = function () {

    var memory = [];
    for (var i = 1; i < 530; i++) {
        memory[i] = '00000000';
    }
    
    return memory;
};

CPU.prototype.load = function (from, values, converter) {
    
    for (var i = from; i < from + 400; i++) {
        this.memory[i] = '00000000';
    }
    
    converter.call(this, values, from);

    this.display();
};

CPU.prototype.display = function () {

    // Info
    $('.info li').text(this.count);

    // Decoded Instruction
    var instruction = this.decode(this.position).optcode();
    if (!instruction) {
        instruction = 'STOP';
    }
    $('.decoded li').html('<em>' + this.position + '</em> ' + instruction);

    // Register
    $('.register .values').empty();
    for (var i = 0; i < this.register.length; i++) {
        $('.register .values').append('<li><em>R0' + i + '</em> ' + dec2bin(this.register[i]) + ' <em>' + this.register[i] + '</em></li>');
    }
    
    // Carry
    $('.register .values').append('<li title="Carry"><em>CA0</em> ' + this.carry + '</em></li>');

    // instructions
    $('.instructions .values').empty();
    for (var i = 100; i < 500; i += 2) {
        
        var li = $('<li><em>' + i + '</em> ' + this.memory[i] + this.memory[i+1] + ' <em>' + this.decode(i).optcode() + '</em></li>');
        
        if (i == this.position) {
            li.addClass('active');
        }
        
        $('.instructions .values').append(li);
    }

    // instructions
    $('.memory .values').empty();
    for (var i = 500; i < 530; i += 2) {
        $('.memory .values').append('<li><em>' + i + '</em> ' + this.memory[i] + this.memory[i+1] + ' <em>' + bin2dec(this.memory[i] + this.memory[i+1]) + '</em></li>');
    }
};

