// El radar heredado consulta coordenadas precisas y no comprueba consentimiento
// ni bloqueos en el servidor. Un flag de entorno por sí solo no debe habilitarlo.
const radarServerContractReady = false

export const isRadarAvailable = radarServerContractReady && import.meta.env.VITE_ENABLE_RADAR === 'true'
