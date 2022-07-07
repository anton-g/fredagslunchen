import { Link } from "@remix-run/react";

export default function GroupIndexPage() {
  return (
    <p>
      No group selected. Select a group on the left, or{" "}
      <Link to="new" className="text-blue-500 underline">
        create a new group.
      </Link>
    </p>
  );
}
