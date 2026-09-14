import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { clsx } from 'clsx';
import { sounds } from '../../utils/audio';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  maxWidth = 'md'
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const widthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-2xl'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity" 
        onClick={() => {
          sounds.playClick(400);
          onClose();
        }} 
      />

      {/* Modal Dialog */}
      <div
        className={clsx(
          'relative w-full rounded-md shadow-2xl z-10 overflow-hidden flex flex-col',
          'dark:bg-[#0E1511] bg-white',
          'panel-border border-crt-green/30 dark:border-crt-green/30',
          widthClasses[maxWidth]
        )}
      >
        {/* Terminal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b dark:border-crt-panelBorder dark:bg-[#070D0A] bg-slate-50">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-crt-green dark:shadow-[0_0_6px_#39FF88]" />
            <h3 className="font-mono text-sm font-semibold tracking-wider text-slate-800 dark:text-crt-textBright uppercase">
              {title}
            </h3>
          </div>
          <button
            onClick={() => {
              sounds.playClick(400);
              onClose();
            }}
            className="p-1 rounded text-slate-400 hover:text-slate-200 dark:hover:text-crt-green hover:bg-white/5 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto max-h-[75vh]">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-3 px-5 py-3.5 border-t dark:border-crt-panelBorder/70 dark:bg-[#070D0A] bg-slate-50">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
