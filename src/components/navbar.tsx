import Link from "next/link";

export const Navbar = () => {
  return (
    <div className="flex items-center gap-4 p-4">
      <Link href="/home" className="font-bold">
        DRAMA WORLD
      </Link>

      <Link href="/order" className="text-sm">
        주문건
      </Link>

      <Link href="/sheet" className="text-sm">
        시트
      </Link>

      <Link href="/sub" className="text-sm">
        자막
      </Link>
    </div>
  );
};
