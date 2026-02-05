import { replyMessage, closeMessage } from '@/actions/messages';
import { db } from '@/lib/db';
import { requireLandlord } from '@/lib/rbac';
import { Badge, Button, Card } from '@/components/ui/shared';
import { MessageSquare, XCircle, Send } from 'lucide-react';

export default async function ReportsPage() {
    await requireLandlord();

    const messages = await db.message.findMany({
        include: { tenant: true, lease: { include: { rooms: true } } },
        orderBy: [{ status: 'asc' }, { createdAt: 'desc' }] // Open first, then new
    });

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold">Reportes</h1>
                <p className="text-muted-foreground">Incidencias reportadas por inquilinos.</p>
            </div>

            <div className="grid gap-6">
                {messages.map((msg) => (
                    <Card key={msg.id} className="p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <div className="flex items-center gap-2">
                                    <h3 className="font-bold">{msg.tenant.fullName}</h3>
                                    <Badge variant={msg.status === 'OPEN' ? 'warning' : 'secondary'}>{msg.status}</Badge>
                                </div>
                                <p className="text-xs text-muted-foreground">{msg.lease.rooms.map(r => r.name).join(', ')} — {msg.createdAt.toLocaleDateString()}</p>
                            </div>
                            {msg.status === 'OPEN' && (
                                <form action={async () => {
                                    'use server';
                                    await closeMessage(msg.id);
                                }}>
                                    <Button variant="ghost" size="sm" type="submit" className="text-muted-foreground hover:text-red-500">
                                        <XCircle size={16} className="mr-1" /> Cerrar Ticket
                                    </Button>
                                </form>
                            )}
                        </div>

                        <div className="bg-muted/50 p-3 rounded-lg text-sm mb-4">
                            {msg.content}
                        </div>

                        {msg.adminReply ? (
                            <div className="ml-8 bg-primary/10 p-3 rounded-lg text-sm">
                                <p className="font-bold text-xs text-primary mb-1">Tu respuesta:</p>
                                {msg.adminReply}
                            </div>
                        ) : (
                            msg.status === 'OPEN' && (
                                <div className="ml-8">
                                    <form action={async (formData) => {
                                        'use server';
                                        const reply = formData.get('reply') as string;
                                        await replyMessage(msg.id, reply);
                                    }} className="flex gap-2">
                                        <input name="reply" placeholder="Escribir respuesta..." className="flex-1 text-sm border rounded px-3 py-2" required />
                                        <Button size="sm" type="submit"><Send size={14} /></Button>
                                    </form>
                                </div>
                            )
                        )}
                    </Card>
                ))}
                {messages.length === 0 && <p className="text-muted-foreground italic">No hay mensajes.</p>}
            </div>
        </div>
    );
}
