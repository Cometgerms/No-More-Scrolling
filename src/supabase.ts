import { createClient } from "@supabase/supabase-js";
import { recoveryState } from "./recovery-state";

// This publishable key is intentionally public. Row ownership is enforced by RLS.
export const supabaseUrl = "https://lanrrewsskfqylinmsag.supabase.co";
export const publishableKey = "sb_publishable_aFNKKHMLz6L11b5W40sQkg_eUrEpRr1";
export const supabase = createClient(supabaseUrl, publishableKey, {
  auth: { flowType: "pkce", persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
});
// Subscribe before React mounts so a fast recovery callback cannot be missed.
const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
  if (event === "PASSWORD_RECOVERY") recoveryState.set(true);
  if (event === "SIGNED_OUT" || (event === "INITIAL_SESSION" && !session)) recoveryState.set(false);
});
if (import.meta.hot) import.meta.hot.dispose(() => subscription.unsubscribe());
export const redirectUrl = () => new URL(import.meta.env.BASE_URL, location.origin).href;
