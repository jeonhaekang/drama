import type { ReactElement } from "react";

export type OneOf<T extends readonly unknown[]> = T[number];

export type PickUnion<T, U> = T extends U ? T : never;

export type ValueOf<T> = T[keyof T];

export type PropsWithElement<T = unknown> = T & { children: ReactElement };
