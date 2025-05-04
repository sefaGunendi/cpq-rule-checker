// checkRules.js

const fs = require('fs');
const xml2js = require('xml2js');

const filePath = process.argv[2]; // Chemin du fichier XML à vérifier

if (!filePath) {
  console.error('❌ Veuillez fournir le chemin d\'un fichier XML à analyser.');
  process.exit(1);
}

// Vérifie que le nom de la règle suit la convention QOP_
function isValidRuleName(name) {
  return /^QOP_[A-Z0-9_]+$/.test(name);
}

fs.readFile(filePath, (err, data) => {
  if (err) {
    console.error('❌ Erreur de lecture du fichier XML :', err.message);
    process.exit(1);
  }

  xml2js.parseString(data, (err, result) => {
    if (err) {
      console.error('❌ Erreur de parsing XML :', err.message);
      process.exit(1);
    }

    const rules = result?.CPQRuleSet?.Rule || [];

    if (rules.length === 0) {
      console.log('⚠️ Aucun élément <Rule> trouvé dans le fichier XML.');
      return;
    }

    let hasError = false;

    rules.forEach((rule, index) => {
      const ruleName = rule?.$?.name || '(nom manquant)';
      const comment = rule?.Comment?.[0]?.trim() || '';

      if (!isValidRuleName(ruleName)) {
        console.error(`❌ Règle #${index + 1} - "${ruleName}" : nom invalide (doit commencer par QOP_ en majuscules)`);
        hasError = true;
      }

      if (comment === '') {
        console.warn(`⚠️ Règle #${index + 1} - "${ruleName}" : aucun commentaire fourni`);
        hasError = true;
      }
    });

    if (!hasError) {
      console.log('✅ Toutes les règles sont conformes à la convention.');
    } else {
      process.exit(1); // Renvoie une erreur pour GitHub Actions
    }
  });
});
