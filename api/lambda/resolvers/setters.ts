import { find, putDb, respond } from '../helpers/utility'
import { GeneralObject } from '../types/GeneralObject'

export const saveAirportAsFavorite = async (iata: string, at: string, source: string) => {
  // Save valid IATA code as a favorite, ignore invalid IATA
  let doc: GeneralObject = {}
  let item: string = ''
  let airport: GeneralObject | undefined = find(iata)

  if (airport) {
    doc.at = at
    doc.iata = iata
    doc.name = airport.name
    doc.source = source
    item = await putDb(doc)
  }

  const response = {
    type: 'favorite',
    count: item ? 1 : 0,
    item: item ? item : null,
  }

  // DOCS: 200 is returned to say only this operation completed. Actually saving a
  // favorite is indicated to the caller by a non-zero @count and non-null @item.
  return respond(200, response)
}
