// checkRules.js

const fs = require('fs');
const xml2js = require('xml2js');

const filePath = process.argv[2]; // ex: node checkRules.js path/to/file.xml

if (!filePath) {
  console.error('Veuillez fournir le chemin du fichier XML en argument.');
  process.exit(1);
}

// Fonction pour vérifier le nommage d'une règle
function isValidRuleName(name) {
  return /^QOP_[A-Z_0-9]+$/.test(name); // exemple de convention
}

fs.readFile(filePath, (err, data) => {
  if (err) {
    console.error('Erreur de lecture du fichier :', err);
    process.exit(1);
  }

  xml2js.parseString(data, (err, result) => {
    if (err) {
      console.error('Erreur de parsing XML :', err);
      process.exit(1);
    }

    const rules = result?.CPQRuleSet?.Rule || [];
    let hasError = false;

    rules.forEach((rule) => {
      const ruleName = rule?.$?.name;
      if (ruleName && !isValidRuleName(ruleName)) {
        console.error(`❌ Règle avec un mauvais nom : ${ruleName}`);
        hasError = true;
      }
    });

    if (!hasError) {
      console.log('✅ Toutes les règles respectent la convention de nommage.');
    } else {
      process.exit(1); // Échec dans GitHub Action
    }
  });
});
