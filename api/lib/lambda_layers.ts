import * as lambda from '@aws-cdk/aws-lambda'

// Define Axios library as a Lambda layer
export const axios = (stack: any) => {
  return new lambda.LayerVersion(stack, 'AxiosLayer', {
    code: lambda.Code.fromAsset('layers/axios'),
    compatibleRuntimes: [lambda.Runtime.NODEJS_12_X],
    description: 'General purpose, promise-based HTTP(s) library for JavaScript',
  })
}

// Define Lodash library as a Lambda layer
export const lodash = (stack: any) => {
  return new lambda.LayerVersion(stack, 'LodashLayer', {
    code: lambda.Code.fromAsset('layers/lodash'),
    compatibleRuntimes: [lambda.Runtime.NODEJS_12_X],
    description: 'General purpose, functional utility library for JavaScript',
  })
}

// Define NanoId library as a Lambda layer
export const nanoId = (stack: any) => {
  return new lambda.LayerVersion(stack, 'NanoIdLayer', {
    code: lambda.Code.fromAsset('layers/nanoid'),
    compatibleRuntimes: [lambda.Runtime.NODEJS_12_X],
    description: 'Better UUID utility library for JavaScript',
  })
}

// Define PathParser library as a Lambda layer
export const pathParser = (stack: any) => {
  return new lambda.LayerVersion(stack, 'PathParserLayer', {
    code: lambda.Code.fromAsset('layers/path-parser'),
    compatibleRuntimes: [lambda.Runtime.NODEJS_12_X],
    description: 'Path management utility library for JavaScript',
  })
}
