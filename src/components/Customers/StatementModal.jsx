import Modal from "../Modal";
import Table from "../Table";
import { useAuth } from "../../context/AuthContext";
import { formatDateWithDay } from "../../utils";

export default function StatementModal({ onClose, statementData }) {
  if (!statementData) return null;

  const { dates, customer, totals, ledger } = statementData;
  const { user } = useAuth();

  const a4Width = 210;   // A4 width
  const a4Height = 297;  // A4 height

  /** ---------- STATEMENT TABLE COLUMNS ---------- **/
  const columns = [
    {
      label: "Date",
      width: "auto",
      render: (row) => formatDateWithDay(row.date),
    },
    {
      label: "Type",
      field: "type",
      width: "13.5%",
    },
    {
      label: "Debit",
      width: "15%",
      render: (row) => (row.debit > 0 ? row.debit.toFixed(2) : "-"),
    },
    {
      label: "Credit",
      width: "15%",
      render: (row) => (row.credit > 0 ? row.credit.toFixed(2) : "-"),
    },
    {
      label: "Ref No.",
      field: "ref",
      width: "15%",
    },
    {
      label: "Balance",
      width: "15%",
      align: "right",
      render: (row) => row.balance.toFixed(2),
    },
  ];

  return (
    <Modal title={`Statement - ${customer.name}`} onClose={onClose} size="4xl">
      <div className="flex justify-center">
        <div className="h-[60vh] overflow-y-auto">
          <div
            className="bg-white border border-gray-300 p-6 rounded-2xl text-xs flex flex-col"
            style={{
              width: `${a4Width}mm`,
              height: `${a4Height}mm`,
            }}
          >
            {/* -------- HEADER -------- */}
            <div className="flex justify-between items-center capitalize text-lg font-medium tracking-wide">
              <div>{user.name}</div>
              <div>Customer Statement</div>
            </div>

            <hr className="border-gray-600 my-2" />

            {/* -------- CUSTOMER INFO -------- */}
            <div className="flex justify-between items-center capitalize">
              <div>
                <p className="mb-1">
                  <span className="font-medium">Customer:</span>{" "}
                  {customer.name || "-"}
                </p>
                <p>
                  <span className="font-medium">Contact:</span>{" "}
                  {customer.phone_no || "-"}
                </p>
              </div>
              <div>
                <p className="mb-1">
                  <span className="font-medium">Date From:</span>{" "}
                  {dates.from !== "" ? formatDateWithDay(dates.from) : "-"}
                </p>
                <p className="mb-1">
                  <span className="font-medium">Date To:</span>{" "}
                  {dates.to !== "" ? formatDateWithDay(dates.to) : "-"}
                </p>
              </div>
            </div>

            <hr className="border-gray-600 my-2" />

            {/* -------- LEDGER TABLE -------- */}
            <div className="grow">
              <Table columns={columns} data={ledger} size="xs" bottomGap={false} />
            </div>

            <hr className="border-gray-600 my-2" />

            {/* -------- TOTALS BOXES -------- */}
            <div className="flex gap-2 mb-2">
              <div className="flex-1 border border-gray-600 rounded-lg py-1.5 px-3 flex justify-between">
                <span>Total Debit:</span>
                {totals?.totalInvoices?.toFixed(2)}
              </div>

              <div className="flex-1 border border-gray-600 rounded-lg py-1.5 px-3 flex justify-between">
                <span>Total Credit:</span>
                {totals?.totalPayments?.toFixed(2)}
              </div>
            </div>
            <div className="flex gap-2">
              <div className="flex-1 border border-gray-600 rounded-lg py-1.5 px-3 flex justify-between">
                <span>Opening Balance:</span>
                {totals?.openingBalance?.toFixed(2)}
              </div>

              <div className="flex-1 border border-gray-600 rounded-lg py-1.5 px-3 flex justify-between">
                <span>Closing Balance:</span>
                {totals?.closingBalance?.toFixed(2)}
              </div>
            </div>

            <hr className="border-gray-600 my-2" />

            {/* -------- FOOTER -------- */}
            <div className="flex justify-between">
              <p>Powered by SparkPair</p>
              <p>© 2025 SparkPair | +92 316 5825495</p>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
