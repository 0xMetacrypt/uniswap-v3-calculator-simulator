import { clsx } from "clsx";

export function Container({ className, children }: React.ComponentPropsWithoutRef<"div">) {
  return <div className={clsx("mx-auto w-full max-w-7xl px-4", className)}>{children}</div>;
}
