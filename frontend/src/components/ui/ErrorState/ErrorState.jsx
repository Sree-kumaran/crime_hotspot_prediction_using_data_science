import Button from "../Button/Button";

function ErrorState({ title = "Something went wrong", message, onRetry }) {
  return (
    <div className="card-base p-6 text-center space-y-2">
      <p className="text-h3 text-danger">{title}</p>
      {message && <p className="text-small text-text-secondary">{message}</p>}
      {onRetry && (
        <Button onClick={onRetry} size="sm">
          Retry
        </Button>
      )}
    </div>
  );
}
export default ErrorState;
