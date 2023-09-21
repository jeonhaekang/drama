import { Select, SelectItem, Selection } from "@nextui-org/react";
import { useEffect, useState } from "react";

const LANGUAGE_MAP = {
  ko: "한국어",
  en: "영어",
  ja: "일본어",
  "zh-CN": "중국어 간체",
  "zh-TW": "중국어 번체",
} as const;

export const LangDropdown = ({
  defaultLang = "ko",
  label,
  onChangeLang,
}: {
  defaultLang?: string;
  label?: string;
  onChangeLang: (lang: string) => void;
}) => {
  const [selectedKeys, setSelectedKeys] = useState<Selection>(
    new Set([defaultLang])
  );

  useEffect(() => {
    onChangeLang(Array.from(selectedKeys).join());
  }, [selectedKeys]);

  return (
    <Select
      items={Object.entries(LANGUAGE_MAP)}
      label={label}
      selectedKeys={selectedKeys}
      onSelectionChange={setSelectedKeys}
    >
      {([value, label]) => (
        <SelectItem key={value} value={value}>
          {label}
        </SelectItem>
      )}
    </Select>
  );
};
