'use client';

import ChatLauncher from './ChatLauncher';
import ChatModal from './ChatModal';

/**
 * ChatWidget — root export.
 * Drop this anywhere in the layout (outside any stacking context).
 * Requires <ChatProvider> to be an ancestor.
 */
export default function ChatWidget() {
  return (
    <>
      <ChatModal />
      <ChatLauncher />
    </>
  );
}
