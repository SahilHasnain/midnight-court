import { useState } from 'react';
import { pinAuth } from '../utils/pinAuth';

export function useAIFeatureLock() {
  const [showPinModal, setShowPinModal] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);

  const checkAccess = async () => {
    const unlocked = await pinAuth.isUnlocked();
    if (!unlocked) {
      setShowPinModal(true);
      return false;
    }

    setIsUnlocked(true);
    return true;
  };

  const handlePinSuccess = () => {
    setShowPinModal(false);
    setIsUnlocked(true);
  };

  const handlePinCancel = () => {
    setShowPinModal(false);
  };

  return {
    showPinModal,
    isUnlocked,
    checkAccess,
    handlePinSuccess,
    handlePinCancel,
  };
}
