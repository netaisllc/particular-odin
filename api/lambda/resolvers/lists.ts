import * as _ from 'lodash'
import { respond, scanDb, search } from '../helpers/utility'
import { Filter } from '../types/Filter'

export const listAirports = (filter: Filter) => {
  const airports = search(filter)

  const response = {
    type: 'airports',
    count: airports.length,
    items: airports,
  }

  return respond(200, response)
}

export const listFavorites = async () => {
  const items = await scanDb()

  const response = {
    type: 'favorites',
    count: items ? items.length : 0,
    items: items ? items : [],
  }

  return respond(200, response)
}
