"use client";

import { addURL } from "./actions";
import { ArrowRightIcon } from "@heroicons/react/20/solid";

export default function AddURLForm() {
  return (
    <form
      action={async (data) => {
        await addURL(data);
        window.location.reload();
      }}
    >
      <div className="flex rounded-lg shadow-lg">
        <input
          type="text"
          name="url"
          id="url"
          required
          placeholder="Terms of service URL"
          className="flex-grow appearance-none px-4 rounded-l-md border border-gray-300 placeholder-gray-400 shadow-sm focus:border-black focus:outline-none focus:ring-black sm:text-sm"
        />
        <button className="inline-flex items-center justify-center gap-x-2 rounded-e-md border border-transparent bg-slate-800 px-4 py-3 text-sm font-semibold text-white disabled:pointer-events-none disabled:opacity-50">
          <ArrowRightIcon className="h-7 w-7 stroke-2" />
        </button>
      </div>
    </form>
  );
}
