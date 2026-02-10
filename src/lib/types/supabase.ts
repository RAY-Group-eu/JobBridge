export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export type Database = {
    graphql_public: {
        Tables: {
            [_ in never]: never
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            graphql: {
                Args: {
                    operationName?: string
                    query?: string
                    variables?: Json
                    extensions?: Json
                }
                Returns: Json
            }
        }
        Enums: {
            [_ in never]: never
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
    public: {
        Tables: {
            applications: {
                Row: {
                    cover_letter: string | null
                    created_at: string
                    id: string
                    job_id: string
                    message: string | null
                    rejection_reason: string | null
                    status: string
                    user_id: string
                }
                Insert: {
                    cover_letter?: string | null
                    created_at?: string
                    id?: string
                    job_id: string
                    message?: string | null
                    rejection_reason?: string | null
                    status?: string
                    user_id: string
                }
                Update: {
                    cover_letter?: string | null
                    created_at?: string
                    id?: string
                    job_id?: string
                    message?: string | null
                    rejection_reason?: string | null
                    status?: string
                    user_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "applications_job_id_fkey"
                        columns: ["job_id"]
                        isOneToOne: false
                        referencedRelation: "jobs"
                        referencedColumns: ["id"]
                    },
                ]
            }
            demo_applications: {
                Row: {
                    cover_letter: string | null
                    created_at: string
                    id: string
                    job_id: string
                    status: string
                    user_id: string
                }
                Insert: {
                    cover_letter?: string | null
                    created_at?: string
                    id?: string
                    job_id: string
                    status?: string
                    user_id: string
                }
                Update: {
                    cover_letter?: string | null
                    created_at?: string
                    id?: string
                    job_id?: string
                    status?: string
                    user_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "demo_applications_job_id_fkey"
                        columns: ["job_id"]
                        isOneToOne: false
                        referencedRelation: "demo_jobs"
                        referencedColumns: ["id"]
                    },
                ]
            }
            demo_jobs: {
                Row: {
                    address_reveal_policy: Database["public"]["Enums"]["address_reveal_policy"]
                    category: Database["public"]["Enums"]["job_category"]
                    created_at: string
                    description: string
                    expires_at: string
                    filled_at: string | null
                    filled_by: string | null
                    hiring_mode: Database["public"]["Enums"]["hiring_mode"]
                    id: string
                    market_id: string
                    max_applicants: number | null
                    posted_by: string
                    public_lat: number
                    public_lng: number
                    public_location_label: string
                    status: Database["public"]["Enums"]["job_status"]
                    title: string
                    wage_hourly: number
                }
                Insert: {
                    address_reveal_policy?: Database["public"]["Enums"]["address_reveal_policy"]
                    category: Database["public"]["Enums"]["job_category"]
                    created_at?: string
                    description: string
                    expires_at?: string
                    filled_at?: string | null
                    filled_by?: string | null
                    hiring_mode?: Database["public"]["Enums"]["hiring_mode"]
                    id?: string
                    market_id: string
                    max_applicants?: number | null
                    posted_by: string
                    public_lat: number
                    public_lng: number
                    public_location_label: string
                    status?: Database["public"]["Enums"]["job_status"]
                    title: string
                    wage_hourly: number
                }
                Update: {
                    address_reveal_policy?: Database["public"]["Enums"]["address_reveal_policy"]
                    category?: Database["public"]["Enums"]["job_category"]
                    created_at?: string
                    description?: string
                    expires_at?: string
                    filled_at?: string | null
                    filled_by?: string | null
                    hiring_mode?: Database["public"]["Enums"]["hiring_mode"]
                    id?: string
                    market_id?: string
                    max_applicants?: number | null
                    posted_by?: string
                    public_lat?: number
                    public_lng?: number
                    public_location_label?: string
                    status?: Database["public"]["Enums"]["job_status"]
                    title?: string
                    wage_hourly?: number
                }
                Relationships: []
            }
            guardian_relationships: {
                Row: {
                    child_id: string
                    created_at: string | null
                    guardian_id: string
                    id: string
                    status: string
                }
                Insert: {
                    child_id: string
                    created_at?: string | null
                    guardian_id: string
                    id?: string
                    status: string
                }
                Update: {
                    child_id?: string
                    created_at?: string | null
                    guardian_id?: string
                    id?: string
                    status?: string
                }
                Relationships: []
            }
            jobs: {
                Row: {
                    address_reveal_policy: Database["public"]["Enums"]["address_reveal_policy"]
                    category: Database["public"]["Enums"]["job_category"]
                    created_at: string
                    description: string
                    expires_at: string
                    filled_at: string | null
                    filled_by: string | null
                    hiring_mode: Database["public"]["Enums"]["hiring_mode"]
                    id: string
                    market_id: string
                    max_applicants: number | null
                    posted_by: string
                    public_lat: number
                    public_lng: number
                    public_location_label: string
                    status: Database["public"]["Enums"]["job_status"]
                    title: string
                    wage_hourly: number
                }
                Insert: {
                    address_reveal_policy?: Database["public"]["Enums"]["address_reveal_policy"]
                    category: Database["public"]["Enums"]["job_category"]
                    created_at?: string
                    description: string
                    expires_at?: string
                    filled_at?: string | null
                    filled_by?: string | null
                    hiring_mode?: Database["public"]["Enums"]["hiring_mode"]
                    id?: string
                    market_id: string
                    max_applicants?: number | null
                    posted_by: string
                    public_lat: number
                    public_lng: number
                    public_location_label: string
                    status?: Database["public"]["Enums"]["job_status"]
                    title: string
                    wage_hourly: number
                }
                Update: {
                    address_reveal_policy?: Database["public"]["Enums"]["address_reveal_policy"]
                    category?: Database["public"]["Enums"]["job_category"]
                    created_at?: string
                    description?: string
                    expires_at?: string
                    filled_at?: string | null
                    filled_by?: string | null
                    hiring_mode?: Database["public"]["Enums"]["hiring_mode"]
                    id?: string
                    market_id?: string
                    max_applicants?: number | null
                    posted_by?: string
                    public_lat?: number
                    public_lng?: number
                    public_location_label?: string
                    status?: Database["public"]["Enums"]["job_status"]
                    title?: string
                    wage_hourly?: number
                }
                Relationships: [
                    {
                        foreignKeyName: "jobs_market_id_fkey"
                        columns: ["market_id"]
                        isOneToOne: false
                        referencedRelation: "regions_live"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "jobs_posted_by_fkey"
                        columns: ["posted_by"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    },
                ]
            }
            messages: {
                Row: {
                    application_id: string
                    content: string
                    created_at: string | null
                    id: string
                    read_at: string | null
                    sender_id: string
                }
                Insert: {
                    application_id: string
                    content: string
                    created_at?: string | null
                    id?: string
                    read_at?: string | null
                    sender_id: string
                }
                Update: {
                    application_id?: string
                    content?: string
                    created_at?: string | null
                    id?: string
                    read_at?: string | null
                    sender_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "messages_application_id_fkey"
                        columns: ["application_id"]
                        isOneToOne: false
                        referencedRelation: "applications"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "messages_sender_id_fkey"
                        columns: ["sender_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    },
                ]
            }
            profiles: {
                Row: {
                    account_type: Database["public"]["Enums"]["account_type"]
                    address_city: string | null
                    address_street: string | null
                    address_zip: string | null
                    avatar_url: string | null
                    bio: string | null
                    birthdate: string | null
                    company_name: string | null
                    created_at: string
                    email: string
                    full_name: string | null
                    guardian_status: string | null
                    id: string
                    market_id: string | null
                    phone: string | null
                    provider_verification_evidence: string | null
                    provider_verification_notes: string | null
                    provider_verification_status: string | null
                    provider_verified_at: string | null
                    updated_at: string
                    verification_status: Database["public"]["Enums"]["verification_status"]
                }
                Insert: {
                    account_type?: Database["public"]["Enums"]["account_type"]
                    address_city?: string | null
                    address_street?: string | null
                    address_zip?: string | null
                    avatar_url?: string | null
                    bio?: string | null
                    birthdate?: string | null
                    company_name?: string | null
                    created_at?: string
                    email: string
                    full_name?: string | null
                    guardian_status?: string | null
                    id: string
                    market_id?: string | null
                    phone?: string | null
                    provider_verification_evidence?: string | null
                    provider_verification_notes?: string | null
                    provider_verification_status?: string | null
                    provider_verified_at?: string | null
                    updated_at?: string
                    verification_status?: Database["public"]["Enums"]["verification_status"]
                }
                Update: {
                    account_type?: Database["public"]["Enums"]["account_type"]
                    address_city?: string | null
                    address_street?: string | null
                    address_zip?: string | null
                    avatar_url?: string | null
                    bio?: string | null
                    birthdate?: string | null
                    company_name?: string | null
                    created_at?: string
                    email?: string
                    full_name?: string | null
                    guardian_status?: string | null
                    id?: string
                    market_id?: string | null
                    phone?: string | null
                    provider_verification_evidence?: string | null
                    provider_verification_notes?: string | null
                    provider_verification_status?: string | null
                    provider_verified_at?: string | null
                    updated_at?: string
                    verification_status?: Database["public"]["Enums"]["verification_status"]
                }
                Relationships: [
                    {
                        foreignKeyName: "profiles_market_id_fkey"
                        columns: ["market_id"]
                        isOneToOne: false
                        referencedRelation: "regions_live"
                        referencedColumns: ["id"]
                    },
                ]
            }
            regions_live: {
                Row: {
                    brand_prefix: string | null
                    centroid_lat: number | null
                    centroid_lng: number | null
                    city: string
                    created_at: string
                    display_name: string | null
                    id: string
                    is_live: boolean
                    radius_km: number
                    rank: number
                    slug: string | null
                    state: string
                }
                Insert: {
                    brand_prefix?: string | null
                    centroid_lat?: number | null
                    centroid_lng?: number | null
                    city: string
                    created_at?: string
                    display_name?: string | null
                    id?: string
                    is_live?: boolean
                    radius_km?: number
                    rank?: number
                    slug?: string | null
                    state: string
                }
                Update: {
                    brand_prefix?: string | null
                    centroid_lat?: number | null
                    centroid_lng?: number | null
                    city?: string
                    created_at?: string
                    display_name?: string | null
                    id?: string
                    is_live?: boolean
                    radius_km?: number
                    rank?: number
                    slug?: string | null
                    state?: string
                }
                Relationships: []
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            get_my_claims: {
                Args: Record<PropertyKey, never>
                Returns: Json
            }
            get_nearby_offers: {
                Args: {
                    arg_lat: number
                    arg_lng: number
                    arg_radius_km: number
                }
                Returns: {
                    id: string
                    title: string
                    description: string
                    wage_hourly: number
                    public_location_label: string
                    created_at: string
                    status: Database["public"]["Enums"]["job_status"]
                    distance_meters: number
                }[]
            }
            is_claims_admin: {
                Args: Record<PropertyKey, never>
                Returns: boolean
            }
        }
        Enums: {
            account_type: "job_seeker" | "job_provider" | "guardian"
            address_reveal_policy: "always" | "on_accept"
            hiring_mode: "first_come" | "select"
            job_category:
            | "gardening"
            | "household"
            | "shopping"
            | "pets"
            | "tech_help"
            | "other"
            job_status: "open" | "in_progress" | "closed"
            application_status: "submitted" | "pending" | "negotiating" | "waitlisted" | "rejected" | "accepted" | "cancelled"
            verification_status: "unverified" | "pending" | "verified"
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
}

export type Tables<
    PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"] & Database["public"]["Views"])
    | { schema: keyof Database },
    TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
    ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
            Row: infer R
        }
    ? R
    : never
    : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] &
        Database["public"]["Views"])
    ? (Database["public"]["Tables"] &
        Database["public"]["Views"])[PublicTableNameOrOptions] extends {
            Row: infer R
        }
    ? R
    : never
    : never

export type TablesInsert<
    PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
    TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
    ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
        Insert: infer I
    }
    ? I
    : never
    : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
    ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
    }
    ? I
    : never
    : never

export type TablesUpdate<
    PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
    TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
    ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
        Update: infer U
    }
    ? U
    : never
    : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
    ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
    }
    ? U
    : never
    : never

export type Enums<
    PublicEnumNameOrOptions extends
    | keyof Database["public"]["Enums"]
    | { schema: keyof Database },
    EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
    ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
    : PublicEnumNameOrOptions extends keyof Database["public"]["Enums"]
    ? Database["public"]["Enums"][PublicEnumNameOrOptions]
    : never
