// MIGRATION: Replaces ventura.config.json + CommonService.getAPIPrefix('SOMNT24')
// Original: commonService.getAPIPrefix('SOMNT24') resolved to e.g. http://localhost:2114
// Angular 17: environment.apiUrl used directly in services.
// In development, requests to /api are proxied to .NET 8 via proxy.conf.json.

export const environment = {
  production: false,
  // Proxy forwards /api → https://localhost:7001 (configure in proxy.conf.json)
  apiUrl: '/api',
  clientDateFormat: 'dd/MM/yyyy',   // from ventura.config.json appSettings.clientDateFormat
  appTitle: 'XONT Ventura SOMNT24',
  version: '17.0.0'
};
