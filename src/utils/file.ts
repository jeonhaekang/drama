export const readFile = (file: File): Promise<string | null> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      resolve(event.target?.result as string | null);
    };

    reader.onerror = (error) => {
      reject(error);
    };

    reader.readAsText(file, "UTF-8");
  });
};
