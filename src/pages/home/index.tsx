import {
  Button,
  Input,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Textarea,
} from "@nextui-org/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { GetServerSideProps } from "next";
import Image from "next/image";
import { useForm } from "react-hook-form";
import withAuth from "~/components/withAuth";
import { supabase } from "~/server/config";

interface FormType {
  title: string;
  description: string;
  images: FileList;
  price: string;
}

const uploadFile = async (file: File) => {
  const fileName = Date.now().toString();

  const { error } = await supabase.storage.from("drama").upload(fileName, file);
  if (error) throw error;

  const {
    data: { publicUrl },
  } = supabase.storage.from("drama").getPublicUrl(fileName);

  return publicUrl;
};

const Home = () => {
  const queryClient = useQueryClient();

  const form = useForm<FormType>({
    defaultValues: { title: "", description: "" },
  });

  const { data: yahooList } = useQuery({
    queryKey: ["yahooList"],
    queryFn: async () => {
      const yahooList = await supabase
        .from("yahooList")
        .select("*, yahooListImages(*)")
        .order("id", { ascending: false });

      return yahooList;
    },
  });

  const { mutate: insertYahooListMutate } = useMutation({
    mutationFn: async ({ title, description, price, images }: FormType) => {
      const { data, error } = await supabase.from("yahooList").insert({ title, description, price }).select().single();
      if (error) throw error;

      const urls = [];

      for (const file of Array.from(images)) {
        const publicUrl = await uploadFile(file);
        urls.push(publicUrl);
      }

      const { error: imageErrors } = await supabase
        .from("yahooListImages")
        .insert(urls.map((url) => ({ dramaId: data.id, url })));

      if (imageErrors) throw imageErrors;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["yahooList"] });
    },
  });

  const { mutate: deleteYahooListMutate } = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase.from("yahooList").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["yahooList"] });
    },
  });

  return (
    <div className="flex flex-col gap-4">
      <form
        className="flex flex-col gap-2"
        onSubmit={form.handleSubmit((values) => {
          insertYahooListMutate(values);
        })}
      >
        <Input label="제목" {...form.register("title")} />

        <Textarea label="설명글" {...form.register("description")} />

        <Input label="가격" {...form.register("price")} />

        <Input type="file" multiple {...form.register("images")} />

        <Button type="submit" color="primary">
          등록
        </Button>
      </form>

      <p>{yahooList?.data?.length}</p>

      <Button
        color="primary"
        disabled={!yahooList?.data}
        onClick={() => {
          const jsonData = yahooList?.data?.map(({ title, description, price, yahooListImages }) => {
            const imageUrls = yahooListImages.map(({ url }) => url);
            return { title, description, price, imageUrls };
          });

          const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: "application/json;charset=utf-8;" });
          const link = document.createElement("a");
          link.href = URL.createObjectURL(blob);
          link.download = "yahoo_list.json";
          link.click();
        }}
      >
        업로드
      </Button>

      <Table>
        <TableHeader
          columns={[
            { key: "title", label: "제목" },
            { key: "price", label: "가격" },
            { key: "images", label: "이미지" },
            { key: "actions", label: "액션" },
          ]}
        >
          {(column) => <TableColumn key={column.key}>{column.label}</TableColumn>}
        </TableHeader>

        <TableBody items={yahooList?.data ?? []} loadingContent={<Spinner color="white" />}>
          {(order) => (
            <TableRow key={order.id}>
              <TableCell>{order.title}</TableCell>
              <TableCell>{order.price}</TableCell>
              <TableCell className="flex gap-4">
                {order.yahooListImages.map(({ id, url }) => (
                  <Image key={id} width={100} height={100} src={url} alt={url} />
                ))}
              </TableCell>
              <TableCell>
                <Button color="danger" size="sm" onClick={() => deleteYahooListMutate(order.id)}>
                  삭제
                </Button>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default Home;

export const getServerSideProps: GetServerSideProps = withAuth(async () => {
  return {
    props: {},
  };
});
