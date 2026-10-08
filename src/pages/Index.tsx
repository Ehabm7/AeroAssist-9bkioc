import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, initializeAdmin } from '@/lib/auth';

export default function Index() {
  const navigate = useNavigate();

  useEffect(() => {
    initializeAdmin();
    const user = getCurrentUser();
    if (user) {
      navigate(`/${user.role}`, { replace: true });
    } else {
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  return null;
}
