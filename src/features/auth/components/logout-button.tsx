import { Button } from "@/components/ui/button";
import { logoutAction } from "@/server/actions/auth-actions";

export function LogoutButton() {
  return (
    <form action={logoutAction}>
      <Button type="submit" variant="secondary">
        Keluar
      </Button>
    </form>
  );
}
