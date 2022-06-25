// interface EventAttributes {
//   aa?: string,
//   groupes?: string[],
//   profs?: string[],
//   profacro?: string[],
//   lieux?: string[],
//   type?: string
// }

const parseDesc = (description) => {
  const obj = {}
  // chaque ligne de /description/ est de la forme: "truc : valeur"

  if (!description) return obj

  for (const item of description.split('\n')) {
    let [key, value] = item.split(' : ')
    if (!value) continue

    switch (key) {
      case 'Matière':
        obj.aa = value
        break
      case 'TD':
        obj.groupes = value.split(', ')
        break
      case 'Enseignant':
      case 'Enseignants':
        key = 'profs'
        obj.profs = value.split(', ')
        if (obj.profs.every(prof => prof.match(/^[A-Z][A-Z][A-Z]\b/))) {
          obj.profacros = obj.profs.map(prof => prof.slice(0, 3))
        }
        break
      case 'Salle':
      case 'Salles':
        obj.lieux = value.split(', ')
        break
      case 'Type':
        obj.type = value
        break
      default:
    }
  }
  return obj
}

export { parseDesc }
export default parseDesc
