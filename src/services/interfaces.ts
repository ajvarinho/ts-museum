

//Define API response types

// Response from first fetch - object IDs
export interface SearchAPIResponse {
  total: number;
  objectIDs: number[] | null;
}

// Response from second fetch - specific image (/objects/:id)
export interface imgResponse {
  objectID: number;
  title?: string;
  primaryImage?: string;
  primaryImageSmall?: string;
  artistDisplayName?: string;
  medium?: string;
  dimensions?: string;
}

// Data format - image type fetched and saved
export interface ImageData {
  id: number;
  title: string;
  srcSmall: string;
  srcLarge?: string;
  author?: string;
  medium?: string;
  favorites: boolean;
}

export interface entry {
  isIntersecting: boolean;
}