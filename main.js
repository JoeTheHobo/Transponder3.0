let clearButton = $('clearButton');
clearButton.onclick = function() {
    clear();
};

window.addEventListener('resize', resize, true);
let tableMapWidth = $('bottomMap').offsetWidth;
function resize() {
    $('body').style.width = (this.window.innerWidth - 500) +'px';
    //              Height =       Window Height      -  (Top Bar + Random Number to make it go up + Bottom Bar)
    $('body').style.height = (this.window.innerHeight - (124 + 25 + 50)) +'px';
    $('leftBar').style.height = (window.innerHeight - 168) + 'px';
};



let makes = [];
let remotes = [];
let savedKeys = ls.get('savedKeys',[]);
let shownBoxes = [];
let keyBoxesShown = 0;

let carColors = [
    ['FCA','#9fc5e8'],
    ['FMC','#38761d'],
    ['GM','#f1c232'],
    ['HMC','#ff0000'],
    ['HMG','#0b5394'],
    ['MAZ','#00ff00'],
    ['MIT','#8e7cc3'],
    ['NMC','#ffe599'],
    ['SUB','#ff9900'],
    ['TOY','#f4cccc'],
    ['EXT','#7f6000'],
]
function findColor(car) {
    for (let i = 0; i < carColors.length; i++) {
        if (carColors[i][0] == car) return carColors[i][1];
    }
}

function startUp() {

    makeTableMap();
    setupCars('makes');
    resize();

    drawBoxes();

}

let currentBox = false;
let carObj = decodeSheet();
let abc = ['A','B','C','D','E','F','G','H','I','J','K','L','M','O','P','Q','R','S','T','U','V','W','X','Y','Z','AA','AB','AC','AD','AE','AF','AG'];
let currentCol = false;
let currentRow = false;

changeStats('price');
carLines = carObj.lines;
let carMakes = carObj.makes;
let dataMakes = $('makes');
let dataModels = $('models');
let dataYears = $('years');
let inputMakes = $('makesInput');
let inputModels = $('modelsInput');
let inputYears = $('yearsInput');
let selectYears = $('yearsSelect');
let selectMakes = $('yearsMakes');
let selectModels = $('yearsModels');
$('body').style.width = (window.innerWidth - 600) + 'px';
$('body').style.height = ((window.innerHeight - 124) - $('tableMap').clientHeight) + 'px';

let keyBoxes = $('keyBoxes');
let rightBoxes = $('rightBoxes');
let selectCarDiv = $('selectCar');


let tableMapSearches = [
        {select: false,
        value: false},
        {select: false,
        value: false},
        {select: false,
        value: false}
]
//Setuo Options for Table Map Select
let blockOptions = ['ymm',''+ carObj.highestID];
let setOptions = ['fccid','model','TLUID'];
for (let k = 0; k < $('sfSelect').length; k++) {
    for (let i = 0; i < carObj.tags.length; i++) {
        if (blockOptions.includes(carObj.tags[i])) continue;

        let opt = $('sfSelect')[k].create('option');
        opt.value = carObj.tags[i];
        opt.innerHTML = carObj.tags[i].charAt(0).toUpperCase() + carObj.tags[i].substring(1,carObj.tags[i].length);
    }
    $('sfSelect')[k].value = setOptions[k];
}


startUp();

function tableMapSearchChange(num) {
    tableMapSearches[num].select = $('sfSelect')[num].value;
    tableMapSearches[num].value = $('sfInput')[num].value;
    makeTableMap();
}

function clear() {
    inputMakes.value = '';
    inputModels.value = '';
    inputYears.value = '';
    selectCarDiv.innerHTML = '';
    $('pullUp').style.display = 'none';
    $('pullUpStats').style.display = 'none';
    shownBoxes = [];

    selectedMake = false;
    selectedModel = false;
    selectedYear = false;

    setupCars('makes');
    makeTableMap()
    drawBoxes();
}

