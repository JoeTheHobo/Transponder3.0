let allImages = [];
let decoded = decodeSheet();
let lines = decoded.lines;
let catagories = [];
let currentLine = 0;
let currentFam = lines[0].car;

function gatherImages(line) {
    if (lines[line].car !== currentFam) {
        currentFam = lines[line].car;
        $('catagories').innerHTML = '';
    }

    if (lines[line].itemType.toLowerCase() == 'remote') {
        currentLine++;
        gatherImages(currentLine);
        return;
    }
    if (lines[line].itemType.toLowerCase() == 'pt') {
        currentLine++;
        gatherImages(currentLine);
        return;
    }

    $('decodeImage').src = '';
    $('decodeImage').src = lines[line].imgLink;
    $('newCatBTN').style.display = 'none';
    $('skipBTN').style.display = 'none';
    $('decodeImage').onload = function() {
        $('location').innerHTML = lines[line].col.toUpperCase() + lines[line].row;
        $('mainFreq').innerHTML = lines[line].frequency;
        $('mainBat').innerHTML = lines[line].battery;
        $('mainBlade').innerHTML = lines[line].bladeType;
        $('newCatBTN').style.display = 'inline-block';
        $('skipBTN').style.display = 'inline-block';
    }
    $('decodeImage').onerror = function() {
        currentLine++;
        gatherImages(currentLine);
    }
}
function skip() {
    currentLine++;
    gatherImages(currentLine);
}

function newCatagory() {
    let holder = $('catagories').create('img');
    holder.className = 'holder';
    holder.src = lines[currentLine].imgLink;
    holder.id = 'ID' + catagories.length;
    holder.box = lines[currentLine];
    holder.cat = catagories.length;
    holder.onmouseover = function() {
        $('examineImage').src = this.src;
        $('oldFreq').innerHTML = this.box.frequency;
        $('oldBat').innerHTML = this.box.battery;
        $('oldBlade').innerHTML = this.box.bladeType;
    }
    holder.onmouseleave = function() {
        $('examineImage').src = '';
        $('oldFreq').innerHTML = '';
        $('oldBat').innerHTML = '';
        $('oldBlade').innerHTML = '';
    }
    holder.onclick = function() {
        catagories[this.cat].push(currentLine);
        currentLine++;
        gatherImages(currentLine);
    }
    let set = [currentLine];
    catagories.push(set);
    currentLine++;
    gatherImages(currentLine)
}

gatherImages(currentLine);


function objToStr() {
    let org = [];
    let id = 0;
    for (let i = 0; i < obj.length; i++) {
        for (let j = 0; j < obj[i].length; j++) {
            org.push({id: id,line: obj[i][j]});
        }
        id++;
    }
    var res = org.sort(({line:a}, {line:b}) => a-b);
    let string = '';
    let current = 0;
    for (let i = 0; i < lines.length; i++) {
        if (current < res.length) {

            if (i === res[current].line) {
                string += res[current].id;
                current++;
            }
        }
        string += '\n';
    }

    console.log(string)
}

let obj = [
    [
        0,
        4
    ],
    [
        3
    ],
    [
        5
    ],
    [
        6,
        11,
        12
    ],
    [
        7,
        8,
        22,
        30
    ],
    [
        9
    ],
    [
        10
    ],
    [
        13
    ],
    [
        18,
        25
    ],
    [
        19
    ],
    [
        23,
        26
    ],
    [
        24,
        27
    ],
    [
        29
    ],
    [
        35
    ],
    [
        37,
        45,
        51
    ],
    [
        39,
        60
    ],
    [
        43,
        54
    ],
    [
        44
    ],
    [
        46
    ],
    [
        47
    ],
    [
        48
    ],
    [
        49,
        59
    ],
    [
        50
    ],
    [
        52
    ],
    [
        55,
        61
    ],
    [
        56
    ],
    [
        57
    ],
    [
        58
    ],
    [
        62
    ],
    [
        63
    ],
    [
        64,
        84
    ],
    [
        68
    ],
    [
        74
    ],
    [
        75
    ],
    [
        83
    ],
    [
        87
    ],
    [
        93,
        95,
        116
    ],
    [
        94
    ],
    [
        101,
        102,
        112,
        114
    ],
    [
        106
    ],
    [
        108
    ],
    [
        111
    ],
    [
        113
    ],
    [
        115
    ],
    [
        117
    ],
    [
        119,
        120,
        124
    ],
    [
        121
    ],
    [
        122,
        126,
        127
    ],
    [
        125,
        128
    ],
    [
        134
    ],
    [
        137,
        140
    ],
    [
        144,
        146
    ],
    [
        151,
        165,
        168,
        173,
        174
    ],
    [
        156,
        162
    ],
    [
        157
    ],
    [
        161
    ],
    [
        164,
        170,
        172
    ],
    [
        167
    ],
    [
        169
    ],
    [
        176
    ],
    [
        177,
        200
    ],
    [
        181,
        184,
        188,
        210
    ],
    [
        185,
        202
    ],
    [
        186
    ],
    [
        187,
        199,
        204
    ],
    [
        189,
        192,
        207
    ],
    [
        193,
        209
    ],
    [
        194,
        206
    ],
    [
        195
    ],
    [
        197
    ],
    [
        201
    ],
    [
        208
    ],
    [
        214
    ],
    [
        219
    ],
    [
        221
    ]
]
