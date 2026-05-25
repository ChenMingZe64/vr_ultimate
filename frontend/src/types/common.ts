export interface PaginatedResponse<T> {
  code: number;
  message: string;
  data: T[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

export interface User {
  id: string;
  username: string;
  email: string;
  realName: string;
  studentId: string;
  avatarUrl: string;
  department: string;
  major: string;
  grade: string;
  roles: Role[];
}

export interface Role {
  id: string;
  name: string;
  displayName: string;
}

export interface Building {
  id: string;
  name: string;
  code: string;
  category: "teaching" | "dormitory" | "canteen" | "lab" | "library" | "office" | "sports";
  description: string;
  coverImage: string;
  floorCount: number;
  geoLat: number;
  geoLng: number;
  facilities: string[];
  openingHours: Record<string, string>;
}

export interface News {
  id: string;
  title: string;
  slug: string;
  summary: string;
  coverImage: string;
  category: string;
  publishedAt: string;
  author: { realName: string };
}

export interface Event {
  id: string;
  title: string;
  slug: string;
  description: string;
  coverImage: string;
  category: string;
  location: string;
  startTime: string;
  endTime: string;
  status: "upcoming" | "ongoing" | "ended";
}

export interface POI {
  id: string;
  name: string;
  category: string;
  position3d: { x: number; y: number; z: number };
}
