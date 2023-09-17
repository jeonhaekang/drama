const bigIntReplacer = (key: string, value: any): any => {
  if (typeof value === "bigint") {
    return value.toString();
  }
  return value;
};

export const toNumber = <T extends object>(obj: T) => {
  return JSON.parse(JSON.stringify(obj, bigIntReplacer)) as T;
};
