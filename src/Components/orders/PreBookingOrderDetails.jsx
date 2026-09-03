import React from "react";
import { CalendarDays } from "lucide-react";
import OrderDetails from "./OrderDetails";

export default function PreBookingOrderDetails({ order, onClose }) {
  if (!order) return null;

  return (
    <div className="relative">
      <div className="mb-3 flex items-center gap-2 rounded-xl border border-amber-400/15 bg-amber-400/[0.06] px-3 py-2.5 text-xs text-amber-200">
        <CalendarDays className="h-4 w-4 shrink-0 text-amber-300" />
        <span className="font-semibold">Pre-booking order</span>
        <span className="text-white/35">•</span>
        <span className="truncate text-white/50">This order is linked to a pre-booking product.</span>
      </div>
      <OrderDetails order={order} onClose={onClose} />
    </div>
  );
}
