export default function Spinner({ label = 'Loading...' }) {
  return (
    <div className="flex items-center justify-center py-12">
      <p className="text-text-muted font-mono text-sm animate-pulse">{label}</p>
    </div>
  );
}