const fs = require('fs');
const xml2js = require('xml2js');

const filePath = process.argv[2];

if (!filePath) {
  console.error('❌ Veuillez fournir le chemin d\'un fichier XML.');
  process.exit(1);
}

function isUpperCase(str) {
  return str === str.toUpperCase();
}

function startsWithSOP(str) {
  return str.startsWith("SOP_");
}

// 🔁 Fonction récursive pour trouver toutes les règles de type Variable
function findVariableRulesRecursively(rules) {
  const variables = [];

  function recurse(rules) {
    if (!rules) return;

    rules.forEach(rule => {
      const type = rule?.RuleTypeName?.[0];
      if (type === "Variable") {
        variables.push(rule);
      }

      const children = rule?.Rule;
      if (children) {
        recurse(children);
      }
    });
  }

  recurse(rules);
  return variables;
}

fs.readFile(filePath, (err, data) => {
  if (err) {
    console.error('❌ Erreur de lecture du fichier :', err.message);
    process.exit(1);
  }

  xml2js.parseString(data, { mergeAttrs: true }, (err, result) => {
    if (err) {
      console.error('❌ Erreur de parsing XML :', err.message);
      process.exit(1);
    }

    const ruleset = result?.Ruleset;
    const rulesetName = ruleset?.Name?.[0] || '(non défini)';
    const componentAttributes = ruleset?.ComponentAttributes?.[0]?.ComponentAttribute || [];
    const ruleTreeRules = ruleset?.RuleTree?.[0]?.Rule || [];

    const variableRules = findVariableRulesRecursively(ruleTreeRules);

    let hasError = false;

    // ✅ Vérification 1 : nom du Ruleset
    if (!startsWithSOP(rulesetName)) {
      console.error(`❌ Ruleset principal : le nom "${rulesetName}" ne commence pas par "SOP_"`);
      hasError = true;
    } else {
      console.log(`✅ Ruleset principal : le nom "${rulesetName}" commence bien par "SOP_"`);
    }

    // ✅ Vérification 2 : ComponentAttributes
    console.log(`\n🔍 Vérification des ComponentAttributes (${componentAttributes.length} trouvés) :\n`);

    componentAttributes.forEach((attr, index) => {
      const name = attr?.Name?.[0] || '';
      if (!name) {
        console.error(`❌ ComponentAttribute #${index + 1} : aucun attribut "Name" trouvé.`);
        hasError = true;
        return;
      }

      if (!isUpperCase(name)) {
        console.error(`❌ ComponentAttribute #${index + 1} : Name "${name}" n'est pas en MAJUSCULES`);
        hasError = true;
      } else {
        console.log(`✅ ComponentAttribute #${index + 1} : Name "${name}" en MAJUSCULES`);
      }
    });

    // ✅ Vérification 3 : Variable Rules
    console.log(`\n🔍 Vérification des Rules de type "Variable" (${variableRules.length} trouvées) :\n`);

    variableRules.forEach((rule, index) => {
      const caption = rule?.Caption?.[0]?.trim() || '';
      const ruleIndex = index + 1;

      if (!caption) {
        console.error(`❌ Règle Variable #${ruleIndex} : Caption manquant.`);
        hasError = true;
      } else {
        console.log(`✅ Règle Variable #${ruleIndex} : Caption = "${caption}"`);
      }

      const vars = rule?.vars?.[0]?.var || [];

      if (vars.length > 0) {
        console.log(`✅ Règle Variable #${ruleIndex} : contient ${vars.length} <var>`);
        vars.forEach((variable, i) => {
          const varName = variable?.name?.[0] || '(nom manquant)';
          const varValue = variable?.value?.[0] || '(value manquante)';
          console.log(`   → var[${i + 1}]: name="${varName}", value="${varValue}"`);
        });
      } else {
        console.error(`❌ Règle Variable #${ruleIndex} : aucune balise <var> trouvée.`);
        hasError = true;
      }
    });

    if (!hasError) {
      console.log('\n🎉 Toutes les vérifications sont conformes.');
    } else {
      process.exit(1); // Pour GitHub Actions
    }
  });
});
