"use client";

import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { Database } from "../../types/supabase";
import { useEffect, useState } from "react";

const tldrSchema = z
  .array(
    z.object({
      score: z.number(),
      title: z.string(),
      description: z.string(),
      reference: z.string().optional().nullable(),
    })
  )
  .min(1)
  .nullable();

async function fetchWebsites() {
  const client = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_KEY!
  );
  const rows = await client.from("websites").select("*");
  if (rows.error) {
    throw rows.error;
  }
  return (
    rows.data?.map((row) => ({
      ...row,
      tldr: tldrSchema.safeParse(row.tldr),
    })) ?? []
  );
}

type PromiseReturnType<T extends (...args: any) => Promise<any>> = T extends (
  ...args: any
) => Promise<infer U>
  ? U
  : never;
type TWebsite = PromiseReturnType<typeof fetchWebsites>[number];

export default function Websites() {
  const [websites, setWebsites] = useState<Array<TWebsite>>([]);

  useEffect(() => {
    fetchWebsites().then((websites) => setWebsites(websites));
  }, []);

  console.log(websites);

  return (
    <dl className="m-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
      {websites.map((website) => (
        <div
          key={website.id}
          className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6 space-y-2"
        >
          <div className="flex items-center">
            <div className="mt-1 text-3xl font-semibold tracking-tight text-gray-900 flex-1">
              {website.name}
            </div>
            {website.terms_url && (
              <a
                href={website.terms_url}
                target="_blank"
                className="text-sm font-medium text-indigo-600 hover:text-indigo-900"
              >
                Terms
              </a>
            )}
          </div>
          {website.tldr &&
            (website.tldr.success ? (
              website.tldr.data ? (
                <div className="">
                  {website.tldr.data?.map((tldr, i) => (
                    <div key={i}>
                      {tldr.score && (
                        <span className="rounded-full bg-slate-200 text-xs px-2 py-1 mr-2">
                          {tldr.score}
                        </span>
                      )}
                      {tldr.title}
                      {" - "}
                      {tldr.description}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="italic text-slate-500">Processing…</div>
              )
            ) : (
              <div className="text-sm text-red-600 p-2 bg-red-50 rounded-md border-red-100 border">
                {website.tldr.error.message}
              </div>
            ))}
        </div>
      ))}
    </dl>
  );
}
