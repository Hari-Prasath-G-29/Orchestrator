
// PhaseNav.jsx (helper) — optional small component or just paste the function
import { useNavigate } from 'react-router-dom';
import { PHASES } from '../lib/progressStore';

export function usePhaseNavigation(projectId, projectName,country) { //31_03_sanju
  const navigate = useNavigate();

  const gotoPhase = (phaseId) => {
    const phase = PHASES.find(p => p.id === phaseId);
    const route = phase?.route || '/';
    // pass minimal state for UX; hydration will pull from storage
    navigate(route, { state: { projectId, projectName,country } });
  };

  return gotoPhase;
}
