"use server";

import { createClient } from "@supabase/supabase-js";
import { Database } from "../../types/supabase";
import { z } from "zod";

export async function addURL(formData: FormData) {
  const url = z.string().url().parse(formData.get("url"));

  const page = await fetch(url);
  if (!page.ok) {
    throw new Error("Failed to fetch page");
  }

  const client = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  );

  const { data, error } = await client.from("websites").insert([{ url }]);
}
