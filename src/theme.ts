import { createSystem, defaultConfig } from '@chakra-ui/react';

const customSystem = createSystem(defaultConfig, {
  theme: {
    tokens: {
      fonts: {
        heading: { value: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' },
        body: { value: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' },
      },
    },
    semanticTokens: {
      colors: {
        bg: {
          DEFAULT: { value: { _light: '{colors.white}', _dark: '{colors.gray.900}' } },
          subtle: { value: { _light: '{colors.gray.50}', _dark: '{colors.gray.800}' } },
          muted: { value: { _light: '{colors.gray.100}', _dark: '{colors.gray.700}' } },
          emphasized: { value: { _light: '{colors.gray.200}', _dark: '{colors.gray.600}' } },
          panel: { value: { _light: '{colors.white}', _dark: '{colors.gray.800}' } },
        },
      },
    },
  },
  globalCss: {
    html: {
      colorPalette: 'teal',
    },
  },
});

export default customSystem;
