export interface Package {
  _id: string ;
  name: string;
  price: number;
  durationInMonths: number;
  concurrentDevices: number;
  channels: boolean;
  premiumSports: boolean;
  hboGo: boolean;
  noAds : boolean;
  kplusChannels: boolean;
  description: string;
}
