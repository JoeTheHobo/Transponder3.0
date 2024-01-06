let stats = {
	price: 0,
    retail: 0,
	keys: 0,
    cars: 0,
    percentages: [],
}
let errorLog = [];
function decodeSheet() {
    //Settings for sheet
    let setCols = 20;
    //End

    let msheet = sheet.split(`	`);
    let nsheet = [];
    //Create nsheet ()
    for (let j = 0; j < msheet.length; j++) {
        //If at end of line on google sheets
        if (j % (setCols-1) == 0 && j !== 0) {
            //Split end of sheet
            let div = msheet[j].replace(/\n/g,`	`).split(`	`);
            nsheet.push(div[0])
            nsheet.push(div[1])
        } else {
            nsheet.push(msheet[j]);
        }
    }

    let tags = [];
    let carCom = [];
    let highestID = 0;
    let lines = [];
    for (let j = 0; j < nsheet.length/setCols; j++) {
        let m = (j*setCols);

        if (j === 0) {
            for (let i = 0; i < setCols; i++) {
                tags.push(nsheet[m+i]);
            }
            continue;
        }

        let ymm = nsheet[m+3] ? nsheet[m+3].replace(/\n/g,`	`).replace('"','').split(`	`) : nsheet[m+3];
        ymms = [];
        if (ymm) {
            for (let k = 0; k < ymm.length; k++) {
                let ymmObj = {
                    year1: '',
                    year2: '',
                    make: '',
                    model: '',
                    notes: '',
                    chip: nsheet[m+9],
                }
                let mode = 1; //1 == year, 2 = make, 3 = model
                for (let p = 0; p < ymm[k].length; p++) {
                    if ((ymm[k].charAt(p) == ' ' && mode !== 4) || (ymm[k].charAt(p) == '-' && mode == 1)) {
                        if (ymm[k].charAt(p) == ' ' && mode == 1) {
                            mode++;
                            ymmObj.year2 = ymmObj.year1;
                        }
                        mode++;

                        if (mode == 5) mode = 4;
                    } else {
                        if (mode == 1) ymmObj.year1 += ymm[k].charAt(p);
                        if (mode == 2) ymmObj.year2 += ymm[k].charAt(p);
                        if (mode == 3) ymmObj.make += ymm[k].charAt(p);
                        if (mode == 4) {
                            if (ymm[k].charAt(p) !== '"')
                                ymmObj.model += ymm[k].charAt(p);
                        }
                    }
                }
                //Fix Years
                ymmObj.year1 = Number(ymmObj.year1);
                ymmObj.year2 = Number(ymmObj.year2);
                ymmObj.make = ymmObj.make.toLowerCase();
                ymmObj.model = ymmObj.model.toLowerCase();
                if (ymmObj.model.charAt(0) == ' ') ymmObj.model = ymmObj.model.substring(1,ymmObj.model.length);
                if (ymmObj.model.charAt(ymmObj.model.length-1) == ' ') ymmObj.model = ymmObj.model.substring(0,ymmObj.model.length-1);
                //Seperate Notes from Model if needed
                let startNotes = false;
                let newModel = '';
                for (let p = 0; p < ymmObj.model.length; p++ ) {
                    if (ymmObj.model.charAt(p) == '(') {
                        startNotes = true;
                        if (newModel.charAt(newModel.length -1) == " ") {
                            newModel = newModel.substring(0,newModel.length - 1);
                        }
                        continue;
                    }
                    if (ymmObj.model.charAt(p) == ')') {
                        startNotes = false;
                        break;
                    }
                    if (startNotes) ymmObj.notes += ymmObj.model.charAt(p);
                    else newModel += ymmObj.model.charAt(p);

                }
                if (newModel.charAt(newModel.length -1) == " ") {
                    newModel = newModel.substring(0,newModel.length - 1);
                }
                ymmObj.model = newModel;

                ymms.push(ymmObj);
				if (ymmObj.model == '') {
					errorLog.push({
						type: 'model',
						location: m,
						car: nsheet[m],
						col: nsheet[m+1],
						row: nsheet[m+2],
					});
				}
				if (ymmObj.make == '') {
					errorLog.push({
						type: 'make',
						location: j,
						car: nsheet[m],
						col: nsheet[m+1],
						row: nsheet[m+2],
					});
				}
            }
        }

        //Find Resale Value
        let cost = Number(nsheet[m+12])*2;
        let retail = cost;
        if (cost < 45) retail = 45;
        else if (cost < 95) retail = 95;
        else retail = Math.ceil(cost/10)*10;

        if (nsheet[m+18] == 'key' && !nsheet[m+6].toLowerCase().includes('pt')) {
            if (retail < 95) retail = 95;
        }

        if (!isNaN(retail)) stats.retail += retail;
        
        if (Number(nsheet[m+16]) > highestID) highestID = Number(nsheet[m+16]);
        if (!carCom.includes(nsheet[m]) && nsheet[m] !== undefined) carCom.push(nsheet[m]);

        let obj = {
            car: nsheet[m],
            col: nsheet[m+1],
            row: Number(nsheet[m+2]),
            ymm: ymms,
            fccid: nsheet[m+4],
            model: nsheet[m+5],
            type: nsheet[m+6],
            amount: Number(nsheet[m+7]),
            frequency: nsheet[m+8],
            chip: nsheet[m+9],
            battery: nsheet[m+10],
            link: nsheet[m+11],
            price: Number(nsheet[m+12]),
            notes: nsheet[m+13],
            imgLink: nsheet[m+14],
            xhorse: nsheet[m+15],
            id: nsheet[m+16],
            itemType: nsheet[m+17],
            bladeType: nsheet[m+18],
            TLUID: nsheet[m+19],
            retail: retail,
        }
        lines.push(obj);
    }

    
	
	if (errorLog.length > 0) {
		console.log('Errors were found:');
		console.log(errorLog)
	}

	//Add Stats
	$('statPrice').innerHTML = 'Total Value: $' + (Math.floor(stats.price*100)/100);
	$('statRetail').innerHTML = 'Total Retail: $' + (Math.floor(stats.retail*100)/100);
	$('statKeys').innerHTML = 'Total Keys: ' + stats.keys;
	$('statCars').innerHTML = 'Total Cars: ' + stats.cars;
	
	//Check Cookies
	let cookieList = ls.get('keyList',[]);
	for (let i = 0; i < lines.length; i++) {
		for (let j = 0; j < cookieList.length; j++) {
			let l = lines[i];
			let c = cookieList[j];
			if (l.id === c.id) {
				l.amount = c.amount;
			}
		}
    }
    
    //Fix Shells
    for (let i = 0; i < lines.length; i++) {
        if (!lines[i].itemType) continue;
        if (lines[i].itemType.toLowerCase() !== 'shell') continue;

        lines[i].ymm = [];
        lines[i].shell = [];
        for (let j = 0; j < lines.length; j++) {
            if (j === i) continue;
            if (lines[j].TLUID !== lines[i].TLUID) continue;

            lines[i].shell.push({
                chip: lines[j].xhorse,
                ymm: lines[j].ymm,
            })
            lines[i].ymm = lines[i].ymm.concat(lines[j].ymm)

        }
    }
	
    let makes = updateMakes(lines);

    return {
        makes: makes,
        lines: lines,
        tags: tags,
        highestID: highestID,
        carCom: carCom,
    }
}

