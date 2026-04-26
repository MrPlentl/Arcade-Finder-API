export function getIgdbAuthUrl(clientId: string, clientSecret: string): string {
  return `https://id.twitch.tv/oauth2/token?client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials`;
}

export function getIgdbBaseUrl(): string {
  return 'https://api.igdb.com/v4';
}
