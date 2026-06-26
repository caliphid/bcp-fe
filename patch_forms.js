const fs = require('fs');

function replaceFile(path, replacements) {
  let content = fs.readFileSync(path, 'utf8');
  let original = content;
  
  if (!content.includes('useTranslation')) {
    content = content.replace(
      'import { useForm } from "react-hook-form";',
      'import { useForm } from "react-hook-form";\nimport { useTranslation } from "../../../hooks/use-translation";'
    );
  }
  
  // Add const { t } = useTranslation();
  if (!content.includes('const { t } = useTranslation()')) {
    content = content.replace(
      '  const router = useRouter();',
      '  const router = useRouter();\n  const { t } = useTranslation();'
    );
  }

  for (const [find, replace] of replacements) {
    content = content.split(find).join(replace);
  }
  
  if (original !== content) {
    fs.writeFileSync(path, content);
    console.log('Patched ' + path);
  }
}

replaceFile('features/marketplace-accounts/components/marketplace-account-form.tsx', [
  ['"Account Name"', 't("marketplace.account.form.name")'],
  ['"Marketplace Type"', 't("marketplace.account.form.type")'],
  ['"Business Unit"', 't("marketplace.account.form.businessUnit")'],
  ['"Settlement Account (Bank/Kas)"', 't("marketplace.account.form.settlementAccount")'],
  ['"Settlement Clearing Category"', 't("marketplace.account.form.clearingCategory")'],
  ['"Commission Category"', 't("marketplace.account.form.commissionCategory")'],
  ['"Shipping Category"', 't("marketplace.account.form.shippingCategory")'],
  ['"Penalty Category"', 't("marketplace.account.form.penaltyCategory")'],
  ['"Refund Category"', 't("marketplace.account.form.refundCategory")'],
  ['"Notes"', 't("marketplace.account.form.notes")'],
  ['"Cancel"', 't("marketplace.account.form.btnCancel")'],
  ['"Save Changes"', 't("marketplace.account.form.btnSave")'],
  ['"Create Account"', 't("marketplace.account.form.btnCreate")']
]);

replaceFile('features/marketplace-settlements/components/marketplace-settlement-form.tsx', [
  ['"Marketplace Account"', 't("marketplace.settlement.form.account")'],
  ['"External Settlement ID"', 't("marketplace.settlement.form.extId")'],
  ['"Business Unit"', 't("marketplace.settlement.form.businessUnit")'],
  ['"Bank Account (Optional)"', 't("marketplace.settlement.form.bankAccount")'],
  ['"Settlement Date"', 't("marketplace.settlement.form.settlementDate")'],
  ['"Payout Date (Optional)"', 't("marketplace.settlement.form.payoutDate")'],
  ['"Period Start (Optional)"', 't("marketplace.settlement.form.periodStart")'],
  ['"Period End (Optional)"', 't("marketplace.settlement.form.periodEnd")'],
  ['"Notes"', 't("marketplace.settlement.form.notes")'],
  ['"Cancel"', 't("marketplace.settlement.form.btnCancel")'],
  ['"Save Changes"', 't("marketplace.settlement.form.btnSave")'],
  ['"Create Settlement"', 't("marketplace.settlement.form.btnCreate")']
]);

