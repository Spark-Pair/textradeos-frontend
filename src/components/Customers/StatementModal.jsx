import Modal from "../Modal";
import Table from "../Table";
import DetailItem from "../DetailItem"; // optional if you have this
import { formatDateWithDay } from "../../utils";

export default function StatementModal({ onClose, statementData }) {
  if (!statementData) return null;

  const { customer, totals, ledger } = statementData;

  /** ---------- TABLE COLUMNS ---------- **/
  const columns = [
    { label: "Date", width: "18%", middleAlign: "center",
      render: row => formatDateWithDay(row.date)
    },
    { label: "Type", field: "type", width: "12%", middleAlign: "center" },
    { label: "Debit", width: "15%", middleAlign: "center",
      render: row => row.debit > 0 ? row.debit.toFixed(2) : "-"
    },
    { label: "Credit", width: "15%", middleAlign: "center",
      render: row => row.credit > 0 ? row.credit.toFixed(2) : "-"
    },
    { label: "Balance", width: "15%", middleAlign: "center",
      render: row => row.balance.toFixed(2)
    },
    { label: "Ref No.", field: "ref", width: "25%", middleAlign: "center" },
  ];

  return (
    <Modal
      title={`Statement - ${customer.name}`}
      onClose={onClose}
      size="4xl"
    >
      {/* ---------- CUSTOMER + TOTALS BOX ---------- */}
      <div className="grid grid-cols-4 gap-4 bg-gray-50 p-4 rounded-xl mb-4">

        <div className="col-span-1">
          <div className="text-xs text-gray-400">Opening Balance</div>
          <div className="text-lg font-semibold">{totals.openingBalance}</div>
        </div>

        <div className="col-span-1">
          <div className="text-xs text-gray-400">Total Invoices</div>
          <div className="text-lg font-semibold text-blue-700">{totals.totalInvoices}</div>
        </div>

        <div className="col-span-1">
          <div className="text-xs text-gray-400">Total Payments</div>
          <div className="text-lg font-semibold text-green-700">{totals.totalPayments}</div>
        </div>

        <div className="col-span-1">
          <div className="text-xs text-gray-400">Closing Balance</div>
          <div className={`text-lg font-bold 
            ${totals.closingBalance >= 0 ? "text-red-600" : "text-green-600"}`}
          >
            {totals.closingBalance}
          </div>
        </div>

      </div>

      {/* ---------- LEDGER TABLE ---------- */}
      <Table
        columns={columns}
        data={ledger}
        height="60vh"
        bottomGap={false}
      />

    </Modal>
  );
}
