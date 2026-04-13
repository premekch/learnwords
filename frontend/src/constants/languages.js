export const LANGUAGES = [
  { name: 'Čeština',     flag: '🇨🇿' },
  { name: 'Angličtina',  flag: '🇬🇧' },
  { name: 'Němčina',     flag: '🇩🇪' },
  { name: 'Španělština', flag: '🇪🇸' },
];

/** Returns "🇨🇿 Čeština" for a stored language name */
export const displayLanguage = (name) => {
  const lang = LANGUAGES.find((l) => l.name === name);
  return lang ? `${lang.flag} ${lang.name}` : name;
};
