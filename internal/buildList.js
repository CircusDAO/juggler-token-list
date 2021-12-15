const { version } = require("../package.json");

const optimistic_ethereum = require("../tokens/optimistic-ethereum.json");
const optimistic_kovan = require("../tokens/optimistic-kovan.json");

module.exports = function buildList() {
  const parsed = version.split(".");
  return {
    name: "Juggler Token List",
    timestamp: new Date().toISOString(),
    version: {
      major: +parsed[0],
      minor: +parsed[1],
      patch: +parsed[2],
    },
    tags: {},
    logoURI:
      "https://raw.githubusercontent.com/CircusDAO/art/master/juggler/logo/juggler.png",
    keywords: ["juggler", "default"],
    tokens: [
      ...optimistic_ethereum,
      ...optimistic_kovan
    ]
      // sort them by symbol for easy readability
      .sort((t1, t2) => {
        if (t1.chainId === t2.chainId) {
          return t1.symbol.toLowerCase() < t2.symbol.toLowerCase() ? -1 : 1;
        }
        return t1.chainId < t2.chainId ? -1 : 1;
      }),
  };
};
