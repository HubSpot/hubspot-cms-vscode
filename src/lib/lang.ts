const { setLangData } = require('@hubspot/cli-lib/lib/lang.js');
import languageObj from './../lang/en.lyaml';

export const initializeCliLibLang = () => {
  setLangData('en', languageObj);
};
