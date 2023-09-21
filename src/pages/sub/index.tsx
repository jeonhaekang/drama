import { Button, Spinner } from "@nextui-org/react";
import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@nextui-org/table";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import srtParser2, { Line } from "srt-parser-2";
import { LangDropdown } from "~/components";
import { useImmutableState } from "~/hooks";
import { translate } from "~/server/papago";
import { chunkArray, downloadSrt } from "~/utils";
import { readFile } from "~/utils/file";

const SEPARATOR = "\n\n";

const Sub = () => {
  const form = useForm<{ files: FileList }>();

  const [isLoading, setIsLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [options, setOptions] = useImmutableState({
    source: "ko",
    target: "ja",
  });

  const translateContent = async (content: string) => {
    const parser = new srtParser2();
    const srtArray = parser.fromSrt(content);

    const srtChunkArray = chunkArray(srtArray, 200);

    const translated: Line[] = [];

    for (const chunk of srtChunkArray) {
      const combinedText = chunk.map((srt) => srt.text).join(SEPARATOR);

      const { translatedText } = await translate({
        source: options.source,
        target: options.target,
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
    <form
      className="flex flex-col gap-4"
      onSubmit={form.handleSubmit(async ({ files }) => {
        setIsLoading(true);

        try {
          for (const file of files) {
            const content = await readFile(file);

            const translatedSrt = await translateContent(content as string);

            downloadSrt(translatedSrt, file.name);
          }
        } catch (error) {}

        setIsLoading(false);
      })}
    >
      <div className="flex gap-4">
        <LangDropdown
          label="출발 언어"
          defaultLang={options.source}
          onChangeLang={(lang) => setOptions({ source: lang })}
        />

        <LangDropdown
          label="도착 언어"
          defaultLang={options.target}
          onChangeLang={(lang) => setOptions({ target: lang })}
        />
      </div>

      <Table
        aria-label="Example table with dynamic content"
        bottomContent={
          <input
            type="file"
            className="block w-full text-sm file:mr-4 file:rounded-lg file:border-0 file:bg-primary-500 file:py-2.5 file:px-4 file:text-sm file:font-semibold file:text-white hover:file:bg-primary-700 focus:outline-none disabled:pointer-events-none disabled:opacity-60"
            multiple
            accept=".srt"
            {...form.register("files")}
          />
        }
      >
        <TableHeader>
          <TableColumn>파일명</TableColumn>
        </TableHeader>
        <TableBody
          emptyContent="파일을 선택해주세요"
          items={[...(form.watch("files") ?? [])]}
        >
          {(file) => (
            <TableRow key={file.name}>
              <TableCell>{file.name}</TableCell>
            </TableRow>
          )}
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
  );
};

export default Sub;
