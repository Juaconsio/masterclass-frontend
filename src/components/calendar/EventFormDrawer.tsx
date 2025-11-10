import { forwardRef, useImperativeHandle, useRef, useState, useId } from 'react';
import Drawer from '@components/UI/Drawer';
import EventForm from './EventForm';
import type { DrawerRef } from '@components/UI/Drawer';
import type { EventFormValues } from '@interfaces/events/IEvent';

export interface EventFormDrawerRef {
  open: () => void;
  close: () => void;
}

interface EventFormDrawerProps {
  title?: string;
  initialValues?: EventFormValues;
  onSubmit: (values: EventFormValues) => void | Promise<void>;
  submitLabel?: string;
  onClose?: () => void;
}

const EventFormDrawer = forwardRef<EventFormDrawerRef, EventFormDrawerProps>(
  ({ title = 'Crear Evento', initialValues, onSubmit, submitLabel = 'Guardar', onClose }, ref) => {
    const drawerRef = useRef<DrawerRef>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [canSubmit, setCanSubmit] = useState(false);
    const formId = useId();

    useImperativeHandle(ref, () => ({
      open: () => drawerRef.current?.open(),
      close: () => drawerRef.current?.close(),
    }));

    const handleSubmit = async (values: EventFormValues) => {
      setIsSubmitting(true);
      try {
        await onSubmit(values);
        drawerRef.current?.close();
      } catch (error) {
        // El error se maneja en EventForm
        console.error('Error submitting form:', error);
      } finally {
        setIsSubmitting(false);
      }
    };

    const handleCancel = () => {
      drawerRef.current?.close();
    };

    return (
      <Drawer
        ref={drawerRef}
        title={title}
        width="xl"
        side="right"
        onClose={onClose}
        actions={[
          {
            label: submitLabel,
            onClick: () => {
              // Trigger form submission via form attribute
              const formElement = document.getElementById(formId) as HTMLFormElement;
              formElement?.requestSubmit();
            },
            variant: 'primary',
            loading: isSubmitting,
            disabled: isSubmitting || !canSubmit,
          },
          {
            label: 'Cancelar',
            onClick: handleCancel,
            variant: 'ghost',
            disabled: isSubmitting,
          },
        ]}
      >
        <EventForm
          formId={formId}
          initialValues={initialValues}
          onSubmit={handleSubmit}
          submitLabel={submitLabel}
          onCancel={handleCancel}
          showActions={false}
          onDataStateChange={({ ready }) => setCanSubmit(ready)}
        />
      </Drawer>
    );
  }
);

EventFormDrawer.displayName = 'EventFormDrawer';

export default EventFormDrawer;
