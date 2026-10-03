'use client';

import React from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useInstallPrompt } from '@/context/InstallPromptContext';
import {
  Smartphone,
  Share,
  PlusSquare,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Download,
  Info,
} from 'lucide-react';

export const InstallAppModal: React.FC = () => {
  const {
    isInstalled,
    isIOS,
    canPromptNative,
    isInstallModalOpen,
    closeInstallModal,
    promptInstall,
  } = useInstallPrompt();

  return (
    <Modal
      isOpen={isInstallModalOpen}
      onClose={closeInstallModal}
      title="Install Oviare on Your Device"
      maxWidth="md"
    >
      <div className="space-y-4 py-1">
        <p className="text-xs text-oviareText-secondary">
          Experience Oviare like a native mobile app with fast launch and background rhythm reminders.
        </p>
        {isInstalled ? (
          <div className="p-6 text-center space-y-3 bg-ivory-50 rounded-2xl border border-oviareBorder">
            <div className="w-12 h-12 rounded-full bg-sage/10 text-sage flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h3 className="font-serif text-lg font-medium text-oviareText-primary">
              App Already Installed
            </h3>
            <p className="text-xs text-oviareText-secondary max-w-sm mx-auto leading-relaxed">
              Oviare is already running in standalone mode on this device. You have full access to background rhythm reminders and fast launch.
            </p>
            <div className="pt-2">
              <Button variant="outline" size="sm" onClick={closeInstallModal}>
                Close
              </Button>
            </div>
          </div>
        ) : isIOS ? (
          /* iOS Safari Installation Guide */
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-mauve/25 border border-mauve/50 text-xs text-oviareText-primary space-y-1">
              <div className="flex items-center gap-1.5 font-medium text-plum">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Apple iOS Home Screen Installation</span>
              </div>
              <p className="text-[11px] text-oviareText-secondary leading-relaxed">
                Safari on iPhone and iPad does not support automatic one-click installation, but you can easily add Oviare to your Home Screen in 3 quick steps:
              </p>
            </div>

            <div className="space-y-2.5">
              {/* Step 1 */}
              <div className="flex items-start gap-3 p-3 rounded-xl border border-oviareBorder bg-white">
                <div className="w-7 h-7 rounded-lg bg-plum/10 text-plum font-semibold text-xs flex items-center justify-center shrink-0">
                  1
                </div>
                <div className="text-xs space-y-0.5">
                  <span className="font-medium text-oviareText-primary block">
                    Tap the Share button in Safari
                  </span>
                  <span className="text-[11px] text-oviareText-secondary flex items-center gap-1">
                    Tap the <Share className="w-3.5 h-3.5 text-plum inline" /> icon at the bottom of your screen.
                  </span>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex items-start gap-3 p-3 rounded-xl border border-oviareBorder bg-white">
                <div className="w-7 h-7 rounded-lg bg-plum/10 text-plum font-semibold text-xs flex items-center justify-center shrink-0">
                  2
                </div>
                <div className="text-xs space-y-0.5">
                  <span className="font-medium text-oviareText-primary block">
                    Select &ldquo;Add to Home Screen&rdquo;
                  </span>
                  <span className="text-[11px] text-oviareText-secondary flex items-center gap-1">
                    Scroll down the share sheet and tap <PlusSquare className="w-3.5 h-3.5 text-sage inline" /> <strong>Add to Home Screen</strong>.
                  </span>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex items-start gap-3 p-3 rounded-xl border border-oviareBorder bg-white">
                <div className="w-7 h-7 rounded-lg bg-plum/10 text-plum font-semibold text-xs flex items-center justify-center shrink-0">
                  3
                </div>
                <div className="text-xs space-y-0.5">
                  <span className="font-medium text-oviareText-primary block">
                    Tap &ldquo;Add&rdquo; & Launch from Home Screen
                  </span>
                  <span className="text-[11px] text-oviareText-secondary">
                    Tap <strong>Add</strong> in the top right. Then tap the Oviare icon on your Home Screen to unlock standalone mode and full Web Push support!
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <Button variant="primary" size="sm" onClick={closeInstallModal}>
                Got it, Thanks!
              </Button>
            </div>
          </div>
        ) : (
          /* Android / Chrome / Edge / Desktop */
          <div className="space-y-4">
            <div className="p-4 rounded-xl border border-oviareBorder bg-white space-y-3 text-center">
              <div className="w-12 h-12 rounded-2xl bg-mauve/40 text-plum flex items-center justify-center mx-auto shadow-sm">
                <Smartphone className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-semibold text-oviareText-primary">
                  1-Click Direct Installation
                </h4>
                <p className="text-xs text-oviareText-secondary max-w-sm mx-auto">
                  Install Oviare directly on your home screen or desktop without using an app store. Takes less than 1 MB.
                </p>
              </div>

              {canPromptNative ? (
                <div className="pt-1">
                  <Button
                    variant="primary"
                    size="md"
                    className="w-full justify-center shadow-md"
                    onClick={promptInstall}
                    leftIcon={<Download className="w-4 h-4" />}
                  >
                    Install Oviare Now
                  </Button>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-ivory-100 border border-oviareBorder text-left space-y-1 text-xs">
                  <p className="font-medium text-oviareText-primary">
                    Manual Installation:
                  </p>
                  <p className="text-[11px] text-oviareText-secondary">
                    Tap your browser menu (<strong>⋮</strong> or <strong>⋯</strong>) and select <strong>&ldquo;Install app&rdquo;</strong> or <strong>&ldquo;Add to Home screen&rdquo;</strong>.
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between text-xs text-oviareText-secondary pt-1">
              <span className="flex items-center gap-1 text-[11px]">
                <Info className="w-3.5 h-3.5 text-sage" /> Zero app store tracking
              </span>
              <Button variant="ghost" size="sm" onClick={closeInstallModal}>
                Close
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
