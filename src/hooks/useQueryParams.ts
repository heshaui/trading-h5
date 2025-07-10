import { useLocation } from 'react-router-dom';
import { useMemo } from 'react';

const useQueryParams = (): Record<string, string> => {
  const { search } = useLocation();

  return useMemo(() => {
    const params = new URLSearchParams(search);
    const result: Record<string, string> = {};
    
    for (const [key, value] of params.entries()) {
      result[key] = value;
    }

    return result;
  }, [search]);
};

export default useQueryParams;