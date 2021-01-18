import * as cdk from '@aws-cdk/core'
import * as apigw from '@aws-cdk/aws-apigateway'
import dynamodb = require('@aws-cdk/aws-dynamodb')
import { axiosLayer, lodashLayer, nanoIdLayer, pathParserLayer, fn_airportsApiHandler } from './lambda_fns'

// This stack is the REST API for 'Airports'
export class ApiStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props)

    // Declare datastore
    const dynamoTable = new dynamodb.Table(this, 'favorite_airports', {
      partitionKey: {
        name: 'id',
        type: dynamodb.AttributeType.STRING,
      },
      tableName: 'favorite_airports',
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    })

    // Set up to allow binding of lambda utility layers to Lambda functions in this stack
    const axios = axiosLayer(this)
    const lodash = lodashLayer(this)
    const nanoId = nanoIdLayer(this)
    const pathParser = pathParserLayer(this)
    const layers = [axios, lodash, nanoId, pathParser]

    // Declare lambda functions and bind layers
    const airportsApiHandler = fn_airportsApiHandler(this, layers)

    // Allow RW
    dynamoTable.grantReadWriteData(airportsApiHandler)

    // Declare api endpoint and bind Lambda function as handler
    new apigw.LambdaRestApi(this, 'Airports_API_Endpoint', {
      handler: airportsApiHandler,
    })
  }
}

// Implement POST /favorite to save an airport as a fav