//Draw Mini boxes for choosing which car
function setupCars(type) {
    if (type == 'makes') {
        //Sort Makes
        let carMakesList = [];
        for (let i = 0; i < carMakes.length; i++) {
            carMakesList.push(carMakes[i].name);
        }
        carMakesList.sort();

        //Draw Make Boxes
        for (let i = 0; i < carMakesList.length; i++) {
            let div = selectCarDiv.create('div');
            div.className = 'carOption';
            let text = div.create('div');
            text.innerHTML = carMakesList[i].toUpperCase();
            text.className = 'carOptionText';
            div.select = carMakesList[i];
            div.onclick = function() {
				clear();
                inputMakes.value = this.select;
                triggerMakeChange();
            }
        }
    }
    if (type == 'models') {
        //Sort Models
        let modelsArr = [];
        for (let i = 0; i < carMakes[selectedMake].models.length; i++) {
            modelsArr.push(carMakes[selectedMake].models[i].name);
        }
        modelsArr.sort();

        //Draw Model Boxes
        for (let i = 0; i < modelsArr.length; i++) {
            let div = selectCarDiv.create('div');
            div.className = 'carOption';
            let text = div.create('div');
            text.innerHTML = modelsArr[i].toUpperCase();
            text.className = 'carOptionText';
            div.select = modelsArr[i];
            div.onclick = function() {
                inputModels.value = this.select;
                triggerModelChange();
            }
        }
    }
    if (type == 'years') {
        //Sort Years
        yearArr = [];
        for (let i = 0; i < carMakes[selectedMake].models[selectedModel].years.length; i++) {
            yearArr.push(carMakes[selectedMake].models[selectedModel].years[i].year);
        }
        yearArr.sort();

        //Draw Years Boxes
        for (let i = 0; i < yearArr.length; i++) {
            let div = selectCarDiv.create('div');
            div.className = 'carOption';
            div.id = 'year' + i;
            let text = div.create('div');
            text.innerHTML = yearArr[i];
            text.className = 'carOptionText';
            div.select = yearArr[i];
            div.onclick = function() {
                inputYears.value = this.select;
                triggerYearChange();
                for (let i = 0; i < yearArr.length; i++) {
                    $('year' + i).style.background = 'white';
                }
                this.style.background = 'lightyellow'
            }
        }
    }
}
let yearArr = [];

let selectedMake = false;
let selectedModel = false;
let selectedYear = false;

function drawBoxes(boxes = shownBoxes) {
    keyBoxes.innerHTML = '';
    $('rightBoxes').innerHTML = '';

    keyBoxesShown = 0;

    let newBoxes = [];

    for (let i = 0; i < savedKeys.length; i++) {
        savedKeys[i].also = false;
    }

    for (let i = 0; i < boxes.length; i++) {
        let pass = true;
        for (let j = 0; j < savedKeys.length; j++) {
            if (savedKeys[j].col == boxes[i].col && savedKeys[j].row == boxes[i].row) {
                savedKeys[j].also = true;
                pass = false;
            }
        }
        if (pass) newBoxes.push(boxes[i]);
    }

    boxes = savedKeys.concat(newBoxes)

    let allBoxes = [];
    for (let i = 0; i < boxes.length; i++) {
        let found = false;
        for (let j = 0; j < allBoxes.length; j++) {
            if (allBoxes[j][0].col == boxes[i].col && allBoxes[j][0].row == boxes[i].row) {
                found = true;
                allBoxes[j].push(boxes[i]);
            }
        }
        if (!found) {
            allBoxes.push([boxes[i]])
        }
    }

    boxes = allBoxes;

    //Start Displaying
    for (let i = 0; i < boxes.length; i++) {
        let box = boxes[i][0];
        let st = false;
        for (let i = 0; i < itemTypes.length; i++) {
            if (itemTypes[i].type == box.itemType) st = itemTypes[i];
        }

        keyBoxesShown++;

        let createFromHere = keyBoxes;
        if (st.display == 'right') createFromHere = rightBoxes;
    
        let holder = createFromHere.create('div');
        holder.className = 'keyboxHolder2';

        let div = holder.create('div');
        div.className = 'keyboxHolder';
        div.id = 'keyBox' + keyBoxesShown;
        div.box = box;
        div.chip = box.chip;
    
        if (st.colorLB) div.style.background = st.colorLB;
        if (box.amount < 1) {
            div.style.background = 'pink';
        }
        if (box.saved) {
            div.style.background = 'lightyellow';
        }
        
        let keyBoxId = div.create('div');
        keyBoxId.className = 'keyboxItem';
        keyBoxId.id = 'keyBoxLocation'
        keyBoxId.innerHTML = box.col.toUpperCase() + box.row;
    
        let anyNotes = false;
        for (let j = 0; j < boxes[i].length; j++) {
            if (boxes[i][j].keyNotes) anyNotes = true;
        }
        if (anyNotes || box.saved) {
            let type = div.create('div');
            type.className = 'keyboxItem';
            type.id = 'keyBoxItemNotes'
            let notes = '';
            if (box.saved) notes += '[' + box.savedName + '] ';
            if (box.saved && box.also) notes += '<br> [Also This Car!]';
            
            let allNoNotes = true;
            for (let j = 0; j < boxes[i].length; j++) {
                if (boxes[i][j].keyNotes) allNoNotes = false; 
            }
            if (!allNoNotes) {
                for (let j = 0; j < boxes[i].length; j++) {
                    let br = j === 0 ? '' : '<br>';
                    if (boxes[i][j].keyNotes) notes += br + (j + 1) + ': ' + boxes[i][j].keyNotes.toUpperCase();
                    else notes += br + (j + 1) + ': NO NOTES';
                }
            }
            
            type.innerHTML = notes;
        }
    
        if (st.buttons && st.keyVSitem == 'key') {
            let type = div.create('div');
            type.className = 'keyboxItem';
            type.className = 'keyBoxType';
            type.innerHTML = box.type;
        }
        if (st.keyVSitem == 'item') {
            let type = div.create('div');
            type.className = 'keyboxItem';
            type.className = 'keyBoxType';
            type.innerHTML = box.itemType.toUpperCase();
        }
    
        
    
        let amt = div.create('div');
        amt.className = 'keyboxItem';
        amt.id = 'keyBoxAMT';
        amt.innerHTML = box.amount + ' Left';
    
        
        if (st.retail) {
            let type = div.create('div');
            type.className = 'keyboxItem';
            type.id = 'keyBoxMoney';
            type.innerHTML = '$' + box.retail;
        }
        
        div.onclick = function() {
            let car = this.box;
            makeTableMap(car.col,car.row)
            let shell = car.itemType == 'shell' ? this.chip : false;
            pullUp(getBoxFromId(car.col + car.row),shell);
            for (let i = 1; i < keyBoxesShown + 1; i++) {
                $('keyBox' + i).style.boxShadow = 'rgba(0, 0, 0, 0.25) 0px 14px 28px, rgba(0, 0, 0, 0.22) 0px 10px 10px';
            }
            this.style.boxShadow = 'rgba(50, 0, 255, 1) 0px 14px 28px, rgba(0, 0, 0, 0.22) 0px 10px 10px';
        }

        let optionDiv = holder.create('div');
        optionDiv.className = 'keyBoxOptions';
        let saveButton = optionDiv.create('div');
        saveButton.className = 'keyBoxSaveButton';
        saveButton.box = box;
        if (box.saved) saveButton.innerHTML = 'Un-Save';
        else saveButton.innerHTML = 'Save';
        saveButton.onclick = function() {
            saveKey(false,this.box)
        };
    }
}

