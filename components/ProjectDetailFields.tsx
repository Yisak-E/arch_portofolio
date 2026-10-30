import { CATEGORIES, STATUS_LABELS } from "@/lib/constants";
import type { Project } from "@/lib/types";

/** Descriptive project fields shared by the owner form and the collaborator form (FR-004, FR-018, FR-028). */
export default function ProjectDetailFields({ project }: { project?: Project }) {
  return (
    <>
      <section className="space-y-5 rounded-lg border border-line bg-panel p-6">
        <div>
          <label className="label" htmlFor="title">Title *</label>
          <input id="title" name="title" required maxLength={200} defaultValue={project?.title} className="input text-base" />
        </div>
        <div>
          <label className="label" htmlFor="summary">Short summary</label>
          <input
            id="summary"
            name="summary"
            maxLength={400}
            defaultValue={project?.summary ?? ""}
            placeholder="One or two lines shown on the project card"
            className="input"
          />
        </div>
        <TextArea name="description" label="Description" rows={8} value={project?.description} placeholder="Site, programme, process… Line breaks are kept." />
        <TextArea name="design_concept" label="Design concept" rows={5} value={project?.design_concept} placeholder="The idea behind the design." />
        <TextArea name="materials" label="Materials & technologies" rows={3} value={project?.materials} placeholder="e.g. Rammed earth, CLT, passive cooling…" />
      </section>

      <section className="grid gap-5 rounded-lg border border-line bg-panel p-6 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="category">Category</label>
          <input id="category" name="category" list="categories" defaultValue={project?.category ?? ""} className="input" />
          <datalist id="categories">
            {CATEGORIES.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </div>
        <div>
          <label className="label" htmlFor="status">Project status</label>
          <select id="status" name="status" defaultValue={project?.status ?? "completed"} className="input">
            {Object.entries(STATUS_LABELS).map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="label" htmlFor="tags">Tags</label>
          <input
            id="tags"
            name="tags"
            defaultValue={project?.tags?.join(", ") ?? ""}
            placeholder="Comma separated, e.g. housing, timber, community"
            className="input"
          />
        </div>
        <div>
          <label className="label" htmlFor="location">Location</label>
          <input id="location" name="location" defaultValue={project?.location ?? ""} className="input" />
        </div>
        <div>
          <label className="label" htmlFor="year">Year</label>
          <input id="year" name="year" inputMode="numeric" maxLength={4} defaultValue={project?.year ?? ""} className="input" />
        </div>
        <div>
          <label className="label" htmlFor="area">Area / scale</label>
          <input id="area" name="area" placeholder="e.g. 1,200 m²" defaultValue={project?.area ?? ""} className="input" />
        </div>
        <div>
          <label className="label" htmlFor="software">Tools & software</label>
          <input id="software" name="software" placeholder="e.g. Revit, Rhino, Lumion" defaultValue={project?.software ?? ""} className="input" />
        </div>
      </section>
    </>
  );
}

function TextArea({
  name,
  label,
  rows,
  value,
  placeholder,
}: {
  name: string;
  label: string;
  rows: number;
  value?: string | null;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="label" htmlFor={name}>{label}</label>
      <textarea id={name} name={name} rows={rows} defaultValue={value ?? ""} placeholder={placeholder} className="input leading-7" />
    </div>
  );
}
