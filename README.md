# Brainbase audition

This project implements a small, "demo" API about US airports per the following requirements:

> Using NodeJS and either the Serverless Framework or ExpressJS create a basic REST API that has at least 2 endpoints:
>
> 1. Provide a search route that accepts a string to search by, perform the search on a 3rd party API or basic web responses like google search, image search, or any API you like.
>
> 2. Provide a details page that loads a single item. If using a 3rd party API this could be any single item you can get from said API, ie a single image, pre-defined search result etc.

## API & Access

The API is implemented on AWS. It is world-facing and uses a paper-thin access control plan based on **API Key**. The key should be conveyed on each request in the Request Header as follows:

`apikey: <VALUE>`

This is preconfigured for you in the E2E tests if you use them. (See **E2E Tests** for more details.)

## Endpoints

The implemented endpoints are:

- **/airports** - [GET] returns a collection of objects describing major American airports with optional search (_Requirement #1_)
- **/airport/:iata** - [GET] returns a single object describing an American airport (with decorations); keyed by IATA code (_Requirement #2_)
- **/favorites** - [GET] returns a collection of IATA codes that have been marked as 'favorites'
- **/favorite/:iata** - [GET] returns the same result as _GET /airport/:iata_
- **/favorite/:iata** - [POST] designates an IATA code as a "favorite"

## Behaviors

The following behaviors are supported:

### Search Airports

**Search** is supported on **/airports** using the designated pattern of **?search=[string]**. Other query string parameters result in the request being treated as invalid.

_String_ should be expressed as unescaped text (letters, numbers, common sense special characters) and is tested against the combination of _IATA code_ and _Airport Common Name_. Thus, you can search by IATA code (like "LAX"), city name (like "Los Angeles"), common term (like "Regional"), and arbitrary strings (like "San"). The test is case sensitive using the value of _string_ directly. A search finding no matches returns an empty collection.

#### Deviation from Spec

The original ask asserted _Search_ as a POST request; I chose to implement it as a GET because the search expression (IATA code) was dead simple and, technically speaking, nothing is "created" in the act of searching. In practice I wouldn't make a change like this without some discussion. (An additional endpoint was added to prove I can POST...)

### Airport Detail & Decoration

When responding to the "detail" request - in this case, returning a single airport object via **/airport/:iata** - the airport object is decorated with data from (3) 3rd-party APIs. The decorations pertain to the current weather at the location of the selected airport, the time of sunrise and sunset at the location, and (becauses this is a demo project) a random "evil insult".

### Save Airport as Favorite

Although the notion of a favorite airport might be a bit off, any IATA code can be marked as a "favorite". This is mainly to demonstrate that indeed I can actually do a POST request and to demonstrate persistence of data to a cloud datastore. This behavior is _very_ MVP.

## Stack

The project is written in TypeScript; it's implemented on AWS using Lambda, Lambda Layers, API Gateway, and DynamoDB.

Deployment was done using AWS Cloud Development Kit (CDK) as an IaC tool. CDK patterns were used to declare the API, the Lambdas, the Lambda Layers, the Lambda's ENV variables, the DynamoDB table, and to assign permissions.

CDK essentially lets you write TypeScript to define resources and then emits a conventional CF template. I like it because it keeps me from having to read or write JSON or YAML IaC files.

## IAM & Security

I didn't spend any time locking this project down in a proper way using IAM or other authentication/authorization plan. If you can reach the API, you are allowed to use all endpoints and read/write to a single data table. Obviously, for a production system this topic would deserve more quality time.

## Project Organization

The project is composed of _IaC code_, _app code_, _library code_, and _tests_ in the following folders:

- **lambda** - source code for the Lambda function handler for the API. A single Lambda, **airports.ts** - composed of several modules - handles all requests to all endpoints. You'll see that for each `.ts` file there are two companion files - a `.d.ts` file and a `.js` file. These are not directly worked with, only the `.ts` file matters. Additionally, the **data** folder stores the local primary data collection of airport objects which is treated as an in-memory datastore.

- **layers** - `npm` modules that are part of the project are implemented as Lambda Layers. CDK automatically deploys these so there's no manual uploading of zipped JS via the AWS Lambda Console and no manually association of layers to functions. Such layers are available to _any_ Lambda in an AWS account, so they are a pretty good place to implement `npm` packages that many functions will share (as opposed to including the packages in each of the specific Lambda function deployment bundles.) This makes the Lambda bundles smaller and helps to ensure consistency of `npm` package versions across Lambdas in the account.

- **lib** - the IaC source code. CDK projects are organzied around the notion of a _stack_, in this case, the key file is **api-stack.ts**. This file declares all of the AWS resources required to implement the project services. **lambda-fns.ts** declares the single Lmabda function we need and binds a set of Lambda Layers to it. Note that this file is also where the `ENV` variables for the Lambda and their values are declared. **lambda-layers.ts** declares the Lambda layers used in the project.

- **test** - CDK creates this file and generates a stub for Jest based unit testing. For this project I ignored Jest, and instead added a sub-folder, **e2e**, to store an end-to-end suite of API tests specific to the project. CDK projects have the ability to "test" the code that declares infrastructure creation/configuration, which is something AWS SAM or Serverless cannot yet do AFAIK. I confined my tests to project specific E2E scenarios.

## E2E Tests

The project reflects my TDDish dev process. I use the Postman GUI REST client (a nice Electron app) to prototype and test API work as I develop. It's nice to work with and allows an arbitrary number of tests per API request. These tests can then be executed in the GUI as a "suite" with options for variable substitution, data sharing, retry, delay, etc. But the big win for me (as comparted to other test runners) is that Postman/Newman tests don't require all the bolerplate associated with setting up and making a REST request. The dev just declares what the outcomes should be.

It's also sweet that the test suite and the environment vars can be exported from the GUI client and run from the command line using Postman's NodeJS-based runner, **Newman**. This makes
it simple to pipe the tests into a CI/CD flow.

To avoid you having to install the Postman GUI and Newman, I exported the test suite and its environment vars into the folder **test/e2e**. It's all JSON so its pretty readable. To execute the tests locally, do the following:

1. Clone the project locally.
2. Execute the `package.json` command `yarn e2e` (or `npm run e2e`).

The command uses `npx` to download and install **Newman** (the CLI runner) and runs the test suite. The output is conventional and directed to _stdout_.

## Notes

A few other remarks about the project:

1. As noted above, user authentication/authorization wasn't a focus; that said, be sure to include the apikey/value as a Header on every request.

2. Favoriting an airport is super basic. Favorites aren't distinguished by end-user account, but I slipped a source property from the request into the Favorite document as a sort of stub for where end-user identification would go. Additionally, an airport can be favorited over and over again, and there is no provision for unfavoriting an airport.

3. I chose to implement the primary data collection - airports - in memory. The reason is the size of the collection (which covers nearly all of the important US airports) is very small and pretty static. In a larger project this type of data might be implemented in a cache, redis, or the like. To play a bit more fairly, I added a "decoration" step wherein a selected airport object is elaborated at request time with data from (3) 3rd-party data sources. Cacheing was ignored for this project.

4. Dealing with 3rd-party APIs can be problematic, and there are several patterns which might be applied. The "correct" one is a matter of taste and fit to the project. I used a simple _Promise.all_ pattern but added some control over the XHR request timeout. The XHR library I used - **axios** - uses a default timeout of "never" which seems far too generous. Thus, I set a global project timeout of _one second_ and demonstrated how we would override that on a specific request source basis. That said, if a request to one of the 3rd-party APIs fails, we handle it gracefully.

5. In regard to error handling, I took a simple approach: the API will "should always" respond, even when errors occur, such as a db operation failure or 3rd-party API timeout. Errors are trapped and reported to CloudWatch, and the response object to the requesting client is set to make it obvious that there's no data to work with. This isn't necessarily a practice I would suggest for actual, production code.