function triggerMakeChange() {
    inputModels.value = '';
    inputYears.value = '';
    shownBoxes = [];
    drawBoxes();
    selectedModel = false;
    selectedYear = false;
    $('pullUp').style.display = 'none';

    selectCarDiv.innerHTML = '';
    dataModels.innerHTML = '';

    let found = false;
    for (let i = 0; i < carMakes.length; i++) {
        if (carMakes[i].name == inputMakes.value && inputMakes.value != '') found = i;
    }
    if (found !== false) {
        selectedMake = found;
        let modelsArr = [];
        for (let i = 0; i < carMakes[selectedMake].models.length; i++) {
            modelsArr.push(carMakes[selectedMake].models[i].name);
        }
        modelsArr.sort();
        for (let i = 0; i < modelsArr.length; i++) {
            let opt = dataModels.create('option');
            opt.value = modelsArr[i];
        }

        setupCars('models')
    } else {
        setupCars('makes')
    }
}
function triggerModelChange() {

    inputYears.value = '';
    selectedYear = false;
    shownBoxes = [];
    drawBoxes();
    $('pullUp').style.display = 'none';

    dataYears.innerHTML = '';
    selectCarDiv.innerHTML = '';

    let found = false;
    for (let i = 0; i < carMakes[selectedMake].models.length; i++) {
        if (carMakes[selectedMake].models[i].name == inputModels.value) found = i;
    }
    if (found !== false) {
        selectedModel = found;
        let yearArr = [];
        for (let i = 0; i < carMakes[selectedMake].models[selectedModel].years.length; i++) {
            yearArr.push(carMakes[selectedMake].models[selectedModel].years[i].year);
        }
        yearArr.sort();
        for (let i = 0; i < yearArr.length; i++) {
            let opt = dataYears.create('option');
            opt.value = yearArr[i];
        }
        setupCars('years');
    } else {
        setupCars('models');
    }
}
function triggerYearChange() {
    rightBoxes.innerHTML = '';
    $('pullUp').style.display = 'none';
    shownBoxes = [];

    let found = false;
    for (let i = 0; i < carMakes[selectedMake].models[selectedModel].years.length; i++) {
        if (carMakes[selectedMake].models[selectedModel].years[i].year == inputYears.value) {
            found = i;
        }
    }

    if (found !== false) {
        selectedYear = found;

        let boxes = carMakes[selectedMake].models[selectedModel].years[selectedYear].keys;
        for (let i = 0; i < boxes.length; i++) {

            let box = boxes[i];
            let st = false;
            for (let i = 0; i < itemTypes.length; i++) {
                if (itemTypes[i].type == box.itemType) st = itemTypes[i];
            }

            //Check If Key Box Should Be Present
            let pass = true;
            let value = $('searchBy').value;
            if (st.searchType !== value) pass = false;
            if (value == 'all') pass = true;

            if (!pass) continue;

            shownBoxes.push(box);


        }
        drawBoxes()
    } else {
        setupCars('years')
    }
}


