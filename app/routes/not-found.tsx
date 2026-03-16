import { Link } from "react-router";
import { Flower2 } from "lucide-react";
import { Button } from "~/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background text-center">
      <div className="flex size-16 items-center justify-center rounded-full bg-muted">
        <Flower2 className="size-8 text-muted-foreground" />
      </div>
      <div className="space-y-1">
        <h1 className="text-4xl font-bold tracking-tight">404</h1>
        <p className="text-muted-foreground">This page could not be found.</p>
      </div>
      <Button asChild variant="outline">
        <Link to="/">Back to dashboard</Link>
      </Button>
    </div>
  );
}
