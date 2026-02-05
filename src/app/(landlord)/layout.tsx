import { MobileHeader, Sidebar } from "@/components/layout/sidebar";

export default function LandlordLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen">
            <Sidebar />
            <div className="flex-1 flex flex-col">
                <MobileHeader />
                <main className="flex-1 p-6 md:p-8 bg-muted/20">
                    <div className="mx-auto max-w-6xl">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