inputMakes.onchange = function() {
    triggerMakeChange();
}
inputModels.onchange = function() {
    triggerModelChange();
}
inputYears.onchange = function() {
    triggerYearChange();
}
$('searchBy').onchange = function() {
    if (selectedYear) triggerYearChange();
    if (!selectedMake) clear();
}

let carMakesList = [];
for (let i = 0; i < carMakes.length; i++) {
    carMakesList.push(carMakes[i].name);
}
carMakesList.sort();
for (let i = 0; i < carMakesList.length; i++) {
    let opt = dataMakes.create('option');
    opt.value = carMakesList[i];
}

function saveCookies() {
	let toSave = [];
	for (let i = 0; i < carObj.lines.length; i++) {
		let l = carObj.lines[i];
		toSave.push({
			id: l.id,
			amount: l.amount,
		});
	}
	ls.save("keyList",toSave);
    ls.save('savedKeys',savedKeys);
}

function makeTableMap(ccol = false,crow = false,lines = carObj.lines) { 
    remotes = [];
    let height = 12;
    let length = 32;
    currentCol = ccol;
    currentRow = crow;

    //Get And Clear Table
    let table = $('tableMap');
    table.innerHTML = '';

    resetStatPercentages();

    for (let i = height-1; i > -2; i--) {
        let row = table.insertRow(0);
        for (let j = length-1; j > -2; j--) {
            if (i == -1) {
                //Draw Alphabet row
                let cell = row.insertCell(0);
                cell.className = 'keyBoxNumber';
                if (j > -1) cell.innerHTML = abc[j];
                if (j+1 == 0) cell.innerHTML = '';
                continue;
            }

            if (j == -1) {
                //Draw Alphabet coloumn
                let cell = row.insertCell(0);
                cell.className = 'keyBoxLetter';
                cell.innerHTML = i+1;
                continue;
            }

            //Draw Boxes
            let cell = row.insertCell(0);
            cell.className = 'keyBox';
            
            cell.row = i+1;
            cell.col = abc[j];
            
            let box = getBoxFromId(cell.col + cell.row);

            //Update Stats
            stats.totalBoxes++;
            if (box) {
                if (box.amount < 1) stats.percentages[0].count++;
                for (let p = 0; p < stats.percentages.length; p++) {
                    let on = stats.percentages[p];
                    let it = boxToItemType(box);
                    if (on.type == 'itemType' && it.type == on.title) {
                        on.count++;
                    }
                    if (on.type == 'carCom' && box.car.toLowerCase() == on.title.toLowerCase()) {
                        on.count++;
                    }
                }
            } else {
                stats.percentages[1].count++;
            }
            
            
            //Finding Which Color
            let color;

            if (box) {
                color = findColor(box.car)
            } else {
                color = 'gray';
            }

            if (cell.row == crow && cell.col.toLowerCase() == ccol.toLowerCase())  {
                cell.className = 'keyBoxSelected';
                color = 'white';
            }

            //Check Search Filters
            let skipFilter = false;
            for (let p = 0; p < tableMapSearches.length; p++) {
                if (!tableMapSearches[p].select || !tableMapSearches[p].value) continue;
                if (!box) continue;
                let value = eval('box.' + tableMapSearches[p].select) + '';
                if (value.toLowerCase().includes(tableMapSearches[p].value.toLowerCase())) {
                    color = 'black';
                    skipFilter = true;

                }
            }

            let brightnessFilter = 1;
            if (box && !skipFilter) {
                brightnessFilter = box.amount > 0 ? 1 : .5;
            }
            cell.css({
                background: color,
                filter: "brightness(" + brightnessFilter + ")",
            })
            //End Color
            
            cell.style.border = '1px solid #333';
            if (j % 8 == 0) {
                cell.style.borderLeft = '3px solid black';
            }
            if (i % 6 == 0) {
                cell.style.borderTop = '3px solid black';
            }

            cell.id = cell.col.toLowerCase() + cell.row;
            cell.line = findLineFromCCR(cell.id);
            if (cell.line) {
                if (cell.line.itemType.toLowerCase() == 'remote') remotes.push(cell.line);
                cell.innerHTML = cell.line.itemType.charAt(0).toUpperCase();
                if (cell.innerHTML == 'K' || cell.innerHTML == 'P') cell.innerHTML = '';
            }
            
            

            cell.onclick = function() {
                clear();
                $(this.id).className = 'keyBoxSelected';
                $(this.id).style.background = 'white';
                $(this.id).style.filter = 'brightness(1)';

                currentCol = this.col;
                currentRow = this.row;
                
                if (getBoxFromId(this.id)) pullUp(getBoxFromId(this.id))
            }
        }
    }
    //Finish Stat Update:
    for (let i = 0; i < stats.percentages.length; i++) {
        let sp = stats.percentages[i];
        sp.value = sp.count / stats.totalBoxes;
    }
    //Update TableMapWidth
    tableMapWidth = $('bottomMap').offsetWidth;
}
document.addEventListener('keydown',function(e) {
    
    let col,row;
    if (!currentCol) {
        col = 'a';
        row = 1;
    }
    if (e.key == 'ArrowDown') {
        if (currentCol) {
            col = currentCol;
            row = currentRow + 1;
        }
        if (row > 12) row = 12;
        moveTableSpot(col,row);
    }
    if (e.key == 'ArrowUp') {
        if (currentCol) {
            col = currentCol;
            row = currentRow - 1;
        }
        if (row < 1) row = 1;
        moveTableSpot(col,row);
    }
    if (e.key == 'ArrowRight') {
        let colVal = abc.indexOf(currentCol.toUpperCase()) + 1;
        if (currentCol) {
            col = abc[colVal];
            row = currentRow;
        }
        if (colVal > 32) col = 'AG';
        moveTableSpot(col,row);
    }
    if (e.key == 'ArrowLeft') {
        let colVal = abc.indexOf(currentCol.toUpperCase()) - 1;
        if (currentCol) {
            col = abc[colVal];
            row = currentRow;
        }
        if (colVal < 1) col = 'A';
        moveTableSpot(col,row);
    }
})

