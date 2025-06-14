export async function fetchUserMetadataFromForecaster(address: string): Promise<{
  full_name: string;
  avatar?: string;
  forecaster_id?: string;
  forecaster_nickname?: string;
}> {
  // Мокаем внешнюю интеграцию
  return {
    full_name: `User ${address.slice(2, 6)}`,
    avatar: `https://robohash.org/${address}.png`,
    forecaster_id: `fc_${address.slice(2, 8)}`,
    forecaster_nickname: `nickname_${address.slice(2, 5)}`
  };
}
