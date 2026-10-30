import type { MediaKind, ProjectStatus, ReportReason, RequestStatus, Role, Visibility } from "./types";

export const ROLE_LABELS: Record<Role, string> = {
  client: "Client",
  architect: "Collaborating architect",
  owner: "Portfolio owner",
  admin: "Administrator",
};

export const VISIBILITY_LABELS: Record<Visibility, string> = {
  public: "Public",
  private: "Private",
  draft: "Draft",
};

export const VISIBILITY_HELP: Record<Visibility, string> = {
  public: "Visible to everyone",
  private: "Finished, but only you, admins and the project's collaborators can see it",
  draft: "Work in progress — only you, admins and collaborators",
};

export const STATUS_LABELS: Record<ProjectStatus, string> = {
  concept: "Concept",
  in_progress: "In progress",
  completed: "Completed",
  built: "Built",
  competition: "Competition entry",
};

export const MEDIA_KIND_LABELS: Record<MediaKind, string> = {
  image: "Image",
  drawing: "Drawing / blueprint",
  document: "Document",
};

export const REQUEST_STATUS_LABELS: Record<RequestStatus, string> = {
  submitted: "Submitted",
  under_review: "Under review",
  accepted: "Accepted",
  declined: "Declined",
  completed: "Completed",
  withdrawn: "Withdrawn",
};

export const REPORT_REASON_LABELS: Record<ReportReason, string> = {
  inappropriate: "Inappropriate content",
  copyright: "Copyright / not the uploader's work",
  incorrect_credit: "Incorrect or missing credit",
  spam: "Spam",
  other: "Other",
};

export const CATEGORIES = [
  "Residential",
  "Public building",
  "Commercial",
  "Urban design",
  "Interior",
  "Landscape",
  "Competition",
  "Studio project",
  "Thesis",
];

export const PROJECT_TYPES = [
  "New building",
  "Renovation / extension",
  "Interior design",
  "Landscape",
  "Competition team",
  "Research / academic",
  "Other",
];

export const BUCKET = "portfolio";

export function statusBadgeClass(status: string) {
  switch (status) {
    case "public":
    case "accepted":
    case "completed":
    case "resolved":
      return "bg-green-100 text-green-800";
    case "private":
    case "under_review":
    case "pending":
      return "bg-amber-100 text-amber-900";
    case "declined":
    case "rejected":
    case "revoked":
    case "open":
      return "bg-red-100 text-red-800";
    default:
      return "bg-line text-muted";
  }
}
