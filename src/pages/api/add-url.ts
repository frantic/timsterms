import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { NextApiRequest, NextApiResponse } from "next";
import { Database } from "../../../types/supabase";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { url } = z.object({ url: z.string().url() }).parse(req.body);

  const page = await fetch(url);
  if (!page.ok) {
    throw new Error("Failed to fetch page");
  }

  const client = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  );

  const base = new URL("/", url);

  const { data, error } = await client
    .from("websites")
    .insert([{ url: base.toString(), terms_url: url }]);

  res.status(200).json({ data });
}
