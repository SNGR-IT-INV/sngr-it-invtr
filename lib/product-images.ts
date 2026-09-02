// No public API exists to fetch a product photo by serial number (HP and
// Apple both gate serial lookups behind reseller/service-provider programs,
// and a serial identifies one unit, not a photo — the photo is a *model*
// concept). Practical alternative: a small local model → image map, since
// this org buys from a known, limited catalog. Drop images in
// public/products/ and add an entry here; until then, the detail page falls
// back to a type icon.
const PRODUCT_IMAGES: Record<string, string> = {
  // "hp elitebook 840": "/products/hp-elitebook-840.png",
  // "apple iphone 15": "/products/iphone-15.png",
}

function normalize(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ")
}

export function getProductImagePath(brand: string, model: string | null) {
  if (!model) return null
  const key = normalize(`${brand} ${model}`)
  if (PRODUCT_IMAGES[key]) return PRODUCT_IMAGES[key]

  // Fall back to a partial match (e.g. stored "HP EliteBook 840 G9" vs a
  // catalog entry for "hp elitebook 840").
  const match = Object.keys(PRODUCT_IMAGES).find(
    (k) => key.includes(k) || k.includes(key)
  )
  return match ? PRODUCT_IMAGES[match] : null
}

const TYPE_ICONS: Record<string, string> = {
  laptop: "tabler:device-laptop",
  desktop: "tabler:device-desktop",
  docking_station: "tabler:device-desktop-analytics",
  monitor: "tabler:device-desktop",
  printer: "tabler:printer",
  iphone: "tabler:device-mobile",
  ipad: "tabler:device-tablet",
  other: "tabler:package",
}

export function getEquipmentTypeIcon(type: string) {
  return TYPE_ICONS[type] ?? "tabler:package"
}
