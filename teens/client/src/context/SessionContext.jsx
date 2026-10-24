import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../lib/api';
import { clearProfile, loadProfile, saveProfile } from '../lib/profile';

const SessionContext = createContext(null);

export function SessionProvider({ children }) {
  const [session, setSession] = useState(null);
  const [status, setStatus] = useState('loading'); // loading | active | none
  const [profile, setProfileState] = useState(() => loadProfile());

  const refresh = useCallback(async () => {
    try {
      const data = await api.session.get();
      setSession(data.session);
      setStatus('active');
    } catch {
      setSession(null);
      setStatus('none');
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const start = useCallback(async ({ withDemoData = false } = {}) => {
    const data = await api.session.start();
    if (withDemoData) await api.session.loadDemoData();
    setSession(data.session);
    setStatus('active');
  }, []);

  const setProfile = useCallback((next) => {
    saveProfile(next);
    setProfileState(next);
  }, []);

  const deleteEverything = useCallback(async () => {
    if (status === 'active') await api.session.deleteAll();
    clearProfile();
    setProfileState(null);
    setSession(null);
    setStatus('none');
  }, [status]);

  const value = useMemo(
    () => ({ session, status, profile, start, refresh, setProfile, deleteEverything }),
    [session, status, profile, start, refresh, setProfile, deleteEverything],
  );
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession must be used inside <SessionProvider>');
  return ctx;
}
