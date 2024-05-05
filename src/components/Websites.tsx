"use client";

import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { Database } from "../../types/supabase";
import { useQuery } from "react-query";
import clsx from "clsx";

const tldrSchema = z
  .array(
    z.object({
      score: z.number().nullable(),
      category_title: z.string(),
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
  const rows = await client
    .from("websites")
    .select("id, name, url, terms_url, image_url, tldr")
    .order("id", { ascending: false });

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

export default function Websites() {
  const websites = useQuery({
    queryKey: "websites",
    queryFn: fetchWebsites,
    refetchInterval(data, query) {
      return data?.find((website) => !website.tldr.data) ? 2_000 : false;
    },
  });

  return (
    <dl
      id="websites"
      className="m-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
    >
      {websites.data?.map((website) => (
        <div
          key={website.id}
          className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6 space-y-6"
        >
          <div className="flex items-center gap-2">
            {website.image_url && (
              <img
                className="h-8 w-8"
                src={website.image_url}
                alt={website.name ?? "Logo"}
              />
            )}
            <div className="text-3xl font-semibold tracking-tight text-gray-900 flex-1 truncate">
              {website.name ?? website.url ?? website.terms_url}
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
                <div className="grid gap-2">
                  {website.tldr.data?.map((tldr, i) => (
                    <div key={i} className="flex flex-row gap-2">
                      <span
                        className={clsx(
                          "rounded-full text-xs flex items-center justify-center w-8 h-8",
                          (tldr.score ?? 0) >= 8
                            ? "bg-green-200"
                            : (tldr.score ?? 0) > 5
                            ? "bg-yellow-200"
                            : tldr.score === null
                            ? ""
                            : "bg-red-200"
                        )}
                      >
                        {tldr.score}
                      </span>
                      <div className="flex-1">
                        <div className="text-sm font-medium">
                          {tldr.category_title}
                        </div>
                        <div className="text-xs text-slate-600">
                          {tldr.description}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : true ? (
                <div className="italic text-slate-500 animate-pulse">
                  Processing…
                </div>
              ) : (
                <div className="italic text-slate-500 animate-pulse">
                  Fetching…
                </div>
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
