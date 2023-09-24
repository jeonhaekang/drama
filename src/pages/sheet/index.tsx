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
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { Key, useCallback } from "react";
import { selectSheets } from "~/server/order";
import { OneOf } from "~/types/common";
import { requiredSession } from "~/utils";

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
      onRowAction={(id) => router.push(`/sheet/${id}`)}
      bottomContent={
        isFetching && (
          <div className="flex justify-center">
            <Spinner color="white" />
          </div>
        )
      }
    >
      <TableHeader
        columns={[
          { key: "id", label: "번호" },
          { key: "createdAt", label: "생성일" },
        ]}
      >
        {(column) => <TableColumn key={column.key}>{column.label}</TableColumn>}
      </TableHeader>

      <TableBody items={sheets}>
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

export const getServerSideProps: GetServerSideProps = requiredSession(
  async (_, token) => {
    return {
      props: { token },
    };
  }
);
