import { cn } from "../../../lib/utils";

export function Card({ className, children, ...props }) {
  return (
    <article className={cn("card-base", className)} {...props}>
      {children}
    </article>
  );
}

export function CardHeader({ className, children, ...props }) {
  return (
    <div
      className={cn(
        "px-5 py-4 border-b border-[#262c4d] flex items-center justify-between text-palette-almond",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardBody({ className, children, ...props }) {
  return (
    <div className={cn("px-5 py-4 text-palette-lilac", className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ className, children, ...props }) {
  return (
    <div
      className={cn(
        "px-5 py-3 border-t border-[#262c4d] bg-[#12162a]/70 rounded-b-xl text-palette-lilac",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function StatCard({ title, value, icon, description, trend, className }) {
  return (
    <Card className={cn("hover:border-palette-grape transition-all duration-200", className)}>
      <CardBody className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <p className="text-[11px] font-semibold tracking-wider uppercase text-palette-lilac">
              {title}
            </p>
            <p className="text-2xl lg:text-3xl font-bold text-palette-almond tracking-tight">
              {value}
            </p>
            {description && (
              <p className="text-xs text-palette-lilac/80 pt-0.5">
                {description}
              </p>
            )}
            {trend && (
              <p className="text-[11px] font-medium text-palette-almond/90">
                {trend}
              </p>
            )}
          </div>
          {icon && (
            <div className="p-2.5 rounded-lg bg-[#1e2444] border border-[#2b3254] text-palette-almond">
              {icon}
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  );
}
