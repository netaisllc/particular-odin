import { Filter } from '../types/Filter'
import { GeneralObject } from '../types/GeneralObject'

export interface EventProps {
  at: string
  filter: Filter
  headers: GeneralObject
  method: string
  path: string
  source: string
}
