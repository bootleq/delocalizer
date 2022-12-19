import React, { useRef } from 'react';

import { load as loadConfig } from '../config';
import { translator } from '../utils';

const t = translator('options');

interface Props {
  setBusy: (state: boolean) => boolean,
  setMsg: (msg: object) => object,
  resetConfig: (config: object) => void,
}

const ImportExport = ({setBusy, setMsg, resetConfig}: Props) => {
  const fileRef = useRef();

  async function onExport(e) {
    e.preventDefault();

    const cfg = await loadConfig();
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(cfg)], {type: "aplication/json;charset=utf-8"})
    );

    const a = document.createElement('a');
    document.body.appendChild(a);
    a.download = 'delocalizer-config.json';
    a.href = url;
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function onImportPicker(e) {
    e.preventDefault();
    fileRef.current.click();
  }

  async function onImport(e) {
    e.preventDefault();
    setBusy(true);

    try {
      const json = await e.target.files[0]?.text();
      const config = JSON.parse(json);
      if (Object.keys(config).includes('domainRules')) { // just tiny quick check
        resetConfig(config);
        setMsg({type: 'success', msg: t('_imported')});
      } else {
        setMsg({type: 'error', msg: t('_invalidImport')});
      }
    } catch (e) {
      setMsg({type: 'error', msg: t('_invalid')});
      throw new Error('Import failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className='import-export'>
      <button onClick={onExport}>{t('_export')}</button>
      <button onClick={onImportPicker}>{t('_import')}</button>
      <input id='import-file' ref={fileRef} type='file' accept='.json' onChange={onImport} />
    </div>
  );
};

export default ImportExport;
