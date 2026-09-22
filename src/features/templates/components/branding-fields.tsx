import { Field, Input, Select, Textarea } from "@/shared/components/ui/form";
import { defaultLayout, type Layout } from "../services/template.service";
export function BrandingFields({
  layout = defaultLayout,
}: {
  layout?: Layout;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Field label="School name">
        <Input
          name="schoolName"
          maxLength={200}
          defaultValue={layout.schoolName}
        />
      </Field>
      <Field label="Teacher name">
        <Input
          name="teacherName"
          maxLength={120}
          defaultValue={layout.teacherName}
        />
      </Field>
      <Field label="Header" className="sm:col-span-2">
        <Textarea name="header" maxLength={1000} defaultValue={layout.header} />
      </Field>
      <Field label="Division">
        <Input name="division" maxLength={200} defaultValue={layout.division} />
      </Field>
      <Field label="Region">
        <Input name="region" maxLength={200} defaultValue={layout.region} />
      </Field>
      <Field label="Position">
        <Input name="position" maxLength={120} defaultValue={layout.position} />
      </Field>
      <Field label="Footer" className="sm:col-span-2">
        <Input name="footer" maxLength={1000} defaultValue={layout.footer} />
      </Field>
      <Field label="Font">
        <Select name="font" defaultValue={layout.font}>
          <option>Arial</option>
          <option>Calibri</option>
          <option>Times New Roman</option>
        </Select>
      </Field>
      <Field label="Paper size">
        <Select name="paperSize" defaultValue={layout.paperSize}>
          <option value="A4">A4</option>
          <option value="LETTER">Letter</option>
          <option value="LEGAL">Legal</option>
        </Select>
      </Field>
      <Field label="Orientation">
        <Select name="orientation" defaultValue={layout.orientation}>
          <option value="portrait">Portrait</option>
          <option value="landscape">Landscape</option>
        </Select>
      </Field>
      <Field label="Margins (mm)">
        <Input
          name="marginMm"
          type="number"
          min={10}
          max={35}
          defaultValue={layout.marginMm}
        />
      </Field>
    </div>
  );
}