function moveTableSpot(col,row) {
    
    if (getBoxFromId(col + row)) {
        currentBox = getBoxFromId(col + row)
        pullUp(currentBox)
    } else {
        let c = currentCol;
        let r = currentRow;
        clear();
        currentCol = c;
        currentRow = r;
    }
    makeTableMap(col,row)
}

function getItemFromBox(box) {
	let brow = box.row;
	let bcol = box.col;
	
	let foundLine = false;
	for (let i = 0; i < carObj.lines.length; i++) {
		let c = carObj.lines[i];
		if (c.row === brow && c.col === bcol) {
			foundLine = i;
		}
	}
	let foundMakes = [];
	for (let i = 0; i < carObj.makes.length; i++) {
		let c = carObj.makes[i];
		for (let j = 0; j < c.models.length; j++) {
			let m = c.models[j];
			for (let k = 0; k < m.years.length; k++) {
				let y = m.years[k];
				for (let p = 0; p < y.keys.length; p++) {
					let a = y.keys[p];
					if (a.row === brow && a.col === bcol) {
						foundMakes.push([i,j,k,p]);
					}
				}
			}
		}
	}
	return {
		line: foundLine,
		makes: foundMakes,
	}
}
function getBoxFromId(id) {
    let box = false;
    for (let i = 0; i < carObj.lines.length; i++) {
        let cl = carObj.lines[i];
        if ((cl.col + cl.row + '').toLowerCase() == id.toLowerCase()) box = i;
    }
    return carObj.lines[box];
}
function openInNewTab(url) {
    window.open(url, '_blank').focus();
  }


option = $('searchBy').create('option');
option.value = 'all';
option.innerHTML = 'ALL';
for (let i = 0; i < itemTypes.length; i++) {
    if (!itemTypes[i].canSearch) break;

    option = $('searchBy').create('option');
    option.value = itemTypes[i].searchType;
    option.innerHTML = itemTypes[i].searchType.toUpperCase() + 'S';
}

