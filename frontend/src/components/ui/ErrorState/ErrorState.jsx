import { AlertOctagon } from "lucide-react";
import Button from "../Button/Button";

function ErrorState({
  title = "Something went wrong",
  message = "An unexpected error occurred while loading data.",
  onRetry,
}) {
  return (
    <div className="card-base p-8 text-center space-y-3 border-red-900/40 bg-red-950/20">
      <div className="w-12 h-12 rounded-full bg-red-900/40 border border-red-700/50 mx-auto flex items-center justify-center text-red-400">
        <AlertOctagon size={22} />
      </div>
      <div className="space-y-1">
        <p className="text-base font-semibold text-red-200">{title}</p>
        <p className="text-xs text-palette-lilac max-w-sm mx-auto">{message}</p>
      </div>
      {onRetry && (
        <div className="pt-2">
          <Button size="sm" variant="outline" onClick={onRetry}>
            Retry Request
          </Button>
        </div>
      )}
    </div>
  );
}

export default ErrorState;
