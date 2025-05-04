import xml.etree.ElementTree as ET
import sys
import os

def check_rule_naming(file_path):
    try:
        tree = ET.parse(file_path)
        root = tree.getroot()

        errors = []
        for rule in root.findall(".//Rule"):
            rule_name = rule.get("name")
            if rule_name:
                if not rule_name.startswith("QOP_"):
                    errors.append(f"Nom invalide : {rule_name}")
            else:
                errors.append("Règle sans nom détectée")

        return errors
    except Exception as e:
        return [f"Erreur lors de l’analyse XML : {str(e)}"]

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Utilisation : python check_rules.py <fichier.xml>")
        sys.exit(1)

    file_path = sys.argv[1]

    if not os.path.exists(file_path):
        print(f"Fichier introuvable : {file_path}")
        sys.exit(1)

    result = check_rule_naming(file_path)
    if result:
        print("❌ Erreurs détectées :")
        for err in result:
            print("-", err)
        sys.exit(1)
    else:
        print("✅ Aucune erreur détectée.")
