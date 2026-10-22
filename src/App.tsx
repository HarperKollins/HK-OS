import React from 'react';
import { Boot } from './shell/Boot';
import { Desktop } from './shell/Desktop';
import { useSystemStore } from './store/systemStore';

const App: React.FC = () => {
  const bootState = useSystemStore(s => s.bootState);
  return bootState === 'booting' ? <Boot /> : <Desktop />;
};

export default App;
