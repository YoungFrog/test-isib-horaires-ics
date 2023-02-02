#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

if (process.argv.length !== 4)
    throw new Error("Give path to ical root then path to file personnel.json, e.g. ./ical/2021-2022/q2 config/personnel.json")

const personnel = require(path.resolve(process.argv[3]))

const icalDir = path.resolve(process.argv[2])

function getBaseNameWithoutExtension (fn) {
  return path.basename(fn, '.ics')
}

const rules = {
  cours: {
    name: 'Cours',
    extractKey: getBaseNameWithoutExtension,
    extractName: getBaseNameWithoutExtension
  },
  groupes: {
    name: 'Groupes',
    extractKey: getBaseNameWithoutExtension,
    extractName: getBaseNameWithoutExtension
  },
  profs: {
    name: 'Profs',
    extractKey (fn) {
      const basename = getBaseNameWithoutExtension(fn)
      return basename.split('_')[0]
    },
    extractName (fn) {
      const basename = getBaseNameWithoutExtension(fn)
      if ('HORAIRES_SANS_ACRONYMES' in process.env) return basename
      const acr = basename.split('_')[0]
      const nom = personnel.find((elm) => elm.acronyme === acr)?.nom
      if (!nom) throw new Error(`Acronyme non trouvé: ${acr} (file ${fn})`)
      return `${acr} - ${nom}`
    }
  },
  salles: {
    name: 'Salles',
    extractKey: getBaseNameWithoutExtension,
    extractName: getBaseNameWithoutExtension
  }
}

function record (bucket, key, valueObject) {
  bucket[key] = valueObject
}

const config = {
  default: 'groupes',
  root: path
      .relative(path.resolve('.'), icalDir)
      .replace(/\/?$/, '/'), // ensure trailing slash
  data: {}
}

for (const dir of fs.readdirSync(icalDir)) {
  const items = {}

  for (const file of fs.readdirSync(path.resolve(icalDir, dir))) {
    const key = rules[dir].extractKey(file)
    const name = rules[dir].extractName(file)
    const calendar = path.relative(config.root, path.resolve(icalDir, dir, file))

    record(items, key, {
      name,
      calendar
    })
  }

  record(config.data, dir, {
    name: rules[dir].name,
    items
  })
}

console.log(JSON.stringify(config))
