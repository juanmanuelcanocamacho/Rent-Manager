'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/shared';
import { cn } from '@/lib/utils';

const COUNTRIES = [
    { code: 'BO', name: 'Bolivia', dial: '+591', flag: '🇧🇴' },
    { code: 'ES', name: 'España', dial: '+34', flag: '🇪🇸' },
    { code: 'US', name: 'EE.UU.', dial: '+1', flag: '🇺🇸' },
    { code: 'GB', name: 'R. Unido', dial: '+44', flag: '🇬🇧' },
    { code: 'FR', name: 'Francia', dial: '+33', flag: '🇫🇷' },
];

interface PhoneInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'defaultValue'> {
    defaultValue?: string | null;
}

export function PhoneInput({ className, defaultValue = '', name = 'phone', required, ...props }: PhoneInputProps) {
    // Default country is Bolivia (+591)
    const [countryDial, setCountryDial] = useState('+591');
    const [localNumber, setLocalNumber] = useState('');

    useEffect(() => {
        if (defaultValue) {
            // Find country matching the prefix
            const country = COUNTRIES.find(c => defaultValue.startsWith(c.dial));
            if (country) {
                setCountryDial(country.dial);
                setLocalNumber(defaultValue.replace(country.dial, ''));
            } else {
                setLocalNumber(defaultValue);
            }
        }
    }, [defaultValue]);

    // Update parent hidden input value
    const fullPhoneNumber = countryDial + localNumber;

    return (
        <div className={cn("flex gap-2 items-center", className)}>
            <div className="relative">
                <select
                    className="h-10 w-[110px] rounded-lg border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 appearance-none cursor-pointer"
                    value={countryDial}
                    onChange={(e) => setCountryDial(e.target.value)}
                >
                    {COUNTRIES.map((country) => (
                        <option key={country.code} value={country.dial}>
                            {country.flag} {country.dial}
                        </option>
                    ))}
                </select>
                {/* Chevron Icon */}
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-muted-foreground">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="m6 9 6 6 6-6" />
                    </svg>
                </div>
            </div>

            {/* Local Number Input */}
            <Input
                type="tel"
                placeholder="Número"
                value={localNumber}
                onChange={(e) => setLocalNumber(e.target.value.replace(/\D/g, ''))}
                className="flex-1"
                required={required}
                {...props}
            />

            {/* Hidden Input for Form Submission */}
            <input type="hidden" name={name} value={fullPhoneNumber} />
        </div>
    );
}
