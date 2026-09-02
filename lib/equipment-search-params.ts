import {
  createSearchParamsCache,
  parseAsInteger,
  parseAsString,
  parseAsStringEnum,
} from "nuqs/server"

import { EQUIPMENT_STATUSES, EQUIPMENT_TYPES } from "@/lib/equipment-types"

export const equipmentSearchParams = {
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(10),
  search: parseAsString,
  type: parseAsStringEnum(EQUIPMENT_TYPES.map((t) => t.value)),
  status: parseAsStringEnum(EQUIPMENT_STATUSES.map((s) => s.value)),
  departmentId: parseAsInteger,
}

export const equipmentSearchParamsCache = createSearchParamsCache(
  equipmentSearchParams
)
