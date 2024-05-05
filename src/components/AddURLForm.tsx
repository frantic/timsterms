import { ArrowRightIcon } from "@heroicons/react/20/solid";
import { useMutation, useQueryClient } from "react-query";

export default function AddURLForm() {
  const utils = useQueryClient();
  const addURL = useMutation(
    async (data: FormData) => {
      const response = await fetch("/api/add-url", {
        method: "POST",
        body: JSON.stringify({ url: data.get("url") }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        throw new Error("Failed to add URL");
      }
    },
    {
      onSuccess: () => {
        utils.invalidateQueries("websites");
        const el = document.getElementById("websites");
        window.scrollTo({ top: el?.offsetTop, behavior: "smooth" });
      },
    }
  );

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        addURL.mutate(new FormData(e.target as HTMLFormElement));
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
