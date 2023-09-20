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

  const [options, setOptions] = useImmutableState({
    source: "ko",
    target: "ja",
  });

  const [state, setState] = useState(false);

  const [total, setTotal] = useState(0);

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
        setState(true);

        for (const file of files) {
          const content = await readFile(file);

          const translatedSrt = await translateContent(content as string);

          downloadSrt(translatedSrt, file.name);
        }

        setState(false);
      })}
    >
      <input
        type="file"
        className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
        multiple
        {...form.register("files")}
      />

      <div className="flex gap-4">
        <div className="flex flex-col">
          <p>출발</p>
          <LangDropdown
            defaultLang={options.source}
            onChangeLang={(lang) => setOptions({ source: lang })}
          />
        </div>

        <div className="flex flex-col">
          <p>도착</p>
          <LangDropdown
            defaultLang={options.target}
            onChangeLang={(lang) => setOptions({ target: lang })}
          />
        </div>
      </div>

      {form.watch("files") && (
        <Table aria-label="Example table with dynamic content">
          <TableHeader>
            <TableColumn>파일명</TableColumn>
          </TableHeader>
          <TableBody>
            {[...form.watch("files")].map((file) => (
              <TableRow key={file.name}>
                <TableCell>{file.name}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <div>글자 수: {total.toLocaleString()}</div>
      <div>예상 요금: {Math.floor(total * 0.02).toLocaleString()}원</div>

      <Button type="submit" color="primary" disabled={state}>
        {state ? <Spinner color="white" size="sm" /> : "번역"}
      </Button>
    </form>
  );
};

export default Sub;
