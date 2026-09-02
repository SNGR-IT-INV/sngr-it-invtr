import {
  createSearchParamsCache,
  parseAsInteger,
  parseAsString,
  parseAsStringEnum,
} from "nuqs/server"

import { STAFF_STATUSES } from "@/lib/equipment-types"

export const staffSearchParams = {
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(10),
  search: parseAsString,
  status: parseAsStringEnum(STAFF_STATUSES.map((s) => s.value)),
  departmentId: parseAsInteger,
}

export const staffSearchParamsCache = createSearchParamsCache(staffSearchParams)
