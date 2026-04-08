import { useLanguage } from '@/context/language-context';
import { t as translate } from '@/lib/translations';

export const useTranslate = () => {
  const { language } = useLanguage();
  
  const t = (key: string): string => {
    return translate(key, language);
  };

  return { t, language };
};
