const fs = require('fs');

const en = JSON.parse(fs.readFileSync('lang/en.json', 'utf8'));
const id = JSON.parse(fs.readFileSync('lang/id.json', 'utf8'));

const enStockOpnames = {
  "title": "Stock Opname",
  "subtitle": "Manage and reconcile physical inventory counts",
  "newSession": "New Session",
  "instruction": "Instructions",
  "table": {
    "colSession": "Session",
    "colWarehouse": "Warehouse",
    "colDate": "Date",
    "colScopeMode": "Scope & Mode",
    "colProgress": "Progress",
    "colStatus": "Status",
    "colActions": "Actions",
    "noData": "No stock opname sessions found",
    "variances": "variances"
  },
  "filter": {
    "searchPlaceholder": "Search session code...",
    "warehousePlaceholder": "All Warehouses",
    "statusPlaceholder": "All Statuses",
    "datePlaceholder": "Select Date"
  },
  "create": {
    "title": "New Stock Opname Session",
    "subtitle": "Create a new physical inventory counting session",
    "btnCreate": "Create Session",
    "btnCancel": "Cancel",
    "basicInfo": "Basic Info",
    "sessionName": "Session Name",
    "sessionNamePlaceholder": "e.g. End of Year Count 2026",
    "warehouse": "Warehouse",
    "warehousePlaceholder": "Select a warehouse...",
    "date": "Session Date",
    "scopeMode": "Scope & Mode",
    "scope": "Count Scope",
    "mode": "Count Mode",
    "modeHelpBlind": "Counters won't see system quantities (blind count)",
    "modeHelpVisible": "Counters can see expected system quantities",
    "productSelection": "Product Selection",
    "productSelectionHelp": "Select specific products to count for partial scope",
    "assignments": "Assignments & Options",
    "assignedCounters": "Assigned Counters",
    "assignedCountersPlaceholder": "Select staff...",
    "reviewer": "Reviewer",
    "reviewerPlaceholder": "Select reviewer...",
    "approver": "Approver",
    "approverPlaceholder": "Select approver..."
  },
  "detail": {
    "staleSnapshotTitle": "STALE SNAPSHOT DETECTED",
    "staleSnapshotDesc": "Inventory movements have occurred since this stock opname session was created. The on-hand snapshot is no longer accurate. You must Void or Cancel this session and start a new one.",
    "sessionInfo": "Session Info",
    "sessionCode": "Session Code",
    "sessionDate": "Session Date",
    "scope": "Scope",
    "mode": "Mode",
    "warehouse": "Warehouse",
    "progressSummary": "Progress & Summary",
    "countedItems": "Counted Items",
    "variances": "Variances",
    "accuracy": "Accuracy",
    "tabs": {
      "items": "Items & Counts",
      "variance": "Variance Report",
      "reconciliation": "Reconciliation",
      "audit": "Audit Log"
    },
    "btnCancel": "Cancel Session",
    "btnVoid": "Void Session",
    "btnReview": "Review",
    "btnApprove": "Approve",
    "btnPost": "Post to Inventory"
  },
  "items": {
    "noItems": "No items found for this session.",
    "submitCounts": "Submit Selected Counts",
    "colProduct": "Product / SKU",
    "colSystemQty": "System Qty (On Hand)",
    "colCountQty": "Count Qty",
    "colDamagedQty": "Damaged Qty",
    "colVariance": "Variance",
    "colStatus": "Status",
    "colNotes": "Notes",
    "notesPlaceholder": "Note (optional)"
  },
  "variance": {
    "noVariance": "No Variances Found",
    "noVarianceDesc": "All counted items perfectly match the system records.",
    "title": "Variances Detected",
    "desc": "items with quantities differing from the system record. Approval requires notes explaining these discrepancies."
  },
  "reconciliation": {
    "noData": "No Reconciliation Data",
    "colSystemQty": "System Qty",
    "colCountQty": "Count Qty",
    "colVarianceQty": "Variance Qty",
    "colStatus": "Reconciliation Status",
    "matched": "Matched",
    "surplus": "Surplus",
    "shortage": "Shortage"
  },
  "audit": {
    "noLogs": "No audit logs available for this session",
    "colTime": "Time",
    "colAction": "Action",
    "colUser": "User",
    "colNotes": "Notes"
  },
  "modals": {
    "reviewTitle": "Review Stock Opname",
    "reviewDesc": "Add review notes. If there are variances, notes are required.",
    "reviewInput": "Review Notes",
    "approveTitle": "Approve Stock Opname",
    "approveDesc": "Approve this session. Once approved, it can be posted to inventory.",
    "approveInput": "Approval Notes",
    "postTitle": "Post to Inventory",
    "postDesc": "Posting this session will adjust the actual inventory based on the final counts. This action cannot be undone.",
    "cancelTitle": "Cancel Stock Opname",
    "cancelDesc": "Are you sure you want to cancel this session? This action cannot be undone.",
    "cancelInput": "Cancellation Reason (Required)",
    "voidTitle": "Void Stock Opname",
    "voidDesc": "Are you sure you want to void this session? This will invalidate all counts. This action cannot be undone.",
    "voidInput": "Void Reason (Required)"
  }
};

