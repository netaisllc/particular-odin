import * as _ from 'lodash'
import { EventProps } from '../types/EventProps'
import { Filter } from '../types/Filter'
import { GeneralObject } from '../types/GeneralObject'
import { Path } from 'path-parser'
import { validationErrorResponse, validationSuccessResponse, respond, unauthorizedResponse } from './utility'
import { getAirport } from '../resolvers/getters'
import { listAirports, listFavorites } from '../resolvers/lists'
import { saveAirportAsFavorite } from '../resolvers/setters'

// Routes
const airport = new Path('/airport/:iata')
const airports = new Path('/airports')
const favorite = new Path('/favorite/:iata')
const favorites = new Path('/favorites')

const isAllowedMethod = (method: string, path: string) => {
  // Validate method and method+path combination
  const notAllowed = ['DELETE', 'PATCH', 'PUT']

  if (_.includes(notAllowed, method)) return false

  if (airport.test(path) && method !== 'GET') return false

  if (airports.test(path) && method !== 'GET') return false

  if (favorites.test(path) && method !== 'GET') return false

  if (favorite.test(path) && method !== 'GET' && method !== 'POST') return false

  return true
}

const isValidApiKey = (headers: GeneralObject) => {
  if (headers.apikey && headers.apikey === process.env.API_KEY) {
    return true
  }
  return false
}

const isValidFilter = (path: string, filter: Filter) => {
  // Validate the querystring object shape; Filter is only checked
  // for the Airports resourceLimits, otherwsie it is ignored.

  if (airports.test(path)) {
    // Only @search is recognized as a filter property
    if (filter && !filter.search) {
      return false
    }
    return true
  }

  return true
}

const isValidRoute = (path: string) => {
  // Validate primary path
  if (airport.test(path) || airports.partialTest(path) || favorite.test(path) || favorites.partialTest(path)) {
    return true
  }
  return false
}

export const dispatch = (props: EventProps) => {
  // List all airports
  if (airports.test(props.path)) return listAirports(props.filter)

  // List all favorites
  if (favorites.test(props.path)) return listFavorites()

  if (airport.test(props.path)) {
    // GET an airport
    const part = airport.test(props.path) || {}
    return getAirport(part.iata)
  }

  if (favorite.test(props.path) && props.method === 'GET') {
    // GET on a favorite is treated like a GET on an airport
    const part = favorite.test(props.path) || {}
    return getAirport(part.iata)
  }

  if (favorite.test(props.path) && props.method === 'POST') {
    // Save a new favorite
    const part = favorite.test(props.path) || {}
    return saveAirportAsFavorite(part.iata, props.at, props.source)
  }

  return respond(200, `(Default) Unhandled ${props.method} on ${props.path}`)
}

export const validate = (props: EventProps) => {
  if (!isValidApiKey(props.headers)) {
    return unauthorizedResponse()
  }

  if (!isValidRoute(props.path)) {
    return validationErrorResponse(`Invalid path ${props.path}`)
  }

  if (!isAllowedMethod(props.method, props.path)) {
    return validationErrorResponse(`Invalid method ${props.method} on path ${props.path}`)
  }

  if (!isValidFilter(props.path, props.filter)) {
    return validationErrorResponse(`Invalid query parameter ${JSON.stringify(props.filter)} for path ${props.path}`)
  }

  return validationSuccessResponse()
}
