import { createMessage } from '@/actions/messages';
import { getTenantProfileForSession } from '@/lib/rbac';
import { db } from '@/lib/db';
import { Card, Button, Badge } from '@/components/ui/shared';
import { MessageSquare } from 'lucide-react';

export default async function TenantMessagesPage() {
    const profile = await getTenantProfileForSession();

    const messages = await db.message.findMany({
        where: { tenantId: profile.id },
        orderBy: { createdAt: 'desc' }
    });

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold">Mis Incidencias</h1>
                <p className="text-muted-foreground">Contacta con el casero si tienes problemas.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4 order-2 md:order-1">
                    <h3 className="font-semibold text-lg">Historial</h3>
                    {messages.map((msg) => (
                        <Card key={msg.id} className="p-4">
                            <div className="flex justify-between mb-2">
                                <Badge variant={msg.status === 'OPEN' ? 'warning' : 'secondary'}>{msg.status}</Badge>
                                <span className="text-xs text-muted-foreground">{msg.createdAt.toLocaleDateString()}</span>
                            </div>
                            <p className="text-sm mb-3">{msg.content}</p>
                            {msg.adminReply && (
                                <div className="bg-muted p-3 rounded text-sm border-l-2 border-primary">
                                    <span className="font-bold text-xs block mb-1">Respuesta:</span>
                                    {msg.adminReply}
                                </div>
                            )}
                        </Card>
                    ))}
                    {messages.length === 0 && <p className="text-muted-foreground italic">No has enviado mensajes.</p>}
                </div>

                <Card className="p-6 h-fit order-1 md:order-2">
                    <h3 className="font-semibold text-lg mb-4">Nueva Incidencia</h3>
                    <form action={createMessage} className="space-y-4">
                        <textarea
                            name="content"
                            className="w-full min-h-[120px] rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                            placeholder="Describe tu problema o consulta..."
                            required
                        />
                        <Button type="submit" className="w-full gap-2">
                            <MessageSquare size={16} /> Enviar Mensaje
                        </Button>
                    </form>
                </Card>
            </div>
        </div>
    );
}
