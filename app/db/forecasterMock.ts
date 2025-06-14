import { UserMetadata } from "./types";

export async function fetchUserMetadataFromForecaster(address: string): Promise<UserMetadata> {
  // Мокаем внешнюю интеграцию
  return {
    full_name: `User ${address.slice(2, 6)}`,
    avatar: `https://robohash.org/${address}.png`,
    forecaster_id: `fc_${address.slice(2, 8)}`,
    forecaster_nickname: `nickname_${address.slice(2, 5)}`
  };
}
