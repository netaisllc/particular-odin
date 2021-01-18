import * as _ from 'lodash'
import { GeneralObject } from '../types/GeneralObject'
import { find, formatSunriseSunset, formatTravellersAdvice, formatWeather, get, respond } from '../helpers/utility'

const decorations = (airport: GeneralObject) => {
  // Decorate airport with 3rd party data
  // There are several ways to handle this use case, this being one of the simplest.
  // See README for more remarks.
  return Promise.all([getWeather(airport.Place.Geometry.Point), getSunrise(airport.Place.Geometry.Point), getInsult()])
    .then((results) => {
      airport.currentWeather = formatWeather(results[0])
      airport.daylight = formatSunriseSunset(results[1])
      airport.evilInsult = formatTravellersAdvice(results[2])
      return airport
    })
    .catch((err) => {
      console.log('ERROR', err)
      return airport
    })
}

const getInsult = async () => {
  // This service is slow, so we give it an individual timeout value that will
  // over-ride the api default.
  const TIMEOUT_MS = 2000
  const uri = `${process.env.URL_EVIL_INSULT}`
  return await get(uri, TIMEOUT_MS)
}

const getSunrise = async (geo: number[]) => {
  const uri = `${process.env.URL_SUNRISE_SUNSET}?lat=${geo[1]}&lng=${geo[0]}}`
  return await get(uri)
}

const getWeather = async (geo: number[]) => {
  const uri = `${process.env.URL_WEATHER}&query=${geo[1]},${geo[0]}&units=f`
  return await get(uri)
}

export const getAirport = async (iata: string) => {
  // Return an airport by its IATA code
  let airport: GeneralObject | undefined = find(iata)

  if (airport) {
    // Decorate the airport object with 3rd party data
    airport = await decorations(airport)
  }

  const response = {
    type: 'airport',
    count: airport ? 1 : 0,
    item: airport ? airport : null,
  }

  return respond(200, response)
}
