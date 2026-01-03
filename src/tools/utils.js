/**
 * Convert simple SLO object to ODCS slaProperties array
 * @param {Object} slo - Simple key-value SLO object
 * @returns {Array} slaProperties array
 */
export function convertSloToSlaProperties(slo) {
  if (!slo || typeof slo !== "object" || Object.keys(slo).length === 0) {
    return [];
  }

  return Object.entries(slo).map(([key, value]) => ({
    property: key,
    value: value.value || value,
    ...(value.unit && { unit: value.unit }),
  }));
}
