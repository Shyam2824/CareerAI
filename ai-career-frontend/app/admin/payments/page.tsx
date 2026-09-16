"use client";

import { useState } from "react";
import { Search } from "lucide-react";

type Payment = {
  id: string;
  user: string;
  email: string;
  amount: string;
  plan: string;
  status: string;
  date: string;
};

export default function PaymentsPage() {
  const [search, setSearch] = useState("");

  const payments: Payment[] = [
    {
      id: "PAY001",
      user: "Rahul Kumar",
      email: "rahul@gmail.com",
      amount: "₹499",
      plan: "Premium",
      status: "Success",
      date: "Sep 04, 2026",
    },
    {
      id: "PAY002",
      user: "Amit Singh",
      email: "amit@gmail.com",
      amount: "₹999",
      plan: "Premium",
      status: "Success",
      date: "Sep 03, 2026",
    },
    {
      id: "PAY003",
      user: "Neha Sharma",
      email: "neha@gmail.com",
      amount: "₹499",
      plan: "Premium",
      status: "Pending",
      date: "Sep 03, 2026",
    },
  ];

  const filteredPayments = payments.filter(
    (payment) =>
      payment.user
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      payment.id
        .toLowerCase()
        .includes(search.toLowerCase())
  );

  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-900">
        Payments
      </h1>

      <p className="mt-2 text-slate-500">
        Monitor platform transactions and revenue.
      </p>

      <div className="mt-8 grid gap-5 md:grid-cols-3">
        <PaymentCard
          title="Total Revenue"
          value="₹1,24,500"
        />

        <PaymentCard
          title="This Month"
          value="₹32,450"
        />

        <PaymentCard
          title="Transactions"
          value="248"
        />
      </div>

      <div className="mt-8 rounded-2xl bg-white p-6 shadow-sm">
        <div className="relative max-w-md">
          <Search
            size={18}
            className="absolute left-3 top-3.5 text-slate-400"
          />

          <input
            type="text"
            placeholder="Search payment..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-300 p-3 pl-10"
          />
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-187.5">
            <thead>
              <tr className="border-b text-left text-sm text-slate-500">
                <th className="pb-4">Transaction</th>
                <th className="pb-4">User</th>
                <th className="pb-4">Amount</th>
                <th className="pb-4">Plan</th>
                <th className="pb-4">Status</th>
                <th className="pb-4">Date</th>
              </tr>
            </thead>

            <tbody>
              {filteredPayments.map((payment) => (
                <tr
                  key={payment.id}
                  className="border-b border-slate-100"
                >
                  <td className="py-4 font-medium">
                    {payment.id}
                  </td>

                  <td>
                    <p className="font-medium">
                      {payment.user}
                    </p>

                    <p className="text-sm text-slate-500">
                      {payment.email}
                    </p>
                  </td>

                  <td className="font-semibold">
                    {payment.amount}
                  </td>

                  <td>{payment.plan}</td>

                  <td>
                    <span
                      className={
                        payment.status === "Success"
                          ? "font-medium text-green-600"
                          : "font-medium text-yellow-600"
                      }
                    >
                      {payment.status}
                    </span>
                  </td>

                  <td>{payment.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function PaymentCard({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      <p className="text-sm text-slate-500">
        {title}
      </p>

      <h2 className="mt-2 text-2xl font-bold text-slate-900">
        {value}
      </h2>
    </div>
  );
}