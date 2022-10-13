'use strict';

/** Lit le fichier ../build/events.json
 * et compte le nombre de séance
 * de l'UE donnée
 * pour chaque groupe
 * jusqu'à la date du jour (ou celle donnée en param)
 * Exemple: node ue-nb-seances.mjs -u javl 2022-10-14

 * Exception notable: si le nom de l'AA d'un évt comprend un signe +, ça compte comme une demi-séance
 * pour tenir compte de l'AA javl+env en dev1 (quelle horreur)
 */

import fs from 'fs';
import path from 'path';
import getopt from 'node-getopt';

let groupes = ["A111", "A112", "A121", "A122", "A131", "A132", "A211", "A212", "A221", "A222", "A231", "A232", "A311", "A312", "A321", "A322", "A331", "A332"]

let opt = getopt.create([
    ['u', 'ue=ARG', 'Regexp comparée au nom de l\'AA']
]).bindHelp().parseSystem();

if (opt.argv.length > 1) {
    opt.showHelp()
    throw Error('must give maximum one ARG : the date');
}

const { ue: aaregexp } = opt.options;


const date = getDate(opt.argv);
const events = JSON.parse(fs.readFileSync(path.resolve("../build/events.json")))



/**
  * retourne la date donnée en paramètre
  */
function getDate(argv) {
    if (argv.length < 3) {
	return new Date();
    }
    let arg = argv[2];

    if (! arg.match(/^[0-9]{4}-[0-9]{1,2}-[0-9]{1,2}/))
	throw new Error('Date should be in format: yyyy-mm-dd');

    return new Date(arg);
}


function getNbSeanceParGroupe(groupes, date) {
    let dict = {}

    for (let event of events) {
	/**
	 * @type {string}
	 */
	let aa = event.aa;
	let groupe = event.groupes // étrangeté de getEvents ; ceci devrait être un tableau !

	if (aaregexp && !aa.match(new RegExp(aaregexp, 'i'))) continue

	if (! dict[groupe]) dict[groupe] = 0;

	let startDay = new Date(event.start)
	startDay.setHours(0,0,0,0);
	if (startDay <= date){
	    if (aa.match(/\+/)) {
	    	dict[groupe]+=0.5;
	    } else {
		dict[groupe]++;
	    }
	}
	
    }

    return dict
}

let result = getNbSeanceParGroupe(groupes, date)

if (process.stdout.isTTY) {
    console.log(result)
} else {
    process.stdout.write(JSON.stringify(result))
}
