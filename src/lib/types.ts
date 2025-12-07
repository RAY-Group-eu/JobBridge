export type UserType = "youth" | "adult" | "senior" | "company";

export type Profile = {
  id: string;
  full_name: string | null;
  birthdate: string | null;
  city: string | null;
  user_type: UserType | null;
  is_verified: boolean | null;
  created_at: string | null;
};

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: {
          id: string;
          full_name?: string | null;
          birthdate?: string | null;
          city?: string | null;
          user_type?: UserType | null;
          is_verified?: boolean | null;
          created_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
        Relationships: [];
      };
      regions: {
        Row: {
          id: string;
          name: string;
          is_active: boolean;
        };
        Insert: {
          id?: string;
          name: string;
          is_active?: boolean;
        };
        Update: Partial<Database["public"]["Tables"]["regions"]["Insert"]>;
        Relationships: [];
      };
      verification_attempts: {
        Row: {
          id: string;
          attempts: number;
          last_attempt: string | null;
        };
        Insert: {
          id: string;
          attempts?: number;
          last_attempt?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["verification_attempts"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export const isProfileComplete = (profile: Profile | null) =>
  Boolean(
    profile?.full_name &&
      profile.birthdate &&
      profile.city &&
      profile.user_type
  );
