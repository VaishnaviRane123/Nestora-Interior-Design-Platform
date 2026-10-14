// app/designers/[id]/request-consultation-button.tsx
'use client';

import { useState } from 'react';
import ConsultationModal from './consultation-modal';

type Props = {
  designerId: string;
  designerName: string;
  designerCity: string;
};

export default function RequestConsultationButton({
  designerId,
  designerName,
  designerCity,
}: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className="btn btn-accent"
        onClick={() => setOpen(true)}
      >
        Request consultation
      </button>
      {open && (
        <ConsultationModal
          designerId={designerId}
          designerName={designerName}
          designerCity={designerCity}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
