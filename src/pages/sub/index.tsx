import {
  Button,
  Chip,
  Divider,
  Input,
  Select,
  SelectItem,
  Selection,
  Spinner,
} from "@nextui-org/react";
import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  getKeyValue,
} from "@nextui-org/table";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { GetServerSideProps } from "next";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import srtParser2, { Line } from "srt-parser-2";
import { useImmutableState } from "~/hooks";
import { supabase } from "~/server/config";
import { translate } from "~/server/papago";
import { chunkArray, downloadSrt, requiredSession } from "~/utils";
import { readFile } from "~/utils/file";

const SEPARATOR = "\n\n";

const LANGUAGE_MAP = {
  ko: "한국어",
  en: "영어",
  ja: "일본어",
  "zh-CN": "중국어 간체",
  "zh-TW": "중국어 번체",
} as const;

const Sub = () => {
  const form = useForm<{ files: FileList }>();
  const wordForm = useForm<{ start: string; end: string }>();

  const queryClient = useQueryClient();

  const [isLoading, setIsLoading] = useState(false);
  const [total, setTotal] = useState(0);

  const [source, setSource] = useState<Selection>(new Set(["ko"]));
  const [target, setTarget] = useState<Selection>(new Set(["ja"]));

  const [progress, setProgress] = useImmutableState<{
    in?: string;
    done: string[];
  }>({
    done: [],
  });

  const { data: subWords } = useQuery({
    queryKey: ["subWords"],
    queryFn: async () => {
      const { data, error } = await supabase.from("subWords").select("*");
      if (error) throw error;

      return data;
    },
    initialData: [],
  });

  const { mutate: insertWord } = useMutation({
    mutationFn: async (word: { start: string; end: string }) => {
      await supabase.from("subWords").insert(word);
    },
    onSettled: async () => {
      queryClient.invalidateQueries(["subWords"]);

      wordForm.reset();
    },
  });

  const { mutate: deleteWord } = useMutation({
    mutationFn: async (id: number) => {
      await supabase.from("subWords").delete().eq("id", id);
    },
    onSettled: async () => {
      await queryClient.invalidateQueries(["subWords"]);
    },
  });

  const translateContent = async (content: string) => {
    const parser = new srtParser2();
    const srtArray = parser.fromSrt(content);

    const srtChunkArray = chunkArray(srtArray, 200);

    const translated: Line[] = [];

    for (const chunk of srtChunkArray) {
      const combinedText = chunk.map((srt) => srt.text).join(SEPARATOR);

      const { translatedText } = await translate({
        source: [...source].join(),
        target: [...target].join(),
        text: combinedText,
      });

      const translatedSrtArray = translatedText.split(SEPARATOR);

      chunk.forEach((srt, index) =>
        translated.push({ ...srt, text: translatedSrtArray[index] })
      );
    }

    return parser.toSrt(translated);
  };

  const updatedTotal = useCallback(async () => {
    let count = 0;

    for (const file of form.watch("files")) {
      const read = await readFile(file);

      if (read) {
        const parser = new srtParser2();
        const srtArray = parser.fromSrt(read);

        count += srtArray.map((srt) => srt.text).join(SEPARATOR).length;
      }
    }

    setTotal(count);
  }, [form.watch("files")]);

  useEffect(() => {
    updatedTotal();
  }, [updatedTotal]);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-xl">언어 선택</h2>

        <div className="flex gap-4 mt-4">
          <Select
            items={Object.entries(LANGUAGE_MAP)}
            label="출발 언어"
            selectedKeys={source}
            onSelectionChange={setSource}
          >
            {([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            )}
          </Select>

          <Select
            items={Object.entries(LANGUAGE_MAP)}
            label="도착 언어"
            selectedKeys={target}
            onSelectionChange={setTarget}
          >
            {([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            )}
          </Select>
        </div>
      </div>

      <Divider />

      <div>
        <h2 className="text-xl">수정 단어 목록</h2>

        <p className="text-sm text-default-500">
          등록된 출발 단어는 도착 단어로 일괄 변경됩니다.
        </p>

        <Table
          className="mt-4"
          bottomContent={
            <form
              className="flex gap-4"
              onSubmit={wordForm.handleSubmit((data) => insertWord(data))}
            >
              <Input
                placeholder="출발 단어"
                {...wordForm.register("start", { required: true })}
              />
              <Input
                placeholder="도착 단어"
                {...wordForm.register("end", { required: true })}
              />

              <Button type="submit" color="primary">
                단어 추가
              </Button>
            </form>
          }
          onRowAction={(id) => {
            if (confirm("삭제하시겠습니까?")) deleteWord(id as number);
          }}
        >
          <TableHeader
            columns={[
              { key: "start", label: "출발 단어" },
              { key: "end", label: "도착 단어" },
            ]}
          >
            {(column) => (
              <TableColumn key={column.key}>{column.label}</TableColumn>
            )}
          </TableHeader>

          <TableBody items={subWords}>
            {(word) => (
              <TableRow key={word.id}>
                {(columnKey) => (
                  <TableCell>{getKeyValue(word, columnKey)}</TableCell>
                )}
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Divider />

      <div>
        <h2 className="text-xl">번역 파일 목록</h2>

        <form
          className="flex flex-col gap-4 mt-4"
          onSubmit={form.handleSubmit(async ({ files }) => {
            setIsLoading(true);

            const _files = Array.from(files);

            try {
              for (let i = 0; i < _files.length; i++) {
                const file = _files[i];

                setProgress({ in: file.name });

                const content = await readFile(_files[i]);
                let translatedSrt = await translateContent(content as string);

                subWords.forEach((word) => {
                  translatedSrt = translatedSrt.replaceAll(
                    word.start,
                    word.end
                  );
                });

                downloadSrt(translatedSrt, file.name);

                setProgress((progress) => ({
                  in: undefined,
                  done: [...progress.done, file.name],
                }));
              }
            } catch (error) {}

            setIsLoading(false);
          })}
        >
          <Table
            aria-label="Example table with dynamic content"
            bottomContent={
              <input
                type="file"
                className="block w-full text-sm file:mr-4 file:rounded-lg file:border-0 file:bg-primary-500 file:py-2 file:px-3 file:text-sm hover:file:bg-primary-600 focus:outline-none disabled:pointer-events-none"
                multiple
                accept=".srt"
                {...form.register("files")}
              />
            }
          >
            <TableHeader>
              <TableColumn>파일명</TableColumn>
              <TableColumn width={100}>상태</TableColumn>
            </TableHeader>

            <TableBody emptyContent="파일을 선택해주세요">
              {Array.from(form.watch("files") ?? []).map((file) => (
                <TableRow key={file.name}>
                  <TableCell>{file.name}</TableCell>

                  <TableCell>
                    {progress.done.includes(file.name) && (
                      <Chip variant="flat" size="sm" color="success">
                        완료
                      </Chip>
                    )}

                    {progress.in === file.name && <Spinner size="sm" />}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="flex gap-4">
            <span className="text-default-400 text-small">
              글자 수: {total.toLocaleString()}
            </span>

            <span className="text-default-400 text-small">
              예상 요금: {Math.floor(total * 0.02).toLocaleString()}원
            </span>
          </div>

          <Button type="submit" color="primary" disabled={isLoading}>
            {isLoading ? <Spinner color="white" size="sm" /> : "번역"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Sub;

export const getServerSideProps: GetServerSideProps = requiredSession(
  async (_, token) => {
    return {
      props: { token },
    };
  }
);
