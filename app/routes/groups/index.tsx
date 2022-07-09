import { Link } from "@remix-run/react";

export default function GroupIndexPage() {
  return (
    <p>
      No group selected. Select a group on the left, or{" "}
      <Link to="new">create a new group.</Link>
    </p>
  );
}
