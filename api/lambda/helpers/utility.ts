import * as _ from 'lodash'
import axios, { AxiosRequestConfig } from 'axios'
import { nanoid } from 'nanoid'
import { DynamoDB } from 'aws-sdk'
import { EventProps } from '../types/EventProps'
import { Filter } from '../types/Filter'
import { GeneralObject } from '../types/GeneralObject'
// Primary data is local...
import { airports } from '../data/data_airports'

const db = new DynamoDB.DocumentClient()
const TABLE_NAME = process.env.TABLE_NAME ?? ''

export const extract = (event: GeneralObject): EventProps => {
  return {
    at: event.requestContext.requestTime,
    filter: event.queryStringParameters,
    headers: event.headers,
    method: event.httpMethod,
    path: event.path,
    source: event.requestContext.identity.sourceIp,
  }
}

export const find = (iata: string) => {
  return _.find(airports, ['iata', iata])
}

export const formatSunriseSunset = (data: GeneralObject) => {
  if (data.status === 'OK' && data.results) {
    return {
      sunrise_UTC: data.results.sunrise,
      sunset_UTC: data.results.sunset,
      lengthOfDay: data.results.day_length,
    }
  }
  return null
}

export const formatTravellersAdvice = (data: GeneralObject) => {
  if (data && data.insult) {
    return data.insult
  }
  return null
}

export const formatWeather = (data: GeneralObject) => {
  if (data && data.current) {
    return {
      asOf_UTC: data.current.observation_time,
      conditions: data.current.weather_descriptions,
      humidity: data.current.humidity,
      temperature: data.current.temperature,
      visability: data.current.visibility,
      windDirection: data.current.wind_direction,
      windSpeed: data.current.wind_speed,
    }
  }
  return null
}

export const get = async (uri: string, timeout: number = 1000) => {
  // Generalized simple XHR GET; Axios default timeout is 'none' which
  // seems too lax, so we set it to one second.
  const options: AxiosRequestConfig = {
    url: uri,
    method: 'GET',
    timeout: timeout,
  }

  try {
    const response = await axios(options)
    return response.data
  } catch (error) {
    console.log('ERROR', error)
    return null
  }
}

export const putDb = async (data: GeneralObject) => {
  // Generic dynamodb item writer
  const item = _.assign({ id: nanoid() }, data)

  const params = {
    TableName: process.env.TABLE_NAME || '',
    Item: item,
  }

  try {
    await db.put(params).promise()
    return data.iata
  } catch (error) {
    console.log('ERROR: Put Db', error)
    return null
  }
}

export const scanDb = async () => {
  // Generalized dynamodb scan fn
  const params = {
    TableName: TABLE_NAME,
  }

  try {
    const results = await db.scan(params).promise()
    return results.Items
  } catch (error) {
    console.log('ERROR: Scan Db', error)
    return null
  }
}

export const search = (filter: Filter) => {
  const selector = (item: any) => {
    const data = `${item.iata}${item.name}`
    const search = filter.search || ''
    return data.includes(search)
  }

  if (filter) {
    return _.filter(airports, selector)
  }

  return airports
}

export const respond = (status: number, message: any) => {
  // Lambda response maker
  const body = {
    response: message,
  }
  const response = {
    statusCode: status,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  }
  return response
}

export const taskErrorResponse = (message: string, task: string) => {
  // Operation response, error case
  return {
    code: 500,
    message: message,
    task: task,
  }
}

export const unauthorizedResponse = () => {
  // Validation response, invalid case
  return {
    code: 401,
    invalid: true,
    message: 'Unauthorized',
  }
}

export const validationErrorResponse = (message: string) => {
  // Validation response, invalid case
  return {
    code: 400,
    invalid: true,
    message: message,
  }
}

export const validationSuccessResponse = () => {
  // Validation response, success case
  return {
    code: 200,
    invalid: false,
    message: 'OK',
  }
}
