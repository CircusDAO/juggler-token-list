const fs = require("fs");
const { resolve } = require("path");
const { ChainId } = require("@circusdao/juggler-sdk");
const { Octokit } = require("@octokit/rest");
const XLSX = require("xlsx");

const octokit = new Octokit();

const NAME = {
  [ChainId.OPTIMISTIC_KOVAN]: "optimistic-kovan",
  [ChainId.OPTIMISTIC_ETHEREUM]: "optimistic-ethereum"
};

(async () => {
  try {
    const book = XLSX.utils.book_new();

    for (const key of Object.keys(ChainId)) {
      const tokenPath = resolve(__dirname, `../tokens/${NAME[key]}.json`);

      if (!fs.existsSync(tokenPath)) {
        continue;
      }

      const tokens = require(tokenPath);

      // Grab file names of the CircusDAO/art/juggler/icons repo at the tokens path
      // we can use this to see if our default list is missing icons
      const { data } = await octokit.rest.repos.getContent({
        owner: "CircusDAO",
        repo: "art",
        path: "juggler/icons/tokens",
      });

      const icons = data.map((data) => data.name.replace(".jpg", ""));
      const json = [];

      for (const token of tokens) {
        const listIcon = icons.find(
          (icon) => icon === token.symbol.toLowerCase()
        );

        // TODO: Check Figma and get icon if available
        const figmaIcon = undefined;
        const icon = listIcon || figmaIcon;

        if ((!token.logoURI && !icon) || !icon) {
          json.push({
            network: NAME[key],
            address: token.address,
            name: token.name,
            symbol: token.symbol,
            logoURI: token?.logoURI || "",
          });
          console.log("Add to list to send to chester");
          continue;
        }

        // Check if logoURI has correct path
        if (!token.logoURI.includes("CircusDAO/art")) {
          // TODO: Automate this part...
          const logoURI = `https://raw.githubusercontent.com/CircusDAO/art/master/juggler/icons/tokens/${icon}.jpg`;
          console.log(`Update Logo URI for ${token.symbol} (${token.chainId}) with ${logoURI}`);
        } else {
          console.log(`Logo URI for ${token.symbol} (${token.chainId}) is correct`);
        }
      }

      const sheet = XLSX.utils.json_to_sheet(json);
      XLSX.utils.book_append_sheet(book, sheet, NAME[key]);
    }

    fs.mkdirSync(__dirname + `/generated`, { recursive: true });

    XLSX.writeFile(book, resolve(__dirname + `/generated/missing-icons.xlsx`));
  } catch (error) {
    console.error(error);
  }
})();
