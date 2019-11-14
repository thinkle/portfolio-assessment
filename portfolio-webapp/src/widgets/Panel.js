import makeComponent from './QuickComponents.js';

const Panel = makeComponent(['panel'])
Panel.Block = makeComponent(['panel-block'])
Panel.Tabs = makeComponent(['panel-block'])
Panel.Tab = makeComponent([],'a')
Panel.Tab = makeComponent([],'a')
Panel.Label = makeComponent(['panel-block'],'label');

export default Panel;
