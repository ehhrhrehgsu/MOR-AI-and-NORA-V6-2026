module.exports = {
  config: {
    name: 'goodbye',
    description: 'Say goodbye to members who leave',
    eventType: ['log:unsubscribe']
  },
  async run({ api, event }) {
    const { threadID, logMessageData } = event;
    if (!logMessageData) return;
    const name = logMessageData.leftParticipantFbId ? 'A member' : 'Someone';
    api.sendMessage(`👋 ${name} has left the group. Goodbye!`, threadID);
  }
};
