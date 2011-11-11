var INSTRUCTIONS = {
    'CLR': {
        regex: '0000([01][01])101.......',
        bits: function (rnr) {
            return '0000' + rnr + '10 10000000';
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
        execute: function (rnr, adr) {
            this.register[rnr] = bin2dec(this.memory[adr] + this.memory[adr + 1]);
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

function dec2bin(n) {
    return (n < 0 ? (0xFFFF + n + 1) : n).toString(2);
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
        
        var current = this.memory[this.position] + this.memory[this.position + 1];
        
        for (name in INSTRUCTIONS) {
            
            var instruction = INSTRUCTIONS[name];
            
            // check if regex matches
            var match = current.match(instruction.regex);
            if (match != null) {
                
                console.log(name);
                
                // convert to decimal
                var args = match.slice(1);
                for (i in args) {
                    args[i] = bin2dec(args[i]);
                }
                
                // execute instruction
                instruction.execute.apply(this, args);
                
                break;
            }
        }
        
        this.position = this.position + 2;
        
        console.log(JSON.stringify(this.register));
    }
};

var cpu = new CPU();

