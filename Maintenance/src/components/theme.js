import { createTheme } from '@mui/material/styles';

/* ---------------------------------------------------------------------
   SHARED DESIGN SYSTEM — all-light palette, no dark surfaces anywhere
   (including the sidebar). Warm paper background, white cards, and a
   single amber/gold accent for active states and primary actions.
   Maroon is kept only as an occasional heading accent, matching the
   brand color already used across the app.
--------------------------------------------------------------------- */
export const tokens = {
  ink: '#26211B',       // primary text
  muted: '#8A8378',      // secondary text
  paper: '#FAF7F1',      // app background (warm, light)
  card: '#FFFFFF',       // cards / sidebar / surfaces
  line: '#EAE3D6',       // hairline borders
  amber: '#E8992C',      // primary accent
  amberDark: '#C97E1C',  // accent hover/pressed
  amberTint: '#FCEEDC',  // soft accent background (active nav, chips)
  maroon: '#872341',     // heading accent, matches existing brand mark
  steel: '#3E6B89',      // secondary/info accent
  success: '#3F8F5F',
  successTint: '#E7F4EC',
  danger: '#C1443B',
  dangerTint: '#FBEAE8',
};

export const fonts = {
  display: '"Space Grotesk", sans-serif',
  body: '"Inter", "Helvetica Neue", Arial, sans-serif',
  mono: '"JetBrains Mono", monospace',
};

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: tokens.amber, dark: tokens.amberDark, contrastText: '#26211B' },
    secondary: { main: tokens.steel },
    success: { main: tokens.success },
    error: { main: tokens.danger },
    background: { default: tokens.paper, paper: tokens.card },
    text: { primary: tokens.ink, secondary: tokens.muted },
    divider: tokens.line,
  },
  typography: {
    fontFamily: fonts.body,
    h5: { fontFamily: fonts.display, fontWeight: 700 },
    h6: { fontFamily: fonts.display, fontWeight: 700 },
    subtitle1: { fontFamily: fonts.display, fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  shape: { borderRadius: 10 },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: { backgroundColor: tokens.paper },
      },
    },
    MuiPaper: {
      styleOverrides: { root: { backgroundImage: 'none' } },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: { backgroundColor: tokens.card, borderRadius: 10 },
        notchedOutline: { borderColor: tokens.line },
      },
    },
    MuiInputLabel: {
      styleOverrides: { root: { fontFamily: fonts.body } },
    },
    MuiButton: {
      styleOverrides: {
        root: { textTransform: 'none', borderRadius: 10, paddingInline: 20 },
        containedPrimary: {
          boxShadow: 'none',
          '&:hover': { boxShadow: 'none', backgroundColor: tokens.amberDark },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: { root: { fontFamily: fonts.body, borderColor: tokens.line } },
    },
  },
});

// Reusable sx for TextField `select` variants so focus/hover states match the theme.
export const selectSx = {
  '& .MuiOutlinedInput-notchedOutline': { borderColor: tokens.line },
  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: tokens.amberDark },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: tokens.amber, borderWidth: 1.5 },
};  