import { ComponentProps, isValidElement, cloneElement, ReactElement } from 'react';
import { cn } from '@/lib/utils';

export function Button({
    className,
    variant = 'primary',
    size = 'default',
    asChild = false,
    children,
    ...props
}: ComponentProps<'button'> & {
    variant?: 'primary' | 'secondary' | 'destructive' | 'outline' | 'ghost',
    size?: 'default' | 'sm' | 'lg' | 'icon',
    asChild?: boolean
}) {
    const variants = {
        primary: 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-md hover:shadow-lg hover:-translate-y-0.5',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80 hover:shadow-md transition-all',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm hover:shadow-md',
        outline: 'border border-input bg-transparent hover:bg-accent hover:text-accent-foreground hover:border-accent',
        ghost: 'hover:bg-accent/50 hover:text-accent-foreground',
    };

    const sizes = {
        default: 'h-10 px-4 py-2', // Slightly taller for modern look
        sm: 'h-8 px-3 text-xs',
        lg: 'h-12 px-8 text-base',
        icon: 'h-10 w-10',
    };

    const classes = cn(
        'inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50 active:scale-95',
        variants[variant],
        sizes[size],
        className
    );

    if (asChild && children) {
        if (isValidElement(children)) {
            return cloneElement(children as ReactElement<any>, {
                className: cn(classes, (children.props as any).className),
                ...props
            } as any);
        }
    }

    return (
        <button
            className={classes}
            {...props}
        >
            {children}
        </button>
    );
}

export function Input({ className, ...props }: ComponentProps<'input'>) {
    return (
        <input
            className={cn(
                'flex h-10 w-full rounded-lg border border-input bg-background/50 px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 focus:bg-background',
                className
            )}
            {...props}
        />
    );
}

export function Badge({ className, variant = 'default', ...props }: ComponentProps<'div'> & { variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' }) {
    const variants = {
        default: 'border-transparent bg-primary/10 text-primary hover:bg-primary/20', // Softer default
        secondary: 'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
        destructive: 'border-transparent bg-destructive/10 text-destructive hover:bg-destructive/20',
        outline: 'text-foreground',
        success: 'border-transparent bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/25',
        warning: 'border-transparent bg-amber-500/15 text-amber-700 dark:text-amber-400 hover:bg-amber-500/25',
    };
    return (
        <div className={cn("inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2", variants[variant], className)} {...props} />
    )
}

export function Card({ className, ...props }: ComponentProps<'div'>) {
    return <div className={cn("rounded-2xl border bg-card/50 backdrop-blur-sm text-card-foreground shadow-sm hover:shadow-md transition-all duration-300", className)} {...props} />
}