function updateMakes(lines) {
    let makes = [];
    for (let i = 0; i < lines.length; i++) {
        //Stats
        let value = (lines[i].amount * lines[i].price);
        if (!isNaN(value)) {
            stats.price += value;
        }
        if (!isNaN(lines[i].amount)) {
            stats.keys += lines[i].amount;
        }
        //Carry On
        for (let j = 0; j < lines[i].ymm.length; j++) {
            let mmake = lines[i].ymm[j].make;
            let mmodel = lines[i].ymm[j].model;
            let mnotes = lines[i].ymm[j].notes;
            let mchip = lines[i].ymm[j].chip;
            for (let k = 0; k < (lines[i].ymm[j].year2-lines[i].ymm[j].year1)+1; k++) {
                let l = lines[i];
                
                let found = false;
                for (let p = 0; p < makes.length; p++) {
                    if (makes[p].name == mmake) found = p;
                }
                if (found === false) {
                    makes.push({
                        name: mmake,
                        models: [],
                    });
                    found = makes.length - 1;
                }

                let found2 = false;
                for (let p = 0; p < makes[found].models.length; p++) {
                    if (makes[found].models[p].name == mmodel) found2 = p;
                }
                if (found2 === false) {

                    makes[found].models.push({
                        name: mmodel,
                        years: [],
                    })
                    found2 = makes[found].models.length - 1;
                }

                let found3 = false;
                for (let p = 0; p < makes[found].models[found2].years.length; p++) {
                    if (makes[found].models[found2].years[p].year == lines[i].ymm[j].year1+k) found3 = p;
                }
                if (found3 === false) {
                    
                    stats.cars += 1;
                    
                    makes[found].models[found2].years.push({
                        year: lines[i].ymm[j].year1+k,
                        make: mmake,
                        model: mmodel,
                        chip: mchip,
                        keys: [],
                    })
                    found3 = makes[found].models[found2].years.length - 1;
                }
                
                makes[found].models[found2].years[found3].keys.push({
                    keyNotes: mnotes,
                    col: l.col,
                    row: l.row,
                    car: l.car,
                    fccid: l.fccid,
                    keymodel: l.model,
                    type: l.type,
                    amount: l.amount,
                    frequency: l.frequency,
                    chip: mchip,
                    battery: l.battery,
                    link: l.link,
                    worksOn: lines[i].ymm,
                    price: l.price,
                    notes: l.notes,
                    imgLink: l.imgLink,
                    xhorse: l.xhorse,
                    id: l.id,
                    itemType: l.itemType,
                    bladeType: l.bladeType,
                    retail: l.retail,
                    TLUID: l.TLUID,
                })
            }
        }


    }

    return makes;
}