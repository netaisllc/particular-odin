import { dispatch, validate } from './helpers/routes'
import { extract, respond } from './helpers/utility'
import { EventProps } from './types/EventProps'

exports.handler = async function (event: any) {
  const props: EventProps = extract(event)

  // Validate request (access, route, method, and filter)
  const state = validate(props)
  if (state.invalid) {
    return respond(state.code, state.message)
  }

  // Dispatch request handler
  return dispatch(props)
}
