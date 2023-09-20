import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Selection,
} from "@nextui-org/react";
import { useMemo, useState } from "react";

export const LangDropdown = ({
  defaultLang = "ko",
  onChangeLang,
}: {
  defaultLang?: string;
  onChangeLang: (lang: string) => void;
}) => {
  const [selectedKeys, setSelectedKeys] = useState<Selection>(
    new Set([defaultLang])
  );

  const selectedValue = useMemo(
    () => Array.from(selectedKeys).join(", ").replaceAll("_", " "),
    [selectedKeys]
  );

  return (
    <Dropdown>
      <DropdownTrigger>
        <Button variant="bordered" className="capitalize">
          {selectedValue}
        </Button>
      </DropdownTrigger>
      <DropdownMenu
        aria-label="Single selection example"
        variant="flat"
        disallowEmptySelection
        selectionMode="single"
        selectedKeys={selectedKeys}
        onSelectionChange={(data) => {
          setSelectedKeys(data);

          onChangeLang([...data].join(""));
        }}
      >
        <DropdownItem key="ko">한국어</DropdownItem>
        <DropdownItem key="en">영어</DropdownItem>
        <DropdownItem key="ja">일본어</DropdownItem>
        <DropdownItem key="zh-CN">중국어 간체</DropdownItem>
        <DropdownItem key="zh-TW">중국어 번체</DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
};
