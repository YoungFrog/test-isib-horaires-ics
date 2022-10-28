'use strict';

/** Lit le fichier ../build/events.json
 * et compte le nombre de séance
 * de l'UE donnée
 * pour chaque groupe
 * jusqu'au nombre de séances donné, et indique la date à laquelle on atteint ladite séance
 * Exemple: node ue-nb-seances.mjs -u javl 12

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


const nbSeanceVoulu = opt.argv[0];
const events = JSON.parse(fs.readFileSync(path.resolve("../build/events.json")))




function getNbSeanceParGroupe(groupes, nbSeanceVoulu) {
    let nbSeances = {}

    for (let gpe of groupes) {
        nbSeances[gpe] = 0;
    }

    let dateSeance = {}

    for (let event of events.sort((e1, e2) => (new Date(e1.start) - new Date(e2.start)))) {
	/**
	 * @type {string}
	 */
	let aa = event.aa;
	let groupe = event.groupes // étrangeté de getEvents ; ceci devrait être un tableau !

	if (aaregexp && !aa.match(new RegExp(aaregexp, 'i'))) continue

        nbSeances[groupe]+= aa.match(/\+/) ? 0.5 : 1;

        if (! dateSeance[groupe] && nbSeances[groupe] >= nbSeanceVoulu) {
            dateSeance[groupe] = event.start;
        }
	
    }

    return dateSeance
}

let result = getNbSeanceParGroupe(groupes, nbSeanceVoulu)

if (process.stdout.isTTY) {
    console.log(result)
} else {
    process.stdout.write(JSON.stringify(result))
}
