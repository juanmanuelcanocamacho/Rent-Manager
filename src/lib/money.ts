export function formatMoney(amountCents: number): string {
    return new Intl.NumberFormat('es-BO', {
        style: 'currency',
        currency: 'BOB',
    }).format(amountCents / 100);
}
