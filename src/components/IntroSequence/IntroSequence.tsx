import { useEffect, useState } from 'react';

export default function IntroSequence({ onComplete, motionEnabled }: { onComplete: () => void; motionEnabled: boolean }) {
  const [step, setStep] = useState(0);
  useEffect(() => {
    if (!motionEnabled) { onComplete(); return; }
    const steps = [window.setTimeout(() => setStep(1), 350), window.setTimeout(() => setStep(2), 850), window.setTimeout(onComplete, 1450)];
    return () => steps.forEach(window.clearTimeout);
  }, [motionEnabled, onComplete]);
  return <div className="intro" role="dialog" aria-label="DevVerse initialization"><button onClick={onComplete}>Skip intro</button><div className="intro-core"><span>RS</span></div><p>{step === 0 ? 'INITIALIZING DEVVERSE' : step === 1 ? 'LOADING DEVELOPER PROFILE' : 'ALL SYSTEMS ONLINE'}</p><div className="intro-line"><i /></div></div>;
}
