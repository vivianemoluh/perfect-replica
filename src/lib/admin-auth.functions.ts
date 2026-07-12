import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

export const checkCurrentUserAdmin = createServerFn({ method: "GET" })
  .handler(async () => {
    const { getRequest } = await import("@tanstack/react-start/server");
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const publishableKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !publishableKey || !serviceRoleKey) {
      const missing = [
        ...(!supabaseUrl ? ["VITE_SUPABASE_URL"] : []),
        ...(!publishableKey ? ["VITE_SUPABASE_PUBLISHABLE_KEY"] : []),
        ...(!serviceRoleKey ? ["SUPABASE_SERVICE_ROLE_KEY"] : []),
      ];
      throw new Error(`Missing Supabase environment variable(s): ${missing.join(", ")}`);
    }

    const authHeader = getRequest().headers.get("authorization");
    const token = authHeader?.startsWith("Bearer ") ? authHeader.slice("Bearer ".length) : "";
    if (!token) throw new Error("Unauthorized: No authorization header provided");

    const userClient = createClient<Database>(supabaseUrl, publishableKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    });
    const { data: userData, error: userError } = await userClient.auth.getUser(token);
    if (userError || !userData.user?.id) throw new Error("Unauthorized: Invalid session");

    const adminClient = createClient<Database>(supabaseUrl, serviceRoleKey, {
      auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    });
    const { data, error } = await adminClient.rpc("has_role", {
      _user_id: userData.user.id,
      _role: "admin",
    });

    if (!error) {
      return {
        userId: userData.user.id,
        isAdmin: data === true,
        source: "has_role",
      };
    }

    console.error("[admin] has_role server RPC failed", error);
    const { data: roleRow, error: roleError } = await adminClient
      .from("user_roles")
      .select("id")
      .eq("user_id", userData.user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (roleError) throw new Error(roleError.message);
    return {
      userId: userData.user.id,
      isAdmin: !!roleRow,
      source: "user_roles_fallback",
      hasRoleError: error.message,
    };
  });