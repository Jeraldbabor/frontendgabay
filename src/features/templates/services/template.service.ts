export const defaultLayout = {
  schoolName: "",
  teacherName: "",
  division: "",
  region: "",
  position: "",
  header: "",
  footer: "Prepared with GABAY AI • Teacher verification recommended",
  font: "Arial",
  paperSize: "A4",
  orientation: "portrait",
  marginMm: 20,
};
export type Layout = typeof defaultLayout;
export function readLayout(form: FormData): Layout {
  return {
    schoolName: String(form.get("schoolName") ?? ""),
    teacherName: String(form.get("teacherName") ?? ""),
    division: String(form.get("division") ?? ""),
    region: String(form.get("region") ?? ""),
    position: String(form.get("position") ?? ""),
    header: String(form.get("header") ?? ""),
    footer: String(form.get("footer") ?? ""),
    font: String(form.get("font") ?? "Arial"),
    paperSize: String(form.get("paperSize") ?? "A4"),
    orientation: String(form.get("orientation") ?? "portrait"),
    marginMm: Number(form.get("marginMm") ?? 20),
  };
}