function pullUp(box,shell = false) {
    let selectedType = false;
	
	currentBox = box;
    if (box === undefined) {
        box = {itemType: 'empty'}
		currentBox = false;
    }
    $('pullUpStats').style.display = 'none';
    $('useChip').style.display = shell ? 'block' : 'none';
    if (shell) {
        for (let i = 0; i < box.shell.length; i++) {
            $('useChip').innerHTML = 'Using Chip: ' + shell;
        }
    }

    for (let i = 0; i < itemTypes.length; i++) {
        if (itemTypes[i].type == box.itemType) selectedType = itemTypes[i];
    }

    let useName = box.itemType.toUpperCase();
    if (selectedType.altName) useName = selectedType.altName.toUpperCase();

    $('pullUp').style.display = 'inline-block';

	$('.amountBtn')[0].style.display = selectedType.buttons ? 'block' : 'none';
	$('.amountBtn')[1].style.display = selectedType.buttons ? 'block' : 'none';
	$('.amountBtn2').style.display = selectedType.buttons ? 'block' : 'none';
    if (selectedType.goToCCR) {
		$('puGoToCCR').style.display = 'block';
		$('puGoToCCR').a = box.model;
        let r = '', c = '';
        for (let i = 0; i < box.model.length; i++) {
            if (isNaN(box.model.charAt(i))) r += box.model.charAt(i);
            else c += box.model.charAt(i);
        }
        $('puGoToCCR').r = r;
        $('puGoToCCR').c = c;
		$('puGoToCCR').onclick = function() {
			pullUp(getBoxFromId(this.a));
            makeTableMap(this.r,this.c);
		}
    } else $('puGoToCCR').style.display = 'none';

    $('identification').style.display = 'block';
    if (box === undefined) $('identification').innerHTML = 'Key Box Is Empty';
    else if (selectedType.location) $('identification').innerHTML = box.col.toUpperCase() + box.row;
    else $('identification').style.display = 'none';

	if (!selectedType.buttons) $('puType').style.display = 'none';
	else {
        $('puType').style.display = 'block';
        $('puType').style.color = selectedType.color ? selectedType.color : 'black';
        $('puType').innerHTML = 'Button Type: ' + box.type;
    }
	if (!selectedType.itemType) $('puItemType').style.display = 'none';
	else {
        $('puItemType').style.display = 'block';
        $('puItemType').style.color = selectedType.color ? selectedType.color : 'black';
        $('puItemType').innerHTML = 'Item Type: ' + useName;
    }

    if (!selectedType.fccID) $('puFCCID').style.display = 'none';
	else {
        $('puFCCID').style.display = 'block';
		$('puFCCID').innerHTML = 'FCC ID: ' + box.fccid;
    }
    if (!selectedType.model) $('puModel').style.display = 'none';
	else {
        $('puModel').style.display = 'block';
		$('puModel').innerHTML = 'Model: ' + box.model;
    }

    if (!selectedType.frequency) $('puFrequency').style.display = 'none';
	else {
        $('puFrequency').style.display = 'block';
		$('puFrequency').innerHTML = 'Frequency: ' + box.frequency;
    }

    if (!selectedType.TLUID) $('puTLUID').style.display = 'none';
	else {
        $('puTLUID').style.display = 'block';
		$('puTLUID').innerHTML = 'TLUID: ' + box.TLUID;
    }
    
    if (!selectedType.bladeType) $('puBladeType').style.display = 'none';
	else {
        $('puBladeType').style.display = 'block';
		$('puBladeType').innerHTML = 'Test Blade: ' + box.bladeType;
    }

    if (!selectedType.chip) $('puChip').style.display = 'none';
	else {
        $('puChip').style.display = 'block';
		let chip = '';
		if (box.chip) chip += box.chip;
		if (box.xhorse && !box.chip) chip += box.xhorse;
		if (box.chip && box.xhorse) chip += '/' + box.xhorse;
		if (!box.chip && !box.xhorse) chip = 'No Information Found';
		$('puChip').innerHTML = 'Chip: ' + chip;
    }


    if (!selectedType.battery) $('puBattery').style.display = 'none';
	else {
        $('puBattery').style.display = 'block';
		$('puBattery').innerHTML = 'Battery: ' + box.battery;
    }
    
    $('puLink').style.display = 'none';
    if (selectedType.link) {
		if (box.link) {
            $('puLink').style.display = 'block';
			$('puLink').onclick = function() {
                openInNewTab(box.link);
            }
			$('puLink').innerHTML = 'Buy This ' + useName + '!';
		}
    }

    if (box.saved) $('saveKey').innerHTML = 'Un-Save';
    else $('saveKey').innerHTML = 'Save';

    if (!selectedType.amount) $('puAmount').style.display = 'none';
	else {
        $('puAmount').style.display = 'block';
		$('puAmount').innerHTML = useName + 'S Left: ' + box.amount;
    }

    $('worksOnList').style.display = 'none';
    $('worksNotes').style.display = 'none';
    $('worksOn').style.lineHeight = '50px';
    $('rightSide').style.display = 'none';
    if (selectedType.worksOn) {
        $('rightSide').style.display = 'block';
        $('worksOnList').style.display = 'block';

        //Create Works On Car List
        if (selectedType.notes && box.notes) {
            $('worksNotes').style.display = 'block';
            $('worksOn').style.lineHeight = '25px';
            $('worksNotes').innerHTML = box.notes;
        }
        //Clear Current Car List
		let carList = $('worksOnList');
        carList.innerHTML = '';
        
        if (box.itemType === 'shell') {
            for (let i = 0; i < box.shell.length; i++) {
                for (let j = 0; j < box.shell[i].ymm.length; j++) {
                    if (shell && shell !== box.shell[i].chip) continue;
                    let b = box.shell[i].ymm[j];
                    let div = carList.create('div');
                    let notes = b.notes ? ' (' + b.notes + ')' : '';
                    div.innerHTML = '(CHIP: ' + box.shell[i].chip + ') ' + b.year1 + '-' + b.year2 + ' ' + b.make + ' ' + b.model + notes;
                }
            }

        } else {
            let carArr = false;
            if (box.worksOn) {
                carArr = box.worksOn;
            } else if (box.ymm) {
                carArr = box.ymm;
            }
            
            for (let i = 0; i < carArr.length; i++) {
                let b = carArr[i];
                let div = carList.create('div');
                let notes = b.notes ? ' (' + b.notes + ')' : '';
                div.innerHTML = b.year1 + '-' + b.year2 + ' ' + b.make + ' ' + b.model + notes;
            }
        }
		

    }

    if (!selectedType.extraOf) $('puExtraOf').style.display = 'none';
	else {
        $('puExtraOf').style.display = 'block';
        $('puExtraOf').innerHTML = 'Extra of: ' + box.model;
    }

    if (!selectedType.ourCost) $('puPrice').style.display = 'none';
	else {
        $('puPrice').style.display = 'block';
        $('puPrice').innerHTML = 'Our Cost: $' + box.price;
    }
    if (!selectedType.retail) $('puRetail').style.display = 'none';
	else {
        $('puRetail').style.display = 'block';
        $('puRetail').innerHTML = 'Retail Price: $' + box.retail;
    }

	$('keyIMG').style.display = 'none';
    if (selectedType.photo) {
        $('keyIMG').style.display = 'block';
        let imgSRC = box.imgLink;
        if (selectedType.goToCCR) imgSRC = findLineFromCCR(box.model).imgLink;
	    $('keyIMG').src = imgSRC;
    }

}