const idStockOpnames = {
  "title": "Stok Opname",
  "subtitle": "Kelola dan rekoniliasi perhitungan fisik inventaris",
  "newSession": "Sesi Baru",
  "instruction": "Instruksi",
  "table": {
    "colSession": "Sesi",
    "colWarehouse": "Gudang",
    "colDate": "Tanggal",
    "colScopeMode": "Cakupan & Mode",
    "colProgress": "Progres",
    "colStatus": "Status",
    "colActions": "Aksi",
    "noData": "Tidak ada sesi stok opname",
    "variances": "selisih"
  },
  "filter": {
    "searchPlaceholder": "Cari kode sesi...",
    "warehousePlaceholder": "Semua Gudang",
    "statusPlaceholder": "Semua Status",
    "datePlaceholder": "Pilih Tanggal"
  },
  "create": {
    "title": "Sesi Stok Opname Baru",
    "subtitle": "Buat sesi perhitungan fisik inventaris baru",
    "btnCreate": "Buat Sesi",
    "btnCancel": "Batal",
    "basicInfo": "Info Dasar",
    "sessionName": "Nama Sesi",
    "sessionNamePlaceholder": "cth. Tutup Tahun 2026",
    "warehouse": "Gudang",
    "warehousePlaceholder": "Pilih gudang...",
    "date": "Tanggal Sesi",
    "scopeMode": "Cakupan & Mode",
    "scope": "Cakupan Perhitungan",
    "mode": "Mode Perhitungan",
    "modeHelpBlind": "Penghitung tidak akan melihat kuantitas sistem (blind count)",
    "modeHelpVisible": "Penghitung dapat melihat kuantitas sistem",
    "productSelection": "Pemilihan Produk",
    "productSelectionHelp": "Pilih produk spesifik untuk cakupan parsial",
    "assignments": "Penugasan & Opsi",
    "assignedCounters": "Penghitung yang Ditugaskan",
    "assignedCountersPlaceholder": "Pilih staf...",
    "reviewer": "Peninjau",
    "reviewerPlaceholder": "Pilih peninjau...",
    "approver": "Penyetuju",
    "approverPlaceholder": "Pilih penyetuju..."
  },
  "detail": {
    "staleSnapshotTitle": "SNAPSHOT KADALUARSA TERDETEKSI",
    "staleSnapshotDesc": "Terdapat pergerakan inventaris sejak sesi ini dibuat. Snapshot stok tidak lagi akurat. Anda harus membatalkan (Void/Cancel) sesi ini dan membuat yang baru.",
    "sessionInfo": "Info Sesi",
    "sessionCode": "Kode Sesi",
    "sessionDate": "Tanggal Sesi",
    "scope": "Cakupan",
    "mode": "Mode",
    "warehouse": "Gudang",
    "progressSummary": "Progres & Ringkasan",
    "countedItems": "Item Dihitung",
    "variances": "Selisih",
    "accuracy": "Akurasi",
    "tabs": {
      "items": "Item & Jumlah",
      "variance": "Laporan Selisih",
      "reconciliation": "Rekonsiliasi",
      "audit": "Log Audit"
    },
    "btnCancel": "Batalkan Sesi",
    "btnVoid": "Void Sesi",
    "btnReview": "Tinjau",
    "btnApprove": "Setujui",
    "btnPost": "Posting ke Inventaris"
  },
  "items": {
    "noItems": "Tidak ada item untuk sesi ini.",
    "submitCounts": "Kirim Hasil Perhitungan",
    "colProduct": "Produk / SKU",
    "colSystemQty": "Jml Sistem",
    "colCountQty": "Jml Hitung",
    "colDamagedQty": "Jml Rusak",
    "colVariance": "Selisih",
    "colStatus": "Status",
    "colNotes": "Catatan",
    "notesPlaceholder": "Catatan (opsional)"
  },
  "variance": {
    "noVariance": "Tidak Ada Selisih",
    "noVarianceDesc": "Semua item yang dihitung cocok dengan catatan sistem.",
    "title": "Selisih Terdeteksi",
    "desc": "item dengan kuantitas berbeda dari catatan sistem. Persetujuan memerlukan catatan yang menjelaskan perbedaan ini."
  },
  "reconciliation": {
    "noData": "Tidak Ada Data Rekonsiliasi",
    "colSystemQty": "Jml Sistem",
    "colCountQty": "Jml Hitung",
    "colVarianceQty": "Jml Selisih",
    "colStatus": "Status Rekonsiliasi",
    "matched": "Sesuai",
    "surplus": "Surplus",
    "shortage": "Kurang"
  },
  "audit": {
    "noLogs": "Tidak ada log audit untuk sesi ini",
    "colTime": "Waktu",
    "colAction": "Aksi",
    "colUser": "Pengguna",
    "colNotes": "Catatan"
  },
  "modals": {
    "reviewTitle": "Tinjau Stok Opname",
    "reviewDesc": "Tambahkan catatan peninjauan. Jika terdapat selisih, catatan wajib diisi.",
    "reviewInput": "Catatan Peninjauan",
    "approveTitle": "Setujui Stok Opname",
    "approveDesc": "Setujui sesi ini. Setelah disetujui, sesi ini dapat diposting ke inventaris.",
    "approveInput": "Catatan Persetujuan",
    "postTitle": "Posting ke Inventaris",
    "postDesc": "Memposting sesi ini akan menyesuaikan inventaris aktual berdasarkan perhitungan akhir. Aksi ini tidak dapat dibatalkan.",
    "cancelTitle": "Batalkan Stok Opname",
    "cancelDesc": "Apakah Anda yakin ingin membatalkan sesi ini? Aksi ini tidak dapat dibatalkan.",
    "cancelInput": "Alasan Pembatalan (Wajib)",
    "voidTitle": "Void Stok Opname",
    "voidDesc": "Apakah Anda yakin ingin melakukan void sesi ini? Ini akan membatalkan semua perhitungan. Aksi ini tidak dapat dibatalkan.",
    "voidInput": "Alasan Void (Wajib)"
  }
};

en.features.stockOpnames = enStockOpnames;
id.features.stockOpnames = idStockOpnames;

fs.writeFileSync('lang/en.json', JSON.stringify(en, null, 2));
fs.writeFileSync('lang/id.json', JSON.stringify(id, null, 2));
console.log("Language files updated.");
