import makeComponent from './QuickComponents.js';
import './Viewport.sass';

const Viewport = makeComponent(['viewport2','top'])
Viewport.Three = makeComponent(['viewport3'])
Viewport.Two = Viewport;
Viewport.Bottom = makeComponent(['viewport2','bottom']);
Viewport.Wrap = makeComponent(['viewWrap'])

export default Viewport;
