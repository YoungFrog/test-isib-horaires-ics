import fs from 'fs';
import path from 'path';
import ics from 'ics';


if (process.argv.length !== 4)
    throw new Error("Give path to ical root then path to file events.json, e.g. ./ical/2021-2022/q2 config/events.json")

const icalRoot = path.resolve(process.argv[2])
const eventsJsonFile = path.resolve(process.argv[3])



/* will contains list of maps with:
  - key : profs/groupes/salles
  - value: a list of events they attend.
*/
const calendars = {}

// maps containing the profs/groupes/salles as key, and the list of their classes as value
calendars.profs = {} 
calendars.groupes = {}
calendars.salles = {}
var profs = calendars.profs
var groupes = calendars.groupes
var salles = calendars.salles

fs.readFile(eventsJsonFile, 'utf-8', (err, data) => {
  if (err) throw err
  
  //parse the json file
  const events = JSON.parse(data)

  /*
   for each event, we extract the teachers/groupes/salles
   and for each of them we add the event as an ics value. 
  */
   events.forEach(event => {
    var icsEvent = getIcsEvent(event)
    addEvent(event.profacros || event.profs, profs, icsEvent)
    addEvent(event.groupes, groupes, icsEvent)
    addEvent(event.lieux, salles, icsEvent)
  })
  
// pourquoi je ne peux pas sortir ceci du reaadFile callback ??
console.log("generating all agendas")

generateIcss("profs", profs)
generateIcss("groupes", groupes)
generateIcss("salles", salles)

})

/**
 * Generates ics files bases on the list.
 * The list contains keys and a list of events as value.
 * The key will be the file name
 * The values will be transformed in vcalendar.
 * @param {*} list 
 */
function  generateIcss(dir, list) {
  for (const key in list) {
    ics.createEvents(list[key], (error, value) => {
      if (error) {
        console.log(error)
        return
      }
      fs.writeFile(`${icalRoot}/${dir}/${key}.ics`, value, (err) => {
        if (err) throw err;
        console.log(`${icalRoot}/${dir}/${key}.ics generated`);
      });
    })
  }
}

/**
 * The listIn contains the elements (groupes/profs/salles)
 * that participate in an event.
 * The icsEvent will be added as value to the element (the key) in the map  
 * @param {*} listIn 
 * @param {*} map 
 * @param {*} icsEvent 
 */
function addEvent(listIn, map, icsEvent) {
  if(listIn) {

    listIn.forEach(element => {
          if(!map[element]) map[element]=[]
          map[element].push(icsEvent);
      })
  }

}

/**
 * returns an event object as expected by the ics library.
 * @param {*} event 
 * @returns 
 */
function getIcsEvent(event) {
  return {
    start: getDateAsArray(new Date(event.start)),
    end:  getDateAsArray(new Date(event.end)),
    title: event.title,
    description: event.title,
    location: event.location,
    uid: event.id
  }
}

/**
 * returns an array representing a datetime 
 * as expected by the ics library.
 * @param {*} date 
 * @returns 
 */
function getDateAsArray(date) {
  return [date.getFullYear(), date.getMonth()+1, date.getDate(), date.getHours(), date.getMinutes()]
}


