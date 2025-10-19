import React from 'react';
import { PolotnoContainer, SidePanelWrap, WorkspaceWrap } from 'polotno';
import { Toolbar } from 'polotno/toolbar/toolbar';
import { ZoomButtons } from 'polotno/toolbar/zoom-buttons';
import { SidePanel } from 'polotno/side-panel';
import { Workspace } from 'polotno/canvas/workspace';
import { createStore } from 'polotno/model/store';

// Import Blueprint CSS
import '@blueprintjs/core/lib/css/blueprint.css';

// Create store
const store = createStore({
  key: 'nFA5H9elEytDyPyvKL7T', // Public free key
  showCredit: true
});

// Add initial page
store.addPage();

function PolotnoTest() {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <PolotnoContainer style={{ width: '100%', height: '100%' }}>
        <SidePanelWrap>
          <SidePanel store={store} />
        </SidePanelWrap>
        <WorkspaceWrap>
          <Toolbar store={store} />
          <Workspace store={store} />
          <ZoomButtons store={store} />
        </WorkspaceWrap>
      </PolotnoContainer>
    </div>
  );
}

export default PolotnoTest;
