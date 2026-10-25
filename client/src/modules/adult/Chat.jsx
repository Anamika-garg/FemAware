import ChatPage from '../chat/ChatPage';

// The shared chat UI adapts its copy and tone from the server, which derives the
// module from the signed-in account. The hint keeps the first paint accurate.
const Chat = () => <ChatPage stageHint="adult" />;

export default Chat;
