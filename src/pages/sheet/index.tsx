import { Spinner } from "@nextui-org/react";
import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@nextui-org/table";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useRouter } from "next/router";
import { Key, useCallback } from "react";
import { selectSheets } from "~/server/order";
import { OneOf } from "~/types/common";

const Sheet = () => {
  const router = useRouter();

  const { data: sheets, isFetching } = useQuery({
    queryFn: selectSheets,
    queryKey: ["selectSheets"],
    initialData: [],
  });

  const renderCell = useCallback((item: OneOf<typeof sheets>, key: Key) => {
    const cellValue = item[key as keyof typeof item];

    switch (key) {
      case "createdAt":
        return dayjs(cellValue).format("YYYY-MM-DD HH:mm");

      default:
        return cellValue;
    }
  }, []);

  return (
    <Table
      aria-label="order table"
      classNames={{
        table: "min-h-[100px]",
      }}
      onRowAction={(id) => router.push(`/sheet/${id}`)}
    >
      <TableHeader
        columns={[
          { key: "id", label: "번호" },
          { key: "createdAt", label: "생성일" },
        ]}
      >
        {(column) => <TableColumn key={column.key}>{column.label}</TableColumn>}
      </TableHeader>

      <TableBody
        items={sheets}
        isLoading={isFetching}
        loadingContent={<Spinner color="white" />}
      >
        {(order) => (
          <TableRow key={order.id} className="cursor-pointer">
            {(column) => <TableCell>{renderCell(order, column)}</TableCell>}
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};

export default Sheet;
