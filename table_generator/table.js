const fs = require('fs');


const filePath = process.argv[2];
const prune = process.argv[3] == "--pruned";

if (!filePath) {
  console.error("Usage: node main.js <path_to_json_file>");
  process.exit(1);
}

const jsonData = fs.readFileSync(filePath, 'utf-8');

const parsedData = JSON.parse(jsonData);

if (!parsedData.format.column_order) {
  console.error("Error: 'format.column_order' must be defined")
  process.exit(1);
}

if (!parsedData.parsing_table) {
  console.error("Error: 'parsing_table must be defined")
  process.exit(1);
}

const transformReductions = parsedData.format.transform_reductions || {};
const transformStates = parsedData.format.transform_states || {};
const parsingTable = parsedData.parsing_table;

print_latex_table(get_table_lines());

function get_table_lines() {

  let rv = {};
  for (const state in parsingTable) {
    if (parsingTable.hasOwnProperty(state)) {
      const row = parsingTable[state];
      let rowActions = [];

      // console.log(row)
      for (const column of parsedData.format.column_order) {
        // console.log(column)
        // console.log(row[column])
        if (row[column] !== undefined) {
          const cellActions = []
          for (const action of row[column]) {
            // console.log(action)
            // console.log(transformReductions[action])

            // REDUCTION
            if (/^r\d+$/.test(action)) {

              if (prune) {
                const driverFollows = parsedData.first_follow_set[parsedData.reductions[action].driver].follow;
                if (driverFollows.includes(column))
                  cellActions.push(transformReductions[action] || transformStates[action] || action);
              }
              else
                cellActions.push(transformReductions[action] || transformStates[action] || action);
            }

            // GOTO
            else if (/^\d+$/.test(action)) {
              cellActions.push(transformStates[`s${action}`].substring(1) || action);
            }

            // SHIFT
            else {
              cellActions.push(transformReductions[action] || transformStates[action] || action);
            }

          }
          rowActions.push(cellActions.join("/"));
        }
        else {
          rowActions.push(' ');
        }

      }


      rv[transformStates[state] || state] = rowActions
      // console.log(rowActions)
      // console.log(rowActions.join(' & '));

    }
  }
  // console.log(rv)
  return rv
}

function print_latex_table(table_lines) {
  let sortedKeys = Object.keys(table_lines).sort((a, b) => parseInt(a.slice(1), 10) - parseInt(b.slice(1), 10))

  console.log(`\\begin{tabular}{${'c'.repeat(parsedData.format.column_order.length + 1)}}`);
  console.log(`\\toprule`);

  let rowString = parsedData.format.column_order.join(' & ');
  console.log("States & " + rowString + "\\\\");
  console.log(`\\midrule`);

  for (let i = 0; i < sortedKeys.length; i++) {
    let rowString = table_lines[sortedKeys[i]].join(' & ');
    console.log(sortedKeys[i] + " & " + rowString + "\\\\");
  }

  console.log(`\\bottomrule`);
  console.log(`\\end{tabular}`);
}

