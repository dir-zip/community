"use client";
import { logoutAction } from "../actions";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();
  return (
    <button
      onClick={async () => {
        await logoutAction();
        router.push("/login");
      }}
    >
      Logout
    </button>
  );
}
