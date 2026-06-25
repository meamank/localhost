import { useColorScheme as useColorSchemeCore } from 'react-native';

export const useColorScheme = () => {
  // TODO: revert to dynamic scheme when done experimenting
  // const coreScheme = useColorSchemeCore();
  // return coreScheme === 'unspecified' ? 'light' : coreScheme;
  return 'light' as const;
};
