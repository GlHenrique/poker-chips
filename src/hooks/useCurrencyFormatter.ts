import { useTranslation } from "react-i18next";
import { formatCurrency } from "@/utils/formatCurrency";
import { useCallback } from "react";

export function useCurrencyFormatter() {
  const { t } = useTranslation();
  const locale = t("currency.locale");
  const currency = t("currency.code");

  return useCallback(
    (value: number) => formatCurrency(value, locale, currency),
    [locale, currency],
  );
}
