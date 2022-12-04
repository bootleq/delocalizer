import React from 'react';
import { createRoot } from 'react-dom/client';

import { getBrowserInfo } from './utils';
import OptionsPage from './components/OptionsPage';

const container = document.getElementById('root');
const root = createRoot(container);
root.render(<OptionsPage />);

getBrowserInfo().then(({name}) => name && document.documentElement.classList.add(name.toLowerCase()));
