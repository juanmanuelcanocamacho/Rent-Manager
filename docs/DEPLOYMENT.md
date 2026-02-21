# Guía de Despliegue y Mantenimiento - Llavia

Este documento resume los pasos necesarios para desplegar nuevas versiones y las lecciones aprendidas durante la configuración del entorno de producción.

## 🚀 Flujo de Despliegue Estándar

Para desplegar cambios en el servidor, el flujo recomendado es:

1.  **En local**: Realizar cambios, probar y subir al repositorio.
    ```bash
    git add .
    git commit -m "Descripción de los cambios"
    git push
    ```
2.  **En el servidor**: Ejecutar el script de despliegue.
    ```bash
    ./scripts/deploy.sh
    ```

---

## 🗄️ Gestión de Base de Datos (Prisma)

Es el punto más crítico. **Nunca** modifiques `schema.prisma` y despliegues sin generar primero la migración en local.

### 1. Generar Migraciones (En Local)
Si añades tablas o cambias campos:
```bash
npx prisma migrate dev --name descripcion_del_cambio
```
Esto genera un archivo `.sql` en `prisma/migrations/`. **Este archivo debe subirse al Git**.

### 2. Reconstruir el Contenedor de Migraciones
Si has añadido nuevos archivos `.sql`, el contenedor `migrate` de Docker necesita ser reconstruido para incluirlos:
```bash
docker compose build --no-cache migrate
```

### 3. Aplicar Migraciones en Producción (SEGURO)
El script `deploy.sh` ejecuta internamente `prisma migrate deploy`. Este comando es **seguro**:
- Solo aplica los cambios nuevos (tablas nuevas, columnas nuevas).
- **NO borra ningún dato** existente.
- Es lo que usarás el 99% de las veces.

```bash
docker compose run --rm migrate
```

### 4. Resetear Base de Datos (SOLO TROUBLESHOOTING)
Si algo falla catastróficamente y la base de datos se queda en un estado inconsistente (como nos pasó hoy), puedes usar el reset. **PRECAUCIÓN**: Esto borra todos los datos.
```bash
docker compose run --rm migrate npx prisma migrate reset --force
```

---

## ⚠️ Lecciones Aprendidas (Troubleshooting)

### Error "Table X does not exist"
*   **Causa**: Se subió el `schema.prisma` pero no los archivos `.sql` de las migraciones, o el contenedor no los leyó.
*   **Solución**: Asegúrate de que `prisma/migrations/` tiene contenido, haz `docker compose build --no-cache migrate` y vuelve a ejecutar la migración.

### Error en Build (Next.js)
*   **Causa**: Desajuste entre el código de las API Routes y el esquema de Prisma (ej: usar un campo `error` cuando en la DB se llama `failed`).
*   **Solución**: Revisa los logs de `docker compose build` para encontrar el archivo exacto con el error de TypeScript.

### Logs del Servidor
Para ver qué está pasando en tiempo real:
```bash
docker compose logs app --tail 50 -f
```

---

## 🔑 Variables de Entorno (.env)
Asegúrate de que estas variables estén siempre configuradas en el servidor:
- `DATABASE_URL`: Conexión interna a Postgre (ej: `postgresql://user:pass@db:5432/db`).
- `NEXTAUTH_SECRET`: Clave para las sesiones.
- `NEXTAUTH_URL`: URL pública de la app.
- `WORKER_SECRET`: Clave para los cronjobs/workers de WhatsApp.
