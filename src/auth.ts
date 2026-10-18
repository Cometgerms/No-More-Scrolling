import { supabase, redirectUrl } from "./supabase";
import { emailAuth } from "./auth-actions";

export const auth = emailAuth(supabase.auth, redirectUrl);
