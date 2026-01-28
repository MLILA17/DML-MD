const middleware = require("../../utility/botUtil/middleware");
module.exports = async _0x4dc5e7 => {
  await middleware(_0x4dc5e7, async () => {
    const {
      client: _0x5377ad,
      m: _0x4ac4f8,
      args: _0x2a9e6b,
      participants: _0x38d862,
      mycode: _0x5b3bed
    } = _0x4dc5e7;
    let _0x2f8982 = _0x38d862.filter(_0x3c9d8b => !_0x3c9d8b.admin).map(_0x1db3fb => _0x1db3fb.id).filter(_0x475052 => !_0x475052.startsWith(_0x5b3bed) && _0x475052 != _0x5377ad.decodeJid(_0x5377ad.user.id));
    if (!_0x2a9e6b || !_0x2a9e6b[0]) {
      if (_0x2f8982.length == 0) {
        return _0x4ac4f8.reply("No foreigners detected.");
      }
      let _0x2d7d67 = "Foreigners are members whose country code is not " + _0x5b3bed + ". The following " + _0x2f8982.length + " foreigners were found:- \n";
      for (let _0x28761c of _0x2f8982) {
        _0x2d7d67 += "🚫 @" + _0x28761c.split("@")[0] + "\n";
      }
      _0x2d7d67 += "\nTo remove them send .foreigners -x";
      _0x5377ad.sendMessage(_0x4ac4f8.chat, {
        text: _0x2d7d67,
        mentions: _0x2f8982
      }, {
        quoted: _0x4ac4f8
      });
    } else if (_0x2a9e6b[0] == "-x") {
      setTimeout(() => {
        _0x5377ad.sendMessage(_0x4ac4f8.chat, {
          text: "Toxic will now remove all " + _0x2f8982.length + " foreigners from this group chat in the next second.\n\nGood bye Foreigners. 🥲"
        }, {
          quoted: _0x4ac4f8
        });
        setTimeout(() => {
          _0x5377ad.groupParticipantsUpdate(_0x4ac4f8.chat, _0x2f8982, "remove");
          setTimeout(() => {
            _0x4ac4f8.reply("✅ Done. All foreigners removed.");
          }, 1000);
        }, 1000);
      }, 1000);
    }
  });
};