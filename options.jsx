import React from 'react';
import { createRoot } from 'react-dom/client';

import OptionsPage from './components/OptionsPage';

const container = document.getElementById('root');
const root = createRoot(container);
root.render(<OptionsPage />);
