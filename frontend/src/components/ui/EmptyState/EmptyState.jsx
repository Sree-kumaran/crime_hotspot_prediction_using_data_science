import Button from "../Button/Button";

function EmptyState({ title, description, actionLabel, onAction }) {
  return (
    <div className="card-base p-6 text-center space-y-2">
      <p className="text-h3">{title}</p>
      <p className="text-small text-text-secondary">{description}</p>
      {actionLabel && onAction && (
        <Button size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
export default EmptyState;
