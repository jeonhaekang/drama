import {
  NavbarBrand,
  Navbar as NavbarContainer,
  NavbarContent,
  NavbarItem,
} from "@nextui-org/react";
import Link from "next/link";

export const Navbar = () => {
  return (
    <NavbarContainer>
      <NavbarBrand>
        <Link href="/home" className="font-bold">
          DRAMA WORLD
        </Link>
      </NavbarBrand>

      <NavbarContent justify="end">
        <NavbarItem>
          <Link href="/order" className="text-sm">
            주문건
          </Link>
        </NavbarItem>

        <NavbarItem>
          <Link href="/sheet" className="text-sm">
            시트
          </Link>
        </NavbarItem>

        <NavbarItem>
          <Link href="/sub" className="text-sm">
            자막
          </Link>
        </NavbarItem>
      </NavbarContent>
    </NavbarContainer>
  );
};
