# Payments

City Bike Tours records payments manually. Customers pay on the day of the ride; this application does not collect card details or connect to an online payment gateway.

In Admin → Bookings, staff can record a payment with method (cash, card, EFT, mobile money or other), amount and reference; mark a paid record refunded; or waive payment. Each change is audited. Booking totals are snapshotted from the route price at request time and are not changed when route prices are edited later.

The backend payment provider interface currently contains only the `manual` provider. Do not add a gateway until the business has decided:

- Which Botswana legal entity will be the merchant of record and what business verification is required.
- Which customer payment methods are supported in Botswana and what device, currency and checkout experience each requires.
- Transaction, refund, chargeback, payout and currency-conversion fees.
- Settlement currency, payout timing, bank requirements and reconciliation procedures.
- Refund, cancellation, dispute, failed-payment and partial-payment policies.
- Who owns provider credentials, webhook signing and incident response.
- How payment status will be reconciled with bookings without counting a booking twice or losing its price snapshot.

Do not store card numbers, security codes or other payment credentials in this application.
