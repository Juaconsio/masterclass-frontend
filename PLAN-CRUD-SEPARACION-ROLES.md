# Plan: Separación de Responsabilidades CRUD por Roles

## 🚧 Estado Actual del Refactor

### ✅ Completado
- Backend: Endpoints `/professors/me/slots/*` con validación de ownership
- Backend: Endpoints `/admin/slots/*` sin restricciones
- Backend: Middleware `authorizeProfessorSlot` valida slots propios
- Backend: Auto-inyección de `professorId` desde JWT
- Frontend: Cliente `professorSlotsClient` en `src/client/professor/slots.ts`
- Frontend: Cliente `adminSlotsClient` en `src/client/admin/slots.ts`
- Frontend: `CalendarTemplate` selecciona cliente según rol (`isProfessor`)
- Frontend: `EventForm` recibe `fixedProfessorId` y funciones inyectadas
- Frontend: Profesor no intenta cargar `/admin/professors` (fix 403)

### ⚠️ Problemas Actuales
1. **Endpoints genéricos `/slots/*` aún activos** → PUT/DELETE sin validación de ownership
2. **Student reservations sin endpoints validados** → Falta `/students/me/reservations/:id`
3. **Componentes legacy usando `fetchSlots()`** → Necesitan migración a clientes específicos
4. **Sin tests automatizados** → Permisos no verificados

### ⬜ Pendiente (Priorizado)

#### 1. Student Reservations (CRÍTICO) 🔴
```
Backend:
⬜ POST   /students/me/reservations    - Crear con studentId del JWT
⬜ GET    /students/me/reservations/:id - Solo propias
⬜ DELETE /students/me/reservations/:id - Cancelar propias
⬜ Middleware: authorizeStudentReservation

Frontend:
⬜ src/client/student/reservations.ts - studentReservationsClient
⬜ Actualizar componentes en src/components/reservations/*
```

#### 2. Deprecar Endpoints Genéricos (SEGURIDAD) 🟡
```
Decisión: Convertir a read-only público
✅ GET    /slots       - Mantener (lista pública)
✅ GET    /slots/:id   - Mantener (detalle público)
⬜ PUT    /slots/:id   - ELIMINAR (redirigir a /admin o /professors/me)
⬜ DELETE /slots/:id   - ELIMINAR (redirigir a /admin o /professors/me)
```

#### 3. Migrar Componentes Legacy 🟢
```
⬜ Buscar usos de src/client/slots.ts (cliente genérico)
⬜ Reemplazar con adminSlotsClient o professorSlotsClient
⬜ Marcar src/client/slots.ts como @deprecated
```

#### 4. Testing & Auditoría 🟢
```
Backend:
⬜ Test: Profesor no edita slots de otro profesor
⬜ Test: Profesor no crea slot en curso no asignado
⬜ Test: Admin edita cualquier slot
⬜ Test: Student solo ve/cancela propias reservaciones

Frontend:
⬜ Test: Requests usan endpoints correctos según rol
⬜ Test: Formulario profesor no carga lista de profesores
⬜ Test: Admin ve todos los profesores y cursos
```

---

## 🎯 Próximos Pasos Inmediatos

### Día 1-2: Student Reservations
1. Backend: Crear `src/controllers/student/reservations.student.controller.ts`
2. Backend: Middleware `authorizeStudentReservation`
3. Backend: Rutas en `src/routes/student.ts`
4. Frontend: Cliente `src/client/student/reservations.ts`
5. Frontend: Actualizar componentes de reservaciones

### Día 3: Deprecar Endpoints Genéricos
1. Backend: Eliminar PUT/DELETE de `src/routes/slots.ts`
2. Backend: Mantener GET como público
3. Frontend: Verificar que ningún componente use PUT/DELETE genéricos

### Día 4-5: Testing
1. Tests unitarios de middleware de autorización
2. Tests de integración de endpoints por rol
3. Auditoría manual de flujos completos

---

## 📚 Archivos Clave Modificados

### Backend
- [`src/controllers/professor/slots.professor.controller.ts`](src/controllers/professor/slots.professor.controller.ts) - CRUD profesor
- [`src/controllers/admin/slots.admin.controller.ts`](src/controllers/admin/slots.admin.controller.ts) - CRUD admin
- [`src/middleware/authorizeProfessorSlot.ts`](src/middleware/authorizeProfessorSlot.ts) - Validación ownership
- [`src/routes/admin.ts`](src/routes/admin.ts) - Rutas admin
- [`src/routes/professor/professors.ts`](src/routes/professor/professors.ts) - Rutas profesor

### Frontend
- [`src/client/professor/slots.ts`](src/client/professor/slots.ts) - Cliente profesor
- [`src/client/admin/slots.ts`](src/client/admin/slots.ts) - Cliente admin
- [`src/components/calendar/CalendarTemplate.tsx`](src/components/calendar/CalendarTemplate.tsx) - Inyección de clientes
- [`src/components/calendar/EventForm.tsx`](src/components/calendar/EventForm.tsx) - Props inyectadas