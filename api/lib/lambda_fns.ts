import { Duration } from '@aws-cdk/core'
import * as lambda from '@aws-cdk/aws-lambda'
import { axios, lodash, nanoId, pathParser } from './lambda_layers'

const API_KEY = ''
const NUMBER_OF_TRIES = '3'
const TABLE_NAME = 'favorite_airports'
const URL_EVIL_INSULT = 'https://evilinsult.com/generate_insult.php?lang=en&type=json'
const URL_SUNRISE_SUNSET = `https://api.sunrise-sunset.org/json`
const URL_WEATHER = `http://api.weatherstack.com/current?access_key=d5106d52b1de5e412e6848e5beec37bd`

export const axiosLayer = (stack: any) => {
  return axios(stack)
}

export const lodashLayer = (stack: any) => {
  return lodash(stack)
}

export const nanoIdLayer = (stack: any) => {
  return nanoId(stack)
}

export const pathParserLayer = (stack: any) => {
  return pathParser(stack)
}

// Define Lambda function that serves as API handler
export const fn_airportsApiHandler = (stack: any, layers: any[]) => {
  // Set role here as needed

  return new lambda.Function(stack, 'AirportsApiHandler', {
    runtime: lambda.Runtime.NODEJS_12_X,
    code: lambda.Code.fromAsset('lambda'),
    environment: {
      API_KEY,
      NUMBER_OF_TRIES,
      TABLE_NAME,
      URL_EVIL_INSULT,
      URL_SUNRISE_SUNSET,
      URL_WEATHER,
    },
    handler: 'airports.handler',
    layers: layers,
    timeout: Duration.minutes(5),
  })
}