function changeStats(type) {
	if (type == 'price') {
		stats.price = 0;
		stats.keys = 0;
		for (let i = 0; i < carObj.lines.length; i++) {
			let c = carObj.lines[i];
			if (!isNaN(c.amount * c.price))
				stats.price += (c.amount * c.price);
			if (!isNaN(c.amount))
				stats.keys += c.amount;
		}
		
		$('statPrice').innerHTML = 'Total Value: $' + (Math.floor(stats.price*100)/100);
		$('statKeys').innerHTML = 'Total Keys: ' + stats.keys;
	}
	
}

function adjustAmt(amt,skip = false) {
	if (currentBox.amount + amt < 0) return;
	
	let obj = getItemFromBox(currentBox);
	if (amt === 0) carObj.lines[obj.line].amount = 0;
    else carObj.lines[obj.line].amount += amt;
    carObj.makes = updateMakes(carObj.lines);
    carMakes = carObj.makes;
	changeStats('price');
	
	if (selectedYear)
		triggerYearChange();
	saveCookies();
	pullUp(currentBox);
}

function findLineFromCCR(ccr) {
	let obj = {
		col: '',
		row: ''
	}
	for (let i = 0; i < ccr.length; i++) {
        if (!isNaN(Number(ccr.charAt(i)))) obj.row += Number(ccr.charAt(i))
        else obj.col += ccr.charAt(i).toLowerCase();
	}

	for (let i = 0; i < carObj.lines.length; i++) {
		let line = carObj.lines[i]
		if (line.row == obj.row && line.col == obj.col) return carObj.lines[i];
	}
}

