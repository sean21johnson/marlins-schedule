import styled, { createGlobalStyle } from 'styled-components';

export const GlobalStyle = createGlobalStyle`
  *, *::before, *::after {
    box-sizing: border-box;
  }

  :root {
    font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    color-scheme: light;
  }

  body {
    margin: 0;
    background-color: #f8fafc; /* professional neutral */
    color: #111827;
  }

  #root {
    min-height: 100vh;
  }
`;

export const PageWrapper = styled.main`
  width: 100%;
  min-height: 100vh;
  padding: 16px;
  margin: 0 auto;

  @media (min-width: 768px) {
    max-width: 960px;
    padding: 24px 16px 32px;
  }
`;