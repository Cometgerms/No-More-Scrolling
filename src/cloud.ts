import { supabase } from "./supabase";
import { validateState } from "./logic";
import type { State } from "./model";

export type CloudRecord = { state: State; revision: number };
export interface CloudGateway {
  read(owner: string): Promise<CloudRecord | null>;
  write(owner: string, revision: number, state: State): Promise<CloudRecord | null>;
}
const parse = (row: { state: unknown; revision: number }): CloudRecord => ({ state: validateState(row.state), revision: row.revision });
export const cloud: CloudGateway = {
  async read(owner) {
    const { data, error } = await supabase.from("reading_states").select("state,revision").eq("user_id", owner).abortSignal(AbortSignal.timeout(15000)).maybeSingle();
    if (error) throw error;
    return data ? parse(data) : null;
  },
  async write(owner, revision, state) {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user.id !== owner) throw new Error("Account changed");
    const { data, error } = await supabase.rpc("save_reading_state", { expected_owner: owner, expected_revision: revision, new_state: state }).abortSignal(AbortSignal.timeout(15000));
    if (error) throw error;
    return data?.[0] ? parse(data[0]) : null;
  },
};
