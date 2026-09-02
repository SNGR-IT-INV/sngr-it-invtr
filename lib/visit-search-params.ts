import {
  createSearchParamsCache,
  parseAsInteger,
  parseAsString,
  parseAsStringEnum,
} from "nuqs/server"

export const visitSearchParams = {
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(10),
  ticket: parseAsString,
  status: parseAsStringEnum(["draft", "completed"]),
  dateFrom: parseAsString,
  dateTo: parseAsString,
}

export const visitSearchParamsCache = createSearchParamsCache(visitSearchParams)
