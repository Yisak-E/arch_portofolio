export function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function str(form: FormData, key: string, max = 5000) {
  const v = form.get(key);
  if (typeof v !== "string") return "";
  return v.trim().slice(0, max);
}

export function nullable(v: string) {
  return v === "" ? null : v;
}
