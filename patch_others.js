const fs = require('fs');

function addUseTranslation(path, isModal = false) {
  let content = fs.readFileSync(path, 'utf8');
  if (content.includes('useTranslation')) return content;
  
  content = content.replace(
    'import { formatCurrency } from "../../../lib/utils";',
    'import { formatCurrency } from "../../../lib/utils";\nimport { useTranslation } from "../../../hooks/use-translation";'
  );
  content = content.replace(
    'import { useAuthStore } from "../../../store/auth-store";',
    'import { useAuthStore } from "../../../store/auth-store";\nimport { useTranslation } from "../../../hooks/use-translation";'
  );

  // Fallback imports
  if (!content.includes('useTranslation')) {
    content = content.replace(
      'import { useForm } from "react-hook-form";',
      'import { useForm } from "react-hook-form";\nimport { useTranslation } from "../../../hooks/use-translation";'
    );
  }

  // Adding the hook
  if (isModal) {
    content = content.replace('  const { user } = useAuthStore();', '  const { user } = useAuthStore();\n  const { t } = useTranslation();');
    if (!content.includes('const { t } = useTranslation()')) {
        content = content.replace('  const [loading, setLoading] = useState(false);', '  const [loading, setLoading] = useState(false);\n  const { t } = useTranslation();');
    }
  } else {
    content = content.replace(') {', ') {\n  const { t } = useTranslation();');
  }

  return content;
}

function replaceFile(path, replacements, isModal = false) {
  let content = addUseTranslation(path, isModal);
  let original = content;

  for (const [find, replace] of replacements) {
    content = content.split(find).join(replace);
  }
  
  fs.writeFileSync(path, content);
  console.log('Patched ' + path);
}

replaceFile('features/marketplace-settlements/components/customer-summary-panel.tsx', [
  ['"Customer Summary"', 't("marketplace.settlement.customerSummary.title")'],
  ['"Aggregated from matched settlement lines."', 't("marketplace.settlement.customerSummary.subtitle")'],
  ['"Customer"', 't("marketplace.settlement.customerSummary.customer")'],
  ['"Unlinked Historical Order"', 't("marketplace.settlement.customerSummary.unlinked")'],
  ['"Total Matched Orders"', 't("marketplace.settlement.customerSummary.totalOrders")'],
  ['"Gross Contribution"', 't("marketplace.settlement.customerSummary.gross")'],
  ['"Net Contribution"', 't("marketplace.settlement.customerSummary.net")'],
]);

replaceFile('features/marketplace-settlements/components/allocation-snapshot-section.tsx', [
  ['"Allocation Snapshot"', 't("marketplace.settlement.allocation.title")'],
  ['"Historical snapshot of order allocation amounts. Read-only."', 't("marketplace.settlement.allocation.subtitle")'],
  ['"Order Code"', 't("marketplace.settlement.allocation.orderCode")'],
  ['"Customer Info"', 't("marketplace.settlement.allocation.customerInfo")'],
  ['"Gross"', 't("marketplace.settlement.allocation.gross")'],
  ['"Fees & Pen."', 't("marketplace.settlement.allocation.fees")'],
  ['"Refund"', 't("marketplace.settlement.allocation.refund")'],
  ['"Tax"', 't("marketplace.settlement.allocation.tax")'],
  ['"Net"', 't("marketplace.settlement.allocation.net")'],
]);

replaceFile('features/marketplace-settlements/components/settlement-lines-table.tsx', [
  ['"No lines added to this settlement yet."', 't("marketplace.settlement.lines.empty")'],
  ['"Order / Trans Ref"', 't("marketplace.settlement.lines.orderRef")'],
  ['"Type & Dir"', 't("marketplace.settlement.lines.typeDir")'],
  ['"Description"', 't("marketplace.settlement.lines.desc")'],
  ['"Amount"', 't("marketplace.settlement.lines.amount")'],
  ['"Match"', 't("marketplace.settlement.lines.match")'],
  ['"Status"', 't("marketplace.settlement.lines.status")'],
  ['"Action"', 't("marketplace.settlement.lines.action")'],
  ['"Manual Match"', 't("marketplace.settlement.lines.btnManualMatch")'],
]);

replaceFile('features/marketplace-settlements/components/add-settlement-lines-modal.tsx', [
  ['"Add Settlement Lines"', 't("marketplace.settlement.addLines.title")'],
  ['"Ext Order ID"', 't("marketplace.settlement.addLines.extOrder")'],
  ['"Ext Trans ID"', 't("marketplace.settlement.addLines.extTrans")'],
  ['"Type"', 't("marketplace.settlement.addLines.type")'],
  ['"Direction"', 't("marketplace.settlement.addLines.direction")'],
  ['"Amount"', 't("marketplace.settlement.addLines.amount")'],
  ['"Description"', 't("marketplace.settlement.addLines.desc")'],
  ['"Customer Name"', 't("marketplace.settlement.addLines.custName")'],
  ['"Customer Phone"', 't("marketplace.settlement.addLines.custPhone")'],
  ['"Add Row"', 't("marketplace.settlement.addLines.btnAddRow")'],
  ['"Cancel"', 't("marketplace.settlement.addLines.btnCancel")'],
  ['"Save Lines"', 't("marketplace.settlement.addLines.btnSave")'],
], true);

replaceFile('features/marketplace-settlements/components/manual-match-modal.tsx', [
  ['"Manual Match Line"', 't("marketplace.settlement.manualMatch.title")'],
  ['"Sales Order ID"', 't("marketplace.settlement.manualMatch.salesOrderId")'],
  ['"Provide the exact internal ID of the Sales Order to match."', 't("marketplace.settlement.manualMatch.salesOrderIdHint")'],
  ['"Notes (Optional)"', 't("marketplace.settlement.manualMatch.notes")'],
  ['"Reason for manual matching..."', 't("marketplace.settlement.manualMatch.notesHint")'],
  ['"Cancel"', 't("marketplace.settlement.manualMatch.btnCancel")'],
  ['"Confirm Match"', 't("marketplace.settlement.manualMatch.btnConfirm")'],
], true);
