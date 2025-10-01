const fs = require('fs');


const filePath = process.argv[2];
if (!filePath) {
  console.error("Usage: node main.js <path_to_json_file>");
  process.exit(1);
}

const jsonData = fs.readFileSync(filePath, 'utf-8');

const parsedData = JSON.parse(jsonData);

const reductions = parsedData.reductions;
const transformReductions = parsedData.format.transform_reductions || {};

if (!reductions) {
  console.error("Error: 'first_follow_set must be defined")
  process.exit(1);
}

print_latex_align(reductions);

function print_latex_align(reductions) {


  let transformedReductions = {}
  for (reduction_name of Object.keys(reductions)) {
    transformedReductions[transformReductions[reduction_name] || reduction_name] = reductions[reduction_name]
  }
  const sorted_reductions = Object.keys(transformedReductions).sort((a, b) => parseInt(a.slice(1), 10) - parseInt(b.slice(1), 10))

  console.log("\\begin{align*}");
  sorted_reductions.forEach((reduction_name) => {
    if (reductions.hasOwnProperty(reduction_name)) {

      const curr_reduction = transformedReductions[reduction_name];
      console.log(`${reduction_name.toUpperCase()} : &\\; ${curr_reduction.driver} \\rightarrow ${curr_reduction.body} \\\\`)
    }
  })
  console.log("\\end{align*}");
}
