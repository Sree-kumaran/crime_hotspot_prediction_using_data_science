import { cn } from "../../../lib/utils";

export function Card({ className, children }) {
  return <article className={cn("card-base", className)}>{children}</article>;
}
export function CardHeader({ className, children }) {
  return (
    <div className={cn("px-5 pt-5 pb-3 border-b border-border", className)}>
      {children}
    </div>
  );
}
export function CardBody({ className, children }) {
  return <div className={cn("px-5 py-4", className)}>{children}</div>;
}
export function CardFooter({ className, children }) {
  return (
    <div
      className={cn(
        "px-5 py-3 border-t border-border bg-bg-muted/50 rounded-b-xl",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function StatCard({ title, value, icon, description }) {
  return (
    <Card>
      <CardBody>
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-caption text-text-muted">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
            {description && (
              <p className="text-small text-text-secondary mt-1">
                {description}
              </p>
            )}
          </div>
          <div className="p-2 rounded-lg bg-bg-muted">{icon}</div>
        </div>
      </CardBody>
    </Card>
  );
}
