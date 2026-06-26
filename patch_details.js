const fs = require('fs');

function replaceFile(path, replacements) {
  let content = fs.readFileSync(path, 'utf8');
  let original = content;
  
  if (!content.includes('useTranslation')) {
    content = content.replace(
      'import { useAuthStore } from "../../../store/auth-store";',
      'import { useAuthStore } from "../../../store/auth-store";\nimport { useTranslation } from "../../../hooks/use-translation";'
    );
    // for those without authstore
    content = content.replace(
      'import { formatCurrency } from "../../../lib/utils";',
      'import { formatCurrency } from "../../../lib/utils";\nimport { useTranslation } from "../../../hooks/use-translation";'
    );
  }
  
  // Add const { t } = useTranslation();
  if (!content.includes('const { t } = useTranslation()')) {
    content = content.replace(
      '  const { user } = useAuthStore();',
      '  const { user } = useAuthStore();\n  const { t } = useTranslation();'
    );
    // fallback if no authstore inside component
    content = content.replace(
      '({ data, onMutate }: ',
      '({ data, onMutate }: '
    ); // manual regex later if needed
  }

  for (const [find, replace] of replacements) {
    content = content.split(find).join(replace);
  }
  
  if (original !== content) {
    fs.writeFileSync(path, content);
    console.log('Patched ' + path);
  }
}

replaceFile('features/marketplace-settlements/components/marketplace-settlement-detail-view.tsx', [
  ['"Financial Summary"', 't("marketplace.settlement.detail.financialSummary")'],
  ['"Gross Amount"', 't("marketplace.settlement.detail.grossAmount")'],
  ['"Total Fees"', 't("marketplace.settlement.detail.totalFees")'],
  ['"Refund / Penalty"', 't("marketplace.settlement.detail.refundPenalty")'],
  ['"Net Settlement Amount"', 't("marketplace.settlement.detail.netAmount")'],
  ['"Reconciliation Difference"', 't("marketplace.settlement.detail.reconDiff")'],
  ['"Actions"', 't("marketplace.settlement.detail.actions")'],
  ['"Add Lines"', 't("marketplace.settlement.detail.btnAddLines")'],
  ['"Validate"', 't("marketplace.settlement.detail.btnValidate")'],
  ['"Auto Match"', 't("marketplace.settlement.detail.btnAutoMatch")'],
  ['"Mark Ready"', 't("marketplace.settlement.detail.btnMarkReady")'],
  ['"Post to Ledger"', 't("marketplace.settlement.detail.btnPost")'],
  ['"Void Settlement"', 't("marketplace.settlement.detail.btnVoid")'],
  ['Settlement Code</div>', '{t("marketplace.settlement.detail.header.code")}</div>'],
  ['Ext ID</div>', '{t("marketplace.settlement.detail.header.extId")}</div>'],
  ['Account</div>', '{t("marketplace.settlement.detail.header.account")}</div>'],
  ['Settlement Date</div>', '{t("marketplace.settlement.detail.header.date")}</div>'],
  ['Payout Date</div>', '{t("marketplace.settlement.detail.header.payout")}</div>'],
  ['Status</div>', '{t("marketplace.settlement.detail.header.status")}</div>'],
  ['Posting</div>', '{t("marketplace.settlement.detail.header.posting")}</div>'],
  ['TXN</div>', '{t("marketplace.settlement.detail.header.txn")}</div>']
]);

