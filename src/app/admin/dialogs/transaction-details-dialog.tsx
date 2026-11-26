"use client";

import { X } from "lucide-react";
import type { TransactionRecord } from "../types";
import { DetailGroup } from "../ui";
import { formatDateTime, txMoney, txStatusClass } from "../utils";

type TransactionDetailsDialogProps = {
  transaction: TransactionRecord;
  onClose: () => void;
};

export default function TransactionDetailsDialog({ transaction: tx, onClose }: TransactionDetailsDialogProps) {
  const rawBlocks = ([
    ["Gateway response", tx.response],
    ["Metadata", tx.metadata ? JSON.stringify(tx.metadata, null, 2) : null],
    ["Request payload", tx.requestPayload ? JSON.stringify(tx.requestPayload, null, 2) : null],
  ] as [string, string | null][]).filter(([, value]) => value);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-[#211f1a]/50 p-4 backdrop-blur-[2px]" role="dialog" aria-modal="true" aria-labelledby="tx-title">
      <div className="my-auto w-full max-w-[720px] rounded-[22px] bg-[#fffdf9] shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#efebe3] px-5 py-4 sm:px-7">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-[#b0714f]">{tx.type} · {tx.provider}</p>
            <h2 id="tx-title" className="serif mt-1 text-2xl">
              {txMoney(tx.amount)}
              <span className={`ml-2 rounded-full px-2.5 py-1 align-middle font-sans text-[9px] font-bold capitalize ${txStatusClass(tx.status)}`}>{tx.status}</span>
            </h2>
          </div>
          <button type="button" onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full border border-[#e9e3d8]" aria-label="Close details"><X size={16} /></button>
        </div>

        <div className="max-h-[70vh] space-y-6 overflow-y-auto px-5 py-5 sm:px-7">
          <DetailGroup title="Transaction" items={[
            ["Transaction ID", tx.transactionId],
            ["Name", tx.transactionName],
            ["Provider txn ID", tx.providerTransactionId],
            ["Gateway", tx.paymentGateway],
            ["Type", tx.types],
            ["Currency", tx.currency],
            ["Paid at", formatDateTime(tx.paidAt)],
            ["Created", formatDateTime(tx.createdAt)],
            ["Updated", formatDateTime(tx.updatedAt)],
          ]} />
          <DetailGroup title="Order & customer" items={[
            ["Order", tx.orderNumber ? `#${tx.orderNumber}` : tx.orderId],
            ["Customer", tx.customerName],
            ["User ID", tx.userId],
          ]} />
          <DetailGroup title="Payment instrument" items={[
            ["Mode", tx.paymentMode],
            ["UPI ID", tx.upiId],
            ["UTR / RRN", tx.utr],
            ["Bank", tx.bankName],
            ["Bank ID", tx.bankId],
            ["Card type", tx.cardType],
            ["Card network", tx.cardNetwork],
            ["Card last 4", tx.cardLast4 ? `•••• ${tx.cardLast4}` : null],
          ]} />
          <DetailGroup title="Gateway references" items={[
            ["Gateway order ID", tx.gatewayOrderId],
            ["Gateway payment ID", tx.gatewayPaymentId],
            ["Error code", tx.errorCode],
            ["Failure reason", tx.failureReason],
          ]} />
          <DetailGroup title="Audit" items={[
            ["IP address", tx.ipAddress],
            ["User agent", tx.userAgent],
          ]} />

          {rawBlocks.map(([label, value]) => (
            <details key={label} className="rounded-xl border border-[#e8e4da] bg-white">
              <summary className="cursor-pointer px-4 py-3 text-[10px] font-bold text-[#545147]">{label}</summary>
              <pre className="max-h-56 overflow-auto border-t border-[#f0ece4] p-4 text-[10px] leading-4 text-[#55534b]">{value}</pre>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}
