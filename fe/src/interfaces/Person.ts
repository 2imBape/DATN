export interface Person {
  _id?: string | undefined;
  name: string;
  role: "actors" | "directors";
  age: number;
  thumbnail: string;
  description: string;
}

