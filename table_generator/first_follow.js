const fs = require('fs');


const filePath = process.argv[2];
if (!filePath) {
  console.error("Usage: node main.js <path_to_json_file>");
  process.exit(1);
}

const jsonData = fs.readFileSync(filePath, 'utf-8');

const parsedData = JSON.parse(jsonData);

const firstFollowSet = parsedData.first_follow_set;

if (!firstFollowSet) {
  console.error("Error: 'first_follow_set must be defined")
  process.exit(1);
}

print_latex_table(firstFollowSet);

function print_latex_table(firstFollowSet) {
  console.log("\\begin{tabular}{cccc}");
  console.log("\\toprule");
  console.log("Symbol & First Set & Follow set & Nullable\\\\");
  console.log("\\midrule");



  for (const symbol in firstFollowSet) {
    if (firstFollowSet.hasOwnProperty(symbol)) {
      const firstSet = firstFollowSet[symbol].first.join(", ");
      const followSet = firstFollowSet[symbol].follow.join(", ");
      console.log(`$${symbol}$ & $${firstSet}$ &  $${followSet}$ & ${firstFollowSet[symbol].nullable ? "yes" : "no"}  \\\\`);
    }
  }

  console.log("\\bottomrule");
  console.log("\\end{tabular}");
}
