export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      dias_sem_expediente: {
        Row: {
          created_at: string | null
          data: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          data: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          data?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      member_chat_messages: {
        Row: {
          author_avatar_url: string | null
          author_filial: string | null
          author_name: string | null
          created_at: string | null
          expires_at: string
          id: string
          message: string
          user_id: string
        }
        Insert: {
          author_avatar_url?: string | null
          author_filial?: string | null
          author_name?: string | null
          created_at?: string | null
          expires_at: string
          id?: string
          message: string
          user_id: string
        }
        Update: {
          author_avatar_url?: string | null
          author_filial?: string | null
          author_name?: string | null
          created_at?: string | null
          expires_at?: string
          id?: string
          message?: string
          user_id?: string
        }
        Relationships: []
      }
      user_dashboard: {
        Row: {
          abertura_dia: number | null
          abertura_vencido_mes: number | null
          avatar_url: string | null
          carteira_total: number | null
          created_at: string | null
          dias_restantes: number | null
          email: string | null
          filial: number | null
          id: string
          instagram: string | null
          membro: boolean | null
          meta_desafio: number | null
          meta_mes: number | null
          meta_perdido: number | null
          nome_usuario: string | null
          rec_perdido: number | null
          role: string | null
          updated_at: string | null
          user_id: string
          vencido_atual: number | null
          whatsapp: string | null
        }
        Insert: {
          abertura_dia?: number | null
          abertura_vencido_mes?: number | null
          avatar_url?: string | null
          carteira_total?: number | null
          created_at?: string | null
          dias_restantes?: number | null
          email?: string | null
          filial?: number | null
          id?: string
          instagram?: string | null
          membro?: boolean | null
          meta_desafio?: number | null
          meta_mes?: number | null
          meta_perdido?: number | null
          nome_usuario?: string | null
          rec_perdido?: number | null
          role?: string | null
          updated_at?: string | null
          user_id: string
          vencido_atual?: number | null
          whatsapp?: string | null
        }
        Update: {
          abertura_dia?: number | null
          abertura_vencido_mes?: number | null
          avatar_url?: string | null
          carteira_total?: number | null
          created_at?: string | null
          dias_restantes?: number | null
          email?: string | null
          filial?: number | null
          id?: string
          instagram?: string | null
          membro?: boolean | null
          meta_desafio?: number | null
          meta_mes?: number | null
          meta_perdido?: number | null
          nome_usuario?: string | null
          rec_perdido?: number | null
          role?: string | null
          updated_at?: string | null
          user_id?: string
          vencido_atual?: number | null
          whatsapp?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
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
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
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
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
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
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
