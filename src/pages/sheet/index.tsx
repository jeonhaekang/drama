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
import Link from "next/link";
import { selectSheets } from "~/server/order";

const Sheet = () => {
  const { data: sheets } = useQuery({
    queryFn: selectSheets,
    queryKey: ["selectSheets"],
    initialData: [],
  });

  return (
    <Table aria-label="order table">
      <TableHeader key={1}>
        <TableColumn>번호</TableColumn>
        <TableColumn>날짜</TableColumn>
      </TableHeader>

      <TableBody>
        {sheets.map((sheet) => {
          return (
            <TableRow key={sheet.id}>
              <TableCell>{sheet.id}</TableCell>

              <TableCell className="whitespace-nowrap">
                <Link href={`/sheet/${sheet.id}`}>
                  {dayjs(sheet.createdAt).format("YYYY-MM-DD HH:mm")}
                </Link>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};

export default Sheet;
