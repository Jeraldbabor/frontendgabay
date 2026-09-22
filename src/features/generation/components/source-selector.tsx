"use client";
import type { SourceMode } from "@gabay/types";
import { Field, Select } from "@/shared/components/ui/form";
export function SourceSelector({
  value,
  onChange,
}: {
  value: SourceMode;
  onChange: (mode: SourceMode) => void;
}) {
  return (
    <Field label="Knowledge sources">
      <Select
        value={value}
        onChange={(e) => onChange(e.target.value as SourceMode)}
      >
        <option value="OFFICIAL_AI">GABAY AI + official documents</option>
        <option value="OFFICIAL_ONLY">Official documents only</option>
        <option value="GENERAL">General AI knowledge</option>
        <option value="PERSONAL_OFFICIAL">My files + official documents</option>
      </Select>
    </Field>
  );
}
