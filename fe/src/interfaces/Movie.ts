import { Category } from "./Category";
import { Country } from "./Country";
import { Person } from "./Person";

export interface Movie {
  _id?: string; 
  name: string; 
  origin_name: string;
  description: string;
  thumbnail: string; 
  time: string; 
  quality: string; 
  lang: string; 
  video: string; 
  trailer: string; 
  year: number; 
  favoriteCount?: number; 
  status: string; 
  movieId?: string;
  createdAt: Date;
  releaseDate: Date; 
  viewCount: number; 
  category?: Category[] | string[]; 
  country?: Country[] | string[]; 
  person?: (Person & { role: "actors" | "directors" })[]; 
  isFree: boolean; 
  isPendingDelete: boolean; 
  totalViews: number;
  directors?: Person[]; // Đảm bảo có trường này
  actors?: Person[];
}
