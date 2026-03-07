interface DistributionErrorProps {
  isHiding: boolean;
}

export function DistributionError({ isHiding }: DistributionErrorProps) {
  return (
    <div
      className={`rounded-lg border bg-card p-6 ${
        isHiding ? "fade-out" : "fade-in-up"
      }`}
    >
      <p className="text-muted-foreground text-center">
        Não foi possível calcular a distribuição. Verifique:
      </p>
      <ul className="list-disc list-inside mt-2 text-sm text-muted-foreground space-y-1">
        <li>Se há fichas suficientes para o valor solicitado</li>
        <li>Se a stack inicial é pelo menos 100 big blinds (recomendado)</li>
        <li>Se há fichas pequenas o suficiente para o small blind</li>
        <li>Se o big blind é maior ou igual ao small blind</li>
      </ul>
    </div>
  );
}