$('remoteViewerButton').onclick = remoteViewerPopup;
$('remoteViewer').style.display = 'none';



function remoteViewerPopup() {
    if ($('remoteViewer').style.display == 'none') {
        $('remoteViewer').style.display = 'block';
        $('remoteBottom').style.display = 'block';
        $('remoteViewer').innerHTML = '';
        $('remoteViewerButton').innerHTML = 'Key Viewer';

        let x = 10;
        let length = (window.innerWidth-(x*6)) / x;
        let maxHeight = window.innerHeight - 25;
        let y = maxHeight % length;

        for (let i = 0; i < remotes.length; i++) {
            let remoteBox = $('remoteViewer').create('img');
            remoteBox.id = 'remoteHolder';
            remoteBox.width = length;
            remoteBox.height = length;
            remoteBox.box = remotes[i].col.toUpperCase() + remotes[i].row;
            remoteBox.onclick = function() {
                pullUp(getBoxFromId(this.box));
                makeTableMap(getBoxFromId(this.box).col,getBoxFromId(this.box).row);
                remoteViewerPopup();
            }
            remoteBox.css({
                cursor: 'pointer',
                margin: "0px",
                padding: '0px',
            })
            remoteBox.src = remotes[i].imgLink;
        }

    } else {
        $('remoteViewer').style.display = 'none';
        $('remoteViewerButton').innerHTML = 'Remote Viewer';
        $('remoteBottom').style.display = 'none';
    }
}

$('statButton').onclick = () => { openMenu('pullUpStats') };
$('bottomBar').onclick = () => { openMenu('pullUpOptions') };
function openMenu(menu) {
    let work = $(menu);
    let pass = false;
    if ($('remoteViewer').style.display == 'block') {
        pass = true;
    }

    $('remoteViewer').style.display = 'none';
    $('remoteViewerButton').innerHTML = 'Remote Viewer';
    $('remoteBottom').style.display = 'none';

    if (menu !== 'pullUpOptions') $('pullUpOptions').style.display = 'none';
    if (menu !== 'pullUpStats') $('pullUpStats').style.display = 'none';

    if (pass) {
        work.style.display = 'inline-block';
        return
    }

    if (work.style.display !== 'none' && work.style.display !== '') {
        work.style.display = 'none';
        return;
    }

    $('pullUp').style.display = 'none';
    work.style.display = 'inline-block';

    
}

function resetStatPercentages() {
    stats.percentages = [];
    stats.totalBoxes = 0;
    stats.percentages.push({
        type: 'extra',
        title: 'dead',
        count: 0,
        value: 0,
    })
    stats.percentages.push({
        type: 'extra',
        title: 'empty',
        count: 0,
        value: 0,
    })
    for (let i = 0; i < itemTypes.length; i++) {
        stats.percentages.push({
            type: 'itemType',
            title: itemTypes[i].type,
            count: 0,
            value: 0,
        })
    }
    for (let i = 0; i < carObj.carCom.length; i++) {
        if (carObj.carCom[i] === undefined) continue;

        stats.percentages.push({
            type: 'carCom',
            title: carObj.carCom[i],
            count: 0,
            value: 0,
        })
    }
}

function boxToItemType(box) {
    if (!box) return false;
    let st = false;
    for (let i = 0; i < itemTypes.length; i++) {
        if (itemTypes[i].type == box.itemType) st = itemTypes[i];
    }
    return st;
}


function saveKey(use,box = currentBox) {
    console.log(use)
    box.saved = true;
    if (inputMakes.value) box.savedName = inputMakes.value + ' ' + inputModels.value + ' ' + inputYears.value;
    else box.savedName = 'From Table Map';

    for (let i = 0; i < savedKeys.length; i++) {
        if (savedKeys[i].col == box.col && savedKeys[i].row == box.row) {
            savedKeys.splice(i,1)
            box.saved = false;
            drawBoxes();
            saveCookies();
            if (use) use.innerHTML = 'Save';
            return;
        }
    }

    savedKeys.push(box);
    if (use) use.innerHTML = 'Un-Save';

    drawBoxes();
    saveCookies();
}

$('mapButton').onmouseover = function() {
    resize();
}
$('mapButton').onmouseleave = function() {
    resize();
}