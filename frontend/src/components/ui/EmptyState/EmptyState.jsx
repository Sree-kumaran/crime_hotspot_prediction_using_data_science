import Button from "../Button/Button";
import { Inbox } from "lucide-react";

function EmptyState({
  title = "No data found",
  description = "There are currently no records to display.",
  actionLabel,
  onAction,
  icon: Icon = Inbox,
}) {
  return (
    <div className="card-base p-8 text-center space-y-3 border-dashed border-[#2b3254] bg-[#12162a]/60">
      <div className="w-12 h-12 rounded-full bg-[#1e2444] border border-[#2b3254] mx-auto flex items-center justify-center text-palette-lilac">
        <Icon size={22} />
      </div>
      <div className="space-y-1">
        <p className="text-base font-semibold text-palette-almond">{title}</p>
        <p className="text-xs text-palette-lilac max-w-sm mx-auto">{description}</p>
      </div>
      {actionLabel && onAction && (
        <div className="pt-2">
          <Button size="sm" variant="secondary" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
}

export default EmptyState;
