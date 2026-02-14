export function formatMoney(amountCents: number, country: 'SPAIN' | 'BOLIVIA' = 'BOLIVIA'): string {
    const isSpain = country === 'SPAIN';
    return new Intl.NumberFormat(isSpain ? 'es-ES' : 'es-BO', {
        style: 'currency',
        currency: isSpain ? 'EUR' : 'BOB',
    }).format(amountCents / 100);
}
