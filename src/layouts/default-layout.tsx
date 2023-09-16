import { PropsWithChildren } from "react";
import { Navbar } from "~/components";

export const DefaultLayout = ({ children }: PropsWithChildren) => {
  return (
    <>
      <Navbar />

      {children}
    </>
  );
};
