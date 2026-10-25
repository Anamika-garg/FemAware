import ChatPage from '../chat/ChatPage';
import SeniorPageShell from './SeniorPageShell';

const SeniorChat = () => (
  <SeniorPageShell>
    <ChatPage stageHint="senior" />
  </SeniorPageShell>
);

export default SeniorChat;
